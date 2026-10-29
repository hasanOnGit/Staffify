const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../app/config/db");

const Requisition = require("../app/models/requisition.model");
const Worker = require("../app/models/worker.model");
const Deployment = require("../app/models/deployment.model");
const Client = require("../app/models/client.model");

async function runTest() {
  try {
    await connectDB();
    console.log("\n================================================================================");
    console.log("   StaffifyGo Requisitions & 1-Click Allocation Test Verification              ");
    console.log("================================================================================\n");

    const testTag = Math.floor(1000 + Math.random() * 9000);
    const worker1Id = `WRK-TEST-REQ-A-${testTag}`;
    const worker2Id = `WRK-TEST-REQ-B-${testTag}`;
    const reqId = `REQ-TEST-${testTag}`;

    // 1. Create 2 test workers available on bench
    console.log(">> Step 1: Enrolling 2 test workers on the bench...");
    const workerA = new Worker({
      workerId: worker1Id,
      fullName: `Test Security Guard Alpha ${testTag}`,
      phone: `+91 91000 ${testTag}`,
      email: `guard_alpha_${testTag}@example.com`,
      tradeCategory: "Security",
      primarySkill: "Premises Physical Security",
      experienceYears: 3,
      wagePerDayOrMonth: 22000,
      billingUnit: "Monthly",
      status: "Available",
      vendorId: "VND-1002",
      vendorName: "Infiniti TechStaffing",
      kycDetails: {
        aadhaarNumber: `88997766${testTag}`,
        policeVerificationStatus: "Verified",
        medicalFitnessCleared: true,
      },
    });
    await workerA.save();

    const workerB = new Worker({
      workerId: worker2Id,
      fullName: `Test Security Guard Beta ${testTag}`,
      phone: `+91 92000 ${testTag}`,
      email: `guard_beta_${testTag}@example.com`,
      tradeCategory: "Security",
      primarySkill: "CCTV Surveillance & Patrolling",
      experienceYears: 4,
      wagePerDayOrMonth: 24000,
      billingUnit: "Monthly",
      status: "Available",
      vendorId: "VND-1002",
      vendorName: "Infiniti TechStaffing",
      kycDetails: {
        aadhaarNumber: `77665544${testTag}`,
        policeVerificationStatus: "Verified",
        medicalFitnessCleared: true,
      },
    });
    await workerB.save();
    console.log(`   [PASS] Created test workers ${worker1Id} & ${worker2Id} with status Available`);

    // 2. Create Requisition
    console.log("\n>> Step 2: Creating client manpower requisition for 2 Security Officers...");
    const client = await Client.findOne().lean() || { clientId: "CLI-1001", legalName: "Apex Retail Pvt Ltd", sites: [{ siteId: "SITE-BLR-01", siteName: "Bangalore Logistics Hub" }] };
    const site = client.sites?.[0] || { siteId: "SITE-BLR-01", siteName: "Bangalore Logistics Hub" };

    const requisition = new Requisition({
      requisitionId: reqId,
      vendorId: "VND-1002",
      vendorName: "Infiniti TechStaffing",
      clientId: client.clientId,
      clientName: client.legalName,
      siteId: site.siteId,
      siteName: site.siteName,
      jobTitle: "Senior Security Supervisor",
      tradeCategory: "Security",
      requiredHeadcount: 2,
      fulfilledHeadcount: 0,
      urgency: "High",
      billingRate: 35000,
      billingUnit: "Monthly",
      targetWorkerPay: 23000,
      status: "Open",
    });
    await requisition.save();
    console.log(`   [PASS] Requisition ${reqId} created: 2 headcount needed at ${site.siteName}`);

    // 3. Simulate 1-Click Worker Allocation
    console.log("\n>> Step 3: Executing 1-Click worker allocation engine...");
    const res = await fetch(`http://localhost:5001/api/requisitions/${reqId}/allocate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vendor-id": "VND-1002",
      },
      body: JSON.stringify({
        workerIds: [worker1Id, worker2Id],
      }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(`Allocation API failed: ${data.message}`);
    }
    console.log(`   [PASS] API response: ${data.message}`);

    // 4. Verification in MongoDB Atlas
    console.log("\n>> Step 4: Verifying database persistence & state updates...");
    const updatedReq = await Requisition.findOne({ requisitionId: reqId }).lean();
    console.log(`   [PASS] Requisition fulfilledHeadcount: ${updatedReq.fulfilledHeadcount} / ${updatedReq.requiredHeadcount}`);
    console.log(`   [PASS] Requisition status: ${updatedReq.status} (Expected: Fulfilled)`);
    if (updatedReq.status !== "Fulfilled" || updatedReq.fulfilledHeadcount !== 2) {
      throw new Error("Requisition state did not shift to Fulfilled!");
    }

    const checkWorkerA = await Worker.findOne({ workerId: worker1Id }).lean();
    const checkWorkerB = await Worker.findOne({ workerId: worker2Id }).lean();
    console.log(`   [PASS] Worker ${worker1Id} status: ${checkWorkerA.status} (Expected: Deployed)`);
    console.log(`   [PASS] Worker ${worker2Id} status: ${checkWorkerB.status} (Expected: Deployed)`);
    if (checkWorkerA.status !== "Deployed" || checkWorkerB.status !== "Deployed") {
      throw new Error("Worker statuses were not updated to Deployed!");
    }

    const deployments = await Deployment.find({
      workerId: { $in: [worker1Id, worker2Id] },
    }).lean();
    console.log(`   [PASS] Active deployments created in MongoDB: ${deployments.length}`);
    if (deployments.length !== 2) {
      throw new Error("Expected 2 deployments to be created in MongoDB!");
    }

    // 5. Cleanup
    console.log("\n>> Step 5: Cleaning up temporary test records...");
    await Worker.deleteMany({ workerId: { $in: [worker1Id, worker2Id] } });
    await Deployment.deleteMany({ workerId: { $in: [worker1Id, worker2Id] } });
    await Requisition.deleteOne({ requisitionId: reqId });
    console.log("   [PASS] Cleaned up temporary test records.");

    console.log("\n================================================================================");
    console.log("   REQUISITIONS & ALLOCATION ENGINE VERIFIED 100% WORKING!                     ");
    console.log("================================================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runTest();
