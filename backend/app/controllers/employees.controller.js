const express = require("express");
const apiRoutes = express.Router();
const newEmployee = require("../models/employees.model");
const User = require("../models/user.model");

module.exports = function (app) {
  /* ==========================================================
     CREATE NEW EMPLOYEE (360 PROFILE)
     ========================================================== */
  apiRoutes.post("/createEmployee", async (req, res) => {
    try {
      const {
        name,
        email,
        phoneNo,
        designation,
        department,
        gender,
        dob,
        bloodGroup,
        maritalStatus,
        fatherName,
        presentAddress,
        permanentAddress,
        emergencyContactNum,
        emergencyContactName,
        emergencyContactRelation,
        dateOfJoining,
        employmentType,
        probationStatus,
        managerId,
        managerName,
        workLocation,
        basicSalary,
        totalSalary,
        bankDetails,
        statutoryDetails,
        isActive,
        userId,
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required." });
      }

      const existing = await newEmployee.findOne({ email });
      if (existing) {
        return res.status(400).json({
          message: "An employee with this email already exists!",
        });
      }

      const employeeId = "EMP-" + Math.floor(1000 + Math.random() * 9000);

      const data = await newEmployee.create({
        employeeId,
        userId: userId || "",
        name,
        email,
        phoneNo,
        designation: designation || "Software Engineer",
        department: department || "Engineering",
        gender: gender || "Prefer not to say",
        dob,
        bloodGroup,
        maritalStatus: maritalStatus || "Single",
        fatherName,
        presentAddress,
        permanentAddress,
        emergencyContactNum,
        emergencyContactName,
        emergencyContactRelation,
        dateOfJoining,
        employmentType: employmentType || "Full-time",
        probationStatus: probationStatus || "Confirmed",
        managerId,
        managerName,
        workLocation: workLocation || "Headquarters",
        basicSalary: Number(basicSalary) || 0,
        totalSalary: Number(totalSalary) || 0,
        bankDetails: bankDetails || {},
        statutoryDetails: statutoryDetails || {},
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      });

      return res.status(201).json({
        message: "New employee profile created successfully",
        data,
      });
    } catch (error) {
      console.error("Create employee error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     GET ALL EMPLOYEES (WITH OPTIONAL FILTER & SEARCH)
     ========================================================== */
  apiRoutes.get("/getEmployee", async (req, res) => {
    try {
      const { department, status, search } = req.query;
      const query = {};

      if (department) query.department = department;
      if (status !== undefined && status !== "") query.isActive = status === "true";
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
          { designation: { $regex: search, $options: "i" } },
        ];
      }

      const allData = await newEmployee.find(query).sort({ createdAt: -1 });

      return res.status(200).json(allData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     GET EMPLOYEE BY ID (SUPPORTS POST, GET, AND PARAMS)
     ========================================================== */
  const handleGetById = async (req, res) => {
    try {
      const employeeId = req.params.employeeId || req.body.employeeId || req.query.employeeId;

      if (!employeeId) {
        return res.status(400).json({ error: "employeeId is required" });
      }

      const employee = await newEmployee.findOne({ employeeId });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found with this ID" });
      }

      return res.status(200).json(employee);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  apiRoutes.get("/getEmployeeById/:employeeId", handleGetById);
  apiRoutes.get("/getEmployeeById", handleGetById);
  apiRoutes.post("/getEmployeeById", handleGetById);

  /* ==========================================================
     GET EMPLOYEE BY USER ID (FOR SELF-SERVICE PROFILE)
     ========================================================== */
  apiRoutes.get("/getEmployeeByUserId/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let employee = await newEmployee.findOne({
        $or: [{ userId }, { employeeId: userId }],
      });

      if (!employee) {
        const user = await User.findOne({
          $or: [
            { userId },
            { _id: userId.match(/^[0-9a-fA-F]{24}$/) ? userId : null },
          ],
        });

        if (user) {
          const employeeId = "EMP-" + Math.floor(1000 + Math.random() * 9000);
          employee = await newEmployee.create({
            employeeId,
            userId: user.userId,
            name: user.name || "Employee",
            email: user.email,
            phoneNo: user.phone || "",
            designation: "Software Engineer",
            department: "Engineering",
            gender: "Prefer not to say",
            employmentType: "Full-time",
            probationStatus: "Confirmed",
            workLocation: "Headquarters",
            dateOfJoining: new Date().toISOString().split("T")[0],
            bankDetails: {},
            statutoryDetails: {},
          });
        } else {
          return res.status(404).json({ message: "Employee profile not found" });
        }
      }

      return res.status(200).json(employee);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     UPDATE EMPLOYEE (360 ATTRIBUTES)
     ========================================================== */
  apiRoutes.post("/updateEmployee", async (req, res) => {
    try {
      const { employeeId, ...updates } = req.body;

      if (!employeeId) {
        return res.status(400).json({ message: "employeeId is required" });
      }

      const employee = await newEmployee.findOne({ employeeId });
      if (!employee) {
        return res.status(404).json({ message: "Employee with this id not found" });
      }

      // Handle nested bank and statutory updates
      if (updates.bankDetails) {
        employee.bankDetails = {
          ...employee.bankDetails?.toObject?.(),
          ...updates.bankDetails,
        };
        delete updates.bankDetails;
      }

      if (updates.statutoryDetails) {
        employee.statutoryDetails = {
          ...employee.statutoryDetails?.toObject?.(),
          ...updates.statutoryDetails,
        };
        delete updates.statutoryDetails;
      }

      // Apply other top-level fields
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          employee[key] = updates[key];
        }
      });

      await employee.save();

      return res.status(200).json({
        message: "Employee 360 profile updated successfully",
        data: employee,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  /* ==========================================================
     DELETE EMPLOYEE
     ========================================================== */
  apiRoutes.post("/deleteEmployee", async (req, res) => {
    try {
      const { employeeId } = req.body;

      const employee = await newEmployee.findOneAndDelete({ employeeId });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.status(200).json({
        message: "Employee deleted successfully",
        data: employee,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.use("/", apiRoutes);
};