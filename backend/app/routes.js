module.exports = function(app) {

require('./controllers/user.controller')(app);
require('./controllers/employees.controller')(app);
require('./controllers/leaves.controller')(app);
require('./controllers/attendance.controller')(app);
require('./controllers/holiday.controller')(app);
require('./controllers/team.controller')(app);
require('./controllers/payroll.controller')(app);
require('./controllers/performance.controller')(app);
require('./controllers/roster.controller')(app);
require('./controllers/helpdesk.controller')(app);
require('./controllers/recruitment.controller')(app);
require('./controllers/geofence.controller')(app);
require('./controllers/tax.controller')(app);
require('./controllers/settlement.controller')(app);
require('./controllers/complianceExport.controller')(app);
require('./controllers/biometric.controller')(app);
require('./controllers/expense.controller')(app);
require('./controllers/hrDocument.controller')(app);
require('./controllers/loan.controller')(app);
require('./controllers/pulse.controller')(app);
require('./controllers/analytics.controller')(app);
require('./controllers/timesheet.controller')(app);
require('./controllers/offboarding.controller')(app);
require('./controllers/webhook.controller')(app);
require('./controllers/ai.controller')(app);
require('./controllers/auditLog.controller')(app);

}


