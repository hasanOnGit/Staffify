const express = require("express");
const apiRoutes = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const authMiddleware = require("../middleware/auth.middleware");

const otpStore = new Map();

module.exports = function(app){
  
  apiRoutes.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      if (!email || !password || !name) {
        return res.status(400).json({ msg: "Name, email, and password are required." });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: "User with this email already registered." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = "USR-" + Math.floor(1000 + Math.random() * 9000);
      const userRole = role || "Employee";

      const newUser = await User.create({
        userId,
        name,
        email,
        password: hashedPassword,
        role: userRole,
        isActive: true,
      });

      const token = jwt.sign(
        {
          id: newUser._id,
          userId: newUser.userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        process.env.JWT_SECRET || "staffify_super_secret_jwt_key_2026_dev",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        msg: "User registered successfully.",
        token,
        user: {
          userId: newUser.userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (err) {
      console.error("Register Error:", err);
      res.status(500).json({ msg: "Error registering user.", error: err.message });
    }
  });

  apiRoutes.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ msg: "Email and password are required." });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials." });
      }

      let isMatch = false;
      if (user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = user.password === password;
        if (isMatch) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
        }
      }

      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials." });
      }

      const userRole = user.role || "Employee";

      const token = jwt.sign(
        {
          id: user._id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: userRole,
        },
        process.env.JWT_SECRET || "staffify_super_secret_jwt_key_2026_dev",
        { expiresIn: "7d" }
      );

      res.status(200).json({
        msg: "Login successful.",
        token,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: userRole,
          profilePicture: user.profilePicture,
        },
      });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ msg: "Error logging in.", error: err.message });
    }
  });

  /* ==========================================================
     GET CURRENT USER (ME)
     ========================================================== */
  apiRoutes.get("/me", authMiddleware, async (req, res) => {
    try {
      const user = await User.findOne({ userId: req.user.userId }).select("-password");
      if (!user) {
        return res.status(404).json({ msg: "User not found." });
      }
      res.status(200).json({ user });
    } catch (err) {
      res.status(500).json({ msg: "Server error.", error: err.message });
    }
  });

  /* ==========================================================
     GET PROFILE BY USER ID
     ========================================================== */
  apiRoutes.get("/getProfile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findOne({ userId }).select("-password");
      if (!user) {
        return res.status(404).json({ message: "Profile not found." });
      }
      res.status(200).json({ data: user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     UPDATE PROFILE BY USER ID
     ========================================================== */
  apiRoutes.post("/updateProfile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, phone, address, profilePicture, role } = req.body;

      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (name) user.name = name;
      if (profilePicture) user.profilePicture = profilePicture;
      if (role) user.role = role;

      await user.save();

      res.status(200).json({
        message: "Profile updated successfully.",
        data: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     FORGET PASSWORD & OTP
     ========================================================== */
  apiRoutes.post("/forget-password", async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: "User not found.", status: "false" });
      }

      const otp = crypto.randomInt(100000, 999999);
      otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

      console.log(`[PASSWORD RESET] OTP generated for ${email}: ${otp}`);

      res.status(200).json({
        msg: "OTP sent to your email (simulated in logs).",
        status: "true",
        otpSimulated: otp,
      });
    } catch (err) {
      res.status(500).json({ msg: "Error sending OTP.", error: err.message });
    }
  });

  apiRoutes.post("/verify-otp", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
      const stored = otpStore.get(email);
      if (!stored || stored.otp !== parseInt(otp) || stored.expiresAt < Date.now()) {
        return res.status(400).json({ msg: "Invalid or expired OTP." });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: "User not found." });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      otpStore.delete(email);

      res.status(200).json({ msg: "Password updated successfully." });
    } catch (err) {
      res.status(500).json({ msg: "Error updating password.", error: err.message });
    }
  });

  app.use("/", apiRoutes);
};
