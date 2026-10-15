const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      unique: true,
    },
    day: {
      type: String, // Monday, Tuesday, etc.
    },
    type: {
      type: String,
      enum: ["National", "Gazetted", "Restricted", "Company"],
      default: "Gazetted",
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model("Holiday", holidaySchema);
module.exports = Holiday;
