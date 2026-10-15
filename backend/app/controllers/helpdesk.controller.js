const express = require("express");
const Ticket = require("../models/ticket.model");
const Asset = require("../models/asset.model");
const Employee = require("../models/employees.model");

// Helper to seed sample inventory & tickets if empty
async function ensureSeedData() {
  const assetCount = await Asset.countDocuments();
  if (assetCount === 0) {
    await Asset.create([
      {
        assetTag: "AST-LAP-1001",
        name: 'MacBook Pro 16" M3 Max',
        category: "Laptop",
        serialNumber: "C02G40H4MD6R",
        model: "Apple MacBook Pro 2024",
        specification: "36GB Unified RAM, 1TB NVMe SSD, Space Black",
        status: "Allocated",
        condition: "Brand New",
        allocatedToId: "EMP-DEV-03",
        allocatedToName: "Employee User",
        allocatedAt: new Date("2026-01-15"),
        purchaseDate: "2026-01-10",
        warrantyExpiry: "2029-01-10",
        purchaseValue: 249900,
        notes: "Primary development workstation issued upon onboarding",
      },
      {
        assetTag: "AST-MON-2001",
        name: 'Dell UltraSharp 27" 4K USB-C Monitor',
        category: "Monitor",
        serialNumber: "CN-0V45J9-74261",
        model: "U2723QE",
        specification: "IPS Black Panel, 90W Power Delivery, 4K UHD",
        status: "Allocated",
        condition: "Good",
        allocatedToId: "EMP-DEV-03",
        allocatedToName: "Employee User",
        allocatedAt: new Date("2026-01-16"),
        purchaseDate: "2025-11-20",
        warrantyExpiry: "2028-11-20",
        purchaseValue: 58000,
        notes: "Dual monitor workstation setup",
      },
      {
        assetTag: "AST-LAP-1002",
        name: "Lenovo ThinkPad X1 Carbon Gen 12",
        category: "Laptop",
        serialNumber: "PF3A99LK",
        model: "ThinkPad X1 Carbon",
        specification: "Core Ultra 7, 32GB LPDDR5x, 512GB SSD",
        status: "Allocated",
        condition: "Good",
        allocatedToId: "EMP-MGR-02",
        allocatedToName: "Manager User",
        allocatedAt: new Date("2025-08-10"),
        purchaseDate: "2025-08-01",
        warrantyExpiry: "2028-08-01",
        purchaseValue: 185000,
        notes: "Managerial portable ultrabook",
      },
      {
        assetTag: "AST-ACC-3001",
        name: "Apple Magic Keyboard with Touch ID",
        category: "Peripherals",
        serialNumber: "MK293HN/A",
        model: "Magic Keyboard",
        specification: "Numeric Keypad, Bluetooth Wireless",
        status: "Available",
        condition: "Brand New",
        purchaseDate: "2026-02-05",
        warrantyExpiry: "2027-02-05",
        purchaseValue: 17500,
        notes: "Spare in IT locker ready for issue",
      },
      {
        assetTag: "AST-BDG-4001",
        name: "Encrypted RFID Smart Access Badge",
        category: "Access Badge",
        serialNumber: "HID-ICLASS-9902",
        model: "iCLASS SE",
        specification: "Level 4 Server Room & Lab clearance",
        status: "Allocated",
        condition: "Good",
        allocatedToId: "EMP-ADMIN-01",
        allocatedToName: "Admin User",
        allocatedAt: new Date("2025-01-01"),
        purchaseDate: "2025-01-01",
        warrantyExpiry: "2030-01-01",
        purchaseValue: 2500,
      },
    ]);
  }

  const ticketCount = await Ticket.countDocuments();
  if (ticketCount === 0) {
    await Ticket.create([
      {
        ticketId: "TCK-1001",
        title: "Docker Desktop memory resource limit adjustment",
        description:
          "Need permission to allocate 16GB memory to Docker Desktop for local Kubernetes cluster testing.",
        category: "IT Hardware & Software",
        priority: "Medium",
        status: "Resolved",
        requesterId: "EMP-DEV-03",
        requesterName: "Employee User",
        department: "Engineering",
        assignedToId: "EMP-ADMIN-01",
        assignedToName: "Admin User",
        resolutionNote: "RAM allocation profile updated via MDM configuration profile.",
        resolvedAt: new Date("2026-10-10"),
        comments: [
          {
            authorId: "EMP-DEV-03",
            authorName: "Employee User",
            authorRole: "Employee",
            message: "Submitted memory boost request for sprint workload.",
            createdAt: new Date("2026-10-09"),
          },
          {
            authorId: "EMP-ADMIN-01",
            authorName: "Admin User",
            authorRole: "Admin",
            message: "Approved and pushed MDM payload. Please restart Docker.",
            createdAt: new Date("2026-10-10"),
          },
        ],
      },
      {
        ticketId: "TCK-1002",
        title: "Request for PF Universal Account Number (UAN) Transfer",
        description:
          "Previous employer EPF balance needs to be linked to current Staffify member ID.",
        category: "Payroll & Taxes",
        priority: "High",
        status: "In Progress",
        requesterId: "EMP-DEV-03",
        requesterName: "Employee User",
        department: "Engineering",
        assignedToId: "EMP-ADMIN-01",
        assignedToName: "Admin User",
        comments: [
          {
            authorId: "EMP-DEV-03",
            authorName: "Employee User",
            authorRole: "Employee",
            message: "Uploaded Annexure K and previous UAN details.",
            createdAt: new Date("2026-10-14"),
          },
        ],
      },
    ]);
  }
}

module.exports = function (app) {
  const apiRoutes = express.Router();

  /* ==========================================================
     1. HELPDESK TICKETS ENDPOINTS
     ========================================================== */
  apiRoutes.get("/tickets", async (req, res) => {
    try {
      await ensureSeedData();

      const { employeeId, status, category, priority } = req.query;
      const query = {};

      if (employeeId) query.requesterId = employeeId;
      if (status && status !== "All") query.status = status;
      if (category && category !== "All") query.category = category;
      if (priority && priority !== "All") query.priority = priority;

      const tickets = await Ticket.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: tickets });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.post("/tickets", async (req, res) => {
    try {
      const { title, description, category, priority, requesterId, requesterName, department } =
        req.body;

      if (!title || !description || !requesterId) {
        return res
          .status(400)
          .json({ success: false, error: "Title, description, and requesterId are required." });
      }

      const count = await Ticket.countDocuments();
      const ticketId = `TCK-${1000 + count + 1}`;

      const newTicket = await Ticket.create({
        ticketId,
        title,
        description,
        category: category || "IT Hardware & Software",
        priority: priority || "Medium",
        requesterId,
        requesterName: requesterName || "Employee",
        department: department || "Engineering",
        status: "Open",
        comments: [
          {
            authorId: requesterId,
            authorName: requesterName || "Employee",
            authorRole: "Employee",
            message: "Ticket created.",
          },
        ],
      });

      return res.status(201).json({
        success: true,
        message: "Support ticket created successfully.",
        data: newTicket,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.patch("/tickets/:ticketId", async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { status, assignedToId, assignedToName, resolutionNote } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
      if (assignedToName !== undefined) updateData.assignedToName = assignedToName;
      if (resolutionNote !== undefined) updateData.resolutionNote = resolutionNote;
      if (status === "Resolved" || status === "Closed") {
        updateData.resolvedAt = new Date();
      }

      const updated = await Ticket.findOneAndUpdate({ ticketId }, updateData, {
        new: true,
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: "Ticket not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Ticket updated successfully.",
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.post("/tickets/:ticketId/comments", async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { authorId, authorName, authorRole, message } = req.body;

      if (!message || !authorId) {
        return res.status(400).json({ success: false, error: "Message and authorId required." });
      }

      const ticket = await Ticket.findOne({ ticketId });
      if (!ticket) {
        return res.status(404).json({ success: false, error: "Ticket not found." });
      }

      ticket.comments.push({
        authorId,
        authorName: authorName || "User",
        authorRole: authorRole || "Employee",
        message,
        createdAt: new Date(),
      });

      await ticket.save();

      return res.status(200).json({
        success: true,
        message: "Comment added successfully.",
        data: ticket,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /* ==========================================================
     2. ASSET INVENTORY & ALLOCATION ENDPOINTS
     ========================================================== */
  apiRoutes.get("/assets", async (req, res) => {
    try {
      await ensureSeedData();

      const { allocatedToId, status, category } = req.query;
      const query = {};

      if (allocatedToId) query.allocatedToId = allocatedToId;
      if (status && status !== "All") query.status = status;
      if (category && category !== "All") query.category = category;

      const assets = await Asset.find(query).sort({ assetTag: 1 });
      return res.status(200).json({ success: true, data: assets });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.post("/assets", async (req, res) => {
    try {
      const {
        assetTag,
        name,
        category,
        serialNumber,
        model,
        specification,
        condition,
        purchaseDate,
        warrantyExpiry,
        purchaseValue,
        notes,
      } = req.body;

      if (!assetTag || !name) {
        return res.status(400).json({ success: false, error: "Asset Tag and name are required." });
      }

      const existing = await Asset.findOne({ assetTag: assetTag.trim().toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, error: "Asset Tag already exists." });
      }

      const newAsset = await Asset.create({
        assetTag: assetTag.trim().toUpperCase(),
        name,
        category: category || "Laptop",
        serialNumber: serialNumber || "",
        model: model || "",
        specification: specification || "",
        condition: condition || "Brand New",
        purchaseDate: purchaseDate || "",
        warrantyExpiry: warrantyExpiry || "",
        purchaseValue: Number(purchaseValue) || 0,
        notes: notes || "",
        status: "Available",
      });

      return res.status(201).json({
        success: true,
        message: "Asset added to inventory successfully.",
        data: newAsset,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.post("/assets/allocate", async (req, res) => {
    try {
      const { assetTag, employeeId } = req.body;

      if (!assetTag || !employeeId) {
        return res.status(400).json({ success: false, error: "assetTag and employeeId required." });
      }

      const [asset, emp] = await Promise.all([
        Asset.findOne({ assetTag }),
        Employee.findOne({ employeeId }),
      ]);

      if (!asset) return res.status(404).json({ success: false, error: "Asset not found." });
      if (!emp) return res.status(404).json({ success: false, error: "Employee not found." });

      asset.status = "Allocated";
      asset.allocatedToId = emp.employeeId;
      asset.allocatedToName = emp.name;
      asset.allocatedAt = new Date();
      await asset.save();

      return res.status(200).json({
        success: true,
        message: `Asset ${assetTag} successfully allocated to ${emp.name}.`,
        data: asset,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRoutes.post("/assets/return", async (req, res) => {
    try {
      const { assetTag, condition, notes } = req.body;

      if (!assetTag) {
        return res.status(400).json({ success: false, error: "assetTag is required." });
      }

      const asset = await Asset.findOne({ assetTag });
      if (!asset) return res.status(404).json({ success: false, error: "Asset not found." });

      const prevUser = asset.allocatedToName;
      asset.status = "Available";
      asset.allocatedToId = "";
      asset.allocatedToName = "";
      asset.allocatedAt = null;
      if (condition) asset.condition = condition;
      if (notes) asset.notes = notes;
      await asset.save();

      return res.status(200).json({
        success: true,
        message: `Asset ${assetTag} returned from ${prevUser || "employee"} and marked Available.`,
        data: asset,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.use("/api/helpdesk", apiRoutes);
};
