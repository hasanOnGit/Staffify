const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/staffify_erp";
    
    await mongoose.connect(mongoUri);
    console.log("[StaffifyGo Database] Connected to MongoDB successfully.");
  } catch (err) {
    console.error("[StaffifyGo Database] Connection error:", err.message);
  }
};

module.exports = connectDB;
