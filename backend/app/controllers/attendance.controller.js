const express = require("express");
const apiRoutes = express.Router();
const Attendance = require("../models/attendance.model");
const newEmployee = require("../models/employees.model");
const Geofence = require("../models/geofence.model");

// Helper to get local YYYY-MM-DD
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to format time
const formatTimeStr = (d = new Date()) => {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Helper to extract client IP address
const getClientIp = (req) => {
  let ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "127.0.0.1";
  if (typeof ip === "string" && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }
  if (typeof ip === "string" && ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }
  if (ip === "::1") {
    ip = "127.0.0.1";
  }
  return ip;
};

// Helper to check if IP is authorized
const isIpAuthorized = (ip, allowedIps = []) => {
  if (!allowedIps || allowedIps.length === 0) return true;
  return allowedIps.some((pattern) => {
    const trimmed = pattern.trim();
    if (!trimmed || trimmed === "*") return true;
    if (trimmed === ip) return true;
    if (trimmed.endsWith(".*")) {
      const prefix = trimmed.slice(0, -2);
      return ip.startsWith(prefix);
    }
    return false;
  });
};

module.exports = function (app) {
  /* ==========================================================
     PUNCH IN / PUNCH OUT
     ========================================================== */
  apiRoutes.post("/punch", async (req, res) => {
    try {
      const { employeeId, employeeName, type, latitude, longitude } = req.body;

      if (!employeeId || !type) {
        return res.status(400).json({ error: "employeeId and type (IN/OUT) are required" });
      }

      const clientIp = getClientIp(req);

      // Geofence & IP Verification
      const emp = await newEmployee.findOne({ employeeId });
      const department = emp ? emp.department : "All";
      const zones = await Geofence.find({ isActive: true });

      let matchedZone = zones.find(
        (z) => z.targetScope === "Specific Employees" && z.targetEmployeeIds.includes(employeeId)
      );
      if (!matchedZone && department) {
        matchedZone = zones.find(
          (z) => z.targetScope === "Department" && z.targetDepartment === department
        );
      }
      if (!matchedZone) {
        matchedZone = zones.find((z) => z.targetScope === "All Employees");
      }

      // IP Verification
      let ipVerified = true;
      if (matchedZone && matchedZone.ipRestricted && matchedZone.allowedIps?.length > 0) {
        const isAllowed = isIpAuthorized(clientIp, matchedZone.allowedIps);
        if (matchedZone.isStrict && !isAllowed) {
          return res.status(403).json({
            error: `Swipe Rejected: Your network IP (${clientIp}) is not within the authorized corporate network whitelist for ${matchedZone.name}.`
          });
        }
        ipVerified = isAllowed;
      }

      let networkType = "Public Gateway";
      if (clientIp === "127.0.0.1") {
        networkType = "Office Localhost / Loopback";
      } else if (clientIp.startsWith("192.168.") || clientIp.startsWith("10.") || clientIp.startsWith("172.")) {
        networkType = "Corporate Office Intranet";
      } else {
        networkType = "Secure Verified Gateway";
      }

      let locationData = null;
      if (matchedZone) {
        if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
          const R = 6371e3;
          const toRad = (deg) => (deg * Math.PI) / 180;
          const φ1 = toRad(Number(latitude));
          const φ2 = toRad(matchedZone.latitude);
          const Δφ = toRad(matchedZone.latitude - Number(latitude));
          const Δλ = toRad(matchedZone.longitude - Number(longitude));
          const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distanceMeters = Math.round(R * c);
          const isWithin = distanceMeters <= matchedZone.radiusMeters;

          if (matchedZone.isStrict && !isWithin) {
            const distKm = (distanceMeters / 1000).toFixed(2);
            return res.status(403).json({
              error: `Swipe Rejected: You are outside your assigned office perimeter (${distKm} km from ${matchedZone.name}). Authorized radius is ${matchedZone.radiusMeters}m.`
            });
          }

          locationData = {
            latitude: Number(latitude),
            longitude: Number(longitude),
            zoneName: matchedZone.name,
            distanceMeters,
            isWithinGeofence: isWithin,
          };
        } else if (matchedZone.isStrict) {
          return res.status(403).json({
            error: `Swipe Rejected: GPS location verification is required for ${matchedZone.name}. Please enable location services in your browser.`
          });
        }
      }

      const today = getTodayStr();
      const now = new Date();
      const timeStr = formatTimeStr(now);

      let record = await Attendance.findOne({ employeeId, date: today });

      if (!record) {
        record = new Attendance({
          employeeId,
          employeeName: employeeName || "Employee",
          date: today,
          firstIn: type === "IN" ? now : undefined,
          lastOut: type === "OUT" ? now : undefined,
          punches: [],
          status: "Present",
          ipAddress: clientIp,
          geofenceZone: matchedZone ? matchedZone.name : "Remote",
        });
      } else {
        record.ipAddress = clientIp;
        if (matchedZone) record.geofenceZone = matchedZone.name;
      }

      // Check for late arrival on first IN (after 9:30 AM)
      if (type === "IN" && !record.firstIn) {
        record.firstIn = now;
        const hour = now.getHours();
        const minute = now.getMinutes();
        if (hour > 9 || (hour === 9 && minute > 30)) {
          record.status = "Late";
        }
      }

      if (type === "OUT") {
        record.lastOut = now;
      }

      // Add punch with location and IP metadata
      record.punches.push({
        time: now,
        timeStr,
        type,
        location: locationData,
        ipAddress: clientIp,
        ipVerified,
        networkType,
      });

      // Compute total hours
      if (record.punches.length >= 2) {
        let totalMs = 0;
        let lastInTime = null;

        for (const p of record.punches) {
          if (p.type === "IN") {
            lastInTime = new Date(p.time);
          } else if (p.type === "OUT" && lastInTime) {
            totalMs += new Date(p.time) - lastInTime;
            lastInTime = null;
          }
        }

        // If currently still in, add elapsed time till now
        if (lastInTime) {
          totalMs += now - lastInTime;
        }

        const calculatedHours = Number((totalMs / (1000 * 60 * 60)).toFixed(2));
        record.totalHours = calculatedHours;

        if (calculatedHours >= 8) {
          if (record.status !== "Late") record.status = "Present";
        } else if (calculatedHours >= 4) {
          record.status = "Half Day";
        }
      }

      await record.save();

      return res.status(200).json({
        message: `Successfully clocked ${type}`,
        data: record,
      });
    } catch (err) {
      console.error("Attendance punch error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     GET TODAY'S STATUS FOR EMPLOYEE
     ========================================================== */
  apiRoutes.get("/today", async (req, res) => {
    try {
      const { employeeId } = req.query;
      const today = getTodayStr();

      if (!employeeId) {
        return res.status(400).json({ error: "employeeId is required" });
      }

      const record = await Attendance.findOne({ employeeId, date: today });
      const lastPunch = record?.punches?.length
        ? record.punches[record.punches.length - 1]
        : null;

      const isClockedIn = lastPunch?.type === "IN";

      return res.status(200).json({
        record: record || null,
        isClockedIn,
        lastPunch,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     GET ATTENDANCE RECORDS BY DATE (MANAGER / HR VIEW)
     ========================================================== */
  apiRoutes.get("/", async (req, res) => {
    try {
      const date = req.query.date || getTodayStr();
      const query = { date };
      if (req.query.employeeId) {
        query.employeeId = req.query.employeeId;
      }
      const records = await Attendance.find(query).sort({ createdAt: -1 });

      return res.status(200).json(records);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     GET EMPLOYEE ATTENDANCE HISTORY (MONTHLY CALENDAR)
     ========================================================== */
  apiRoutes.get("/history", async (req, res) => {
    try {
      const { employeeId, month } = req.query; // month in format "YYYY-MM"
      if (!employeeId) {
        return res.status(400).json({ error: "employeeId is required" });
      }

      const query = { employeeId };
      if (month) {
        query.date = { $regex: `^${month}` };
      }

      const records = await Attendance.find(query).sort({ date: 1 });
      return res.status(200).json(records);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     REQUEST ATTENDANCE REGULARIZATION (FOR MISSED PUNCHES)
     ========================================================== */
  apiRoutes.post("/regularize", async (req, res) => {
    try {
      const { employeeId, date, reason, proposedIn, proposedOut } = req.body;

      if (!employeeId || !date || !reason) {
        return res.status(400).json({ error: "employeeId, date, and reason are required" });
      }

      let record = await Attendance.findOne({ employeeId, date });
      if (!record) {
        record = new Attendance({
          employeeId,
          employeeName: req.body.employeeName || "Employee",
          date,
          status: "Absent",
        });
      }

      record.regularization = {
        requested: true,
        reason,
        proposedIn: proposedIn || "09:00",
        proposedOut: proposedOut || "18:00",
        status: "Pending",
      };

      await record.save();

      return res.status(200).json({
        message: "Regularization request submitted successfully",
        data: record,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /* ==========================================================
     APPROVE / REJECT REGULARIZATION (MANAGER ACTION)
     ========================================================== */
  apiRoutes.post("/approve-regularization", async (req, res) => {
    try {
      const { attendanceId, status, approvedBy } = req.body;

      if (!attendanceId || !status) {
        return res.status(400).json({ error: "attendanceId and status are required" });
      }

      const record = await Attendance.findById(attendanceId);
      if (!record) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      record.regularization.status = status;
      record.regularization.approvedBy = approvedBy || "Manager";
      record.regularization.reviewedAt = new Date();

      if (status === "Approved") {
        record.status = "Present";
        record.totalHours = 8;
      }

      await record.save();

      return res.status(200).json({
        message: `Regularization request ${status.toLowerCase()}`,
        data: record,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/attendance", apiRoutes);
};
