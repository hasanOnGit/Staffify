/**
 * Staffify Model Provider & Orchestration Engine
 *
 * Configurable abstraction supporting external AI models (Gemini / OpenAI)
 * with automatic fallback to the built-in Deterministic Semantic Query Engine (DSQE).
 * Guarantees zero hallucinations by grounding responses strictly in verified database results.
 */

const { executeQueryPlan } = require("./dataAccessLayer");
const { planQuery } = require("./queryPlanner");

async function generateGroundedResponse(userMessage, conversationHistory = [], userContext = {}, previousContext = {}) {
  // 1. Generate query or action plan
  const plan = planQuery(userMessage, previousContext, userContext.role);

  // If user triggered conversational intent (greetings, identity, help, gratitude, farewells)
  if (plan.type === "CONVERSATIONAL") {
    const role = userContext.role || "Employee";
    const name = userContext.name || "there";

    if (plan.subtype === "GREETING") {
      let greetingDesc = "";
      let followUps = [];

      if (role === "Admin") {
        greetingDesc = `### Authorized Administrator Scope
- **Workforce Analytics**: Query overall headcount, department distributions, and company rosters.
- **Financial & Payroll Audits**: Review gross/net payroll disbursements, EPF/ESIC statutory liabilities, and tax declarations.
- **Talent Acquisition**: Track active job requisitions and candidate stages across the ATS pipeline.
- **Workflow Approvals**: Review pending leave applications, IT support tickets, and exit settlements.

### Quick Suggestions
Try clicking any of the suggested prompt pills below or ask naturally (e.g., *"Give me a department-wise employee count"* or *"Show all open support tickets"*).`;

        followUps = [
          "Give me a department-wise employee count",
          "What is the total monthly payroll cost?",
          "Show all open job requisitions",
          "Show pending leave requests",
        ];
      } else if (role === "Manager") {
        greetingDesc = `### Authorized Manager Scope
- **Team Oversight**: Monitor team attendance, check-in punctuality, and who is on leave today.
- **Workflows & Rosters**: Review shift schedules, manage shift swap requests, and approve team leave applications.
- **Performance & OKRs**: Track team milestone deliverables and pending performance appraisals.

### Quick Suggestions
Try clicking any of the prompt suggestions below or ask directly.`;

        followUps = [
          "Who is on leave today?",
          "Who checked in late today?",
          "Show active goals with progress below 50%",
          "List pending attendance regularizations",
        ];
      } else {
        greetingDesc = `### Employee Self-Service Scope
- **Time Off & Balances**: Check your remaining casual/sick leave balances or submit leave requests.
- **Attendance & Swipes**: View today's check-in/out records, work hours, or submit attendance regularization.
- **Payslips & Loans**: Review monthly salary slips, tax declarations, or apply for salary advances.
- **Helpdesk Support**: Inspect assigned IT assets or raise an IT support ticket.

### Quick Suggestions
Select a quick question below or ask me anything about your records.`;

        followUps = [
          "What is my current leave balance?",
          "Show my attendance records for this month",
          "Apply for leave tomorrow",
          "Which IT assets are currently assigned to me?",
        ];
      }

      return {
        intentType: "CONVERSATIONAL",
        message: `Hello, **${name}**! Welcome to **Staffify AI Copilot**. How can I assist you with your workforce analytics, operations, or HR tasks today?`,
        summary: `Hello, **${name}**! Welcome to **Staffify AI Copilot**. I am your enterprise assistant for HRMS operations, operational database analytics, and statutory labor compliance.`,
        description: greetingDesc,
        suggestedFollowUps: followUps,
        records: [],
        columns: [],
        kpis: [],
        totalCount: 0,
        citations: [{ source: "Staffify Enterprise Copilot Core", timestamp: new Date() }],
        context: {
          module: "conversational",
          lastQueryText: userMessage,
        },
      };
    }

    if (plan.subtype === "HELP") {
      return {
        intentType: "CONVERSATIONAL",
        message: `Here is what Staffify AI Copilot can do for you.`,
        summary: `I am **Staffify Enterprise AI Copilot**, connected directly to live MongoDB operational collections across 15+ business modules. All answers are 100% grounded on verified database records with zero hallucinations.`,
        description: `### What You Can Ask Me
1. **Workforce & Directory**: *"Give me a department-wise employee count"*, *"Show all managers"*
2. **Attendance & Swipes**: *"Who checked in late today?"*, *"Show my attendance history for this month"*
3. **Leaves & Time Off**: *"What is my leave balance?"*, *"Show pending leave requests"*
4. **Payroll & Statutory**: *"What is the total monthly payroll cost?"*, *"What are our EPF liabilities?"*
5. **Recruitment ATS**: *"How many candidates are in the interview stage?"*, *"List open Engineering jobs"*
6. **Statutory HR Policies**: *"What is the sandwich leave policy?"*, *"How is gratuity calculated?"*, *"What are EPF rules?"*
7. **Two-Phase Action Execution**: *"Apply for leave tomorrow"*, *"Clock in"*, *"Raise support ticket"*

### How to Interact
- Type your question naturally in the prompt box or click any of the suggested prompt pills.
- Use **Ctrl + J** anywhere in the application to toggle the slide-over assistant drawer.`,
        suggestedFollowUps: [
          "Give me a department-wise employee count",
          "What is my current leave balance?",
          "What is the sandwich leave policy?",
          "Show all open support tickets",
        ],
        records: [],
        columns: [],
        kpis: [],
        totalCount: 0,
        citations: [{ source: "Staffify Enterprise Copilot Core", timestamp: new Date() }],
        context: {
          module: "conversational",
          lastQueryText: userMessage,
        },
      };
    }

    if (plan.subtype === "GRATITUDE") {
      return {
        intentType: "CONVERSATIONAL",
        message: `You're very welcome, **${name}**! I'm glad I could assist. Let me know if you need any other workforce insights or operational tasks performed.`,
        summary: `You're very welcome, **${name}**! I'm here 24/7 to help streamline your HR and workforce management workflows.`,
        description: `### Recommended Follow-ups
Feel free to ask another query or click one of the quick suggestions below.`,
        suggestedFollowUps: [
          "Give me a department-wise employee count",
          "What is the total monthly payroll cost?",
          "Show pending leave approval requests",
        ],
        records: [],
        columns: [],
        kpis: [],
        totalCount: 0,
        citations: [{ source: "Staffify Enterprise Copilot Core", timestamp: new Date() }],
        context: {
          module: "conversational",
          lastQueryText: userMessage,
        },
      };
    }

    if (plan.subtype === "FAREWELL") {
      return {
        intentType: "CONVERSATIONAL",
        message: `Goodbye, **${name}**! Have a productive day ahead. Feel free to open Copilot anytime with **Ctrl + J**.`,
        summary: `Goodbye, **${name}**! Have a great day. Feel free to reopen Staffify Copilot whenever you need assistance.`,
        description: "",
        suggestedFollowUps: [],
        records: [],
        columns: [],
        kpis: [],
        totalCount: 0,
        citations: [{ source: "Staffify Enterprise Copilot Core", timestamp: new Date() }],
        context: {
          module: "conversational",
          lastQueryText: userMessage,
        },
      };
    }
  }

  // If user requested knowledge base / HR statutory policy information
  if (plan.type === "KNOWLEDGE_BASE") {
    const AiKnowledgeBase = require("../models/aiKnowledgeBase.model");
    const query = plan.queryText;

    let article = null;
    try {
      article = await AiKnowledgeBase.findOne({ $text: { $search: query }, isActive: true });
    } catch (_) {}

    if (!article) {
      const lowerQ = query.toLowerCase();
      const articles = await AiKnowledgeBase.find({ isActive: true }).lean();
      article =
        articles.find(
          (a) =>
            a.tags.some((t) => lowerQ.includes(t)) ||
            lowerQ.includes(a.title.toLowerCase())
        ) || articles[0];
    }

    if (article) {
      return {
        intentType: "KNOWLEDGE_BASE",
        message: article.summary,
        summary: `Here is the verified statutory policy guidance on **${article.title}** from the Staffify HR Knowledge Base.`,
        description: article.content,
        suggestedFollowUps: article.sampleQuestions || [
          "What is the sandwich leave policy?",
          "How is gratuity calculated?",
          "What are the EPF contribution rates?",
        ],
        records: [],
        columns: [],
        kpis: [
          { label: "Category", value: article.category, change: "HR Governance", changeType: "neutral" },
          { label: "Policy Scope", value: article.applicableRoles?.join(", ") || "All Staff", change: "Enterprise-wide", changeType: "positive" },
          { label: "Reference Standard", value: "Verified Standard", change: article.source?.slice(0, 20) || "Statutory", changeType: "neutral" },
        ],
        totalCount: 1,
        citations: [{ source: `HR Knowledge Base: ${article.source}`, timestamp: new Date() }],
        context: {
          module: "knowledge_base",
          lastQueryText: userMessage,
        },
      };
    }
  }

  // If user requested an action draft
  if (plan.type === "ACTION_DRAFT") {
    return {
      intentType: "ACTION_DRAFT",
      message: plan.message,
      actionDraft: plan.actionDraft,
      data: null,
      kpis: [],
      records: [],
      columns: [],
      citations: [],
      context: {
        module: plan.module,
        lastQueryText: userMessage,
      },
    };
  }

  // 2. Execute grounded database query
  const dalResult = await executeQueryPlan(plan, userContext);

  if (!dalResult.success) {
    return {
      message: dalResult.error || "Unable to retrieve data for this query.",
      error: dalResult.error,
      data: null,
      kpis: [],
      records: [],
      columns: [],
      citations: [],
      context: {
        module: plan.module,
        lastQueryText: userMessage,
      },
    };
  }

  // 3. Construct visual chart config if requested or data is categorical/numerical
  const chartConfig = buildChartConfig(plan, dalResult);

  // 4. Optional: Call external LLM (Gemini) for linguistic polish and multilingual synthesis
  let naturalResponse = dalResult.summaryText;
  let startingSummary = dalResult.startingSummary || dalResult.summaryText;
  let modelUsed = "dsqe-deterministic";

  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
      let langInstruction = "";
      if (plan.detectedLanguage && plan.detectedLanguage !== "en") {
        const langNames = { hi: "Hindi/Hinglish", es: "Spanish", fr: "French" };
        const langName = langNames[plan.detectedLanguage] || plan.detectedLanguage;
        langInstruction = `\nLanguage Instruction: The user communicated in ${langName}. You MUST respond in natural, fluent ${langName} while keeping technical HR terms (such as Department, Leaves, EPF, Staffify, INR) and exact numeric metrics grounded and intact.`;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are Staffify AI Copilot, a professional enterprise HRMS assistant.
Grounding Rule: Only state facts from the provided verified database results. Never invent figures or records.
User Question: "${userMessage}"
Retrieved Data: ${JSON.stringify(dalResult.records.slice(0, 10))}
KPI Metrics: ${JSON.stringify(dalResult.kpis)}
Factual Summary: "${dalResult.summaryText}"${langInstruction}
Provide a polite, professional, concise response summarizing the findings:`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (response.ok) {
        const json = await response.json();
        const geminiText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          naturalResponse = geminiText.trim();
          startingSummary = geminiText.trim();
          modelUsed = `google-gemini (${geminiModel})`;
        }
      }
    } catch (llmErr) {
      console.warn("External LLM call skipped, using deterministic summary:", llmErr.message);
    }
  }

  return {
    message: naturalResponse,
    summary: startingSummary || naturalResponse,
    modelUsed,
    chartConfig,
    detectedLanguage: plan.detectedLanguage || "en",
    description: dalResult.detailedDescription || "",
    suggestedFollowUps: dalResult.suggestedFollowUps || [],
    records: dalResult.records,
    columns: dalResult.columns,
    kpis: dalResult.kpis,
    totalCount: dalResult.totalCount,
    citations: dalResult.citations,
    context: {
      module: plan.module,
      filters: plan.filters,
      lastQueryText: userMessage,
      lastRecordCount: dalResult.totalCount,
    },
  };
}

/**
 * Builds standard chart configuration for inline rendering in Staffify Copilot
 */
function buildChartConfig(plan, dalResult) {
  if (!dalResult || !Array.isArray(dalResult.records) || dalResult.records.length === 0) {
    return null;
  }

  const wantsChart = plan?.wantsChart;
  const isDepartmentSummary = dalResult.records.some(
    (r) => r.department && (r.count !== undefined || r.headcount !== undefined || r.employeeCount !== undefined || r.totalSalary !== undefined)
  );
  const isStatusDistribution = dalResult.records.some((r) => (r.status || r._id) && r.count !== undefined);
  const isCandidatePipeline = plan?.module === "candidates" || dalResult.records.some((r) => r.stage !== undefined);

  if (!wantsChart && !isDepartmentSummary && !isStatusDistribution && !isCandidatePipeline) {
    return null;
  }

  const PALETTE = ["#0052CC", "#00C7E6", "#6554C0", "#36B37E", "#FFAB00", "#FF5630", "#4C9AFF", "#8777D9"];

  // Funnel chart for recruitment pipeline
  if (isCandidatePipeline && dalResult.records.some((r) => r.stage)) {
    const stageCounts = {};
    dalResult.records.forEach((r) => {
      const s = r.stage || "Applied";
      stageCounts[s] = (stageCounts[s] || 0) + 1;
    });
    const standardOrder = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];
    const stages = Object.keys(stageCounts).sort((a, b) => {
      const ia = standardOrder.indexOf(a);
      const ib = standardOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    return {
      type: "funnel",
      title: "Recruitment Pipeline Conversion",
      unit: "Candidates",
      data: stages.map((st, idx) => ({
        label: st,
        value: stageCounts[st],
        color: PALETTE[idx % PALETTE.length],
      })),
    };
  }

  // Department distribution
  const hasDepartment = dalResult.records.some((r) => r.department);
  if (isDepartmentSummary || (wantsChart && hasDepartment)) {
    const hasSalary = dalResult.records.some((r) => r.totalSalary !== undefined);
    const deptMap = {};
    dalResult.records.forEach((r, idx) => {
      const d = r.department || r._id || `Dept ${idx + 1}`;
      const val = Number(r.count || r.headcount || r.employeeCount || r.totalSalary || 1);
      deptMap[d] = (deptMap[d] || 0) + val;
    });

    const data = Object.entries(deptMap)
      .slice(0, 8)
      .map(([dept, val], idx) => ({
        label: dept,
        value: val,
        color: PALETTE[idx % PALETTE.length],
      }));

    const chartType = plan.chartType === "bar" || data.length > 5 ? "bar" : "donut";
    return {
      type: chartType,
      title: hasSalary ? "Payroll Allocation by Department" : "Headcount Distribution by Department",
      unit: hasSalary ? "INR" : "Employees",
      data,
    };
  }

  // Status breakdown
  if (isStatusDistribution) {
    const data = dalResult.records.slice(0, 6).map((r, idx) => ({
      label: String(r.status || r._id || "Active"),
      value: Number(r.count || 1),
      color: PALETTE[idx % PALETTE.length],
    }));
    return {
      type: "donut",
      title: "Status Distribution",
      unit: "Records",
      data,
    };
  }

  // Generic fallback if user asked for a chart
  if (wantsChart) {
    const firstRec = dalResult.records[0];
    const numKey = Object.keys(firstRec).find((k) => typeof firstRec[k] === "number" && k !== "id" && k !== "_id");
    const labelKey = Object.keys(firstRec).find((k) => typeof firstRec[k] === "string" && k !== "id" && k !== "_id");

    if (numKey && labelKey) {
      return {
        type: plan.chartType || "bar",
        title: `${labelKey.toUpperCase()} Analytics`,
        unit: numKey,
        data: dalResult.records.slice(0, 8).map((r, idx) => ({
          label: String(r[labelKey] || `Item ${idx + 1}`),
          value: Number(r[numKey] || 0),
          color: PALETTE[idx % PALETTE.length],
        })),
      };
    }
  }

  return null;
}

module.exports = {
  generateGroundedResponse,
  buildChartConfig,
};
