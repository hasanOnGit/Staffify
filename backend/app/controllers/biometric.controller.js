const express = require("express");
const apiRoutes = express.Router();
const BiometricMachine = require("../models/biometricMachine.model");
const BiometricLog = require("../models/biometricLog.model");
const Attendance = require("../models/attendance.model");
const Employees = require("../models/employees.model");

// Seed default hardware machines if none exist
async function ensureDefaultMachines() {
  const count = await BiometricMachine.countDocuments();
  if (count === 0) {
    await BiometricMachine.create([
      {
        machineId: "BIO-DEV-01",
        machineName: "Bangalore HQ - Main Reception Turnstile",
        brand: "eSSL",
        modelNumber: "SilkBio-101",
        serialNumber: "ESSL-BLR-00921",
        ipAddress: "192.168.1.201",
        port: 4370,
        location: "Main Reception Gate A",
        directionDefault: "AUTO",
        status: "Online",
        lastHeartbeat: new Date(),
        totalPunchesRecorded: 142,
      },
      {
        machineId: "BIO-DEV-02",
        machineName: "Engineering Bay - ZKTeco Face Access",
        brand: "ZKTeco",
        modelNumber: "MB20-VL",
        serialNumber: "ZK-TECH-BLR-881",
        ipAddress: "192.168.1.205",
        port: 4370,
        location: "Floor 2 Engineering Wing",
        directionDefault: "IN",
        status: "Online",
        lastHeartbeat: new Date(),
        totalPunchesRecorded: 98,
      },
    ]);
  }
}

module.exports = function (app) {
  ensureDefaultMachines().catch((err) => console.error("Machine seed err:", err));

  /**
   * GET /api/biometric/machines
   * List all registered biometric devices and health status
   */
  apiRoutes.get("/machines", async (req, res) => {
    try {
      const machines = await BiometricMachine.find().sort({ createdAt: 1 });
      const logs = await BiometricLog.find().sort({ punchTime: -1 }).limit(10);
      return res.status(200).json({ success: true, data: { machines, recentLogs: logs } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/biometric/machines
   * Register a new biometric device terminal
   */
  apiRoutes.post("/machines", async (req, res) => {
    try {
      const { machineName, brand, modelNumber, serialNumber, ipAddress, port, location } = req.body;
      if (!machineName || !serialNumber || !ipAddress) {
        return res.status(400).json({ error: "Machine name, serial number, and IP address are required" });
      }

      const machineId = "BIO-" + Date.now();
      const machine = await BiometricMachine.create({
        machineId,
        machineName,
        brand: brand || "eSSL",
        modelNumber: modelNumber || "SilkBio-101",
        serialNumber,
        ipAddress,
        port: Number(port) || 4370,
        location: location || "Corporate Office",
        status: "Online",
        lastHeartbeat: new Date(),
      });

      return res.status(201).json({ success: true, message: "Biometric machine registered", data: machine });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/biometric/iclock/cdata
   * Standard ADMS / Push protocol webhook for eSSL and ZKTeco devices.
   * Biometric hardware terminals automatically POST their attendance logs here.
   */
  apiRoutes.all("/iclock/cdata", async (req, res) => {
    try {
      const sn = req.query.SN || req.headers["serialnumber"] || "UNKNOWN_DEVICE";
      let bodyData = req.body;
      let rawText = typeof bodyData === "string" ? bodyData : JSON.stringify(bodyData);

      // Acknowledge hardware device immediately with standard OK handshake response
      res.status(200).send("OK\n");

      // Update machine heartbeat
      await BiometricMachine.findOneAndUpdate(
        { serialNumber: sn },
        { lastHeartbeat: new Date(), status: "Online" }
      );
    } catch (err) {
      console.error("ADMS push error:", err);
      return res.status(200).send("OK\n");
    }
  });

  /**
   * POST /api/biometric/simulate-punch
   * Emulates a physical biometric terminal reading (Fingerprint / Face / Card)
   */
  apiRoutes.post("/simulate-punch", async (req, res) => {
    try {
      const {
        machineId = "BIO-DEV-01",
        employeeId,
        verificationMode = "Fingerprint",
        direction = "AUTO",
      } = req.body;

      if (!employeeId) {
        return res.status(400).json({ error: "employeeId is required" });
      }

      const emp = await Employees.findOne({ employeeId });
      const machine = await BiometricMachine.findOne({ machineId });

      const punchTime = new Date();
      const logId = "BIOLOG-" + Date.now();

      const log = await BiometricLog.create({
        logId,
        machineId,
        serialNumber: machine?.serialNumber || "ESSL-BLR-00921",
        employeeId,
        employeeName: emp?.name || "Employee",
        punchTime,
        punchDirection: direction,
        verificationMode,
        rawPayload: `PIN=${employeeId}\tTIME=${punchTime.toISOString()}\tVERIFY=${verificationMode}`,
        syncStatus: "Pending",
      });

      if (machine) {
        machine.totalPunchesRecorded = (machine.totalPunchesRecorded || 0) + 1;
        machine.lastHeartbeat = new Date();
        await machine.save();
      }

      return res.status(201).json({
        success: true,
        message: `Biometric punch received from ${machine?.machineName || "Terminal"} via ${verificationMode}`,
        data: log,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/biometric/sync
   * Process all pending biometric logs into Staffify Attendance records
   */
  apiRoutes.post("/sync", async (req, res) => {
    try {
      const pendingLogs = await BiometricLog.find({ syncStatus: "Pending" }).sort({ punchTime: 1 });
      let syncedCount = 0;

      for (const log of pendingLogs) {
        const punchDate = new Date(log.punchTime);
        punchDate.setHours(0, 0, 0, 0);

        let att = await Attendance.findOne({
          employeeId: log.employeeId,
          date: punchDate,
        });

        const emp = await Employees.findOne({ employeeId: log.employeeId });

        if (!att) {
          att = new Attendance({
            attendanceId: "ATT-" + log.employeeId + "-" + punchDate.getTime(),
            employeeId: log.employeeId,
            employeeName: log.employeeName || emp?.name || "Employee",
            date: punchDate,
            status: "Present",
            checkIn: log.punchTime,
            swipes: [
              {
                time: log.punchTime,
                type: "IN",
                source: "Biometric Hardware",
                location: "Turnstile Terminal",
                verified: true,
              },
            ],
          });
        } else {
          // If already checked in, add second swipe
          const lastSwipe = att.swipes?.[att.swipes.length - 1];
          const nextType = lastSwipe?.type === "IN" ? "OUT" : "IN";

          if (nextType === "OUT") {
            att.checkOut = log.punchTime;
            const diffMs = log.punchTime - new Date(att.checkIn);
            att.workHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
          }

          att.swipes.push({
            time: log.punchTime,
            type: nextType,
            source: "Biometric Hardware",
            location: "Turnstile Terminal",
            verified: true,
          });
        }

        await att.save();

        log.syncStatus = "Synced";
        log.syncedAttendanceDate = punchDate.toISOString().split("T")[0];
        await log.save();
        syncedCount++;
      }

      // Update machines last sync
      await BiometricMachine.updateMany({}, { lastSyncTime: new Date() });

      return res.status(200).json({
        success: true,
        message: `Successfully synchronized ${syncedCount} biometric punch logs into Attendance records`,
        syncedCount,
      });
    } catch (err) {
      console.error("Biometric sync error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/biometric", apiRoutes);
};
