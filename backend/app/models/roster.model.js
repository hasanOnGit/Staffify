const mongoose = require("mongoose");

const rosterSchema = new mongoose.Schema(
  {
    rosterId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "Engineering",
    },
    squadId: {
      type: String,
      default: "",
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    shiftCode: {
      type: String,
      required: true,
      uppercase: true,
      default: "GS",
    },
    assignedBy: {
      type: String,
      default: "Manager",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee one shift per employee per date
rosterSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Roster", rosterSchema);
