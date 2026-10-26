const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

const { seedOpenSourceKnowledgeBase } = require("../ai/knowledgeSeeder");

const demoUsers = [
  { email: "admin@staffify.com", password: "Admin@123", role: "Admin", name: "Staffify Admin" },
  { email: "manager@staffify.com", password: "Manager@123", role: "Manager", name: "Staffify Manager" },
  { email: "employee@staffify.com", password: "Employee@123", role: "Employee", name: "Staffify Employee" },
];

const ensureDemoUsers = async () => {
  for (const demoUser of demoUsers) {
    const existingUser = await User.findOne({ email: demoUser.email });
    const hashedPassword = await bcrypt.hash(demoUser.password, 10);
    if (!existingUser) {
      await User.create({
        userId: `DEMO-${demoUser.role.toUpperCase()}`,
        name: demoUser.name,
        email: demoUser.email,
        password: hashedPassword,
        role: demoUser.role,
        isActive: true,
      });
    } else if (existingUser.userId?.startsWith("DEMO-")) {
      existingUser.password = hashedPassword;
      existingUser.role = demoUser.role;
      existingUser.isActive = true;
      await existingUser.save();
    }
  }
};

module.exports = (app) => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb+srv://ndeeksha1904_db_user:07PLiwxleed0gA9Z@cluster0.o1ofpc9.mongodb.net/hr_portal";

  mongoose
    .connect(mongoUri)
    .then(async () => {
      console.log("MongoDB connection successful");
      await ensureDemoUsers();
      console.log("Demo users verified");
      await seedOpenSourceKnowledgeBase();
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};
