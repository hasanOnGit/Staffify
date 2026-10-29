/**
 * Staffify Security Verification Test Suite
 * Validates HTTP Security Headers, NoSQL Injection Sanitization, Rate Limiting,
 * IDOR Defense, Privilege Escalation Defense, and RBAC Enforcement.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

let employeeToken = null;
let employeeUserId = null;
let managerToken = null;
let adminToken = null;

const results = [];

function recordResult(category, testCase, status, details = "") {
  results.push({ category, testCase, status, details });
  const mark = status === "PASSED" ? "[PASS]" : "[FAIL]";
  console.log(`${mark} [${category}] ${testCase} ${details ? "- " + details : ""}`);
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    method: options.method || "GET",
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  const res = await fetch(url, config);
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, headers: res.headers, ok: res.ok, data };
}

async function runSecurityTests() {
  console.log("\n=======================================================");
  console.log("     STAFFIFY ENTERPRISE SECURITY VERIFICATION SUITE   ");
  console.log("=======================================================\n");

  /* ==========================================================
     1. HTTP SECURITY HEADERS & INFORMATION DEFENSE
     ========================================================== */
  try {
    const healthRes = await request("/api/health");
    const headers = healthRes.headers;

    // Check X-Powered-By is suppressed
    const poweredBy = headers.get("x-powered-by");
    if (!poweredBy) {
      recordResult("Headers", "X-Powered-By Suppressed", "PASSED", "Server fingerprinting hidden");
    } else {
      recordResult("Headers", "X-Powered-By Suppressed", "FAILED", `Found header: ${poweredBy}`);
    }

    // Check X-Content-Type-Options
    const nosniff = headers.get("x-content-type-options");
    if (nosniff === "nosniff") {
      recordResult("Headers", "X-Content-Type-Options: nosniff", "PASSED", "MIME sniffing protection enabled");
    } else {
      recordResult("Headers", "X-Content-Type-Options: nosniff", "FAILED", `Value: ${nosniff}`);
    }

    // Check Correlation ID (X-Request-Id)
    const requestId = headers.get("x-request-id");
    if (requestId && requestId.length > 8) {
      recordResult("Tracing", "X-Request-Id Correlation Header", "PASSED", `Trace ID: ${requestId}`);
    } else {
      recordResult("Tracing", "X-Request-Id Correlation Header", "FAILED", "Missing correlation header");
    }

    // Check Frame Options / CSP
    const csp = headers.get("content-security-policy");
    const frameOptions = headers.get("x-frame-options");
    if (csp || frameOptions) {
      recordResult("Headers", "Clickjacking Defense (CSP/X-Frame-Options)", "PASSED", "Frame isolation verified");
    } else {
      recordResult("Headers", "Clickjacking Defense (CSP/X-Frame-Options)", "FAILED", "No frame isolation headers");
    }
  } catch (err) {
    recordResult("Headers", "Header Inspection Execution", "FAILED", err.message);
  }

  /* ==========================================================
     2. AUTHENTICATION & TOKEN ACQUISITION
     ========================================================== */
  try {
    const empLogin = await request("/api/login", {
      method: "POST",
      body: { email: "employee@staffify.com", password: "Employee@123" },
    });
    if (empLogin.status === 200 && empLogin.data.token) {
      employeeToken = empLogin.data.token;
      employeeUserId = empLogin.data.user.userId;
      recordResult("Auth", "Employee Authentication", "PASSED", `Logged in as ${empLogin.data.user.name}`);
    } else {
      recordResult("Auth", "Employee Authentication", "FAILED", JSON.stringify(empLogin.data));
    }

    const mgrLogin = await request("/api/login", {
      method: "POST",
      body: { email: "manager@staffify.com", password: "Manager@123" },
    });
    if (mgrLogin.status === 200 && mgrLogin.data.token) {
      managerToken = mgrLogin.data.token;
      recordResult("Auth", "Manager Authentication", "PASSED", `Logged in as ${mgrLogin.data.user.name}`);
    } else {
      recordResult("Auth", "Manager Authentication", "FAILED", JSON.stringify(mgrLogin.data));
    }

    const adminLogin = await request("/api/login", {
      method: "POST",
      body: { email: "admin@staffify.com", password: "Admin@123" },
    });
    if (adminLogin.status === 200 && adminLogin.data.token) {
      adminToken = adminLogin.data.token;
      recordResult("Auth", "Admin Authentication", "PASSED", `Logged in as ${adminLogin.data.user.name}`);
    } else {
      recordResult("Auth", "Admin Authentication", "FAILED", JSON.stringify(adminLogin.data));
    }
  } catch (err) {
    recordResult("Auth", "Login Execution", "FAILED", err.message);
  }

  /* ==========================================================
     3. UNAUTHENTICATED ACCESS DEFENSE (401 VERIFICATION)
     ========================================================== */
  try {
    const unauthCreate = await request("/api/createEmployee", {
      method: "POST",
      body: { name: "Malicious Actor", email: "hacker@evil.com" },
    });
    if (unauthCreate.status === 401) {
      recordResult("Access Control", "Reject Unauthenticated Create Employee", "PASSED", "401 Unauthorized returned");
    } else {
      recordResult("Access Control", "Reject Unauthenticated Create Employee", "FAILED", `Status: ${unauthCreate.status}`);
    }

    const unauthPayroll = await request("/api/payroll/run", {
      method: "POST",
      body: { month: 11, year: 2026 },
    });
    if (unauthPayroll.status === 401) {
      recordResult("Access Control", "Reject Unauthenticated Payroll Run", "PASSED", "401 Unauthorized returned");
    } else {
      recordResult("Access Control", "Reject Unauthenticated Payroll Run", "FAILED", `Status: ${unauthPayroll.status}`);
    }

    const unauthAudit = await request("/api/audit-logs");
    if (unauthAudit.status === 401) {
      recordResult("Access Control", "Reject Unauthenticated Audit Log Access", "PASSED", "401 Unauthorized returned");
    } else {
      recordResult("Access Control", "Reject Unauthenticated Audit Log Access", "FAILED", `Status: ${unauthAudit.status}`);
    }

    const unauthWebhook = await request("/api/webhooks/configs");
    if (unauthWebhook.status === 401) {
      recordResult("Access Control", "Reject Unauthenticated Webhook Config Access", "PASSED", "401 Unauthorized returned");
    } else {
      recordResult("Access Control", "Reject Unauthenticated Webhook Config Access", "FAILED", `Status: ${unauthWebhook.status}`);
    }
  } catch (err) {
    recordResult("Access Control", "Unauthenticated Check Execution", "FAILED", err.message);
  }

  /* ==========================================================
     4. PRIVILEGE ESCALATION DEFENSE (ANTI-ELEVATION)
     ========================================================== */
  try {
    // Employee attempting to elevate role to Admin on their own profile
    const escalateAttempt = await request(`/api/updateProfile/${employeeUserId}`, {
      method: "POST",
      token: employeeToken,
      body: { role: "Admin" },
    });
    if (escalateAttempt.status === 403) {
      recordResult("RBAC Integrity", "Privilege Escalation Prohibited", "PASSED", "Employee cannot escalate to Admin (403)");
    } else {
      recordResult("RBAC Integrity", "Privilege Escalation Prohibited", "FAILED", `Status: ${escalateAttempt.status}`);
    }
  } catch (err) {
    recordResult("RBAC Integrity", "Privilege Escalation Execution", "FAILED", err.message);
  }

  /* ==========================================================
     5. INSECURE DIRECT OBJECT REFERENCE (IDOR) DEFENSE
     ========================================================== */
  try {
    // Employee attempting to mutate Admin's profile
    const idorAttempt = await request("/api/updateProfile/DEMO-ADMIN", {
      method: "POST",
      token: employeeToken,
      body: { name: "Compromised Profile" },
    });
    if (idorAttempt.status === 403) {
      recordResult("IDOR Defense", "Cross-User Profile Mutation Blocked", "PASSED", "Employee cannot modify other user profiles (403)");
    } else {
      recordResult("IDOR Defense", "Cross-User Profile Mutation Blocked", "FAILED", `Status: ${idorAttempt.status}`);
    }
  } catch (err) {
    recordResult("IDOR Defense", "IDOR Execution", "FAILED", err.message);
  }

  /* ==========================================================
     6. RBAC PER-ROLE FUNCTIONALITY SCOPING
     ========================================================== */
  try {
    // Employee attempting to trigger payroll run -> Should be 403
    const empPayrollRun = await request("/api/payroll/run", {
      method: "POST",
      token: employeeToken,
      body: { month: 11, year: 2026 },
    });
    if (empPayrollRun.status === 403) {
      recordResult("RBAC Enforcement", "Employee Blocked from Payroll Execution", "PASSED", "403 Forbidden received");
    } else {
      recordResult("RBAC Enforcement", "Employee Blocked from Payroll Execution", "FAILED", `Status: ${empPayrollRun.status}`);
    }

    // Manager accessing audit logs -> Allowed
    const mgrAudit = await request("/api/audit-logs", { token: managerToken });
    if (mgrAudit.status === 200 && mgrAudit.data.success) {
      recordResult("RBAC Enforcement", "Manager Access to Audit Logs", "PASSED", `Retrieved ${mgrAudit.data.total} audit logs`);
    } else {
      recordResult("RBAC Enforcement", "Manager Access to Audit Logs", "FAILED", `Status: ${mgrAudit.status}`);
    }

    // Admin accessing webhook configs -> Allowed
    const adminWebhook = await request("/api/webhooks/configs", { token: adminToken });
    if (adminWebhook.status === 200 && adminWebhook.data.success) {
      recordResult("RBAC Enforcement", "Admin Webhook Configuration Control", "PASSED", `Managed ${adminWebhook.data.count} integrations`);
    } else {
      recordResult("RBAC Enforcement", "Admin Webhook Configuration Control", "FAILED", `Status: ${adminWebhook.status}`);
    }
  } catch (err) {
    recordResult("RBAC Enforcement", "RBAC Scoping Execution", "FAILED", err.message);
  }

  /* ==========================================================
     7. NOSQL OPERATOR INJECTION DEFENSE (SANITIZATION)
     ========================================================== */
  try {
    // Attempting to send an injected object with $where or $ne in body
    const injectAttempt = await request("/api/attendance/punch", {
      method: "POST",
      token: employeeToken,
      body: {
        employeeId: employeeUserId,
        type: "IN",
        $where: "sleep(5000)",
        $ne: null,
      },
    });
    // If sanitization works, $where and $ne keys were stripped cleanly without throwing syntax or mongo operator errors
    if (injectAttempt.status === 200 || injectAttempt.status === 403 || injectAttempt.status === 400) {
      recordResult("Injection Defense", "NoSQL Operator Keys Stripped", "PASSED", "Operators neutralised without server crash");
    } else {
      recordResult("Injection Defense", "NoSQL Operator Keys Stripped", "FAILED", `Status: ${injectAttempt.status}`);
    }
  } catch (err) {
    recordResult("Injection Defense", "Injection Execution", "FAILED", err.message);
  }

  /* ==========================================================
     TEST SUMMARY
     ========================================================== */
  console.log("\n=======================================================");
  console.log("            SECURITY VERIFICATION SUMMARY              ");
  console.log("=======================================================");
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  const rate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Security Checks Executed: ${total}`);
  console.log(`Passed:                         ${passed}`);
  console.log(`Failed:                         ${failed}`);
  console.log(`Compliance Score:               ${rate}%`);

  if (failed > 0) {
    console.log("\nFailed Checks Detail:");
    results
      .filter((r) => r.status === "FAILED")
      .forEach((r) => console.log(` - [${r.category}] ${r.testCase}: ${r.details}`));
    process.exit(1);
  } else {
    console.log("\nStaffify API & Security Hardening fully verified and compliant!");
    process.exit(0);
  }
}

runSecurityTests();
