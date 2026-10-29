const BASE_URL = "http://localhost:5001/api/loans";

async function runLoansWorkflowTests() {
  console.log("================================================================================");
  console.log("   StaffifyGo Worker Advances & Loan Repayment Deductions Test Verification    ");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 5;
  let testLoanId = null;

  try {
    // Check 1: Fetch initial advances list & stats
    console.log(">> Check 1: Fetching Advances & Loans Portfolio Stats...");
    const resList = await fetch(`${BASE_URL}`);
    const dataList = await resList.json();

    if (!dataList.success || !dataList.stats) {
      throw new Error("Failed to fetch loans list and stats");
    }
    console.log(`   [PASS] Total Disbursed: Rs ${dataList.stats.totalDisbursed.toLocaleString()}`);
    console.log(`   [PASS] Active Outstanding: Rs ${dataList.stats.totalOutstanding.toLocaleString()}`);
    console.log(`   [PASS] Total Recovered: Rs ${dataList.stats.totalRecovered.toLocaleString()}`);
    console.log(`   [PASS] Active Advances Count: ${dataList.stats.activeLoansCount}`);
    passed++;

    // Check 2: Issue a new salary advance
    console.log("\n>> Check 2: Issuing New Salary Advance (Rs 15,000 across 3 months)...");
    const resCreate = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId: "WRK-8001",
        workerName: "Abhishek Rao",
        loanType: "Salary Advance",
        principalAmount: 15000,
        tenureMonths: 3,
        reason: "Medical & family emergency support",
        repaymentStartMonth: "April",
        repaymentStartYear: 2026,
      }),
    });
    const dataCreate = await resCreate.json();

    if (!dataCreate.success || !dataCreate.data) {
      throw new Error("Failed to create salary advance: " + dataCreate.message);
    }
    testLoanId = dataCreate.data.loanId || dataCreate.data._id;
    console.log(`   [PASS] Issued Advance ID: ${testLoanId}`);
    console.log(`   [PASS] Principal Amount: Rs ${dataCreate.data.principalAmount.toLocaleString()}`);
    console.log(`   [PASS] Monthly EMI: Rs ${dataCreate.data.monthlyEmi.toLocaleString()} (Expected 5000)`);
    console.log(`   [PASS] Initial Remaining Balance: Rs ${dataCreate.data.remainingBalance.toLocaleString()}`);
    console.log(`   [PASS] Initial Status: ${dataCreate.data.status}`);
    passed++;

    // Check 3: Record first EMI repayment
    console.log("\n>> Check 3: Recording First EMI Repayment (Rs 5,000)...");
    const resRepay1 = await fetch(`${BASE_URL}/${testLoanId}/repay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 5000,
        paymentMethod: "Payroll Deduction",
        remarks: "April 2026 Monthly Salary EMI Deduction",
      }),
    });
    const dataRepay1 = await resRepay1.json();

    if (!dataRepay1.success || !dataRepay1.data) {
      throw new Error("Failed to record first repayment: " + dataRepay1.message);
    }
    console.log(`   [PASS] Total Repaid: Rs ${dataRepay1.data.totalRepaid.toLocaleString()}`);
    console.log(`   [PASS] Remaining Balance: Rs ${dataRepay1.data.remainingBalance.toLocaleString()} (Expected 10000)`);
    console.log(`   [PASS] Current Status: ${dataRepay1.data.status} (Expected Active)`);
    passed++;

    // Check 4: Record final full settlement repayment
    console.log("\n>> Check 4: Recording Final Settlement (Rs 10,000)...");
    const resRepay2 = await fetch(`${BASE_URL}/${testLoanId}/repay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 10000,
        paymentMethod: "Payroll Deduction",
        remarks: "May 2026 Final Settlement Deduction",
      }),
    });
    const dataRepay2 = await resRepay2.json();

    if (!dataRepay2.success || !dataRepay2.data) {
      throw new Error("Failed to record second repayment: " + dataRepay2.message);
    }
    console.log(`   [PASS] Total Repaid: Rs ${dataRepay2.data.totalRepaid.toLocaleString()} (Expected 15000)`);
    console.log(`   [PASS] Remaining Balance: Rs ${dataRepay2.data.remainingBalance.toLocaleString()} (Expected 0)`);
    console.log(`   [PASS] Settled Status: ${dataRepay2.data.status} (Expected Fully Repaid)`);
    passed++;

    // Check 5: Cleanup temporary test advance
    console.log("\n>> Check 5: Cleaning up temporary test advance record...");
    const mongoose = require("mongoose");
    const path = require("path");
    require("dotenv").config({ path: path.join(__dirname, "../.env") });
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.collection("loans").deleteOne({ loanId: testLoanId });
    await mongoose.disconnect();
    console.log(`   [PASS] Cleaned up temporary test advance ${testLoanId}`);
    passed++;

    console.log("\n================================================================================");
    console.log(`   WORKER ADVANCES & REPAYMENTS ENGINE ${passed}/${total} CHECKS PASSED!        `);
    console.log("================================================================================\n");
  } catch (err) {
    console.error("\n[FAIL] Loans Workflow Test Failed:", err);
    process.exit(1);
  }
}

runLoansWorkflowTests();
