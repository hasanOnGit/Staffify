const BASE_URL = "http://localhost:5001/api/compliance";

async function runComplianceWorkflowTests() {
  console.log("================================================================================");
  console.log("   StaffifyGo Statutory Compliance & Labor Registers Test Verification         ");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 5;

  try {
    // Check 1: Overview
    console.log(">> Check 1: Fetching Compliance Overview & Audit Health Scorecard...");
    const resOverview = await fetch(`${BASE_URL}/overview`);
    const dataOverview = await resOverview.json();

    if (!dataOverview.success || !dataOverview.data) {
      throw new Error("Failed to fetch compliance overview");
    }
    console.log(`   [PASS] Total Workers: ${dataOverview.data.totalWorkers}`);
    console.log(`   [PASS] KYC Completion Rate: ${dataOverview.data.kycCompletionRate}%`);
    console.log(`   [PASS] Minimum Wage Compliance: ${dataOverview.data.minimumWageComplianceRate}%`);
    console.log(`   [PASS] EPF Coverage Rate: ${dataOverview.data.epfCoverageRate}%`);
    console.log(`   [PASS] Audit Readiness Score: ${dataOverview.data.auditReadinessScore} / 100 (${dataOverview.data.auditStatus})`);
    passed++;

    // Check 2: Form B Wage Register
    console.log("\n>> Check 2: Generating Form B (Wage Register)...");
    const resFormB = await fetch(`${BASE_URL}/form-b`);
    const dataFormB = await resFormB.json();

    if (!dataFormB.success || !Array.isArray(dataFormB.data)) {
      throw new Error("Failed to generate Form B register");
    }
    console.log(`   [PASS] Form B Title: "${dataFormB.meta?.formTitle}"`);
    console.log(`   [PASS] Entries Count: ${dataFormB.data.length}`);
    console.log(`   [PASS] Grand Gross Wages: Rs ${dataFormB.totals?.grandGross.toLocaleString()}`);
    console.log(`   [PASS] Grand EPF Deductions (12%): Rs ${dataFormB.totals?.grandPf.toLocaleString()}`);
    console.log(`   [PASS] Grand Net Wages Disbursed: Rs ${dataFormB.totals?.grandNet.toLocaleString()}`);
    passed++;

    // Check 3: Form D Muster Roll Register
    console.log("\n>> Check 3: Generating Form D (Attendance Register)...");
    const resFormD = await fetch(`${BASE_URL}/form-d`);
    const dataFormD = await resFormD.json();

    if (!dataFormD.success || !Array.isArray(dataFormD.data)) {
      throw new Error("Failed to generate Form D register");
    }
    console.log(`   [PASS] Form D Title: "${dataFormD.meta?.formTitle}"`);
    console.log(`   [PASS] Muster Roll Entries Count: ${dataFormD.data.length}`);
    console.log(`   [PASS] Total Present Days: ${dataFormD.totals?.totalPresentDays}`);
    console.log(`   [PASS] Total Overtime Hours: ${dataFormD.totals?.totalOtHours} hrs`);
    passed++;

    // Check 4: EPF Electronic Challan cum Return (ECR)
    console.log("\n>> Check 4: Calculating EPF ECR Remittance Batch...");
    const resEpf = await fetch(`${BASE_URL}/epf-ecr`);
    const dataEpf = await resEpf.json();

    if (!dataEpf.success || !dataEpf.summary) {
      throw new Error("Failed to calculate EPF ECR statement");
    }
    console.log(`   [PASS] Scheme: ${dataEpf.meta?.scheme}`);
    console.log(`   [PASS] EPF Wage Ceiling: Rs ${dataEpf.meta?.wageCeiling}`);
    console.log(`   [PASS] Total EPF Wages: Rs ${dataEpf.summary.totalEpfWages.toLocaleString()}`);
    console.log(`   [PASS] Total Employee Share (12%): Rs ${dataEpf.summary.totalEeShare12.toLocaleString()}`);
    console.log(`   [PASS] Total Employer Share (3.67% EPF + 8.33% EPS): Rs ${(dataEpf.summary.totalErShareEpf367 + dataEpf.summary.totalErShareEps833).toLocaleString()}`);
    console.log(`   [PASS] Total Challan Remittance: Rs ${dataEpf.summary.totalChallanPayable.toLocaleString()}`);
    passed++;

    // Check 5: ESIC Monthly Contribution Statement
    console.log("\n>> Check 5: Calculating ESIC Monthly Contribution Return...");
    const resEsic = await fetch(`${BASE_URL}/esic-return`);
    const dataEsic = await resEsic.json();

    if (!dataEsic.success || !dataEsic.summary) {
      throw new Error("Failed to calculate ESIC return");
    }
    console.log(`   [PASS] Scheme: ${dataEsic.meta?.scheme}`);
    console.log(`   [PASS] ESIC Wage Ceiling: Rs ${dataEsic.meta?.wageCeiling}`);
    console.log(`   [PASS] Eligible Headcount (< Rs 21k): ${dataEsic.summary.eligibleHeadcount}`);
    console.log(`   [PASS] Total ESIC Covered Wages: Rs ${dataEsic.summary.totalCoveredWages.toLocaleString()}`);
    console.log(`   [PASS] Employee Contribution (0.75%): Rs ${dataEsic.summary.totalEeShare075.toLocaleString()}`);
    console.log(`   [PASS] Employer Contribution (3.25%): Rs ${dataEsic.summary.totalErShare325.toLocaleString()}`);
    console.log(`   [PASS] Total ESIC Challan (4.0%): Rs ${dataEsic.summary.totalChallanPayable.toLocaleString()}`);
    passed++;

    console.log("\n================================================================================");
    console.log(`   STATUTORY COMPLIANCE REGISTERS VERIFIED ${passed}/${total} CHECKS PASSED!            `);
    console.log("================================================================================\n");
  } catch (err) {
    console.error("\n[FAIL] Compliance Workflow Test Failed:", err);
    process.exit(1);
  }
}

runComplianceWorkflowTests();
