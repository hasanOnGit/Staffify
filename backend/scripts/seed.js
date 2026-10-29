const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config();
const connectDB = require("../app/config/db");
const { seedData } = require("../app/controllers/seed.controller");

async function run() {
  await connectDB();
  console.log("Seeding Vendor & Staffing Management ERP records...");
  await seedData();
  console.log("Database seeded successfully!");
  process.exit(0);
}

run();
