const mongoose = require("mongoose");

module.exports = (app) => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb+srv://ndeeksha1904_db_user:07PLiwxleed0gA9Z@cluster0.o1ofpc9.mongodb.net/hr_portal";

  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("MongoDB connection successful");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};
