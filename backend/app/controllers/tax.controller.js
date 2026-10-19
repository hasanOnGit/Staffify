const express = require("express");
const apiRoutes = express.Router();
const TaxDeclaration = require("../models/taxDeclaration.model");
const SalaryStructure = require("../models/salaryStructure.model");
const Employees = require("../models/employees.model");

/**
 * Standard Indian Income Tax Computation Engine
 * Compares Old Tax Regime vs New Tax Regime (Section 115BAC)
 */
function computeTaxComparison(grossAnnual, deductions = {}) {
  // 1. OLD TAX REGIME
  const oldStdDeduction = 50000;
  const old80C = Math.min(150000, Number(deductions.total80C || 0));
  const old80D = Math.min(75000, Number(deductions.total80D || 0));
  const old24B = Math.min(200000, Number(deductions.section24B || 0));
  const oldHra = Number(deductions.hraExemption || 0);
  const oldOther = Number(deductions.otherDeductions || 0);

  const oldTotalDeductions = oldStdDeduction + old80C + old80D + old24B + oldHra + oldOther;
  const oldTaxableIncome = Math.max(0, grossAnnual - oldTotalDeductions);

  let oldTax = 0;
  if (oldTaxableIncome > 1000000) {
    oldTax = 112500 + (oldTaxableIncome - 1000000) * 0.3;
  } else if (oldTaxableIncome > 500000) {
    oldTax = 12500 + (oldTaxableIncome - 500000) * 0.2;
  } else if (oldTaxableIncome > 250000) {
    oldTax = (oldTaxableIncome - 250000) * 0.05;
  }

  // Section 87A rebate for Old Regime up to 5 Lakhs
  if (oldTaxableIncome <= 500000) {
    oldTax = 0;
  } else {
    // 4% Health & Education Cess
    oldTax = Math.round(oldTax * 1.04);
  }

  // 2. NEW TAX REGIME (Budget 2024 / FY 24-25 Slabs)
  const newStdDeduction = 75000;
  const newTaxableIncome = Math.max(0, grossAnnual - newStdDeduction);

  let newTax = 0;
  if (newTaxableIncome > 1500000) {
    newTax = 140000 + (newTaxableIncome - 1500000) * 0.3;
  } else if (newTaxableIncome > 1200000) {
    newTax = 95000 + (newTaxableIncome - 1200000) * 0.2;
  } else if (newTaxableIncome > 900000) {
    newTax = 50000 + (newTaxableIncome - 900000) * 0.15;
  } else if (newTaxableIncome > 600000) {
    newTax = 20000 + (newTaxableIncome - 600000) * 0.1;
  } else if (newTaxableIncome > 300000) {
    newTax = (newTaxableIncome - 300000) * 0.05;
  }

  // Section 87A rebate for New Regime up to 7 Lakhs (Taxable income <= 700,000 pays zero tax)
  if (newTaxableIncome <= 700000) {
    newTax = 0;
  } else {
    // 4% Health & Education Cess
    newTax = Math.round(newTax * 1.04);
  }

  const taxDiff = oldTax - newTax;
  const recommended = taxDiff > 0 ? "New" : "Old";
  const savings = Math.abs(taxDiff);

  return {
    grossAnnual,
    oldRegime: {
      standardDeduction: oldStdDeduction,
      exemptionsAndDeductions: oldTotalDeductions,
      taxableIncome: oldTaxableIncome,
      estimatedTaxPayable: oldTax,
    },
    newRegime: {
      standardDeduction: newStdDeduction,
      exemptionsAndDeductions: newStdDeduction,
      taxableIncome: newTaxableIncome,
      estimatedTaxPayable: newTax,
    },
    recommendedRegime: recommended,
    taxSavings: savings,
  };
}

module.exports = function (app) {
  /**
   * GET /api/tax/declaration/:employeeId
   * Fetch active tax declaration & simulation for an employee
   */
  apiRoutes.get("/declaration/:employeeId", async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { financialYear = "2024-2025" } = req.query;

      let declaration = await TaxDeclaration.findOne({ employeeId, financialYear });
      const emp = await Employees.findOne({ employeeId });
      const struct = await SalaryStructure.findOne({ employeeId });

      const annualCtc = struct?.annualCtc || (emp?.designation?.includes("Lead") ? 840000 : 600000);

      if (!declaration) {
        declaration = await TaxDeclaration.create({
          declarationId: "DEC-" + employeeId + "-" + financialYear.replace("-", ""),
          employeeId,
          employeeName: emp?.name || "Employee",
          financialYear,
          regime: struct?.taxRegime || "New",
          status: "Draft",
          section80C: { total80C: 50000, epfVoluntary: 21600, ppf: 28400 },
          section80D: { total80D: 15000, selfAndFamily: 15000 },
          hraDetails: { monthlyRent: 15000, annualRent: 180000, cityType: "Metro" },
        });
      }

      // Compute live comparison
      const total80C =
        (declaration.section80C.ppf || 0) +
        (declaration.section80C.elss || 0) +
        (declaration.section80C.lifeInsurance || 0) +
        (declaration.section80C.epfVoluntary || 0) +
        (declaration.section80C.tuitionFees || 0) +
        (declaration.section80C.housingLoanPrincipal || 0);

      const total80D =
        (declaration.section80D.selfAndFamily || 0) +
        (declaration.section80D.parents || 0) +
        (declaration.section80D.preventiveHealthCheckup || 0);

      const hraExemption = Math.min(
        declaration.hraDetails?.annualRent > 100000 ? declaration.hraDetails.annualRent - annualCtc * 0.1 : 0,
        annualCtc * 0.4
      );

      const comparison = computeTaxComparison(annualCtc, {
        total80C,
        total80D,
        section24B: declaration.section24B?.interestAmount || 0,
        hraExemption: Math.max(0, hraExemption),
        otherDeductions:
          (declaration.otherDeductions?.section80E || 0) +
          (declaration.otherDeductions?.section80G || 0) +
          (declaration.otherDeductions?.section80CCD1B || 0),
      });

      declaration.taxEstimate = {
        grossAnnualIncome: annualCtc,
        oldRegimeTax: comparison.oldRegime.estimatedTaxPayable,
        newRegimeTax: comparison.newRegime.estimatedTaxPayable,
        recommendedRegime: comparison.recommendedRegime,
        taxSavings: comparison.taxSavings,
      };
      await declaration.save();

      return res.status(200).json({
        success: true,
        data: declaration,
        comparison,
      });
    } catch (err) {
      console.error("Tax declaration fetch error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/tax/declaration
   * Save / update employee tax declaration draft
   */
  apiRoutes.post("/declaration", async (req, res) => {
    try {
      const {
        employeeId,
        financialYear = "2024-2025",
        regime,
        section80C,
        section80D,
        section24B,
        hraDetails,
        otherDeductions,
        proofs,
      } = req.body;

      if (!employeeId) {
        return res.status(400).json({ error: "employeeId is required" });
      }

      let declaration = await TaxDeclaration.findOne({ employeeId, financialYear });
      const emp = await Employees.findOne({ employeeId });
      const struct = await SalaryStructure.findOne({ employeeId });
      const annualCtc = struct?.annualCtc || 600000;

      const sum80C = section80C
        ? (section80C.ppf || 0) +
          (section80C.elss || 0) +
          (section80C.lifeInsurance || 0) +
          (section80C.epfVoluntary || 0) +
          (section80C.tuitionFees || 0) +
          (section80C.housingLoanPrincipal || 0) +
          (section80C.sukanyaSamriddhi || 0) +
          (section80C.nsc || 0)
        : 0;

      const sum80D = section80D
        ? (section80D.selfAndFamily || 0) +
          (section80D.parents || 0) +
          (section80D.preventiveHealthCheckup || 0)
        : 0;

      if (!declaration) {
        declaration = new TaxDeclaration({
          declarationId: "DEC-" + employeeId + "-" + financialYear.replace("-", ""),
          employeeId,
          employeeName: emp?.name || "Employee",
          financialYear,
        });
      }

      if (regime) declaration.regime = regime;
      if (section80C) {
        declaration.section80C = { ...section80C, total80C: Math.min(150000, sum80C) };
      }
      if (section80D) {
        declaration.section80D = { ...section80D, total80D: sum80D };
      }
      if (section24B) declaration.section24B = section24B;
      if (hraDetails) {
        declaration.hraDetails = {
          ...hraDetails,
          annualRent: (hraDetails.monthlyRent || 0) * 12,
        };
      }
      if (otherDeductions) declaration.otherDeductions = otherDeductions;
      if (proofs) declaration.proofs = proofs;

      // Recalculate tax estimate
      const comparison = computeTaxComparison(annualCtc, {
        total80C: Math.min(150000, sum80C),
        total80D: sum80D,
        section24B: declaration.section24B?.interestAmount || 0,
        hraExemption: Math.max(0, (declaration.hraDetails?.annualRent || 0) - annualCtc * 0.1),
        otherDeductions:
          (declaration.otherDeductions?.section80E || 0) +
          (declaration.otherDeductions?.section80G || 0) +
          (declaration.otherDeductions?.section80CCD1B || 0),
      });

      declaration.taxEstimate = {
        grossAnnualIncome: annualCtc,
        oldRegimeTax: comparison.oldRegime.estimatedTaxPayable,
        newRegimeTax: comparison.newRegime.estimatedTaxPayable,
        recommendedRegime: comparison.recommendedRegime,
        taxSavings: comparison.taxSavings,
      };

      await declaration.save();

      return res.status(200).json({
        success: true,
        message: "Tax declaration saved successfully",
        data: declaration,
        comparison,
      });
    } catch (err) {
      console.error("Save declaration error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/tax/declaration/submit
   * Submit declaration for HR verification
   */
  apiRoutes.post("/declaration/submit", async (req, res) => {
    try {
      const { employeeId, financialYear = "2024-2025" } = req.body;
      const declaration = await TaxDeclaration.findOne({ employeeId, financialYear });
      if (!declaration) {
        return res.status(404).json({ error: "Declaration not found" });
      }

      declaration.status = "Submitted";
      await declaration.save();

      return res.status(200).json({
        success: true,
        message: "Tax declaration and proofs submitted for HR verification",
        data: declaration,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/tax/all-declarations
   * Admin overview of all employee declarations
   */
  apiRoutes.get("/all-declarations", async (req, res) => {
    try {
      const { financialYear = "2024-2025" } = req.query;
      const list = await TaxDeclaration.find({ financialYear }).sort({ updatedAt: -1 });
      return res.status(200).json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/tax/declaration/verify
   * Admin approves/rejects declaration and proofs
   */
  apiRoutes.put("/declaration/verify", async (req, res) => {
    try {
      const { declarationId, status, adminRemarks, verifiedBy, proofUpdates } = req.body;
      const declaration = await TaxDeclaration.findOne({ declarationId });
      if (!declaration) {
        return res.status(404).json({ error: "Declaration not found" });
      }

      if (status) declaration.status = status;
      if (adminRemarks) declaration.adminRemarks = adminRemarks;
      declaration.verifiedBy = verifiedBy || "HR Admin";
      declaration.verifiedAt = new Date();

      if (Array.isArray(proofUpdates)) {
        proofUpdates.forEach((pu) => {
          const p = declaration.proofs.id ? declaration.proofs.id(pu.proofId) : declaration.proofs.find((x) => x.proofId === pu.proofId);
          if (p) {
            if (pu.status) p.status = pu.status;
            if (pu.verifiedAmount !== undefined) p.verifiedAmount = pu.verifiedAmount;
            if (pu.remarks) p.remarks = pu.remarks;
          }
        });
      }

      await declaration.save();
      return res.status(200).json({
        success: true,
        message: `Tax declaration marked as ${declaration.status}`,
        data: declaration,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/tax", apiRoutes);
};
