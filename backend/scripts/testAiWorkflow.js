const BASE_URL = "http://localhost:5001/api/ai";

async function runAiWorkflowTests() {
  console.log("================================================================================");
  console.log("   StaffifyGo Autonomous AI Copilot & Watchdog Workflow Test Verification   ");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 3;

  try {
    // Check 1: AI Anomaly Watchdog Scan
    console.log(">> Check 1: Executing Autonomous Workforce Anomaly Scan...");
    const resAnomalies = await fetch(`${BASE_URL}/anomalies`);
    const dataAnomalies = await resAnomalies.json();

    if (!dataAnomalies.success || !Array.isArray(dataAnomalies.data)) {
      throw new Error("Failed to scan anomalies: " + JSON.stringify(dataAnomalies));
    }
    console.log(`   [PASS] Total Anomalies Detected: ${dataAnomalies.stats?.total || dataAnomalies.data.length}`);
    console.log(`   [PASS] Critical Risks: ${dataAnomalies.stats?.critical || 0}`);
    console.log(`   [PASS] Warnings: ${dataAnomalies.stats?.warning || 0}`);
    console.log(`   [PASS] Sample Alert: "${dataAnomalies.data[0]?.title || "None"}"`);
    passed++;

    // Check 2: AI Candidate Smart Matching
    console.log("\n>> Check 2: Testing AI Smart Candidate Matching for Requisition...");
    const resMatch = await fetch(`${BASE_URL}/match-candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tradeCategory: "Security",
        skillsRequired: ["Patrol", "Access Control"],
        experienceYears: 1,
      }),
    });
    const dataMatch = await resMatch.json();

    if (!dataMatch.success || !Array.isArray(dataMatch.data)) {
      throw new Error("Failed to match candidates: " + JSON.stringify(dataMatch));
    }
    console.log(`   [PASS] Available Bench Candidates Evaluated: ${dataMatch.totalAvailable}`);
    console.log(`   [PASS] Top Matched Candidate: ${dataMatch.data[0]?.fullName} (Score: ${dataMatch.data[0]?.matchScore}%)`);
    console.log(`   [PASS] Match Reasons: ${dataMatch.data[0]?.matchReasons?.join(" | ") || "N/A"}`);
    passed++;

    // Check 3: Grounded Conversational AI Chat
    console.log("\n>> Check 3: Testing Grounded Natural Language Copilot Chat...");
    const queries = [
      "Audit PO budget burn rate and utilization",
      "How many workers are ready on the bench?",
      "Summarize labor compliance and EPF/ESIC returns",
    ];

    for (const q of queries) {
      const resChat = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const dataChat = await resChat.json();
      if (!dataChat.success || !dataChat.answer) {
        throw new Error(`Failed chat response for query "${q}": ` + JSON.stringify(dataChat));
      }
      console.log(`   [PASS] Query: "${q}" -> Answer generated (${dataChat.answer.length} chars, ${dataChat.quickActions?.length || 0} quick actions)`);
    }
    passed++;

    console.log("\n================================================================================");
    console.log(`   ALL ${passed}/${total} AI WORKFORCE COPILOT & WATCHDOG CHECKS PASSED!   `);
    console.log("================================================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("\n[FAIL] AI Workflow Test failed:", err.message);
    process.exit(1);
  }
}

runAiWorkflowTests();
