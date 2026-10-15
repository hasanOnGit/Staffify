const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    accountHolderName: { type: String, default: "" },
  },
  { _id: false }
);

const statutoryDetailsSchema = new mongoose.Schema(
  {
    panNumber: { type: String, default: "" },
    aadhaarNumber: { type: String, default: "" },
    uanNumber: { type: String, default: "" },
    pfNumber: { type: String, default: "" },
    esiNumber: { type: String, default: "" },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNo: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      default: "Software Engineer",
    },
    department: {
      type: String,
      default: "Engineering",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    dob: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
      default: "Single",
    },
    fatherName: {
      type: String,
      default: "",
    },
    presentAddress: {
      type: String,
      default: "",
    },
    permanentAddress: {
      type: String,
      default: "",
    },
    emergencyContactNum: {
      type: String,
      default: "",
    },
    emergencyContactName: {
      type: String,
      default: "",
    },
    emergencyContactRelation: {
      type: String,
      default: "",
    },

    // Job & Organization
    dateOfJoining: {
      type: String,
      default: "",
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Intern"],
      default: "Full-time",
    },
    probationStatus: {
      type: String,
      enum: ["Confirmed", "Probation", "Notice Period", "Intern"],
      default: "Confirmed",
    },
    managerId: {
      type: String,
      default: "",
    },
    managerName: {
      type: String,
      default: "",
    },
    workLocation: {
      type: String,
      default: "Headquarters",
    },

    // Compensation Preview
    basicSalary: {
      type: Number,
      default: 0,
    },
    totalSalary: {
      type: Number,
      default: 0,
    },

    // Banking & Statutory (Staffify standard)
    bankDetails: {
      type: bankDetailsSchema,
      default: () => ({}),
    },
    statutoryDetails: {
      type: statutoryDetailsSchema,
      default: () => ({}),
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const newEmployee = mongoose.model("employeelist", employeeSchema);
module.exports = newEmployee;