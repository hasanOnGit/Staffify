module.exports = function(app) {

require('./controllers/user.controller')(app);
require('./controllers/employees.controller')(app);
require('./controllers/leaves.controller')(app);


}
