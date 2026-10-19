const mongoose = require("mongoose");

const KudosSchema = new mongoose.Schema(
  {
    kudosId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fromEmployeeId: {
      type: String,
      required: true,
      index: true,
    },
    fromEmployeeName: {
      type: String,
      required: true,
    },
    toEmployeeId: {
      type: String,
      required: true,
      index: true,
    },
    toEmployeeName: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      enum: ["Team Player", "Customer Champion", "Innovation Leader", "Problem Solver", "Rockstar Performer"],
      default: "Team Player",
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kudos", KudosSchema);
