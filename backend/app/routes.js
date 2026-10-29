const vendorRoutes = require("./controllers/vendor.controller");
const clientRoutes = require("./controllers/client.controller");
const commercialRoutes = require("./controllers/commercial.controller");
const deploymentRoutes = require("./controllers/deployment.controller");
const vendorInvoiceRoutes = require("./controllers/vendorInvoice.controller");
const { router: seedRoutes } = require("./controllers/seed.controller");

module.exports = function (app) {
  app.use("/api/vendors", vendorRoutes);
  app.use("/api/clients", clientRoutes);
  app.use("/api/commercials", commercialRoutes);
  app.use("/api/deployments", deploymentRoutes);
  app.use("/api/vendor-invoices", vendorInvoiceRoutes);
  app.use("/api/seed", seedRoutes);
};
