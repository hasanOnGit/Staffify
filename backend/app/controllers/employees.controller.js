const express = require("express");
const apiRoutes = express.Router();
const newEmployee = require("../models/employees.model");


module.exports = function(app){
    apiRoutes.post("/createEmployee", async (req, res) => {
      
  try {
    const {
      name,
      designation,
      gender,
      phoneNo,
      fatherName,
      presentAddress,
      permanentAddress,
      emergencyContactNum,
      
      dateOfJoining,
      basicSalary,
      
      totalSalary,
      department,
      email,
      isActive
    } = req.body;

    const employeeId = "ENQ-" + Math.floor(1000 + Math.random() * 9000);

    const existing = await newEmployee.findOne({ name });
    if (existing) {
      return res.status(400).json({
        message: "An Employee already exists!",
      });
    }

    const data = await newEmployee.create({
      employeeId,
      name,
      designation,
      gender,
      phoneNo,
      fatherName,
      presentAddress,
      permanentAddress,
      emergencyContactNum,
      
      dateOfJoining,
      basicSalary,
      
      totalSalary,
      department,
      email,
      isActive
    });

    return res.status(200).json({
      message: "New employee created successfully",
      data
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});


      apiRoutes.post("/getEmployeeById",async(req,res) =>{
        try {
          const {employeeId} = req.body;   

        const alldata = await newEmployee.findOne({employeeId});

        return res.status(200).json(alldata,{message:"data fetched successfully"})
        } catch (error) {
            return res.status(500).json({error:error.message});
        }
        
      });

       apiRoutes.get("/getEmployee",async(req,res) =>{
        try {
             

        const alldata = await newEmployee.find({});

        return res.status(200).json(alldata,{message:"data fetched successfully"})
        } catch (error) {
            return res.status(500).json({error:error.message});
        }
        
      });


   apiRoutes.post("/updateEmployee", async (req, res) => {
    try {
    const {
      employeeId,
      name,
      designation,
      gender,
      phoneNo,
      fatherName,
      presentAddress,
      permanentAddress,
      emergencyContactNum,
      
      dateOfJoining,
      basicSalary,
      
      totalSalary,
      department,
      email,
      isActive
    } = req.body;

    const employee = await newEmployee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({
        message: "Employee with this id not found"
      });
    }

    const updates = {
     
      name,
      designation,
      gender,
      phoneNo,
      fatherName,
      presentAddress,
      permanentAddress,
      emergencyContactNum,
      
      dateOfJoining,
      basicSalary,
      
      totalSalary,
      department,
      email,
      isActive
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        employee[key] = updates[key];
      }
    });

    await employee.save();

    return res.status(200).json({
      message: "Employee updated successfully",
      data: employee
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});



     apiRoutes.post("/deleteEmployee", async (req, res) => {
  try {
    const { employeeId } = req.body;

    const employee = await newEmployee.findOneAndDelete({ employeeId });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    return res.status(200).json({
      message: "Employee deleted successfully",
      data: employee
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});



       
    app.use("/",apiRoutes);
}