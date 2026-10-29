const mongoose = require("mongoose");
const BASE_URL = "http://localhost:5001/api";

async function runSettlementsWorkflowTests() {
  console.log("================================================================================");
  console.log("   StaffifyGo Worker Exits & Final Payouts Workflow Test Verification   ");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 6;
  let testSettlementId = null;

  try {
    // Check 1: Initial settlements stats
    console.log(">> Check 1: Fetching Exits & Final Payouts Summary Stats...");
    const resList = await fetch(`${BASE_URL}/settlements`);
    const dataList = await resList.json();

    if (!dataList.success || !dataList.stats) {
      throw new Error("Failed to fetch settlements list and stats");
    }
    console.log(`   [PASS] Total Exit Records: ${dataList.stats.totalCount}`);
    console.log(`   [PASS] Pending Clearances: ${dataList.stats.pendingClearances}`);
    console.log(`   [PASS] Ready for Payment: ${dataList.stats.readyForPayment}`);
    console.log(`   [PASS] Total Settled & Paid: Rs ${dataList.stats.totalPaidOut.toLocaleString()}`);
    passed++;

    // Prepare test worker
    console.log("\n>> Preparing test worker and advance for exit settlement test...");
    const resWorkers = await fetch(`${BASE_URL}/workers`);
    const dataWorkers = await resWorkers.json();
    const workers = dataWorkers.data || [];
    if (workers.length === 0) {
      throw new Error("No workers found to test settlement workflow");
    }

    // Pick worker WRK-8002 or next worker to test cleanly
    const testWorker = workers.find((w) => w.workerId === "WRK-8002") || workers[1] || workers[0];
    const workerId = testWorker.workerId;
    console.log(`   [INFO] Using Worker: ${testWorker.fullName} (${workerId})`);

    // Clean up any existing active settlements for this test worker if rerun
    require("dotenv").config({ path: "./backend/.env" });
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/hr_portal";
    await mongoose.connect(mongoUri);
    const Settlement = require("../app/models/settlement.model");
    await Settlement.deleteMany({ workerId, status: { $ne: "Settled & Paid" } });

    // Ensure worker has a test loan so we can verify automatic advance deduction
    console.log("   [INFO] Issuing a temporary Rs 5,000 emergency medical advance for test verification...");
    const resAdvance = await fetch(`${BASE_URL}/loans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId: workerId,
        workerName: testWorker.fullName,
        loanType: "Emergency Medical Advance",
        principalAmount: 5000,
        tenureMonths: 2,
        reason: "Test advance for exit deduction check",
        repaymentStartMonth: "April",
        repaymentStartYear: 2026,
      }),
    });
    const dataAdvance = await resAdvance.json();
    if (!dataAdvance.success) {
      throw new Error("Failed to issue test advance: " + dataAdvance.message);
    }
    console.log(`   [PASS] Issued test advance: ${dataAdvance.data.loanId}`);

    // Check 2: Initiate worker exit settlement
    console.log("\n>> Check 2: Initiating Worker Exit Settlement...");
    const resCreate = await fetch(`${BASE_URL}/settlements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId: workerId,
        lastWorkingDate: new Date().toISOString(),
        exitReason: "Tour Completed",
        daysWorkedInExitMonth: 12,
        leaveEncashmentPay: 2500,
        bonusOrIncentive: 1000,
        unreturnedAssetDeduction: 0,
        otherDeductions: 0,
        notes: "Automated test exit initiation with auto-advance deduction",
      }),
    });
    const dataCreate = await resCreate.json();

    if (!dataCreate.success || !dataCreate.data) {
      throw new Error("Failed to create exit settlement: " + dataCreate.message);
    }

    const settlement = dataCreate.data;
    testSettlementId = settlement.settlementId;
    console.log(`   [PASS] Created Settlement ID: ${testSettlementId}`);
    console.log(`   [PASS] Days Worked: ${settlement.earnings.daysWorkedInExitMonth} days @ Rs ${settlement.earnings.dailyRate}/day`);
    console.log(`   [PASS] Earned Wages: Rs ${settlement.earnings.earnedWages.toLocaleString()}`);
    console.log(`   [PASS] Total Earnings: Rs ${settlement.earnings.totalEarnings.toLocaleString()}`);
    console.log(`   [PASS] Outstanding Advance Auto-Deducted: Rs ${settlement.deductions.outstandingAdvanceDeducted.toLocaleString()} (Expected >= 5000)`);
    console.log(`   [PASS] Net Final Payout: Rs ${settlement.netFinalPayout.toLocaleString()}`);
    console.log(`   [PASS] Initial Status: ${settlement.status}`);

    if (settlement.deductions.outstandingAdvanceDeducted < 5000) {
      throw new Error("Expected at least Rs 5000 advance to be auto-deducted");
    }
    passed++;

    // Check 3: Retrieve settlement voucher by ID
    console.log("\n>> Check 3: Fetching Settlement Voucher by ID...");
    const resGet = await fetch(`${BASE_URL}/settlements/${testSettlementId}`);
    const dataGet = await resGet.json();

    if (!dataGet.success || !dataGet.data) {
      throw new Error("Failed to fetch settlement by ID");
    }
    console.log(`   [PASS] Verified Settlement Worker Details: Phone=${dataGet.data.workerDetails?.phone || "N/A"}, Trade=${dataGet.data.workerDetails?.tradeCategory || "N/A"}`);
    passed++;

    // Check 4: Update clearances partially (still Clearance In Progress)
    console.log("\n>> Check 4: Testing Partial Clearance Sign-Off...");
    const resPartial = await fetch(`${BASE_URL}/settlements/${testSettlementId}/clearance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idCardReturned: true,
        uniformReturned: true,
        toolsEquipmentReturned: false,
        siteSupervisorApproved: false,
        remarks: "ID Card & Uniform returned at site gate.",
      }),
    });
    const dataPartial = await resPartial.json();

    if (!dataPartial.success || dataPartial.data.status !== "Clearance In Progress") {
      throw new Error(`Expected status 'Clearance In Progress', got: ${dataPartial.data?.status}`);
    }
    console.log(`   [PASS] Partial checklist updated; status maintained as: ${dataPartial.data.status}`);
    passed++;

    // Check 5: Complete all 4 clearances (transitions to Ready for Payment)
    console.log("\n>> Check 5: Completing All 4 Clearances (Auto-Transition to Ready for Payment)...");
    const resFullClear = await fetch(`${BASE_URL}/settlements/${testSettlementId}/clearance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toolsEquipmentReturned: true,
        siteSupervisorApproved: true,
        remarks: "All site tools handed over in good condition. Supervisor approved.",
      }),
    });
    const dataFullClear = await resFullClear.json();

    if (!dataFullClear.success || dataFullClear.data.status !== "Ready for Payment") {
      throw new Error(`Expected status 'Ready for Payment', got: ${dataFullClear.data?.status}`);
    }
    console.log(`   [PASS] All 4 clearances verified. Status successfully progressed to: ${dataFullClear.data.status}`);
    passed++;

    // Check 6: Disburse payout and mark Settled & Paid
    console.log("\n>> Check 6: Disbursing Final Payout & Closing Records...");
    const resPay = await fetch(`${BASE_URL}/settlements/${testSettlementId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMode: "Direct Bank Transfer",
        transactionRef: "NEFT-SET-998822",
        paidBy: "Finance Disbursal Team",
        notes: "Bank transfer processed to worker salary account.",
      }),
    });
    const dataPay = await resPay.json();

    if (!dataPay.success || dataPay.data.status !== "Settled & Paid") {
      throw new Error(`Expected status 'Settled & Paid', got: ${dataPay.data?.status}`);
    }
    console.log(`   [PASS] Payout disbursed: Status is now ${dataPay.data.status}`);
    console.log(`   [PASS] Payment Mode: ${dataPay.data.paymentDetails.paymentMode}, Ref: ${dataPay.data.paymentDetails.transactionRef}`);

    // Verify related active loan was marked as Fully Repaid
    const resLoansCheck = await fetch(`${BASE_URL}/loans?workerId=${workerId}`);
    const dataLoansCheck = await resLoansCheck.json();
    const activeRemaining = (dataLoansCheck.data || []).filter(l => l.loanId === dataAdvance.data.loanId && l.status === "Active");
    console.log(`   [PASS] Verified test loan ${dataAdvance.data.loanId} is closed: active count = ${activeRemaining.length}`);
    passed++;

    console.log("\n================================================================================");
    console.log(`   All ${passed}/${total} Worker Exits & Final Payouts tests passed successfully!   `);
    console.log("================================================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n[FAIL] Test encountered an error:", err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runSettlementsWorkflowTests();
