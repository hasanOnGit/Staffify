const mongoose = require("mongoose");

const Userschema = new mongoose.Schema(
  {  userId:{
     type: String
  },
    name: {
      type: String
     
    },
    email: {
      type: String
    },
    password:{
      type: String
      
    },
    role: {
      type: String
      
    },
    otp: {
      type: String
      
    },
    otpExpiry: {
      type: Date
      
    },
    profilePicture:{
      type: String
      
    },
    isActive:{
     type: Boolean
    },
    createdBy:{
     type: String
    }
  },
  {
    timestamps: true, 
  }
);

const User = mongoose.model("user", Userschema);
module.exports = User;
