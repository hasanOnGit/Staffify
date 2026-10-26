const express = require("express");
const apiRoutes = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const AiConversation = require("../models/aiConversation.model");
const AiQueryLog = require("../models/aiQueryLog.model");
const AiKnowledgeBase = require("../models/aiKnowledgeBase.model");
const { generateGroundedResponse } = require("../ai/modelProvider");
const { executeAction } = require("../ai/actionExecutionService");
const { getCapabilitiesForRole } = require("../ai/capabilityRegistry");

module.exports = function (app) {
  /* ========================================================
     1. CHAT WITH ENTERPRISE AI ASSISTANT
     ======================================================== */
  apiRoutes.post("/chat", authMiddleware, async (req, res) => {
    const startTime = Date.now();
    try {
      const { message, conversationId, currentRoute } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: "Query message is required." });
      }

      const userId = req.user.userId || req.user.id;
      const employeeId = req.user.employeeId || req.user.userId || "EMP-ADMIN-01";
      const userRole = req.user.role || "Employee";
      const userName = req.user.name || "User";

      // 1. Retrieve or initialize conversation thread
      let conversation = null;
      if (conversationId) {
        conversation = await AiConversation.findOne({ conversationId, userId });
      }

      if (!conversation) {
        const newConvId = "CONV-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        conversation = new AiConversation({
          conversationId: newConvId,
          userId,
          employeeId,
          userName,
          userRole,
          title: message.trim().slice(0, 40) + "...",
          messages: [],
          lastContext: {},
        });
      }

      // Add user message to history
      const userMsgId = "MSG-" + Date.now() + "-U";
      conversation.messages.push({
        id: userMsgId,
        role: "user",
        content: message.trim(),
        timestamp: new Date(),
      });

      // 2. Generate grounded database response
      const userContext = {
        userId,
        employeeId,
        role: userRole,
        name: userName,
      };

      const aiResult = await generateGroundedResponse(
        message.trim(),
        conversation.messages,
        userContext,
        conversation.lastContext || {}
      );

      // Add assistant message to history
      const assistantMsgId = "MSG-" + Date.now() + "-A";
      conversation.messages.push({
        id: assistantMsgId,
        role: "assistant",
        content: aiResult.message,
        summary: aiResult.summary || "",
        description: aiResult.description || "",
        suggestedFollowUps: aiResult.suggestedFollowUps || [],
        timestamp: new Date(),
        data: aiResult.records || [],
        kpis: aiResult.kpis || [],
        actionDraft: aiResult.actionDraft || null,
        citations: aiResult.citations || [],
        error: aiResult.error || null,
      });

      // Update conversation state and context for follow-up resolution
      if (aiResult.context) {
        conversation.lastContext = {
          ...conversation.lastContext,
          ...aiResult.context,
        };
      }

      await conversation.save();

      // 3. Log user input and assistant response for analytics and AI training
      const executionTimeMs = Date.now() - startTime;
      const logId = "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

      AiQueryLog.create({
        logId,
        userId,
        userName,
        userRole,
        conversationId: conversation.conversationId,
        queryText: message.trim(),
        intentType:
          aiResult.intentType ||
          (aiResult.actionDraft
            ? "ACTION_DRAFT"
            : aiResult.context?.module === "knowledge_base"
            ? "KNOWLEDGE_BASE"
            : aiResult.context?.module === "conversational"
            ? "CONVERSATIONAL"
            : "QUERY"),
        resolvedModule: aiResult.context?.module || "employees",
        responseSummary: aiResult.summary || aiResult.message || "",
        detailedDescription: aiResult.description || "",
        recordCount: aiResult.totalCount || (aiResult.records ? aiResult.records.length : 0),
        executionTimeMs,
        modelUsed: aiResult.modelUsed || "dsqe-deterministic",
        clientRoute: currentRoute || req.body.currentRoute || "",
        isTrainingSample: true,
        timestamp: new Date(),
      }).catch((logErr) => console.error("AiQueryLog save error:", logErr.message));

      return res.status(200).json({
        success: true,
        conversationId: conversation.conversationId,
        messageId: assistantMsgId,
        logId,
        message: aiResult.message,
        summary: aiResult.summary || "",
        description: aiResult.description || "",
        modelUsed: aiResult.modelUsed || "dsqe-deterministic",
        suggestedFollowUps: aiResult.suggestedFollowUps || [],
        records: aiResult.records || [],
        columns: aiResult.columns || [],
        kpis: aiResult.kpis || [],
        totalCount: aiResult.totalCount || 0,
        actionDraft: aiResult.actionDraft || null,
        citations: aiResult.citations || [],
        context: conversation.lastContext,
        executionTimeMs,
      });
    } catch (err) {
      console.error("AI Chat Controller Error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     2. EXECUTE CONFIRMED ACTION
     ======================================================== */
  apiRoutes.post("/action/confirm", authMiddleware, async (req, res) => {
    try {
      const { actionType, params, conversationId } = req.body;
      if (!actionType) {
        return res.status(400).json({ success: false, error: "Action type is required." });
      }

      const userContext = {
        userId: req.user.userId || req.user.id,
        employeeId: req.user.employeeId || req.user.userId || "EMP-ADMIN-01",
        role: req.user.role || "Employee",
        name: req.user.name || "User",
      };

      const actionResult = await executeAction(actionType, params, userContext);

      // Append confirmation result to conversation if thread exists
      if (conversationId) {
        const conversation = await AiConversation.findOne({ conversationId });
        if (conversation) {
          conversation.messages.push({
            id: "MSG-" + Date.now() + "-ACT",
            role: "assistant",
            content: actionResult.message || actionResult.error,
            timestamp: new Date(),
            actionResult,
          });
          await conversation.save();
        }
      }

      return res.status(actionResult.success ? 200 : 400).json(actionResult);
    } catch (err) {
      console.error("Action confirmation error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     3. LIST USER CONVERSATION THREADS
     ======================================================== */
  apiRoutes.get("/conversations", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const threads = await AiConversation.find({ userId })
        .select("conversationId title createdAt updatedAt lastContext")
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();

      return res.status(200).json({ success: true, count: threads.length, data: threads });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     4. GET CONVERSATION BY ID
     ======================================================== */
  apiRoutes.get("/conversations/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const conversation = await AiConversation.findOne({
        conversationId: req.params.id,
        userId,
      }).lean();

      if (!conversation) {
        return res.status(404).json({ success: false, error: "Conversation not found." });
      }

      return res.status(200).json({ success: true, data: conversation });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     5. DELETE CONVERSATION THREAD
     ======================================================== */
  apiRoutes.delete("/conversations/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      await AiConversation.deleteOne({ conversationId: req.params.id, userId });
      return res.status(200).json({ success: true, message: "Conversation deleted." });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     6. GET CAPABILITIES & SUGGESTED PROMPTS FOR USER ROLE
     ======================================================== */
  apiRoutes.get("/capabilities", authMiddleware, async (req, res) => {
    try {
      const role = req.user.role || "Employee";
      const capabilities = getCapabilitiesForRole(role);
      return res.status(200).json({ success: true, role, data: capabilities });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     7. EXPORT DATA TO CSV STREAM
     ======================================================== */
  apiRoutes.post("/export", authMiddleware, (req, res) => {
    try {
      const { records = [], columns = [], title = "staffify_export" } = req.body;
      if (!records || !records.length) {
        return res.status(400).json({ success: false, error: "No records to export." });
      }

      const headers = columns.length
        ? columns.map((c) => c.label || c.key)
        : Object.keys(records[0] || {});
      const keys = columns.length
        ? columns.map((c) => c.key)
        : Object.keys(records[0] || {});

      let csv = headers.join(",") + "\n";
      records.forEach((row) => {
        const line = keys.map((k) => {
          let val = row[k] !== undefined && row[k] !== null ? String(row[k]) : "";
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csv += line.join(",") + "\n";
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${title}_${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     8. SUBMIT USER FEEDBACK ON QUERY
     ======================================================== */
  apiRoutes.post("/logs/:logId/feedback", authMiddleware, async (req, res) => {
    try {
      const { logId } = req.params;
      const { feedback } = req.body; // "up" | "down" | null

      if (!["up", "down", null].includes(feedback)) {
        return res.status(400).json({ success: false, error: "Invalid feedback value." });
      }

      const log = await AiQueryLog.findOneAndUpdate(
        { logId },
        { $set: { feedback } },
        { new: true }
      );

      return res.status(200).json({ success: true, data: log });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     9. QUERY AUDIT LOGS & ANALYTICS
     ======================================================== */
  apiRoutes.get("/logs", authMiddleware, async (req, res) => {
    try {
      const userRole = req.user.role || "Employee";
      const userId = req.user.userId || req.user.id;
      const { page = 1, limit = 20, module, intentType, search } = req.query;

      const query = {};
      // Non-admins only see their own query logs
      if (userRole !== "Admin") {
        query.userId = userId;
      }
      if (module) query.resolvedModule = module;
      if (intentType) query.intentType = intentType;
      if (search) {
        query.$or = [
          { queryText: new RegExp(search, "i") },
          { responseSummary: new RegExp(search, "i") },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const totalLogs = await AiQueryLog.countDocuments(query);
      const logs = await AiQueryLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      // Aggregate high-level statistics for Admin
      const stats = {
        totalQueries: totalLogs,
        positiveFeedback: await AiQueryLog.countDocuments({ feedback: "up" }),
        negativeFeedback: await AiQueryLog.countDocuments({ feedback: "down" }),
      };

      return res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalLogs,
          totalPages: Math.ceil(totalLogs / Number(limit)) || 1,
        },
        stats,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     10. RETRIEVE OPEN-SOURCE HR KNOWLEDGE BASE ARTICLES
     ======================================================== */
  apiRoutes.get("/knowledge", authMiddleware, async (req, res) => {
    try {
      const { category, search } = req.query;
      const query = { isActive: true };

      if (category) query.category = category;
      if (search) {
        query.$or = [
          { title: new RegExp(search, "i") },
          { tags: new RegExp(search, "i") },
          { content: new RegExp(search, "i") },
        ];
      }

      const articles = await AiKnowledgeBase.find(query).sort({ category: 1, title: 1 }).lean();
      return res.status(200).json({ success: true, count: articles.length, data: articles });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ========================================================
     11. EXPORT AI TRAINING DATASET (JSONL FORMAT)
     ======================================================== */
  apiRoutes.get("/training-dataset", authMiddleware, async (req, res) => {
    try {
      // 1. Fetch all logged queries
      const queryLogs = await AiQueryLog.find({ isTrainingSample: true })
        .sort({ timestamp: -1 })
        .lean();

      // 2. Fetch all open-source knowledge base articles
      const knowledgeArticles = await AiKnowledgeBase.find({ isActive: true }).lean();

      const systemPrompt =
        "You are Staffify AI Copilot, a professional enterprise HRMS assistant. Ground all answers strictly on verified operational data and statutory labor standards. Provide clear executive summaries, analytical distributions, and actionable guidance without hallucinations.";

      let jsonlLines = [];

      // Format query logs as instruction-tuning pairs
      queryLogs.forEach((log) => {
        if (!log.queryText || !log.responseSummary) return;

        const assistantContent = log.detailedDescription
          ? `${log.responseSummary}\n\n${log.detailedDescription}`
          : log.responseSummary;

        const trainingSample = {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: log.queryText },
            { role: "assistant", content: assistantContent },
          ],
          metadata: {
            source: "staffify_live_queries",
            module: log.resolvedModule,
            intent: log.intentType,
            feedback: log.feedback,
            timestamp: log.timestamp,
          },
        };
        jsonlLines.push(JSON.stringify(trainingSample));
      });

      // Format knowledge articles as training Q&A samples
      knowledgeArticles.forEach((art) => {
        const questions = art.sampleQuestions?.length
          ? art.sampleQuestions
          : [`What is the statutory policy for ${art.title}?`];

        questions.forEach((q) => {
          const trainingSample = {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: q },
              { role: "assistant", content: `**${art.title}**\n\n${art.summary}\n\n${art.content}` },
            ],
            metadata: {
              source: art.source || "open_source_hr_statutory_corpus",
              category: art.category,
              docId: art.docId,
            },
          };
          jsonlLines.push(JSON.stringify(trainingSample));
        });
      });

      const outputContent = jsonlLines.join("\n");

      res.setHeader("Content-Type", "application/x-jsonlines");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="staffify_ai_training_dataset_${Date.now()}.jsonl"`
      );
      return res.status(200).send(outputContent);
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use("/api/ai", apiRoutes);
  app.use("/ai", apiRoutes);
};
