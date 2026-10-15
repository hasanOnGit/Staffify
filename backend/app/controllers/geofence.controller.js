const express = require("express");
const Geofence = require("../models/geofence.model");
const Employee = require("../models/employees.model");

// Calculate Haversine distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return Infinity;
  }
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Seed default office zone if empty
async function ensureDefaultGeofence() {
  const count = await Geofence.countDocuments();
  if (count === 0) {
    await Geofence.create([
      {
        zoneId: "GEO-HQ-01",
        name: "Headquarters - Tech Park Campus",
        address: "Cessna Business Park, Outer Ring Road, Bangalore",
        latitude: 12.9352,
        longitude: 77.6946,
        radiusMeters: 500, // 500m radius
        targetScope: "All Employees",
        targetDepartment: "All",
        isStrict: true,
        isActive: true,
      },
      {
        zoneId: "GEO-MUM-02",
        name: "Mumbai Corporate Tower",
        address: "Bandra Kurla Complex (BKC), Mumbai",
        latitude: 19.0657,
        longitude: 72.8687,
        radiusMeters: 400,
        targetScope: "Department",
        targetDepartment: "Operations",
        isStrict: true,
        isActive: true,
      },
    ]);
  }
}

module.exports = function (app) {
  const apiRoutes = express.Router();

  /* ==========================================================
     1. GET ALL GEOFENCE ZONES
     ========================================================== */
  apiRoutes.get("/", async (req, res) => {
    try {
      await ensureDefaultGeofence();
      const zones = await Geofence.find({ isActive: true }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: zones });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     2. CREATE A GEOFENCE ZONE
     ========================================================== */
  apiRoutes.post("/", async (req, res) => {
    try {
      const {
        name,
        address,
        latitude,
        longitude,
        radiusMeters,
        targetScope,
        targetDepartment,
        targetEmployeeIds,
        isStrict,
      } = req.body;

      if (!name || latitude === undefined || longitude === undefined) {
        return res
          .status(400)
          .json({ success: false, error: "Zone name, latitude, and longitude are required." });
      }

      const count = await Geofence.countDocuments();
      const zoneId = `GEO-ZN-${100 + count + 1}`;

      const newZone = await Geofence.create({
        zoneId,
        name: name.trim(),
        address: address || "",
        latitude: Number(latitude),
        longitude: Number(longitude),
        radiusMeters: Number(radiusMeters) || 300,
        targetScope: targetScope || "All Employees",
        targetDepartment: targetDepartment || "All",
        targetEmployeeIds: targetEmployeeIds || [],
        isStrict: isStrict !== undefined ? isStrict : true,
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        message: "Office geofence perimeter configured successfully.",
        data: newZone,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     3. UPDATE GEOFENCE ZONE
     ========================================================== */
  apiRoutes.patch("/:zoneId", async (req, res) => {
    try {
      const { zoneId } = req.params;
      const updated = await Geofence.findOneAndUpdate({ zoneId }, req.body, { new: true });

      if (!updated) {
        return res.status(404).json({ success: false, error: "Geofence zone not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Geofence zone updated successfully.",
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     4. DELETE GEOFENCE ZONE
     ========================================================== */
  apiRoutes.delete("/:zoneId", async (req, res) => {
    try {
      const { zoneId } = req.params;
      await Geofence.findOneAndDelete({ zoneId });
      return res.status(200).json({ success: true, message: "Geofence zone removed." });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     5. VERIFY EMPLOYEE COORDINATES AGAINST ASSIGNED GEOFENCE
     ========================================================== */
  apiRoutes.post("/verify", async (req, res) => {
    try {
      await ensureDefaultGeofence();
      const { employeeId, latitude, longitude } = req.body;

      if (!employeeId) {
        return res.status(400).json({ success: false, error: "employeeId is required." });
      }

      // If user provided no coordinates
      if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
        return res.status(200).json({
          success: true,
          data: {
            isAllowed: false,
            needsLocation: true,
            message: "GPS coordinates required for attendance swipe verification.",
          },
        });
      }

      const emp = await Employee.findOne({ employeeId });
      const department = emp ? emp.department : "All";

      // Find active geofence zones
      const zones = await Geofence.find({ isActive: true });

      // Find applicable zone for this employee:
      // Priority 1: Specific employee rule
      // Priority 2: Department rule
      // Priority 3: All Employees rule
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

      // If no zones configured, allow punch by default
      if (!matchedZone) {
        return res.status(200).json({
          success: true,
          data: {
            isAllowed: true,
            isStrict: false,
            zoneName: "No Restricted Zone",
            distanceMeters: 0,
            radiusMeters: 0,
            message: "No location restrictions configured.",
          },
        });
      }

      // Compute distance
      const distanceMeters = calculateDistanceMeters(
        Number(latitude),
        Number(longitude),
        matchedZone.latitude,
        matchedZone.longitude
      );

      const isWithinGeofence = distanceMeters <= matchedZone.radiusMeters;
      const isAllowed = isWithinGeofence || !matchedZone.isStrict;

      let messageText = "";
      if (isWithinGeofence) {
        messageText = `Within authorized perimeter (${distanceMeters}m from ${matchedZone.name}).`;
      } else {
        const distKm = (distanceMeters / 1000).toFixed(2);
        messageText = `Outside authorized office radius (${distKm} km from ${matchedZone.name}).`;
      }

      return res.status(200).json({
        success: true,
        data: {
          isAllowed,
          isWithinGeofence,
          isStrict: matchedZone.isStrict,
          zoneId: matchedZone.zoneId,
          zoneName: matchedZone.name,
          officeLatitude: matchedZone.latitude,
          officeLongitude: matchedZone.longitude,
          userLatitude: Number(latitude),
          userLongitude: Number(longitude),
          distanceMeters,
          radiusMeters: matchedZone.radiusMeters,
          message: messageText,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use("/api/geofence", apiRoutes);
};
