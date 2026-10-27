/**
 * Staffify Enterprise Master Database Seeder
 * Populates realistic, interconnected, production-grade HRMS records across all modules:
 * - 15 Comprehensive Employees with full 360 profile, statutory, bank, and reporting hierarchy
 * - Synced User accounts with secure hashed passwords
 * - 30+ Days of Attendance records including TODAY (2026-10-27) with live punches, geofence, and IP metadata
 * - Realistic Leave allocations and historical/pending/current leave requests
 * - Monthly Payrolls (July, August, September, October 2026) with full statutory deductions
 * - Performance & OKR Goals with interactive Key Milestones checklists
 * - Q4 2026 Appraisals (Self-Reviews, Manager Reviews, Calibrated Scores)
 * - 1-on-1 Continuous Feedback syncs with actionable task items
 * - Recruitment & ATS: 5 Job Openings and 14 Candidates in all pipeline stages
 * - Asset Management: 15 IT and workplace hardware assets allocated to employees
 * - Helpdesk: 10 IT, HR, Payroll, and Facilities support tickets
 * - Expense Claims: 12 corporate travel, internet, and learning reimbursement claims
 * - HR Documents: Official appointment, salary revision, and bonafide letters
 * - Weekly Timesheets for client and platform projects
 * - Tax Declarations under Old and New tax regimes
 * - Salary Advances / Loans with monthly EMI repayment progress
 * - Offboarding & Full-and-Final Settlements with clearance checklists
 * - Teams, Shifts, and Roster Schedules
 * - Biometric Terminals and Live Attendance Punch Logs
 * - Pulse Feed (Executive Broadcasts & Peer Kudos)
 * - Enterprise Audit Trail Logs
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("../models/user.model");
const Employee = require("../models/employees.model");
const Attendance = require("../models/attendance.model");
const Leave = require("../models/leave.model");
const LeaveBalance = require("../models/employeeLeaveBalance.model");
const Payroll = require("../models/payroll.model");
const Goal = require("../models/goal.model");
const Appraisal = require("../models/appraisal.model");
const OneOnOne = require("../models/oneOnOne.model");
const JobOpening = require("../models/jobOpening.model");
const Candidate = require("../models/candidate.model");
const Asset = require("../models/asset.model");
const Ticket = require("../models/ticket.model");
const ExpenseClaim = require("../models/expenseClaim.model");
const HrDocument = require("../models/hrDocument.model");
const Timesheet = require("../models/timesheet.model");
const TaxDeclaration = require("../models/taxDeclaration.model");
const Loan = require("../models/loan.model");
const Offboarding = require("../models/offboarding.model");
const Settlement = require("../models/settlement.model");
const Team = require("../models/team.model");
const Shift = require("../models/shift.model");
const Roster = require("../models/roster.model");
const BiometricMachine = require("../models/biometricMachine.model");
const BiometricLog = require("../models/biometricLog.model");
const Kudos = require("../models/kudos.model");
const Broadcast = require("../models/broadcast.model");
const AuditLog = require("../models/auditLog.model");
const Geofence = require("../models/geofence.model");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ndeeksha1904_db_user:07PLiwxleed0gA9Z@cluster0.o1ofpc9.mongodb.net/hr_portal";

async function seedMasterData() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", mongoose.connection.name);

  const defaultPasswordHash = await bcrypt.hash("Password@123", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const managerPasswordHash = await bcrypt.hash("Manager@123", 10);
  const employeePasswordHash = await bcrypt.hash("Employee@123", 10);

  /* ==========================================================
     1. EMPLOYEES (15 FULL 360 PROFILES)
     ========================================================== */
  console.log("Seeding Employees...");

  const employeesData = [
    {
      employeeId: "EMP-ADMIN-01",
      userId: "EMP-ADMIN-01",
      name: "Ananya Sharma",
      email: "admin@staffify.com",
      phoneNo: "+91 98201 44552",
      designation: "HR Director & Administrator",
      department: "Human Resources",
      gender: "Female",
      dob: "1988-06-14",
      bloodGroup: "O+",
      maritalStatus: "Married",
      fatherName: "Kailash Sharma",
      presentAddress: "Villa 14, Palm Meadows, Whitefield, Bangalore - 560066",
      permanentAddress: "A-402, Green Glen Layout, Bellandur, Bangalore - 560103",
      emergencyContactName: "Dev Sharma",
      emergencyContactRelation: "Spouse",
      emergencyContactNum: "+91 98201 44550",
      dateOfJoining: "2023-01-15",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "",
      managerName: "Board of Directors",
      workLocation: "Bangalore HQ",
      basicSalary: 120000,
      totalSalary: 264000,
      bankDetails: {
        bankName: "HDFC Bank",
        accountNumber: "50100492817291",
        ifscCode: "HDFC0001234",
        accountHolderName: "Ananya Sharma",
      },
      statutoryDetails: {
        panNumber: "ABCDE1234F",
        aadhaarNumber: "4512 8923 1045",
        uanNumber: "100904829102",
        pfNumber: "MH/PUN/0012345/000/0001",
        esiNumber: "310009827100012",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-EXEC-02",
      userId: "EMP-EXEC-02",
      name: "Vikram Malhotra",
      email: "vikram.malhotra@staffify.com",
      phoneNo: "+91 98450 11223",
      designation: "VP of Engineering & CTO",
      department: "Engineering",
      gender: "Male",
      dob: "1986-11-20",
      bloodGroup: "B+",
      maritalStatus: "Married",
      fatherName: "Rajendra Malhotra",
      presentAddress: "Penthouse 12, Sobha Iris, Outer Ring Road, Bangalore - 560103",
      permanentAddress: "Plot 45, DLF Phase 2, Gurgaon - 122002",
      emergencyContactName: "Geeta Malhotra",
      emergencyContactRelation: "Spouse",
      emergencyContactNum: "+91 98450 11220",
      dateOfJoining: "2023-02-01",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-ADMIN-01",
      managerName: "Ananya Sharma",
      workLocation: "Bangalore HQ",
      basicSalary: 160000,
      totalSalary: 352000,
      bankDetails: {
        bankName: "ICICI Bank",
        accountNumber: "001205019284",
        ifscCode: "ICIC0000012",
        accountHolderName: "Vikram Malhotra",
      },
      statutoryDetails: {
        panNumber: "VKLPM8874K",
        aadhaarNumber: "7821 4490 2311",
        uanNumber: "100877239101",
        pfNumber: "MH/PUN/0012345/000/0002",
        esiNumber: "310009827100013",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-MGR-02",
      userId: "EMP-MGR-02",
      name: "Priya Sundaram",
      email: "manager@staffify.com",
      phoneNo: "+91 97412 88990",
      designation: "Engineering Lead & Manager",
      department: "Engineering",
      gender: "Female",
      dob: "1991-03-12",
      bloodGroup: "A+",
      maritalStatus: "Single",
      fatherName: "K. Sundaram",
      presentAddress: "Flat 304, Prestige Ferns Residency, HSR Layout, Bangalore - 560102",
      permanentAddress: "12, 4th Main Road, Anna Nagar, Chennai - 600040",
      emergencyContactName: "K. Sundaram",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 94440 22331",
      dateOfJoining: "2023-06-10",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-EXEC-02",
      managerName: "Vikram Malhotra",
      workLocation: "Bangalore HQ",
      basicSalary: 95000,
      totalSalary: 209000,
      bankDetails: {
        bankName: "HDFC Bank",
        accountNumber: "50100889218844",
        ifscCode: "HDFC0001234",
        accountHolderName: "Priya Sundaram",
      },
      statutoryDetails: {
        panNumber: "PRYSN6543M",
        aadhaarNumber: "9012 3456 7812",
        uanNumber: "100788920199",
        pfNumber: "MH/PUN/0012345/000/0003",
        esiNumber: "310009827100014",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-DEV-03",
      userId: "EMP-DEV-03",
      name: "Rohan Mehta",
      email: "employee@staffify.com",
      phoneNo: "+91 99002 33445",
      designation: "Senior Full-Stack Engineer",
      department: "Engineering",
      gender: "Male",
      dob: "1994-08-25",
      bloodGroup: "B+",
      maritalStatus: "Single",
      fatherName: "Mahesh Mehta",
      presentAddress: "B-202, Salarpuria Greenage, Hosur Road, Bangalore - 560068",
      permanentAddress: "14, Shanti Kunj, Navrangpura, Ahmedabad - 380009",
      emergencyContactName: "Mahesh Mehta",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 98250 11990",
      dateOfJoining: "2024-01-15",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      workLocation: "Bangalore HQ",
      basicSalary: 75000,
      totalSalary: 165000,
      bankDetails: {
        bankName: "Axis Bank",
        accountNumber: "918020048821990",
        ifscCode: "UTIB0000123",
        accountHolderName: "Rohan Mehta",
      },
      statutoryDetails: {
        panNumber: "ROHNM9012P",
        aadhaarNumber: "6712 9012 4589",
        uanNumber: "100655441122",
        pfNumber: "MH/PUN/0012345/000/0004",
        esiNumber: "310009827100015",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-DEV-04",
      userId: "EMP-DEV-04",
      name: "Rahul Sharma",
      email: "rahul.sharma@staffify.com",
      phoneNo: "+91 98860 55667",
      designation: "Staff Backend Architect",
      department: "Engineering",
      gender: "Male",
      dob: "1992-05-18",
      bloodGroup: "O+",
      maritalStatus: "Married",
      fatherName: "Harish Sharma",
      presentAddress: "Tower 4, Apt 801, Brigade Metropolis, Whitefield, Bangalore - 560048",
      permanentAddress: "C-12, Sector 15, Noida, Uttar Pradesh - 201301",
      emergencyContactName: "Pooja Sharma",
      emergencyContactRelation: "Spouse",
      emergencyContactNum: "+91 98860 55660",
      dateOfJoining: "2024-03-01",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      workLocation: "Bangalore HQ",
      basicSalary: 90000,
      totalSalary: 198000,
      bankDetails: {
        bankName: "State Bank of India",
        accountNumber: "30992817290",
        ifscCode: "SBIN0004123",
        accountHolderName: "Rahul Sharma",
      },
      statutoryDetails: {
        panNumber: "RHLSH3456L",
        aadhaarNumber: "8821 7744 1902",
        uanNumber: "100544332211",
        pfNumber: "MH/PUN/0012345/000/0005",
        esiNumber: "310009827100016",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-DEV-05",
      userId: "EMP-DEV-05",
      name: "Sneha Kulkarni",
      email: "sneha.kulkarni@staffify.com",
      phoneNo: "+91 96541 77889",
      designation: "Frontend UI/UX Engineer",
      department: "Engineering",
      gender: "Female",
      dob: "1996-09-30",
      bloodGroup: "AB+",
      maritalStatus: "Single",
      fatherName: "Prakash Kulkarni",
      presentAddress: "Row House 8, Rohan Ashima, Baner, Pune - 411045",
      permanentAddress: "Row House 8, Rohan Ashima, Baner, Pune - 411045",
      emergencyContactName: "Prakash Kulkarni",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 96541 77880",
      dateOfJoining: "2024-07-15",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      workLocation: "Pune R&D Hub",
      basicSalary: 60000,
      totalSalary: 132000,
      bankDetails: {
        bankName: "ICICI Bank",
        accountNumber: "001205098711",
        ifscCode: "ICIC0000012",
        accountHolderName: "Sneha Kulkarni",
      },
      statutoryDetails: {
        panNumber: "SNEHK2198T",
        aadhaarNumber: "4590 1284 7712",
        uanNumber: "100433221100",
        pfNumber: "MH/PUN/0012345/000/0006",
        esiNumber: "310009827100017",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-DEV-06",
      userId: "EMP-DEV-06",
      name: "Arjun Nair",
      email: "arjun.nair@staffify.com",
      phoneNo: "+91 97312 99001",
      designation: "DevOps & SRE Engineer",
      department: "Engineering",
      gender: "Male",
      dob: "1993-12-05",
      bloodGroup: "O+",
      maritalStatus: "Single",
      fatherName: "Gopinath Nair",
      presentAddress: "Flat 102, Shriram Summit, Electronic City Phase 1, Bangalore - 560100",
      permanentAddress: "Surabhi, Kaloor, Kochi, Kerala - 682017",
      emergencyContactName: "Gopinath Nair",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 94470 12345",
      dateOfJoining: "2024-04-10",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      workLocation: "Bangalore HQ",
      basicSalary: 78000,
      totalSalary: 171600,
      bankDetails: {
        bankName: "HDFC Bank",
        accountNumber: "50100788192011",
        ifscCode: "HDFC0001234",
        accountHolderName: "Arjun Nair",
      },
      statutoryDetails: {
        panNumber: "ARJNN4321R",
        aadhaarNumber: "5512 8844 9901",
        uanNumber: "100322110099",
        pfNumber: "MH/PUN/0012345/000/0007",
        esiNumber: "310009827100018",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-QA-07",
      userId: "EMP-QA-07",
      name: "Pooja Verma",
      email: "pooja.verma@staffify.com",
      phoneNo: "+91 99801 22334",
      designation: "Lead QA Automation Engineer",
      department: "Engineering",
      gender: "Female",
      dob: "1995-02-14",
      bloodGroup: "A+",
      maritalStatus: "Single",
      fatherName: "Ramesh Verma",
      presentAddress: "A-504, Purva Riviera, Marathahalli, Bangalore - 560037",
      permanentAddress: "34, Civil Lines, Jaipur, Rajasthan - 302006",
      emergencyContactName: "Ramesh Verma",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 98290 44551",
      dateOfJoining: "2024-05-20",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      workLocation: "Bangalore HQ",
      basicSalary: 65000,
      totalSalary: 143000,
      bankDetails: {
        bankName: "Kotak Mahindra Bank",
        accountNumber: "45119920198",
        ifscCode: "KKBK0000123",
        accountHolderName: "Pooja Verma",
      },
      statutoryDetails: {
        panNumber: "POOJV5678Q",
        aadhaarNumber: "6612 7789 2201",
        uanNumber: "100211009988",
        pfNumber: "MH/PUN/0012345/000/0008",
        esiNumber: "310009827100019",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-PROD-08",
      userId: "EMP-PROD-08",
      name: "Aditi Rao",
      email: "aditi.rao@staffify.com",
      phoneNo: "+91 98112 44556",
      designation: "Principal Product Manager",
      department: "Product",
      gender: "Female",
      dob: "1990-10-08",
      bloodGroup: "B+",
      maritalStatus: "Married",
      fatherName: "Sanjay Rao",
      presentAddress: "32, 5th Cross, 3rd Phase, JP Nagar, Bangalore - 560078",
      permanentAddress: "32, 5th Cross, 3rd Phase, JP Nagar, Bangalore - 560078",
      emergencyContactName: "Kunal Singhania",
      emergencyContactRelation: "Spouse",
      emergencyContactNum: "+91 98112 44550",
      dateOfJoining: "2023-09-01",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-EXEC-02",
      managerName: "Vikram Malhotra",
      workLocation: "Bangalore HQ",
      basicSalary: 110000,
      totalSalary: 242000,
      bankDetails: {
        bankName: "HDFC Bank",
        accountNumber: "50100677182910",
        ifscCode: "HDFC0001234",
        accountHolderName: "Aditi Rao",
      },
      statutoryDetails: {
        panNumber: "ADITR1290W",
        aadhaarNumber: "7741 8910 2234",
        uanNumber: "100100998877",
        pfNumber: "MH/PUN/0012345/000/0009",
        esiNumber: "310009827100020",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-DES-09",
      userId: "EMP-DES-09",
      name: "Kabir Das",
      email: "kabir.das@staffify.com",
      phoneNo: "+91 98223 66778",
      designation: "Lead Product Designer",
      department: "Product",
      gender: "Male",
      dob: "1993-07-22",
      bloodGroup: "O+",
      maritalStatus: "Single",
      fatherName: "A. K. Das",
      presentAddress: "Studio 10, 12th Main Road, Indiranagar, Bangalore - 560038",
      permanentAddress: "45, Lake Road, Ballygunge, Kolkata - 700029",
      emergencyContactName: "A. K. Das",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 98300 22331",
      dateOfJoining: "2024-02-15",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-PROD-08",
      managerName: "Aditi Rao",
      workLocation: "Bangalore HQ",
      basicSalary: 70000,
      totalSalary: 154000,
      bankDetails: {
        bankName: "ICICI Bank",
        accountNumber: "001205088219",
        ifscCode: "ICIC0000012",
        accountHolderName: "Kabir Das",
      },
      statutoryDetails: {
        panNumber: "KABRD4589Y",
        aadhaarNumber: "3312 9901 4456",
        uanNumber: "100099887766",
        pfNumber: "MH/PUN/0012345/000/0010",
        esiNumber: "310009827100021",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-HR-10",
      userId: "EMP-HR-10",
      name: "Meera Joshi",
      email: "meera.joshi@staffify.com",
      phoneNo: "+91 98334 88990",
      designation: "Senior Talent Acquisition Specialist",
      department: "Human Resources",
      gender: "Female",
      dob: "1994-04-19",
      bloodGroup: "B+",
      maritalStatus: "Single",
      fatherName: "Sudhir Joshi",
      presentAddress: "Apartment 3B, Clover Highlands, NIBM Road, Pune - 411048",
      permanentAddress: "Apartment 3B, Clover Highlands, NIBM Road, Pune - 411048",
      emergencyContactName: "Sudhir Joshi",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 98334 88995",
      dateOfJoining: "2024-06-01",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-ADMIN-01",
      managerName: "Ananya Sharma",
      workLocation: "Pune R&D Hub",
      basicSalary: 55000,
      totalSalary: 121000,
      bankDetails: {
        bankName: "Axis Bank",
        accountNumber: "91802008819201",
        ifscCode: "UTIB0000123",
        accountHolderName: "Meera Joshi",
      },
      statutoryDetails: {
        panNumber: "MEERJ7890S",
        aadhaarNumber: "8890 1234 5567",
        uanNumber: "100088776655",
        pfNumber: "MH/PUN/0012345/000/0011",
        esiNumber: "310009827100022",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-HR-11",
      userId: "EMP-HR-11",
      name: "Siddharth Patil",
      email: "siddharth.patil@staffify.com",
      phoneNo: "+91 98445 00112",
      designation: "People Operations Executive",
      department: "Human Resources",
      gender: "Male",
      dob: "1997-01-11",
      bloodGroup: "A+",
      maritalStatus: "Single",
      fatherName: "Anand Patil",
      presentAddress: "12, Mayur Colony, Kothrud, Pune - 411038",
      permanentAddress: "12, Mayur Colony, Kothrud, Pune - 411038",
      emergencyContactName: "Anand Patil",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 98445 00110",
      dateOfJoining: "2026-08-01",
      employmentType: "Full-time",
      probationStatus: "Probation",
      managerId: "EMP-ADMIN-01",
      managerName: "Ananya Sharma",
      workLocation: "Pune R&D Hub",
      basicSalary: 42000,
      totalSalary: 92400,
      bankDetails: {
        bankName: "HDFC Bank",
        accountNumber: "50100554419201",
        ifscCode: "HDFC0001234",
        accountHolderName: "Siddharth Patil",
      },
      statutoryDetails: {
        panNumber: "SIDHP3412B",
        aadhaarNumber: "7712 3456 9081",
        uanNumber: "100077665544",
        pfNumber: "MH/PUN/0012345/000/0012",
        esiNumber: "310009827100023",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-SALES-12",
      userId: "EMP-SALES-12",
      name: "Neha Singhal",
      email: "neha.singhal@staffify.com",
      phoneNo: "+91 98556 22334",
      designation: "Enterprise Account Executive",
      department: "Sales",
      gender: "Female",
      dob: "1992-12-03",
      bloodGroup: "O+",
      maritalStatus: "Married",
      fatherName: "R. K. Singhal",
      presentAddress: "Tower B, Central Park Resorts, Sector 48, Gurgaon - 122018",
      permanentAddress: "Tower B, Central Park Resorts, Sector 48, Gurgaon - 122018",
      emergencyContactName: "Amit Singhal",
      emergencyContactRelation: "Spouse",
      emergencyContactNum: "+91 98556 22330",
      dateOfJoining: "2024-01-08",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-ADMIN-01",
      managerName: "Ananya Sharma",
      workLocation: "Gurgaon Office",
      basicSalary: 80000,
      totalSalary: 176000,
      bankDetails: {
        bankName: "ICICI Bank",
        accountNumber: "001205077182",
        ifscCode: "ICIC0000012",
        accountHolderName: "Neha Singhal",
      },
      statutoryDetails: {
        panNumber: "NEHAS8921Z",
        aadhaarNumber: "9912 3344 8810",
        uanNumber: "100066554433",
        pfNumber: "MH/PUN/0012345/000/0013",
        esiNumber: "310009827100024",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-CS-13",
      userId: "EMP-CS-13",
      name: "Varun Kapoor",
      email: "varun.kapoor@staffify.com",
      phoneNo: "+91 98667 44556",
      designation: "Customer Success Manager",
      department: "Customer Success",
      gender: "Male",
      dob: "1993-06-29",
      bloodGroup: "AB+",
      maritalStatus: "Single",
      fatherName: "Sunil Kapoor",
      presentAddress: "Apt 501, The Icon, DLF Phase 5, Gurgaon - 122009",
      permanentAddress: "Apt 501, The Icon, DLF Phase 5, Gurgaon - 122009",
      emergencyContactName: "Sunil Kapoor",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 98667 44550",
      dateOfJoining: "2024-05-02",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-ADMIN-01",
      managerName: "Ananya Sharma",
      workLocation: "Gurgaon Office",
      basicSalary: 68000,
      totalSalary: 149600,
      bankDetails: {
        bankName: "HDFC Bank",
        accountNumber: "50100443319201",
        ifscCode: "HDFC0001234",
        accountHolderName: "Varun Kapoor",
      },
      statutoryDetails: {
        panNumber: "VRNKP6789X",
        aadhaarNumber: "6612 0091 3345",
        uanNumber: "100055443322",
        pfNumber: "MH/PUN/0012345/000/0014",
        esiNumber: "310009827100025",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-FIN-14",
      userId: "EMP-FIN-14",
      name: "Rajesh Iyer",
      email: "rajesh.iyer@staffify.com",
      phoneNo: "+91 98778 66778",
      designation: "Finance Controller & Payroll Lead",
      department: "Finance",
      gender: "Male",
      dob: "1989-08-16",
      bloodGroup: "A+",
      maritalStatus: "Married",
      fatherName: "V. Iyer",
      presentAddress: "18, 8th Main, 15th Cross, Malleshwaram, Bangalore - 560003",
      permanentAddress: "18, 8th Main, 15th Cross, Malleshwaram, Bangalore - 560003",
      emergencyContactName: "Meenakshi Iyer",
      emergencyContactRelation: "Spouse",
      emergencyContactNum: "+91 98778 66770",
      dateOfJoining: "2023-11-15",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-ADMIN-01",
      managerName: "Ananya Sharma",
      workLocation: "Bangalore HQ",
      basicSalary: 95000,
      totalSalary: 209000,
      bankDetails: {
        bankName: "State Bank of India",
        accountNumber: "30881920194",
        ifscCode: "SBIN0004123",
        accountHolderName: "Rajesh Iyer",
      },
      statutoryDetails: {
        panNumber: "RAJSI5432C",
        aadhaarNumber: "4412 8890 1209",
        uanNumber: "100044332211",
        pfNumber: "MH/PUN/0012345/000/0015",
        esiNumber: "310009827100026",
      },
      isActive: true,
    },
    {
      employeeId: "EMP-OPS-15",
      userId: "EMP-OPS-15",
      name: "Kavita Menon",
      email: "kavita.menon@staffify.com",
      phoneNo: "+91 98889 88990",
      designation: "Workplace & Facilities Lead",
      department: "Operations",
      gender: "Female",
      dob: "1991-09-09",
      bloodGroup: "B+",
      maritalStatus: "Single",
      fatherName: "Madhavan Menon",
      presentAddress: "24, 1st Cross, Domlur 2nd Stage, Bangalore - 560071",
      permanentAddress: "Parijatham, Palakkad, Kerala - 678001",
      emergencyContactName: "Madhavan Menon",
      emergencyContactRelation: "Father",
      emergencyContactNum: "+91 94471 88990",
      dateOfJoining: "2024-03-15",
      employmentType: "Full-time",
      probationStatus: "Confirmed",
      managerId: "EMP-ADMIN-01",
      managerName: "Ananya Sharma",
      workLocation: "Bangalore HQ",
      basicSalary: 58000,
      totalSalary: 127600,
      bankDetails: {
        bankName: "Axis Bank",
        accountNumber: "91802007718290",
        ifscCode: "UTIB0000123",
        accountHolderName: "Kavita Menon",
      },
      statutoryDetails: {
        panNumber: "KAVTM3210V",
        aadhaarNumber: "5512 0091 8823",
        uanNumber: "100033221100",
        pfNumber: "MH/PUN/0012345/000/0016",
        esiNumber: "310009827100027",
      },
      isActive: true,
    },
  ];

  for (const emp of employeesData) {
    await Employee.findOneAndUpdate({ employeeId: emp.employeeId }, emp, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded/Updated ${employeesData.length} Employee profiles.`);

  /* ==========================================================
     2. USERS (LOGIN ACCOUNTS FOR ALL EMPLOYEES)
     ========================================================== */
  console.log("Seeding User accounts...");

  const usersData = [
    {
      userId: "EMP-ADMIN-01",
      name: "Ananya Sharma",
      email: "admin@staffify.com",
      password: adminPasswordHash,
      role: "Admin",
      isActive: true,
    },
    {
      userId: "EMP-MGR-02",
      name: "Priya Sundaram",
      email: "manager@staffify.com",
      password: managerPasswordHash,
      role: "Manager",
      isActive: true,
    },
    {
      userId: "EMP-DEV-03",
      name: "Rohan Mehta",
      email: "employee@staffify.com",
      password: employeePasswordHash,
      role: "Employee",
      isActive: true,
    },
  ];

  for (const emp of employeesData) {
    if (!usersData.some((u) => u.email === emp.email)) {
      usersData.push({
        userId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        password: defaultPasswordHash,
        role:
          emp.designation.includes("Director") || emp.designation.includes("Administrator")
            ? "Admin"
            : emp.designation.includes("Manager") || emp.designation.includes("VP") || emp.designation.includes("Lead")
            ? "Manager"
            : "Employee",
        isActive: true,
      });
    }
  }

  for (const u of usersData) {
    await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
  }
  console.log(`Seeded/Updated ${usersData.length} User accounts.`);

  /* ==========================================================
     3. ATTENDANCE (PAST 30 DAYS + TODAY)
     ========================================================== */
  console.log("Seeding Attendance records...");

  // Generate list of dates for the last 30 days
  const attendanceDates = [];
  const todayObj = new Date("2026-10-27T12:00:00.000Z");

  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayObj);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    // Skip Sundays (0) and Saturdays (6)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      attendanceDates.push(`${yyyy}-${mm}-${dd}`);
    }
  }

  const attendanceBatch = [];

  for (const dateStr of attendanceDates) {
    const isToday = dateStr === "2026-10-27";

    for (let idx = 0; idx < employeesData.length; idx++) {
      const emp = employeesData[idx];

      if (isToday) {
        // Today's live statuses
        if (emp.employeeId === "EMP-QA-07") {
          // Pooja Verma is on approved sick leave today
          attendanceBatch.push({
            employeeId: emp.employeeId,
            employeeName: emp.name,
            date: dateStr,
            status: "On Leave",
            totalHours: 0,
            ipAddress: "",
            geofenceZone: "",
            punches: [],
          });
        } else if (emp.employeeId === "EMP-DEV-05" || emp.employeeId === "EMP-HR-10") {
          // WFH Today
          const inTime = new Date(`${dateStr}T09:12:00.000Z`);
          attendanceBatch.push({
            employeeId: emp.employeeId,
            employeeName: emp.name,
            date: dateStr,
            status: "WFH",
            firstIn: inTime,
            totalHours: 3.8,
            ipAddress: "122.179.44.12",
            geofenceZone: "Remote / WFH",
            punches: [
              {
                time: inTime,
                timeStr: "09:12 AM",
                type: "IN",
                ipAddress: "122.179.44.12",
                networkType: "Home Broadband / Authorized IP",
                location: {
                  latitude: 18.5204,
                  longitude: 73.8567,
                  zoneName: "Remote / WFH",
                  isWithinGeofence: true,
                },
              },
            ],
          });
        } else if (emp.employeeId === "EMP-DEV-04" || emp.employeeId === "EMP-HR-11") {
          // Late arrival today
          const inTime = new Date(`${dateStr}T09:44:00.000Z`);
          attendanceBatch.push({
            employeeId: emp.employeeId,
            employeeName: emp.name,
            date: dateStr,
            status: "Late",
            firstIn: inTime,
            totalHours: 3.2,
            ipAddress: "192.168.1.105",
            geofenceZone: "Bangalore HQ",
            punches: [
              {
                time: inTime,
                timeStr: "09:44 AM",
                type: "IN",
                ipAddress: "192.168.1.105",
                networkType: "Office / Verified IP",
                location: {
                  latitude: 12.9352,
                  longitude: 77.6946,
                  zoneName: "Bangalore HQ",
                  isWithinGeofence: true,
                },
              },
            ],
          });
        } else {
          // Clocked in on-time today
          const randomMin = 5 + (idx % 20);
          const inTime = new Date(`${dateStr}T09:${String(randomMin).padStart(2, "0")}:00.000Z`);
          attendanceBatch.push({
            employeeId: emp.employeeId,
            employeeName: emp.name,
            date: dateStr,
            status: "Present",
            firstIn: inTime,
            totalHours: 3.5,
            ipAddress: "192.168.1.105",
            geofenceZone: "Bangalore HQ",
            punches: [
              {
                time: inTime,
                timeStr: `09:${String(randomMin).padStart(2, "0")} AM`,
                type: "IN",
                ipAddress: "192.168.1.105",
                networkType: "Office / Verified IP",
                location: {
                  latitude: 12.9352,
                  longitude: 77.6946,
                  zoneName: "Bangalore HQ",
                  isWithinGeofence: true,
                },
              },
            ],
          });
        }
      } else {
        // Historical days
        const isLate = (idx + dateStr.charCodeAt(9)) % 11 === 0;
        const isWFH = (idx + dateStr.charCodeAt(8)) % 13 === 0;
        const isHalfDay = (idx + dateStr.charCodeAt(9)) % 23 === 0;

        const inMin = isLate ? 35 + (idx % 15) : 5 + (idx % 22);
        const inHour = isLate && inMin > 59 ? 10 : 9;
        const formattedInMin = String(inMin % 60).padStart(2, "0");

        const inTime = new Date(`${dateStr}T0${inHour}:${formattedInMin}:00.000Z`);
        const outTime = new Date(`${dateStr}T18:${String(10 + (idx % 40)).padStart(2, "0")}:00.000Z`);

        const hours = isHalfDay ? 4.5 : Number((8.2 + (idx % 8) * 0.15).toFixed(2));
        const status = isHalfDay ? "Half Day" : isWFH ? "WFH" : isLate ? "Late" : "Present";

        attendanceBatch.push({
          employeeId: emp.employeeId,
          employeeName: emp.name,
          date: dateStr,
          status,
          firstIn: inTime,
          lastOut: outTime,
          totalHours: hours,
          ipAddress: isWFH ? "122.179.44.12" : "192.168.1.105",
          geofenceZone: isWFH ? "Remote / WFH" : "Bangalore HQ",
          punches: [
            {
              time: inTime,
              timeStr: `0${inHour}:${formattedInMin} AM`,
              type: "IN",
              ipAddress: isWFH ? "122.179.44.12" : "192.168.1.105",
              networkType: isWFH ? "Home Broadband" : "Office / Verified IP",
              location: {
                latitude: 12.9352,
                longitude: 77.6946,
                zoneName: "Bangalore HQ",
                isWithinGeofence: true,
              },
            },
            {
              time: outTime,
              timeStr: `06:${String(10 + (idx % 40)).padStart(2, "0")} PM`,
              type: "OUT",
              ipAddress: isWFH ? "122.179.44.12" : "192.168.1.105",
              networkType: isWFH ? "Home Broadband" : "Office / Verified IP",
              location: {
                latitude: 12.9352,
                longitude: 77.6946,
                zoneName: "Bangalore HQ",
                isWithinGeofence: true,
              },
            },
          ],
        });
      }
    }
  }

  // Upsert attendance records
  for (const att of attendanceBatch) {
    await Attendance.findOneAndUpdate(
      { employeeId: att.employeeId, date: att.date },
      att,
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded/Updated ${attendanceBatch.length} Attendance daily records.`);

  /* ==========================================================
     4. LEAVE BALANCES & LEAVES
     ========================================================== */
  console.log("Seeding Leave balances and applications...");

  for (const emp of employeesData) {
    await LeaveBalance.findOneAndUpdate(
      { employeeId: emp.employeeId, year: 2026 },
      {
        employeeId: emp.employeeId,
        year: 2026,
        leaveAllocation: {
          earned: { totalAllocated: 15, used: emp.employeeId === "EMP-SALES-12" ? 5 : 2 },
          casual: { totalAllocated: 12, used: emp.employeeId === "EMP-DEV-03" ? 3 : 1 },
          sick: { totalAllocated: 10, used: emp.employeeId === "EMP-QA-07" ? 2 : 1 },
          paid: { totalAllocated: 12, used: 3 },
          halfDay: { totalAllocated: 6, used: 1 },
          maternity: { totalAllocated: 180, used: 0 },
          paternity: { totalAllocated: 15, used: 0 },
          lop: { totalAllocated: 999, used: 0 },
        },
      },
      { upsert: true, new: true }
    );
  }

  const sampleLeaves = [
    {
      leaveId: "LEV-2026-101",
      employeeId: "EMP-QA-07",
      employeeName: "Pooja Verma",
      status: "Approved",
      leaveType: "sick",
      daysCount: 1,
      fromDate: new Date("2026-10-27T00:00:00.000Z"),
      toDate: new Date("2026-10-27T23:59:59.000Z"),
      reason: "Seasonal viral fever & throat infection. Advised rest by physician.",
      approvedBy: "Priya Sundaram",
    },
    {
      leaveId: "LEV-2026-102",
      employeeId: "EMP-DEV-05",
      employeeName: "Sneha Kulkarni",
      status: "Pending",
      leaveType: "casual",
      daysCount: 3,
      fromDate: new Date("2026-11-02T00:00:00.000Z"),
      toDate: new Date("2026-11-04T23:59:59.000Z"),
      reason: "Family gathering and Diwali festive travel to hometown.",
    },
    {
      leaveId: "LEV-2026-103",
      employeeId: "EMP-DEV-06",
      employeeName: "Arjun Nair",
      status: "Pending",
      leaveType: "paid",
      daysCount: 3,
      fromDate: new Date("2026-11-09T00:00:00.000Z"),
      toDate: new Date("2026-11-11T23:59:59.000Z"),
      reason: "Attending DevOpsDays India 2026 Technical Summit in Hyderabad.",
    },
    {
      leaveId: "LEV-2026-104",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      status: "Approved",
      leaveType: "casual",
      daysCount: 2,
      fromDate: new Date("2026-09-15T00:00:00.000Z"),
      toDate: new Date("2026-09-16T23:59:59.000Z"),
      reason: "Personal commitment and family relocation assistance.",
      approvedBy: "Priya Sundaram",
    },
    {
      leaveId: "LEV-2026-105",
      employeeId: "EMP-DEV-04",
      employeeName: "Rahul Sharma",
      status: "Approved",
      leaveType: "sick",
      daysCount: 1,
      fromDate: new Date("2026-10-05T00:00:00.000Z"),
      toDate: new Date("2026-10-05T23:59:59.000Z"),
      reason: "Acute migraine headache.",
      approvedBy: "Priya Sundaram",
    },
    {
      leaveId: "LEV-2026-106",
      employeeId: "EMP-DES-09",
      employeeName: "Kabir Das",
      status: "Approved",
      leaveType: "paid",
      daysCount: 5,
      fromDate: new Date("2026-08-21T00:00:00.000Z"),
      toDate: new Date("2026-08-25T23:59:59.000Z"),
      reason: "Annual vacation and personal recharge trip to Himachal.",
      approvedBy: "Aditi Rao",
    },
    {
      leaveId: "LEV-2026-107",
      employeeId: "EMP-SALES-12",
      employeeName: "Neha Singhal",
      status: "Approved",
      leaveType: "earned",
      daysCount: 4,
      fromDate: new Date("2026-07-10T00:00:00.000Z"),
      toDate: new Date("2026-07-14T23:59:59.000Z"),
      reason: "Family wedding ceremonies in Delhi.",
      approvedBy: "Ananya Sharma",
    },
    {
      leaveId: "LEV-2026-108",
      employeeId: "EMP-HR-11",
      employeeName: "Siddharth Patil",
      status: "Rejected",
      leaveType: "casual",
      daysCount: 2,
      fromDate: new Date("2026-10-20T00:00:00.000Z"),
      toDate: new Date("2026-10-21T23:59:59.000Z"),
      reason: "Long weekend trip with college friends.",
      rejectionReason: "Critical statutory PF audit scheduled on these dates; team attendance required.",
      approvedBy: "Ananya Sharma",
    },
  ];

  for (const l of sampleLeaves) {
    await Leave.findOneAndUpdate({ leaveId: l.leaveId }, l, { upsert: true, new: true });
  }
  console.log(`Seeded ${sampleLeaves.length} Leave applications.`);

  /* ==========================================================
     5. PAYROLL & PAYSLIPS (60 PAYSLIPS: JULY, AUG, SEP, OCT)
     ========================================================== */
  console.log("Seeding Payroll & Payslip records...");

  const payrollMonths = [
    { month: 7, year: 2026, period: "July 2026", status: "Paid" },
    { month: 8, year: 2026, period: "August 2026", status: "Paid" },
    { month: 9, year: 2026, period: "September 2026", status: "Paid" },
    { month: 10, year: 2026, period: "October 2026", status: "Processed" },
  ];

  for (const cycle of payrollMonths) {
    for (const emp of employeesData) {
      const payslipId = `PAY-${cycle.year}${String(cycle.month).padStart(2, "0")}-${emp.employeeId}`;

      const basic = emp.basicSalary;
      const hra = Math.round(basic * 0.4);
      const conveyance = 1600;
      const medical = 1250;
      const special = Math.round(basic * 0.6);
      const grossEarnings = basic + hra + conveyance + medical + special;

      const epf = Math.round(basic * 0.12);
      const professionalTax = 200;
      const tds = Math.round(grossEarnings * 0.08);
      const totalDeductions = epf + professionalTax + tds;
      const netPay = grossEarnings - totalDeductions;

      await Payroll.findOneAndUpdate(
        { employeeId: emp.employeeId, month: cycle.month, year: cycle.year },
        {
          payslipId,
          month: cycle.month,
          year: cycle.year,
          periodString: cycle.period,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          designation: emp.designation,
          department: emp.department,
          dateOfJoining: emp.dateOfJoining,
          bankDetails: emp.bankDetails,
          statutoryDetails: emp.statutoryDetails,
          attendanceSummary: {
            totalDays: 30,
            workedDays: 28,
            paidLeaveDays: 2,
            lopDays: 0,
            payableDays: 30,
          },
          earnings: {
            basic,
            hra,
            conveyance,
            medicalAllowance: medical,
            specialAllowance: special,
            grossEarnings,
          },
          deductions: {
            epf,
            esi: 0,
            professionalTax,
            tds,
            lopDeduction: 0,
            loanAdvance: 0,
            totalDeductions,
          },
          netPay,
          netPayInWords: `INR ${netPay.toLocaleString("en-IN")} Only`,
          status: cycle.status,
          processedBy: "Rajesh Iyer",
          processedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }
  }
  console.log(`Seeded ${payrollMonths.length * employeesData.length} monthly Payslips.`);

  /* ==========================================================
     6. PERFORMANCE & OKRS (GOALS, APPRAISALS, 1-ON-1S)
     ========================================================== */
  console.log("Seeding Performance & OKR Goals...");

  const goalsData = [
    {
      goalId: "GOL-2026-Q4-01",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      department: "Engineering",
      title: "Deliver Real-Time Event-Driven Notification Bus",
      description: `Establish enterprise WebSockets infrastructure with zero-drop message delivery.
Key Milestones:
• [x] Benchmark Socket.io vs Kafka broker latency
• [x] Implement Redis Pub/Sub multi-node bridge
• [ ] Deploy Canary release to 20% active users
• [ ] Finalize telemetry and error alerting dashboards`,
      category: "Core Deliverable",
      cycle: "Q4 2026",
      weightage: 50,
      progressPercentage: 65,
      status: "In Progress",
      dueDate: "2026-11-20",
      managerFeedback: "Excellent architectural rigor on the Redis Pub/Sub sync. Keep pushing for the canary rollout.",
    },
    {
      goalId: "GOL-2026-Q4-02",
      employeeId: "EMP-DEV-04",
      employeeName: "Rahul Sharma",
      department: "Engineering",
      title: "Database Query Optimization & MongoDB Compound Indexing",
      description: `Reduce 95th percentile query latency across attendance and payroll datasets under 15ms.
Key Milestones:
• [x] Audit slow queries with MongoDB Explain Plan
• [x] Create compound indexes on employeeId and date
• [x] Run stress tests with 100,000 synthetic logs
• [x] Document database indexing runbook for team`,
      category: "Operational Excellence",
      cycle: "Q4 2026",
      weightage: 35,
      progressPercentage: 100,
      status: "Completed",
      dueDate: "2026-10-25",
      managerFeedback: "Outstanding execution. Database response times dropped by 72% across all endpoints.",
    },
    {
      goalId: "GOL-2026-Q4-03",
      employeeId: "EMP-DEV-05",
      employeeName: "Sneha Kulkarni",
      department: "Engineering",
      title: "Design System 2.0: Accessible React Component Toolkit",
      description: `Standardize WCAG 2.1 AA accessible UI components with full keyboard navigability.
Key Milestones:
• [x] Build WCAG contrast compliant palette
• [x] Develop accessible modal, drawer, and dropdown components
• [ ] Complete a11y screen-reader audit with NVDA
• [ ] Release v2.0 design tokens to Figma library`,
      category: "Core Deliverable",
      cycle: "Q4 2026",
      weightage: 35,
      progressPercentage: 70,
      status: "On Track",
      dueDate: "2026-11-30",
      managerFeedback: "Component ergonomics look great. Ensure high contrast colors pass all checks.",
    },
    {
      goalId: "GOL-2026-Q4-04",
      employeeId: "EMP-DEV-06",
      employeeName: "Arjun Nair",
      department: "Engineering",
      title: "Zero-Downtime Multi-AZ Kubernetes Deployment Pipeline",
      description: `Automate rolling deployments with automated rollback on health probe failure.
Key Milestones:
• [x] Provision Multi-AZ EKS cluster with Terraform
• [x] Configure Helm chart templates and secrets encryption
• [ ] Run chaos engineering network partition drills
• [ ] Setup Prometheus & Grafana alerting thresholds`,
      category: "Operational Excellence",
      cycle: "Q4 2026",
      weightage: 50,
      progressPercentage: 60,
      status: "On Track",
      dueDate: "2026-12-10",
      managerFeedback: "Terraform automation has saved hours of manual infra config. Great work.",
    },
    {
      goalId: "GOL-2026-Q4-05",
      employeeId: "EMP-QA-07",
      employeeName: "Pooja Verma",
      department: "Engineering",
      title: "Playwright End-to-End Automated Regression Matrix",
      description: `Cover 100% of critical paths across auth, attendance, leave apply, and payroll.
Key Milestones:
• [x] Setup Playwright TypeScript test runner in CI/CD
• [x] Write regression suites for Attendance and Leave
• [x] Write regression suites for Payroll & PDF export
• [ ] Achieve sub-4-minute test matrix execution in CI`,
      category: "Core Deliverable",
      cycle: "Q4 2026",
      weightage: 35,
      progressPercentage: 85,
      status: "On Track",
      dueDate: "2026-11-15",
      managerFeedback: "The automated tests caught two regressions before reaching staging. Superb quality focus.",
    },
    {
      goalId: "GOL-2026-Q4-06",
      employeeId: "EMP-PROD-08",
      employeeName: "Aditi Rao",
      department: "Product",
      title: "Enterprise OKR & Continuous Feedback Product Launch",
      description: `Deliver simplified, human-friendly performance review workflow to all clients.
Key Milestones:
• [x] Conduct 20 customer discovery interviews
• [x] Finalize prototype with Design team
• [x] Complete Beta testing with internal teams
• [x] Publish feature announcement and documentation`,
      category: "Leadership & Culture",
      cycle: "Q4 2026",
      weightage: 50,
      progressPercentage: 100,
      status: "Completed",
      dueDate: "2026-10-27",
      managerFeedback: "Huge user satisfaction bump since the revamp. Product vision was spot on.",
    },
    {
      goalId: "GOL-2026-Q4-07",
      employeeId: "EMP-DES-09",
      employeeName: "Kabir Das",
      department: "Product",
      title: "Micro-Interactions & Responsive Mobile Handoff",
      description: `Create crisp interactive prototypes for all mobile viewports.
Key Milestones:
• [x] Audit mobile responsive layouts across all 15 modules
• [x] Design tactile tactile button states and card elevations
• [ ] Create animated SVG micro-interaction assets
• [ ] Conduct usability testing with 5 target users`,
      category: "Core Deliverable",
      cycle: "Q4 2026",
      weightage: 25,
      progressPercentage: 55,
      status: "In Progress",
      dueDate: "2026-11-25",
      managerFeedback: "Mobile navigation drawer feels silky smooth. Polish the touch target hitboxes.",
    },
    {
      goalId: "GOL-2026-Q4-08",
      employeeId: "EMP-HR-10",
      employeeName: "Meera Joshi",
      department: "Human Resources",
      title: "Strategic Tech Talent Pipeline: Q4 Senior Engineering Hires",
      description: `Close 5 senior engineering positions within 35-day average offer-to-accept SLA.
Key Milestones:
• [x] Source 80+ qualified candidate resumes
• [x] Conduct initial screening for 25 candidates
• [x] Advance 8 candidates to technical interview stage
• [ ] Close final offers for Staff Backend and DevOps roles`,
      category: "Core Deliverable",
      cycle: "Q4 2026",
      weightage: 50,
      progressPercentage: 75,
      status: "On Track",
      dueDate: "2026-11-30",
      managerFeedback: "Candidate pipeline quality is top-notch this quarter. Keep up the high touch candidate care.",
    },
  ];

  for (const g of goalsData) {
    await Goal.findOneAndUpdate({ goalId: g.goalId }, g, { upsert: true, new: true });
  }
  console.log(`Seeded ${goalsData.length} OKR Goals.`);

  /* ==========================================================
     7. APPRAISALS & 1-ON-1 SESSIONS
     ========================================================== */
  console.log("Seeding Appraisals & 1-on-1s...");

  const appraisalsData = [
    {
      appraisalId: "APR-2026-Q4-01",
      cycleName: "Q4 2026 Performance Appraisal Cycle",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      designation: "Senior Full-Stack Engineer",
      department: "Engineering",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      status: "Completed",
      finalScore: 4.6,
      selfAppraisal: {
        rating: 5,
        achievements: "Architected real-time WebSocket bus, cut page load times by 40%, mentored 2 junior developers.",
        challenges: "Cross-team dependencies with DevOps during staging migration.",
        developmentGoals: "Deep dive into distributed consensus protocols and cloud cost engineering.",
        submittedAt: new Date("2026-10-18T10:00:00Z"),
      },
      managerReview: {
        rating: 4,
        strengths: "Exceptional code quality, high ownership, proactive technical communication.",
        growthAreas: "Delegate operational triage to free up more time for system design.",
        recommendation: "Merit Increment",
        submittedAt: new Date("2026-10-22T14:30:00Z"),
      },
    },
    {
      appraisalId: "APR-2026-Q4-02",
      employeeId: "EMP-DEV-04",
      employeeName: "Rahul Sharma",
      designation: "Staff Backend Architect",
      department: "Engineering",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      status: "Completed",
      finalScore: 4.8,
      selfAppraisal: {
        rating: 5,
        achievements: "Optimized database indexes across all tables, authored team architectural guidelines.",
        challenges: "Managing tight timelines during high-concurrency stress testing.",
        developmentGoals: "Publish company engineering blog and lead system architecture review board.",
        submittedAt: new Date("2026-10-15T11:00:00Z"),
      },
      managerReview: {
        rating: 5,
        strengths: "Domain authority, exemplary problem solver, role model engineer.",
        growthAreas: "Continue mentoring leads across other squads.",
        recommendation: "Promotion",
        submittedAt: new Date("2026-10-20T16:00:00Z"),
      },
    },
    {
      appraisalId: "APR-2026-Q4-03",
      employeeId: "EMP-DEV-05",
      employeeName: "Sneha Kulkarni",
      designation: "Frontend UI/UX Engineer",
      department: "Engineering",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      status: "Pending Manager Review",
      selfAppraisal: {
        rating: 4,
        achievements: "Revamped Design System with WCAG 2.1 standards, eliminated all emoji rendering artifacts.",
        challenges: "Balancing component refactoring with ad-hoc bugfix requests.",
        developmentGoals: "Master micro-frontend architecture and WebAssembly performance profiling.",
        submittedAt: new Date("2026-10-24T09:30:00Z"),
      },
    },
    {
      appraisalId: "APR-2026-Q4-04",
      employeeId: "EMP-QA-07",
      employeeName: "Pooja Verma",
      designation: "Lead QA Automation Engineer",
      department: "Engineering",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      status: "Completed",
      finalScore: 4.4,
      selfAppraisal: {
        rating: 4,
        achievements: "Achieved 92% automated regression coverage with Playwright; cut release validation from 2 days to 30 mins.",
        challenges: "Flaky test isolation in staging container network.",
        developmentGoals: "Implement automated performance regression benchmarks in GitHub Actions.",
        submittedAt: new Date("2026-10-19T14:00:00Z"),
      },
      managerReview: {
        rating: 4,
        strengths: "Diligent test design, zero release slips, proactive test data generation.",
        growthAreas: "Integrate security vulnerability scanning into pipeline.",
        recommendation: "Merit Increment",
        submittedAt: new Date("2026-10-23T11:00:00Z"),
      },
    },
  ];

  for (const a of appraisalsData) {
    await Appraisal.findOneAndUpdate(
      { employeeId: a.employeeId, cycleName: a.cycleName },
      a,
      { upsert: true, new: true }
    );
  }

  const sampleOneOnOnes = [
    {
      meetingId: "1ON1-2026-101",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      designation: "Senior Full-Stack Engineer",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      meetingDate: "2026-10-22",
      feedbackType: "Growth & Career Check-in",
      talkingPoints: "Reviewed Q4 architectural deliverables. Rohan is demonstrating strong technical leadership. Discussed career progression path toward Staff Engineer.",
      actionItems: [
        { text: "Prepare architecture design doc for distributed cache cluster", isCompleted: true },
        { text: "Lead the technical walkthrough session for junior team members", isCompleted: true },
        { text: "Schedule quarterly sync with VP of Engineering", isCompleted: false },
      ],
      status: "Completed",
    },
    {
      meetingId: "1ON1-2026-102",
      employeeId: "EMP-DEV-05",
      employeeName: "Sneha Kulkarni",
      designation: "Frontend UI/UX Engineer",
      managerId: "EMP-MGR-02",
      managerName: "Priya Sundaram",
      meetingDate: "2026-10-18",
      feedbackType: "Quarterly Goal Alignment",
      talkingPoints: "Discussed Design System 2.0 component rollout. Prioritized eliminating CSS bundle duplication and auditing accessibility tokens.",
      actionItems: [
        { text: "Audit mobile responsive viewports for Attendance and Leaves pages", isCompleted: true },
        { text: "Run automated axe-core accessibility scanner on forms", isCompleted: false },
      ],
      status: "Completed",
    },
  ];

  for (const m of sampleOneOnOnes) {
    await OneOnOne.findOneAndUpdate({ meetingId: m.meetingId }, m, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded Appraisals and 1-on-1 meetings.`);

  /* ==========================================================
     8. RECRUITMENT & ATS (JOB OPENINGS & CANDIDATES)
     ========================================================== */
  console.log("Seeding Recruitment Job Openings & Candidates...");

  const jobOpeningsData = [
    {
      jobId: "JOB-2026-01",
      title: "Lead Frontend Architect",
      department: "Engineering",
      location: "Bangalore HQ",
      jobType: "Full-time",
      experienceRequired: "7-10 Years",
      salaryRange: "₹28L - ₹38L PA",
      openPositions: 2,
      status: "Active",
      description: "Lead enterprise web architecture, design system engineering, and performance optimization with React and Tailwind.",
    },
    {
      jobId: "JOB-2026-02",
      title: "Staff Backend Engineer - Distributed Systems",
      department: "Engineering",
      location: "Pune R&D Hub",
      jobType: "Full-time",
      experienceRequired: "6-9 Years",
      salaryRange: "₹30L - ₹42L PA",
      openPositions: 3,
      status: "Active",
      description: "Design high-throughput microservices, database sharding strategies, and enterprise audit logging systems.",
    },
    {
      jobId: "JOB-2026-03",
      title: "Senior Product Manager - Enterprise SaaS",
      department: "Product",
      location: "Bangalore HQ",
      jobType: "Full-time",
      experienceRequired: "5-8 Years",
      salaryRange: "₹25L - ₹35L PA",
      openPositions: 1,
      status: "Active",
      description: "Drive core HRMS roadmaps, customer discovery interviews, and competitive benchmark analysis.",
    },
    {
      jobId: "JOB-2026-04",
      title: "DevOps & Cloud Infrastructure Lead",
      department: "Engineering",
      location: "Remote / Anywhere in India",
      jobType: "Full-time",
      experienceRequired: "6-10 Years",
      salaryRange: "₹26L - ₹36L PA",
      openPositions: 1,
      status: "Active",
      description: "Manage AWS multi-region Kubernetes clusters, automated CI/CD canary deployments, and SOC2 compliance.",
    },
    {
      jobId: "JOB-2026-05",
      title: "Talent Acquisition Business Partner",
      department: "Human Resources",
      location: "Bangalore HQ",
      jobType: "Full-time",
      experienceRequired: "4-7 Years",
      salaryRange: "₹14L - ₹20L PA",
      openPositions: 2,
      status: "Active",
      description: "Lead end-to-end engineering and executive hiring pipelines with exceptional candidate experience.",
    },
  ];

  for (const job of jobOpeningsData) {
    await JobOpening.findOneAndUpdate({ jobId: job.jobId }, job, { upsert: true, new: true });
  }

  const candidatesData = [
    {
      candidateId: "CAN-2026-101",
      jobId: "JOB-2026-01",
      jobTitle: "Lead Frontend Architect",
      department: "Engineering",
      name: "Akash Singhal",
      email: "akash.singhal@example.com",
      phone: "+91 98101 22334",
      currentCompany: "Infosys Labs",
      currentDesignation: "Principal UI Architect",
      totalExperienceYears: 8,
      stage: "Technical Round",
      offeredCtc: 0,
      summary: "8+ years building enterprise single-page applications. Strong mastery of React concurrency, Webpack optimization, and Tailwind CSS.",
      feedback: [
        {
          roundName: "Technical Round 1",
          interviewerName: "Priya Sundaram",
          rating: 5,
          recommendation: "Strong Yes",
          notes: "Exceptional depth in web rendering performance, state machines, and micro-frontend federation.",
          submittedAt: new Date("2026-10-23T11:00:00Z"),
        },
      ],
    },
    {
      candidateId: "CAN-2026-102",
      jobId: "JOB-2026-01",
      jobTitle: "Lead Frontend Architect",
      department: "Engineering",
      name: "Divya Nambiar",
      email: "divya.nambiar@example.com",
      phone: "+91 97402 33445",
      currentCompany: "Swiggy",
      currentDesignation: "Lead Frontend Engineer",
      totalExperienceYears: 7,
      stage: "HR Interview",
      offeredCtc: 0,
      summary: "7 years of full-lifecycle product engineering with focus on real-time order tracking and mobile web responsiveness.",
      feedback: [
        {
          roundName: "Technical Round 1",
          interviewerName: "Vikram Malhotra",
          rating: 4,
          recommendation: "Yes",
          notes: "Strong knowledge of browser performance metrics and Core Web Vitals optimization.",
          submittedAt: new Date("2026-10-21T15:00:00Z"),
        },
      ],
    },
    {
      candidateId: "CAN-2026-103",
      jobId: "JOB-2026-02",
      jobTitle: "Staff Backend Engineer - Distributed Systems",
      department: "Engineering",
      name: "Tarun Chawla",
      email: "tarun.chawla@example.com",
      phone: "+91 98290 55667",
      currentCompany: "Razorpay",
      currentDesignation: "Senior Software Engineer",
      totalExperienceYears: 6,
      stage: "Offered",
      offeredCtc: 3400000,
      expectedJoiningDate: "2026-11-15",
      summary: "6 years specializing in financial transaction pipelines, Kafka event streaming, and resilient database caching.",
      feedback: [
        {
          roundName: "System Design",
          interviewerName: "Rahul Sharma",
          rating: 5,
          recommendation: "Strong Yes",
          notes: "Flawless distributed lock implementation with Redis and optimistic concurrency controls.",
          submittedAt: new Date("2026-10-19T16:30:00Z"),
        },
        {
          roundName: "Executive HR Discussion",
          interviewerName: "Ananya Sharma",
          rating: 5,
          recommendation: "Strong Yes",
          notes: "Culturally aligned, enthusiastic about Staffify vision. Offer rolled out at ₹34L CTC.",
          submittedAt: new Date("2026-10-24T12:00:00Z"),
        },
      ],
    },
    {
      candidateId: "CAN-2026-104",
      jobId: "JOB-2026-04",
      jobTitle: "DevOps & Cloud Infrastructure Lead",
      department: "Engineering",
      name: "Manish Kothari",
      email: "manish.kothari@example.com",
      phone: "+91 99301 44556",
      currentCompany: "Cisco Systems",
      currentDesignation: "Cloud Infrastructure Architect",
      totalExperienceYears: 9,
      stage: "Screening",
      summary: "9 years designing AWS multi-account landing zones, Kubernetes clusters, and automated compliance pipelines.",
    },
    {
      candidateId: "CAN-2026-105",
      jobId: "JOB-2026-03",
      jobTitle: "Senior Product Manager - Enterprise SaaS",
      department: "Product",
      name: "Simran Anand",
      email: "simran.anand@example.com",
      phone: "+91 98119 77889",
      currentCompany: "Freshworks",
      currentDesignation: "Product Manager",
      totalExperienceYears: 5,
      stage: "Applied",
      summary: "5 years leading B2B SaaS onboarding and workflow automation features with strong analytical tracking.",
    },
  ];

  for (const c of candidatesData) {
    await Candidate.findOneAndUpdate({ candidateId: c.candidateId }, c, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded Job Openings and Candidates.`);

  /* ==========================================================
     9. ASSETS (12 HARDWARE & IT ASSETS)
     ========================================================== */
  console.log("Seeding Hardware Assets...");

  const assetsData = [
    {
      assetTag: "AST-MBP-0101",
      name: "Apple MacBook Pro 16\" (M3 Max, 36GB, 1TB)",
      category: "Laptop",
      serialNumber: "C02G89A2MD6R",
      model: "MacBookPro18,1",
      specification: "Apple M3 Max 14-core CPU, 30-core GPU, 36GB Unified RAM, 1TB NVMe SSD",
      status: "Allocated",
      condition: "Brand New",
      allocatedToId: "EMP-DEV-03",
      allocatedToName: "Rohan Mehta",
      allocatedAt: new Date("2024-01-16"),
      purchaseDate: "2024-01-10",
      warrantyExpiry: "2027-01-10",
      purchaseCost: 289900,
      notes: "Primary developer workstation with AppleCare+ Enterprise Protection.",
    },
    {
      assetTag: "AST-XPS-0202",
      name: "Dell XPS 15 9530 (i9-13900H, 32GB, RTX 4070)",
      category: "Laptop",
      serialNumber: "9KZ1NP3",
      model: "XPS 15 9530",
      specification: "Intel Core i9-13900H, 32GB DDR5 RAM, 1TB Gen4 SSD, NVIDIA RTX 4070 8GB",
      status: "Allocated",
      condition: "Good",
      allocatedToId: "EMP-DEV-04",
      allocatedToName: "Rahul Sharma",
      allocatedAt: new Date("2024-03-02"),
      purchaseDate: "2024-02-20",
      warrantyExpiry: "2027-02-20",
      purchaseCost: 245000,
      notes: "High-performance backend compilation and stress testing machine.",
    },
    {
      assetTag: "AST-MBP-0103",
      name: "Apple MacBook Pro 14\" (M2 Pro, 16GB, 512GB)",
      category: "Laptop",
      serialNumber: "C02F7190MD5T",
      model: "MacBookPro17,2",
      specification: "Apple M2 Pro 10-core CPU, 16GB RAM, 512GB SSD",
      status: "Allocated",
      condition: "Good",
      allocatedToId: "EMP-DEV-05",
      allocatedToName: "Sneha Kulkarni",
      allocatedAt: new Date("2024-07-16"),
      purchaseDate: "2024-07-01",
      warrantyExpiry: "2027-07-01",
      purchaseCost: 199900,
      notes: "Assigned for frontend design system and UI engineering.",
    },
    {
      assetTag: "AST-MON-0301",
      name: "Dell UltraSharp 27\" 4K USB-C Hub Monitor (U2723QE)",
      category: "Monitor",
      serialNumber: "CN-039K99-74261",
      model: "U2723QE",
      specification: "4K IPS Black Panel, 98% DCI-P3, 90W Power Delivery USB-C Hub",
      status: "Allocated",
      condition: "Good",
      allocatedToId: "EMP-MGR-02",
      allocatedToName: "Priya Sundaram",
      allocatedAt: new Date("2023-06-15"),
      purchaseDate: "2023-06-05",
      warrantyExpiry: "2026-06-05",
      purchaseCost: 56000,
      notes: "Desk 3A - Engineering Lead workstation monitor.",
    },
    {
      assetTag: "AST-MON-0302",
      name: "LG 34\" Curved UltraWide QHD Monitor (34WN80C)",
      category: "Monitor",
      serialNumber: "204NDTM1K901",
      model: "34WN80C-B",
      specification: "34\" 21:9 Curved IPS QHD (3440 x 1440), sRGB 99%, HDR10",
      status: "Allocated",
      condition: "Good",
      allocatedToId: "EMP-DES-09",
      allocatedToName: "Kabir Das",
      allocatedAt: new Date("2024-02-18"),
      purchaseDate: "2024-02-10",
      warrantyExpiry: "2027-02-10",
      purchaseCost: 48500,
      notes: "Design studio workstation panoramic display.",
    },
    {
      assetTag: "AST-ACC-0401",
      name: "Keychron K2 Wireless Mechanical Keyboard (RGB, Hot-swap)",
      category: "Peripherals",
      serialNumber: "KC2-2024-8891",
      model: "Keychron K2 v2",
      specification: "Gateron G Pro Red switches, Mac & Windows layout, Bluetooth 5.1",
      status: "Allocated",
      condition: "Good",
      allocatedToId: "EMP-DEV-06",
      allocatedToName: "Arjun Nair",
      allocatedAt: new Date("2024-04-12"),
      purchaseDate: "2024-04-05",
      warrantyExpiry: "2025-04-05",
      purchaseCost: 9500,
      notes: "Ergonomic peripheral accessory request.",
    },
    {
      assetTag: "AST-MBP-0104",
      name: "Apple MacBook Pro 14\" (M3 Pro, 18GB, 512GB)",
      category: "Laptop",
      serialNumber: "C02L9022MD8W",
      model: "MacBookPro18,3",
      specification: "Apple M3 Pro, 18GB Unified RAM, 512GB SSD",
      status: "Available",
      condition: "Brand New",
      purchaseDate: "2026-10-01",
      warrantyExpiry: "2029-10-01",
      purchaseCost: 199900,
      notes: "In IT vault, ready for incoming engineering hire.",
    },
  ];

  for (const a of assetsData) {
    await Asset.findOneAndUpdate({ assetTag: a.assetTag }, a, { upsert: true, new: true });
  }
  console.log(`Seeded Hardware Assets.`);

  /* ==========================================================
     10. HELPDESK TICKETS
     ========================================================== */
  console.log("Seeding Helpdesk Tickets...");

  const ticketsData = [
    {
      ticketId: "TCK-2026-101",
      title: "Request for JetBrains All Products Pack License Renewal",
      description: "My annual JetBrains WebStorm/IntelliJ license expires in 5 days. Requesting approval for enterprise renewal.",
      category: "IT Hardware & Software",
      priority: "High",
      status: "In Progress",
      requesterId: "EMP-DEV-03",
      requesterName: "Rohan Mehta",
      department: "Engineering",
      assignedTo: "Kavita Menon",
      comments: [
        {
          authorId: "EMP-DEV-03",
          authorName: "Rohan Mehta",
          authorRole: "Employee",
          message: "Invoice reference from last renewal: JB-2025-88910.",
          createdAt: new Date("2026-10-24T10:00:00Z"),
        },
        {
          authorId: "EMP-OPS-15",
          authorName: "Kavita Menon",
          authorRole: "Admin",
          message: "Procurement approved by HR Director. Corporate license key will be issued today.",
          createdAt: new Date("2026-10-25T14:30:00Z"),
        },
      ],
    },
    {
      ticketId: "TCK-2026-102",
      title: "Tax Deduction at Source (TDS) Clarification for Form 16",
      description: "Need clarification regarding Section 80D medical insurance deduction reflected in the September payslip.",
      category: "Payroll & Taxes",
      priority: "Medium",
      status: "Resolved",
      requesterId: "EMP-DEV-04",
      requesterName: "Rahul Sharma",
      department: "Engineering",
      assignedTo: "Rajesh Iyer",
      resolution: "Verified medical premium policy receipt. Tax exemption adjustment credited in October payroll run.",
      resolvedAt: new Date("2026-10-22T16:00:00Z"),
    },
    {
      ticketId: "TCK-2026-103",
      title: "Dual Monitor DisplayPort to USB-C Adapter for Desk 4B",
      description: "Need an active 4K 60Hz DisplayPort adapter to connect second external monitor to MacBook.",
      category: "Facilities & Workplace",
      priority: "Low",
      status: "Resolved",
      requesterId: "EMP-DEV-05",
      requesterName: "Sneha Kulkarni",
      department: "Engineering",
      assignedTo: "Kavita Menon",
      resolution: "Anker USB-C to Dual DP hub dispatched and delivered to Pune R&D Hub.",
      resolvedAt: new Date("2026-10-20T12:00:00Z"),
    },
  ];

  for (const t of ticketsData) {
    await Ticket.findOneAndUpdate({ ticketId: t.ticketId }, t, { upsert: true, new: true });
  }
  console.log(`Seeded Helpdesk Tickets.`);

  /* ==========================================================
     11. EXPENSE CLAIMS
     ========================================================== */
  console.log("Seeding Expense Claims...");

  const expensesData = [
    {
      claimId: "EXP-2026-101",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      department: "Engineering",
      expenseCategory: "Travel & Fuel",
      claimDate: new Date("2026-10-15"),
      amount: 8450,
      merchantName: "IndiGo Airlines",
      receiptNumber: "6E-BLR-BOM-9921",
      description: "Roundtrip flights Bangalore to Mumbai for on-site client architecture summit.",
      status: "Approved",
      approvedBy: "Priya Sundaram",
      approvedAt: new Date("2026-10-18"),
    },
    {
      claimId: "EXP-2026-102",
      employeeId: "EMP-DEV-06",
      employeeName: "Arjun Nair",
      department: "Engineering",
      expenseCategory: "Training & Certifications",
      claimDate: new Date("2026-10-10"),
      amount: 26500,
      merchantName: "Linux Foundation",
      receiptNumber: "LF-CKA-2026-881",
      description: "Certified Kubernetes Administrator (CKA) official examination registration fee.",
      status: "Approved",
      approvedBy: "Priya Sundaram",
      approvedAt: new Date("2026-10-12"),
    },
    {
      claimId: "EXP-2026-103",
      employeeId: "EMP-DEV-05",
      employeeName: "Sneha Kulkarni",
      department: "Engineering",
      expenseCategory: "Internet & Mobile",
      claimDate: new Date("2026-10-20"),
      amount: 4497,
      merchantName: "Airtel Xstream Fiber",
      receiptNumber: "ARTL-PUN-091244",
      description: "Quarterly high-speed home fiber broadband reimbursement for remote development.",
      status: "Reimbursed",
      approvedBy: "Rajesh Iyer",
      approvedAt: new Date("2026-10-22"),
    },
    {
      claimId: "EXP-2026-104",
      employeeId: "EMP-PROD-08",
      employeeName: "Aditi Rao",
      department: "Product",
      expenseCategory: "Client Entertainment",
      claimDate: new Date("2026-10-22"),
      amount: 4800,
      merchantName: "The Leela Palace Bangalore",
      receiptNumber: "LEELA-BLR-01924",
      description: "Business dinner with enterprise client stakeholders discussing Q4 HRMS rollout.",
      status: "Pending",
    },
  ];

  for (const exp of expensesData) {
    await ExpenseClaim.findOneAndUpdate({ claimId: exp.claimId }, exp, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded Expense Claims.`);

  /* ==========================================================
     12. HR OFFICIAL DOCUMENTS
     ========================================================== */
  console.log("Seeding HR Documents...");

  const hrDocsData = [
    {
      documentId: "DOC-2026-01",
      referenceNumber: "STF/HR/2024/OFF-0182",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      department: "Engineering",
      designation: "Senior Full-Stack Engineer",
      templateType: "Appointment_Offer",
      title: "Official Letter of Employment & Appointment",
      issueDate: new Date("2024-01-15"),
      signatoryName: "Ananya Sharma",
      signatoryTitle: "HR Director & Administrator",
      status: "Signed",
    },
    {
      documentId: "DOC-2026-02",
      referenceNumber: "STF/HR/2026/REV-0391",
      employeeId: "EMP-MGR-02",
      employeeName: "Priya Sundaram",
      department: "Engineering",
      designation: "Engineering Lead & Manager",
      templateType: "Salary_Revision",
      title: "Annual Merit Compensation Revision Letter",
      issueDate: new Date("2026-04-01"),
      signatoryName: "Ananya Sharma",
      signatoryTitle: "HR Director & Administrator",
      status: "Signed",
    },
    {
      documentId: "DOC-2026-03",
      referenceNumber: "STF/HR/2026/BON-0045",
      employeeId: "EMP-DEV-04",
      employeeName: "Rahul Sharma",
      department: "Engineering",
      designation: "Staff Backend Architect",
      templateType: "Bonafide_Certificate",
      title: "Bonafide Certificate of Active Employment",
      issueDate: new Date("2026-09-10"),
      signatoryName: "Ananya Sharma",
      signatoryTitle: "HR Director & Administrator",
      status: "Signed",
    },
  ];

  for (const doc of hrDocsData) {
    await HrDocument.findOneAndUpdate({ documentId: doc.documentId }, doc, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded HR Documents.`);

  /* ==========================================================
     13. TIMESHEETS
     ========================================================== */
  console.log("Seeding Timesheets...");

  const timesheetsData = [
    {
      timesheetId: "TS-2026-W42-03",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      department: "Engineering",
      weekStartDate: "2026-10-19",
      weekEndDate: "2026-10-25",
      totalHours: 40,
      status: "Approved",
      approvedBy: "Priya Sundaram",
      approvedAt: new Date("2026-10-26"),
      entries: [
        {
          projectId: "PRJ-STAFFIFY-01",
          projectName: "Staffify Enterprise Platform v2",
          clientName: "Internal Product",
          taskCategory: "Development",
          mon: 8,
          tue: 8,
          wed: 6,
          thu: 8,
          fri: 6,
          sat: 0,
          sun: 0,
          total: 36,
          isBillable: true,
          notes: "Engineered real-time notification bus and WebSocket connection pooling.",
        },
        {
          projectId: "PRJ-STAFFIFY-01",
          projectName: "Staffify Enterprise Platform v2",
          clientName: "Internal Product",
          taskCategory: "Code Review",
          mon: 0,
          tue: 0,
          wed: 2,
          thu: 0,
          fri: 2,
          sat: 0,
          sun: 0,
          total: 4,
          isBillable: true,
          notes: "Peer architectural reviews for database indexing and Playwright tests.",
        },
      ],
    },
  ];

  for (const ts of timesheetsData) {
    await Timesheet.findOneAndUpdate({ timesheetId: ts.timesheetId }, ts, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded Timesheets.`);

  /* ==========================================================
     14. TAX DECLARATIONS & LOANS
     ========================================================== */
  console.log("Seeding Tax Declarations & Loans...");

  await TaxDeclaration.findOneAndUpdate(
    { declarationId: "TAX-2026-DEV-03" },
    {
      declarationId: "TAX-2026-DEV-03",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      financialYear: "2026-2027",
      regime: "Old",
      status: "Verified",
      section80C: {
        ppf: 50000,
        elss: 40000,
        lifeInsurance: 25000,
        epfVoluntary: 0,
        tuitionFees: 0,
        housingLoanPrincipal: 35000,
        total80C: 150000,
      },
      section80D: {
        selfAndFamily: 25000,
        parents: 30000,
        parentsSeniorCitizen: true,
        preventiveHealthCheckup: 5000,
        total80D: 60000,
      },
      houseRentAllowance: {
        isLivingInRentedHouse: true,
        isMetroCity: true,
        monthlyRentAmount: 28000,
        annualRentAmount: 336000,
        landlordName: "R. Venkatesh",
        landlordPan: "VENKR4412M",
        rentalAddress: "B-202, Salarpuria Greenage, Hosur Road, Bangalore",
      },
    },
    { upsert: true, new: true }
  );

  await Loan.findOneAndUpdate(
    { loanId: "LOAN-2026-01" },
    {
      loanId: "LOAN-2026-01",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      department: "Engineering",
      loanType: "Salary Advance",
      principalAmount: 50000,
      tenureMonths: 5,
      monthlyEmi: 10000,
      interestRatePercent: 0,
      disbursedDate: new Date("2026-08-01"),
      repaymentStartMonth: 9,
      repaymentStartYear: 2026,
      paidEmisCount: 2,
      totalPaidAmount: 20000,
      remainingAmount: 30000,
      status: "Approved",
    },
    { upsert: true, new: true }
  );

  /* ==========================================================
     15. TEAMS, SHIFTS & ROSTER
     ========================================================== */
  console.log("Seeding Teams & Shifts...");

  const teamsData = [
    {
      teamId: "TEAM-ENG-CORE",
      name: "Core Platform & Infrastructure",
      department: "Engineering",
      description: "Owns microservices architecture, cloud infrastructure, database reliability, and design systems.",
      managers: [{ employeeId: "EMP-MGR-02", name: "Priya Sundaram", email: "manager@staffify.com", role: "Engineering Lead" }],
      members: [
        { employeeId: "EMP-DEV-03", name: "Rohan Mehta", designation: "Senior Full-Stack Engineer", role: "Developer" },
        { employeeId: "EMP-DEV-04", name: "Rahul Sharma", designation: "Staff Backend Architect", role: "Architect" },
        { employeeId: "EMP-DEV-05", name: "Sneha Kulkarni", designation: "Frontend UI/UX Engineer", role: "Developer" },
        { employeeId: "EMP-DEV-06", name: "Arjun Nair", designation: "DevOps & SRE Engineer", role: "DevOps" },
        { employeeId: "EMP-QA-07", name: "Pooja Verma", designation: "Lead QA Automation Engineer", role: "QA" },
      ],
      isActive: true,
    },
    {
      teamId: "TEAM-PROD-DESIGN",
      name: "Product Experience & UX",
      department: "Product",
      description: "Drives product roadmaps, user discovery research, design systems, and usability testing.",
      managers: [{ employeeId: "EMP-PROD-08", name: "Aditi Rao", email: "aditi.rao@staffify.com", role: "Principal PM" }],
      members: [
        { employeeId: "EMP-DES-09", name: "Kabir Das", designation: "Lead Product Designer", role: "Designer" },
      ],
      isActive: true,
    },
    {
      teamId: "TEAM-PEOPLE-OPS",
      name: "People, Talent & Operations",
      department: "Human Resources",
      description: "Oversees employee experience, compensation, payroll, statutory compliance, and talent acquisition.",
      managers: [{ employeeId: "EMP-ADMIN-01", name: "Ananya Sharma", email: "admin@staffify.com", role: "HR Director" }],
      members: [
        { employeeId: "EMP-HR-10", name: "Meera Joshi", designation: "Senior Talent Acquisition Specialist", role: "Recruiter" },
        { employeeId: "EMP-HR-11", name: "Siddharth Patil", designation: "People Operations Executive", role: "Member" },
        { employeeId: "EMP-FIN-14", name: "Rajesh Iyer", designation: "Finance Controller", role: "Member" },
        { employeeId: "EMP-OPS-15", name: "Kavita Menon", designation: "Workplace & Facilities Lead", role: "Member" },
      ],
      isActive: true,
    },
  ];

  for (const t of teamsData) {
    await Team.findOneAndUpdate({ teamId: t.teamId }, t, { upsert: true, new: true });
  }

  /* ==========================================================
     16. BIOMETRIC MACHINES & LIVE LOGS
     ========================================================== */
  console.log("Seeding Biometric Machines & Logs...");

  const machinesData = [
    {
      machineId: "BIO-BLR-01",
      machineName: "Bangalore HQ - Main Turnstile RFID & Facial",
      brand: "eSSL",
      modelNumber: "SilkBio-101",
      serialNumber: "SN-BLR-0019284",
      ipAddress: "192.168.1.201",
      port: 4370,
      location: "Bangalore HQ - Ground Floor Turnstile",
      status: "Online",
      lastSyncTime: new Date(),
    },
    {
      machineId: "BIO-PUN-02",
      machineName: "Pune R&D Hub - Main Entrance Scanner",
      brand: "ZKTeco",
      modelNumber: "uFace800",
      serialNumber: "SN-PUN-0099482",
      ipAddress: "192.168.2.202",
      port: 4370,
      location: "Pune R&D Hub - Level 3 Access",
      status: "Online",
      lastSyncTime: new Date(),
    },
  ];

  for (const m of machinesData) {
    await BiometricMachine.findOneAndUpdate({ machineId: m.machineId }, m, {
      upsert: true,
      new: true,
    });
  }

  const bioLogsData = [
    {
      logId: "LOG-BIO-101",
      machineId: "BIO-BLR-01",
      serialNumber: "SN-BLR-0019284",
      employeeId: "EMP-DEV-03",
      employeeName: "Rohan Mehta",
      punchTime: new Date("2026-10-27T09:08:14.000Z"),
      punchDirection: "IN",
      verificationMode: "Facial Recognition",
      processedStatus: "Processed",
    },
    {
      logId: "LOG-BIO-102",
      machineId: "BIO-BLR-01",
      serialNumber: "SN-BLR-0019284",
      employeeId: "EMP-DEV-04",
      employeeName: "Rahul Sharma",
      punchTime: new Date("2026-10-27T09:44:22.000Z"),
      punchDirection: "IN",
      verificationMode: "RFID Card",
      processedStatus: "Processed",
    },
    {
      logId: "LOG-BIO-103",
      machineId: "BIO-BLR-01",
      serialNumber: "SN-BLR-0019284",
      employeeId: "EMP-MGR-02",
      employeeName: "Priya Sundaram",
      punchTime: new Date("2026-10-27T09:15:02.000Z"),
      punchDirection: "IN",
      verificationMode: "Fingerprint",
      processedStatus: "Processed",
    },
  ];

  for (const log of bioLogsData) {
    await BiometricLog.findOneAndUpdate({ logId: log.logId }, log, {
      upsert: true,
      new: true,
    });
  }

  /* ==========================================================
     17. PULSE FEED (BROADCASTS & KUDOS)
     ========================================================== */
  console.log("Seeding Pulse Broadcasts & Kudos...");

  const broadcastsData = [
    {
      broadcastId: "BRD-2026-01",
      title: "Staffify Q4 Annual Townhall: Vision, Products & Culture",
      content: "Join us this Friday at 4:30 PM for our quarterly all-hands townhall with leadership. We will celebrate milestone product launches, announce annual awards, and preview the 2027 strategic roadmap.",
      authorId: "EMP-ADMIN-01",
      authorName: "Ananya Sharma",
      priority: "High",
      isPinned: true,
      expiresAt: new Date("2026-11-15"),
    },
    {
      broadcastId: "BRD-2026-02",
      title: "Diwali 2026 Holiday Schedule & Festive Office Celebrations",
      content: "Wishing the entire Staffify family a joyous Diwali! Please note that offices across Bangalore, Pune, and Gurgaon will be closed for the festive weekend. Join us for traditional office festivities on Thursday afternoon.",
      authorId: "EMP-ADMIN-01",
      authorName: "Ananya Sharma",
      priority: "Normal",
      isPinned: false,
      expiresAt: new Date("2026-11-10"),
    },
  ];

  for (const b of broadcastsData) {
    await Broadcast.findOneAndUpdate({ broadcastId: b.broadcastId }, b, {
      upsert: true,
      new: true,
    });
  }

  const kudosData = [
    {
      kudosId: "KUD-2026-01",
      fromEmployeeId: "EMP-EXEC-02",
      fromEmployeeName: "Vikram Malhotra",
      toEmployeeId: "EMP-DEV-03",
      toEmployeeName: "Rohan Mehta",
      badge: "Rockstar Performer",
      message: "Huge shoutout to Rohan for architecting the real-time notification engine with zero downtime and sub-20ms latency!",
      likesCount: 14,
    },
    {
      kudosId: "KUD-2026-02",
      fromEmployeeId: "EMP-MGR-02",
      fromEmployeeName: "Priya Sundaram",
      toEmployeeId: "EMP-DEV-05",
      toEmployeeName: "Sneha Kulkarni",
      badge: "Innovation Leader",
      message: "Sneha's redesign of the Performance and OKR module has completely transformed the user experience into something human, friendly, and joyful to use!",
      likesCount: 11,
    },
    {
      kudosId: "KUD-2026-03",
      fromEmployeeId: "EMP-PROD-08",
      fromEmployeeName: "Aditi Rao",
      toEmployeeId: "EMP-QA-07",
      toEmployeeName: "Pooja Verma",
      badge: "Problem Solver",
      message: "Pooja's automated Playwright regression suite caught two critical edge-case bugs right before the staging release. True quality guardian!",
      likesCount: 9,
    },
  ];

  for (const k of kudosData) {
    await Kudos.findOneAndUpdate({ kudosId: k.kudosId }, k, { upsert: true, new: true });
  }

  /* ==========================================================
     18. AUDIT LOGS
     ========================================================== */
  console.log("Seeding Audit Logs...");

  const auditLogsData = [
    {
      logId: "AUD-2026-001",
      action: "USER_LOGIN_SUCCESS",
      category: "Access & Security",
      actorId: "EMP-ADMIN-01",
      actorName: "Ananya Sharma",
      actorRole: "Admin",
      targetEntity: "User",
      targetId: "EMP-ADMIN-01",
      ipAddress: "192.168.1.105",
      status: "SUCCESS",
      details: { note: "Successful administrator login from verified HQ IP." },
      createdAt: new Date("2026-10-27T08:55:00Z"),
    },
    {
      logId: "AUD-2026-002",
      action: "PAYROLL_CYCLE_PROCESSED",
      category: "Payroll & Statutory",
      actorId: "EMP-FIN-14",
      actorName: "Rajesh Iyer",
      actorRole: "Manager",
      targetEntity: "Payroll",
      targetId: "PAY-202610-ALL",
      ipAddress: "192.168.1.108",
      status: "SUCCESS",
      details: { note: "October 2026 payroll cycle processed for 15 active employees with statutory deductions." },
      createdAt: new Date("2026-10-26T17:30:00Z"),
    },
    {
      logId: "AUD-2026-003",
      action: "LEAVE_REQUEST_APPROVED",
      category: "Human Resources",
      actorId: "EMP-MGR-02",
      actorName: "Priya Sundaram",
      actorRole: "Manager",
      targetEntity: "Leave",
      targetId: "LEV-2026-101",
      ipAddress: "192.168.1.105",
      status: "SUCCESS",
      details: { note: "Approved sick leave for Pooja Verma for 2026-10-27." },
      createdAt: new Date("2026-10-27T08:30:00Z"),
    },
  ];

  for (const log of auditLogsData) {
    await AuditLog.findOneAndUpdate({ logId: log.logId }, log, { upsert: true, new: true });
  }

  console.log("Master Database Seeding Complete!");
  console.log("All modules now have rich, interconnected real database records.");
}

if (require.main === module) {
  seedMasterData()
    .then(() => {
      console.log("SUCCESS: Master database seeder executed cleanly.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("FATAL: Master database seeder encountered error:", err);
      process.exit(1);
    });
}

module.exports = seedMasterData;
