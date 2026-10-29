const mongoose = require("mongoose");

const rosterSchema = new mongoose.Schema(
  {
    rosterId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    vendorId: {
      type: String,
      default: "VND-1002",
      index: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      default: "",
    },
    siteId: {
      type: String,
      required: true,
      index: true,
    },
    siteName: {
      type: String,
      default: "",
    },
    workerId: {
      type: String,
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      default: function () {
        return this.workerId;
      },
      index: true,
    },
    workerName: {
      type: String,
      required: true,
    },
    tradeCategory: {
      type: String,
      default: "General",
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
      default: "Site Supervisor",
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

// Compound index to guarantee one shift per worker per day
rosterSchema.index({ workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Roster", rosterSchema);
