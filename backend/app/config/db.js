const mongoose = require('mongoose')
const express = require('express')
module.exports = (app)=>{

    mongoose
    .connect(
      process.env.MONGO_URI || "mongodb+srv://ndeeksha1904_db_user:07PLiwxleed0gA9Z@cluster0.o1ofpc9.mongodb.net/hr_portal"
    )
    .then(() => {
      console.log("MongoDB connection successful");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });}