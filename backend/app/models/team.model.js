const mongoose = require("mongoose");

const teamManagerSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String },
  role: { type: String, default: "Lead Manager" },
}, { _id: false });

const teamMemberSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String },
  designation: { type: String },
  role: { type: String, default: "Member" }, // "Lead", "Developer", "QA", "Designer", etc.
  status: { type: String, default: "Active" },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const teamSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    department: {
      type: String,
      default: "Engineering",
    },
    managers: [teamManagerSchema],
    members: [teamMemberSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
