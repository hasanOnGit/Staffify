const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    employeeId:{
        type:String,
        primaryKey:true
    },
    userId:{
        type:String,
        primaryKey:true
    },
    
    name:{
        type:String,
        
    },
    designation:{
        type:String,
        
    },
    gender :{
        type:String,
        
    },
    phoneNo:{
        type:String,
        
    },
    name:{
        type:String,
        
    },
    presentAddress:{
        type:String,
        
    },
    permanentAddress:{
        type:String,
        
    },
    emergencyContactNum:{
        type:String,
        
    },
    
    dateOfJoining:{
        type:String,
        
    },
    basicSalary:{
        type:String,
        
    },
    totalSalary:{
        type:String,
        
    },department:{
        type:String,
        
    },email:{
        type:String,
        
    },
    managerId:{
        type:String,
        
    },
    isActive:{
        type:Boolean,
        
    },
},
{ 
    timestamp :true,

}
);

const newEmployee = mongoose.model("employeelist", employeeSchema);
module.exports = newEmployee;