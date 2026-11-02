/**
 * Staffify E2E Screenshot Capture Pipeline
 * Uses puppeteer-core and system Google Chrome to capture high-resolution
 * viewports across all application screens and interactive modals.
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const BASE_URL = "http://127.0.0.1:5173";
const OUTPUT_DIR = path.resolve(__dirname, "../../docs/assets/screenshots");

// Ensure screenshots directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureScreenshots() {
  console.log("==================================================");
  console.log("STAFFIFY E2E SCREENSHOT AUTOMATION SUITE");
  console.log("==================================================");
  console.log(`Target: ${BASE_URL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}\n`);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1440,900",
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2, // Retina crispness
    },
  });

  const page = await browser.newPage();

  try {
    // 1. Capture Login Screen
    console.log("Capturing 01_login_screen.png...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await wait(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "01_login_screen.png") });

    // 2. Perform Login as Admin
    console.log("Logging in as Administrator (admin@staffify.com)...");
    await page.type("input[type='email']", "admin@staffify.com");
    await page.type("input[type='password']", "Admin@123");
    await wait(300);
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }).catch(() => {});
    await wait(1500);

    // 3. Dashboard Overview
    console.log("Capturing 02_dashboard_overview.png...");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "02_dashboard_overview.png") });

    // 4. Attendance & Geofencing
    console.log("Capturing 03_attendance_and_geofencing.png...");
    await page.goto(`${BASE_URL}/attendance`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "03_attendance_and_geofencing.png") });

    // 5. Attendance Regularization Modal
    console.log("Capturing 04_attendance_regularization_modal.png...");
    const regButtons = await page.$$("button");
    let regClicked = false;
    for (const b of regButtons) {
      const txt = await page.evaluate((el) => el.textContent, b);
      if (txt && txt.includes("Regularize")) {
        await b.click();
        regClicked = true;
        break;
      }
    }
    if (regClicked) {
      await wait(600);
      await page.screenshot({ path: path.join(OUTPUT_DIR, "04_attendance_regularization_modal.png") });
      await page.keyboard.press("Escape");
      await wait(300);
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, "04_attendance_regularization_modal.png") });
    }

    // 6. Leave Management
    console.log("Capturing 05_leave_management.png...");
    await page.goto(`${BASE_URL}/leaves`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "05_leave_management.png") });

    // 7. Apply Leave Modal
    console.log("Capturing 06_apply_leave_modal.png...");
    const leaveButtons = await page.$$("button");
    let applyClicked = false;
    for (const b of leaveButtons) {
      const txt = await page.evaluate((el) => el.textContent, b);
      if (txt && txt.includes("Apply Leave")) {
        await b.click();
        applyClicked = true;
        break;
      }
    }
    if (applyClicked) {
      await wait(600);
      await page.screenshot({ path: path.join(OUTPUT_DIR, "06_apply_leave_modal.png") });
      await page.keyboard.press("Escape");
      await wait(300);
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, "06_apply_leave_modal.png") });
    }

    // 8. Employee Directory
    console.log("Capturing 07_employee_directory.png...");
    await page.goto(`${BASE_URL}/employees`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "07_employee_directory.png") });

    // 9. Employee 360 Dossier Modal
    console.log("Capturing 08_employee_dossier_modal.png...");
    const viewEyeBtn = await page.$("button[title='View Full 360 Dossier']");
    if (viewEyeBtn) {
      await viewEyeBtn.click();
      await wait(600);
      await page.screenshot({ path: path.join(OUTPUT_DIR, "08_employee_dossier_modal.png") });
      await page.keyboard.press("Escape");
      await wait(300);
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, "08_employee_dossier_modal.png") });
    }

    // 10. Payroll & Compliance
    console.log("Capturing 09_payroll_and_compliance.png...");
    await page.goto(`${BASE_URL}/payroll`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "09_payroll_and_compliance.png") });

    // 11. Payslips Self-Service
    console.log("Capturing 10_payslips_statement.png...");
    await page.goto(`${BASE_URL}/payslips`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "10_payslips_statement.png") });

    // 12. Performance & OKRs
    console.log("Capturing 11_performance_and_okrs.png...");
    await page.goto(`${BASE_URL}/performance`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "11_performance_and_okrs.png") });

    // 13. Goal Modal with AI SMART Refiner
    console.log("Capturing 12_goal_modal_smart_refiner.png...");
    const perfButtons = await page.$$("button");
    let goalClicked = false;
    for (const b of perfButtons) {
      const txt = await page.evaluate((el) => el.textContent, b);
      if (txt && (txt.includes("New Goal") || txt.includes("Set New") || txt.includes("Add Objective"))) {
        await b.click();
        goalClicked = true;
        break;
      }
    }
    if (goalClicked) {
      await wait(600);
      await page.screenshot({ path: path.join(OUTPUT_DIR, "12_goal_modal_smart_refiner.png") });
      await page.keyboard.press("Escape");
      await wait(300);
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, "12_goal_modal_smart_refiner.png") });
    }

    // 14. Recruitment & ATS
    console.log("Capturing 13_recruitment_ats.png...");
    await page.goto(`${BASE_URL}/recruitment`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "13_recruitment_ats.png") });

    // 15. Candidate Application Modal with AI Interview Kit
    console.log("Capturing 14_candidate_modal_interview_kit.png...");
    const recruitButtons = await page.$$("button");
    let candClicked = false;
    for (const b of recruitButtons) {
      const txt = await page.evaluate((el) => el.textContent, b);
      if (txt && (txt.includes("Add Candidate") || txt.includes("New Candidate"))) {
        await b.click();
        candClicked = true;
        break;
      }
    }
    if (candClicked) {
      await wait(600);
      await page.screenshot({ path: path.join(OUTPUT_DIR, "14_candidate_modal_interview_kit.png") });
      await page.keyboard.press("Escape");
      await wait(300);
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, "14_candidate_modal_interview_kit.png") });
    }

    // 16. Expense Management
    console.log("Capturing 15_expense_management.png...");
    await page.goto(`${BASE_URL}/expenses`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "15_expense_management.png") });

    // 17. Shift Rosters
    console.log("Capturing 16_shift_rosters.png...");
    await page.goto(`${BASE_URL}/roster`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "16_shift_rosters.png") });

    // 18. Helpdesk & Assets
    console.log("Capturing 17_helpdesk_and_assets.png...");
    await page.goto(`${BASE_URL}/helpdesk`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "17_helpdesk_and_assets.png") });

    // 19. Timesheets
    console.log("Capturing 18_timesheets.png...");
    await page.goto(`${BASE_URL}/timesheets`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "18_timesheets.png") });

    // 20. Org Hierarchy Chart
    console.log("Capturing 19_org_hierarchy_tree.png...");
    await page.goto(`${BASE_URL}/org-chart`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "19_org_hierarchy_tree.png") });

    // 21. Workplace Analytics
    console.log("Capturing 20_workplace_analytics.png...");
    await page.goto(`${BASE_URL}/analytics`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "20_workplace_analytics.png") });

    // 22. Offboarding & Settlement
    console.log("Capturing 21_offboarding_and_settlement.png...");
    await page.goto(`${BASE_URL}/offboarding`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "21_offboarding_and_settlement.png") });

    // 23. AI Copilot Workspace
    console.log("Capturing 22_ai_copilot_workspace.png...");
    await page.goto(`${BASE_URL}/copilot`, { waitUntil: "networkidle0" });
    await wait(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "22_ai_copilot_workspace.png") });

    // 24. Audit Logs
    console.log("Capturing 23_audit_logs.png...");
    await page.goto(`${BASE_URL}/audit-logs`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "23_audit_logs.png") });

    // 25. Webhook Bridge
    console.log("Capturing 24_webhook_bridge.png...");
    await page.goto(`${BASE_URL}/webhook-bridge`, { waitUntil: "networkidle0" });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "24_webhook_bridge.png") });

    console.log("\nAll 24 screen snapshots captured successfully!");
  } catch (err) {
    console.error("Screenshot capture pipeline encountered error:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

captureScreenshots();
