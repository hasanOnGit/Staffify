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

}


