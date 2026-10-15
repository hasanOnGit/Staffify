const mongoose = require("mongoose");

const Leaveschema = new mongoose.Schema(
  {
   
     leaveId:{
     type: String
      },
     employeeId:{
     type: String
      },  
    employeeName:{
     type: String
      },
    status: {
      type: String
     
    },
   leaveType: {
     type: String,
     enum: ["halfDay", "paid", "sick", "casual"]
    },

    fromDate:{
      type: Date
      
    },
    toDate: {
      type: Date
      
    },
    reason: {
      type: String
      
    },
    approvedBy: {
      type: String
      
    },
    
  },
  {
    timestamps: true, 
  }
);

const Leaves = mongoose.model("leave", Leaveschema);
module.exports = Leaves;


