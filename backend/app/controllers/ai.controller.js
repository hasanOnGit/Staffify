const express = require("express");
const apiRoutes = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const AiConversation = require("../models/aiConversation.model");
const { generateGroundedResponse } = require("../ai/modelProvider");
const { executeAction } = require("../ai/actionExecutionService");
const { getCapabilitiesForRole } = require("../ai/capabilityRegistry");

module.exports = function (app) {
  /* ========================================================
     1. CHAT WITH ENTERPRISE AI ASSISTANT
     ======================================================== */
  apiRoutes.post("/chat", authMiddleware, async (req, res) => {
    try {
      const { message, conversationId } = req.body;
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

      return res.status(200).json({
        success: true,
        conversationId: conversation.conversationId,
        messageId: assistantMsgId,
        message: aiResult.message,
        records: aiResult.records || [],
        columns: aiResult.columns || [],
        kpis: aiResult.kpis || [],
        totalCount: aiResult.totalCount || 0,
        actionDraft: aiResult.actionDraft || null,
        citations: aiResult.citations || [],
        context: conversation.lastContext,
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

  app.use("/api/ai", apiRoutes);
  app.use("/ai", apiRoutes);
};
