const http = require('http');
const jwt = require('jsonwebtoken');
const path = require('path');

const { planQuery } = require('../app/ai/queryPlanner');
const { generateGroundedResponse } = require('../app/ai/modelProvider');
const { findModuleByTask, getModulesDirectory } = require('../app/ai/capabilityRegistry');

const JWT_SECRET = process.env.JWT_SECRET || 'staffify_super_secret_jwt_key_2026_dev';

function generateTestToken(role = 'Employee', userId = 'EMP-TEST-01') {
  return jwt.sign(
    { userId, employeeId: userId, role, name: 'Test User', email: 'test@staffify.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function makeApiRequest(pathUrl, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: pathUrl,
        method,
        headers,
      },
      (res) => {
        let respData = '';
        res.on('data', (chunk) => (respData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(respData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTestSuite() {
  console.log('==================================================================');
  console.log('STAFFIFY AI MODULE ROUTING & DISCOVERY TEST SUITE');
  console.log('==================================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log('[PASS] ' + message);
    } else {
      console.error('[FAIL] ' + message);
    }
  }

  // 1. Task Matching Unit Tests
  console.log('>>> SECTION 1: TASK-TO-MODULE MATCHING ENGINE');

  const leaveMatch = findModuleByTask('Where can I apply for leave?', 'Employee');
  assert(leaveMatch && leaveMatch.module.id === 'leaves', 'Leaves task matches leaves module');
  assert(leaveMatch && leaveMatch.module.actionRoute === '/leaves?apply=true', 'Leaves actionRoute is /leaves?apply=true');
  assert(leaveMatch && leaveMatch.isAuthorized === true, 'Employee is authorized for Leaves');

  const payslipMatch = findModuleByTask('How do I download my payslip?', 'Employee');
  assert(payslipMatch && payslipMatch.module.id === 'payslips', 'Payslip query matches payslips module');
  assert(payslipMatch && payslipMatch.module.route === '/payslips', 'Payslip route is /payslips');

  const orgTreeMatch = findModuleByTask('Where can I see the company org tree?', 'Employee');
  assert(orgTreeMatch && orgTreeMatch.module.id === 'org-chart', 'Org tree query matches org-chart module');

  const expenseMatch = findModuleByTask('How do I submit an expense reimbursement?', 'Employee');
  assert(expenseMatch && expenseMatch.module.id === 'expenses', 'Expense query matches expenses module');
  assert(expenseMatch && expenseMatch.module.actionRoute === '/expenses?claim=true', 'Expense actionRoute is /expenses?claim=true');

  const timesheetMatch = findModuleByTask('Where can I log my project timesheet hours?', 'Employee');
  assert(timesheetMatch && timesheetMatch.module.id === 'timesheets', 'Timesheet query matches timesheets module');

  const ticketMatch = findModuleByTask('Where do I raise an IT support ticket?', 'Employee');
  assert(ticketMatch && ticketMatch.module.id === 'helpdesk', 'Ticket query matches helpdesk module');
  assert(ticketMatch && ticketMatch.module.actionRoute === '/helpdesk?ticket=true', 'Ticket actionRoute is /helpdesk?ticket=true');

  const rosterMatch = findModuleByTask('Where can I check my shift roster?', 'Employee');
  assert(rosterMatch && rosterMatch.module.id === 'roster', 'Roster query matches roster module');

  // 2. Role-Based Access Control Tests
  console.log('\n>>> SECTION 2: RBAC PERMISSIONS ON TASK ROUTING');

  const empAddMatch = findModuleByTask('Where do I add a new employee?', 'Employee');
  assert(empAddMatch && empAddMatch.module.id === 'employees', 'Add employee matches employees module');
  assert(empAddMatch && empAddMatch.isAuthorized === false, 'Employee is NOT authorized for Employee Directory adding');

  const adminAddMatch = findModuleByTask('Where do I add a new employee?', 'Admin');
  assert(adminAddMatch && adminAddMatch.isAuthorized === true, 'Admin IS authorized for Employee Directory adding');

  const empPayrollMatch = findModuleByTask('Where do I run monthly payroll?', 'Employee');
  assert(empPayrollMatch && empPayrollMatch.isAuthorized === false, 'Employee is NOT authorized to run payroll');

  const adminPayrollMatch = findModuleByTask('Where do I run monthly payroll?', 'Admin');
  assert(adminPayrollMatch && adminPayrollMatch.isAuthorized === true, 'Admin IS authorized to run payroll');

  // 3. Module Directory Catalog Tests
  console.log('\n>>> SECTION 3: SYSTEM MODULE DIRECTORY CATALOG');

  const empDirectory = getModulesDirectory('Employee');
  assert(empDirectory['Self Service (ESS)'].length >= 10, 'Employee sees all 10+ ESS modules');
  assert(empDirectory['Manager Services'].length === 0, 'Employee does not see Manager Services');
  assert(empDirectory['HR & Administration'].length === 0, 'Employee does not see Admin modules');

  const adminDirectory = getModulesDirectory('Admin');
  assert(adminDirectory['Self Service (ESS)'].length >= 10, 'Admin sees all ESS modules');
  assert(adminDirectory['Manager Services'].length >= 4, 'Admin sees Manager Services modules');
  assert(adminDirectory['HR & Administration'].length >= 2, 'Admin sees HR & Administration modules');

  // 4. Grounded Response Provider Tests
  console.log('\n>>> SECTION 4: GROUNDED RESPONSE GENERATION');

  const leaveResponse = await generateGroundedResponse('Where can I apply for leave?', [], {
    role: 'Employee',
    name: 'Aarav Sharma',
  });
  assert(leaveResponse.intentType === 'MODULE_NAVIGATION', 'Response intent is MODULE_NAVIGATION');
  assert(leaveResponse.navigationCard !== null, 'navigationCard payload is attached');
  assert(leaveResponse.navigationCard.actionRoute === '/leaves?apply=true', 'Action route correctly set to /leaves?apply=true');
  assert(leaveResponse.navigationCard.steps.length > 0, 'Step-by-step instructions included');

  const catalogResponse = await generateGroundedResponse('What modules are available?', [], {
    role: 'Employee',
    name: 'Aarav Sharma',
  });
  assert(catalogResponse.intentType === 'MODULE_DIRECTORY', 'Response intent is MODULE_DIRECTORY');
  assert(catalogResponse.moduleDirectory !== null, 'moduleDirectory payload is attached');
  assert(catalogResponse.kpis.length > 0, 'KPI summary cards attached');

  // 5. Live HTTP API Endpoint Verification
  console.log('\n>>> SECTION 5: LIVE REST API INTEGRATION (/api/ai/chat)');

  try {
    const token = generateTestToken('Employee', 'EMP-TEST-01');
    const apiRes = await makeApiRequest('/api/ai/chat', 'POST', { message: 'Where can I apply for leave?' }, token);

    assert(apiRes.status === 200, 'API returned HTTP 200 OK');
    assert(apiRes.body.success === true, 'API response success flag is true');
    assert(apiRes.body.navigationCard !== null, 'API response includes navigationCard');
    assert(apiRes.body.navigationCard.moduleId === 'leaves', 'API response navigationCard moduleId is leaves');
    assert(apiRes.body.navigationCard.actionRoute === '/leaves?apply=true', 'API response actionRoute is /leaves?apply=true');

    // Test catalog endpoint
    const catalogApiRes = await makeApiRequest('/api/ai/chat', 'POST', { message: 'Tell me about the modules available' }, token);
    assert(catalogApiRes.status === 200, 'Catalog API returned HTTP 200 OK');
    assert(catalogApiRes.body.moduleDirectory !== null, 'Catalog API returned moduleDirectory object');
  } catch (err) {
    console.error('API test error:', err.message);
    assert(false, 'API call succeeded without error: ' + err.message);
  }

  console.log('\n==================================================================');
  console.log('TEST SUMMARY: ' + passedTests + ' / ' + totalTests + ' passed (' + ((passedTests / totalTests) * 100).toFixed(1) + '%)');
  console.log('==================================================================');

  if (passedTests === totalTests) {
    console.log('ALL MODULE ROUTING & DISCOVERY CHECKS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
