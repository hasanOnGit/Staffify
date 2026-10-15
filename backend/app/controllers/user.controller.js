const express = require("express");
const apiRoutes = express.Router();
const User = require("../models/user.model");
 

module.exports = function(app){
  
 apiRoutes.post("/register", async (req, res) => {
  
    const { name, email, password } = req.body;
    try {


        const userId = "USR-" + Math.floor(1000 + Math.random() * 9000);
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send({ msg: "User already registered." });
      }

      const newUser = await User.create({
       userId, name, email, password
      });
      res
        .status(201)
        .send({ msg: "User registered successfully.", user: newUser });
    } catch (err) {
      res
        .status(500)
        .send({ msg: "Error registering user.", error: err.message });
    }
  });

  apiRoutes.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
         const userId = "USR-" + Math.floor(1000 + Math.random() * 9000);
      const user = await User.findOne({ email});
      if (!user || user.password !== password) {
        return res.status(400).send({ msg: "Invalid credentials." });
      }


      res.status(200).send({ msg: "Login successful.", email,userId:user.userId ,user:user.name});
    } catch (err) {
      res.status(500).send({ msg: "Error logging in.", error: err.message });
    }
  });

  apiRoutes.post("/forget-password", async (req, res) => {
    const { email } = req.body;
    console.log("Body for Forget-Password::::", req.body);
    try {
      const user = await User.findOne({ email});
      if (!user) {
        console.log(`User not found for emailOrUsername: ${email}`);
        return res.status(404).send({ msg: "User not found.", status: "false" });
      }
      const otp = crypto.randomInt(100000, 999999);
      otpStore[email] = otp; // Store OTP temporarily

      console.log(
        `Generated OTP: ${otp} for email: ${email}`
      );

      await sendEmail(
        email,
        "Password Reset OTP",
        `Your OTP for password reset is: ${otp}`
      );

      res.status(200).send({ msg: "OTP sent to your email.", status: "true" });
    } catch (err) {
      console.error(`Error sending OTP to ${email}:`, err.message);
      res.status(500).send({ msg: "Error sending OTP.", error: err.message });
    }
  });

  apiRoutes.post("/verify-otp", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
      const storedOtp = otpStore[email];
      if (!storedOtp || storedOtp !== parseInt(otp)) {
        return res.status(400).send({ msg: "Invalid or expired OTP." });
      }

      const user = await User.findOne({ email});
      if (!user) {
        return res.status(404).send({ msg: "User not found." });
      }

      user.password = newPassword;
      await user.save();

      delete otpStore[emailOrUsername];

      res.status(200).send({ msg: "Password updated successfully." });
    } catch (err) {
      res
        .status(500)
        .send({ msg: "Error updating password.", error: err.message });
    }
  });

  // apiRoutes.post('/adminLogin', async (req, res) => {
  //     const { email, phone, password, role } = req.body;

  //     try {
  //         // Find user based on email or phone
  //         const user = await User.findOne({
  //             $or: [
  //                 { email: email },
  //                 { phone: phone }
  //             ]
  //         });

  //         // Check if user exists
  //         if (!user) {
  //             return res.status(400).send({ msg: 'User Not Found.' });
  //         }

  //         // Check if the password matches (assuming password is not hashed)
  //         if (user.password !== password) {
  //             return res.status(400).send({ msg: 'Invalid Password.' });
  //         }

  //         // Check if the role matches and if the user is an admin
  //         if (user.role !== 'admin' || role !== 'admin') {
  //             return res.status(403).send({ msg: 'You are not an admin.' });
  //         }

  //         // Login successful
  //         res.status(200).send({ msg: 'Login successful.', email: user.email });
  //     } catch (err) {
  //         res.status(500).send({ msg: 'Error logging in.', error: err.message, err });
  //     }
  // });

  apiRoutes.post("/adminLogin", async (req, res) => {
    const { email, phone, password, role } = req.body;
   
    try {
      // Define query condition based on input
      let queryCondition = {};
      if (email) {
        queryCondition.emailOrUsername = email;
      } else if (phone) {
        queryCondition.phone = phone;
      } else {
        return res.status(400).send({ msg: "Email or phone is required." });
      }

      // Find user based on the specific query condition
      const user = await User.findOne(queryCondition);

      // Check if user exists
      if (!user) {
        return res.status(400).send({ msg: "User Not Found." });
      }

      // Check if the password matches
      if (user.password !== password) {
        return res.status(400).send({ msg: "Invalid Password." });
      }

      // Check if the role matches and if the user is an admin
      if (user.role !== "admin" || role !== "admin") {
        return res.status(403).send({ msg: "You are not an admin." });
      }

      // Login successful
      res
        .status(200)
        .send({
          msg: "Login successful.",
          email: user.email,
        });
    } catch (err) {
      res.status(500).send({ msg: "Error logging in.", error: err.message });
    }
  });


    app.use("/",apiRoutes);
   
}
