const express = require("express");
const apiRoutes = express.Router();
const HrDocument = require("../models/hrDocument.model");
const Employees = require("../models/employees.model");
const SalaryStructure = require("../models/salaryStructure.model");

/**
 * Letter Templates Generator
 */
function buildDocumentContent(type, data) {
  const {
    employeeName,
    employeeId,
    designation,
    department,
    joiningDate,
    annualCtc,
    basicSalary,
    issueDate,
    refNo,
    purpose,
    bankOrConsulate,
    lwd,
    signatoryName = "Ananya Sharma",
    signatoryTitle = "Head of People & Operations",
  } = data;

  const dateFormatted = new Date(issueDate || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (type === "Appointment_Offer") {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172B4D; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #0052CC; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0052CC; margin: 0;">STAFFIFY TECHNOLOGIES PRIVATE LIMITED</h2>
          <p style="font-size: 11px; color: #6B778C; margin: 4px 0 0 0;">Prestige Tech Park, Outer Ring Road, Bangalore - 560103, Karnataka, India</p>
        </div>

        <p style="text-align: right; font-size: 12px; color: #6B778C;"><strong>Ref No:</strong> ${refNo}<br/><strong>Date:</strong> ${dateFormatted}</p>

        <p><strong>To,</strong><br/>
        <strong>${employeeName}</strong><br/>
        Employee ID: ${employeeId}<br/>
        Department: ${department}</p>

        <h3 style="color: #172B4D; text-align: center; margin-top: 24px; text-decoration: underline;">SUB: FORMAL APPOINTMENT LETTER & COMPENSATION ANNEXURE</h3>

        <p>Dear <strong>${employeeName}</strong>,</p>
        <p>With reference to your application and subsequent discussions, we are pleased to confirm your appointment as <strong>${designation}</strong> in <strong>${department}</strong> with Staffify Technologies Private Limited effective <strong>${joiningDate}</strong>.</p>

        <h4 style="color: #0052CC; margin-top: 18px; margin-bottom: 8px;">COMPENSATION ANNEXURE (CTC BREAKDOWN):</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #F4F5F7; border: 1px solid #DFE1E6;">
              <th style="padding: 8px; text-align: left; border: 1px solid #DFE1E6;">Salary Component</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #DFE1E6;">Monthly (INR ₹)</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #DFE1E6;">Annual (INR ₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #DFE1E6;">Basic Salary (45%)</td>
              <td style="padding: 6px 8px; text-align: right; border: 1px solid #DFE1E6;">₹${Math.round(basicSalary / 12).toLocaleString("en-IN")}</td>
              <td style="padding: 6px 8px; text-align: right; border: 1px solid #DFE1E6;">₹${Number(basicSalary).toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #DFE1E6;">House Rent Allowance (HRA)</td>
              <td style="padding: 6px 8px; text-align: right; border: 1px solid #DFE1E6;">₹${Math.round((basicSalary * 0.5) / 12).toLocaleString("en-IN")}</td>
              <td style="padding: 6px 8px; text-align: right; border: 1px solid #DFE1E6;">₹${Math.round(basicSalary * 0.5).toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #DFE1E6;">Special Allowance</td>
              <td style="padding: 6px 8px; text-align: right; border: 1px solid #DFE1E6;">₹${Math.round((annualCtc - basicSalary * 1.5 - 21600) / 12).toLocaleString("en-IN")}</td>
              <td style="padding: 6px 8px; text-align: right; border: 1px solid #DFE1E6;">₹${Math.round(annualCtc - basicSalary * 1.5 - 21600).toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #DFE1E6;">Employer PF Contribution (Capped)</td>
              <td style="padding: 6px 8px; text-align: right; border: 1px solid #DFE1E6;">₹1,800</td>
              <td style="padding: 6px 8px; text-align: right; border: 1px solid #DFE1E6;">₹21,600</td>
            </tr>
            <tr style="background: #E3FCEF; font-weight: bold;">
              <td style="padding: 8px; border: 1px solid #DFE1E6; color: #006644;">Total Cost to Company (CTC)</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #DFE1E6; color: #006644;">₹${Math.round(annualCtc / 12).toLocaleString("en-IN")}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #DFE1E6; color: #006644;">₹${Number(annualCtc).toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>

        <p>Please review and sign the duplicate copy of this letter in token of your formal acceptance.</p>

        <div style="margin-top: 36px;">
          <p>Yours sincerely,<br/>
          <strong>For Staffify Technologies Private Limited</strong><br/><br/>
          <strong>${signatoryName}</strong><br/>
          ${signatoryTitle}
          </p>
        </div>
      </div>
    `;
  }

  if (type === "Bonafide_Certificate") {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172B4D; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #0052CC; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0052CC; margin: 0;">STAFFIFY TECHNOLOGIES PRIVATE LIMITED</h2>
          <p style="font-size: 11px; color: #6B778C; margin: 4px 0 0 0;">Prestige Tech Park, Outer Ring Road, Bangalore - 560103, Karnataka, India</p>
        </div>

        <p style="text-align: right; font-size: 12px; color: #6B778C;"><strong>Ref No:</strong> ${refNo}<br/><strong>Date:</strong> ${dateFormatted}</p>

        <h3 style="color: #172B4D; text-align: center; margin-top: 30px; text-decoration: underline;">TO WHOMSOEVER IT MAY CONCERN</h3>

        <p style="margin-top: 24px;">This is to certify that <strong>${employeeName}</strong> (Employee ID: <strong>${employeeId}</strong>) is a permanent, full-time employee of <strong>Staffify Technologies Private Limited</strong>.</p>

        <p>Particulars of employment as per company official personnel records are as follows:</p>
        <ul style="line-height: 1.8;">
          <li><strong>Current Designation:</strong> ${designation}</li>
          <li><strong>Department:</strong> ${department}</li>
          <li><strong>Date of Joining:</strong> ${joiningDate}</li>
          <li><strong>Employment Status:</strong> Active & in Good Standing</li>
          <li><strong>Annual Gross Package:</strong> INR ₹${Number(annualCtc).toLocaleString("en-IN")} per annum</li>
        </ul>

        <p>This certificate is issued at the specific request of the employee for the purpose of <strong>${purpose || "Bank Financial Verification / VISA processing"}</strong> addressed to <strong>${bankOrConsulate || "the concerned authority"}</strong>.</p>

        <p>The company accepts no financial liability on behalf of the employee through the issuance of this certificate.</p>

        <div style="margin-top: 48px;">
          <p>Authorized Signatory,<br/>
          <strong>For Staffify Technologies Private Limited</strong><br/><br/>
          <strong>${signatoryName}</strong><br/>
          ${signatoryTitle}
          </p>
        </div>
      </div>
    `;
  }

  if (type === "Salary_Revision") {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172B4D; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #0052CC; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0052CC; margin: 0;">STAFFIFY TECHNOLOGIES PRIVATE LIMITED</h2>
          <p style="font-size: 11px; color: #6B778C; margin: 4px 0 0 0;">Prestige Tech Park, Outer Ring Road, Bangalore - 560103, Karnataka, India</p>
        </div>

        <p style="text-align: right; font-size: 12px; color: #6B778C;"><strong>Ref No:</strong> ${refNo}<br/><strong>Date:</strong> ${dateFormatted}</p>

        <p><strong>To,</strong><br/>
        <strong>${employeeName}</strong><br/>
        Employee ID: ${employeeId}<br/>
        Designation: ${designation}</p>

        <h3 style="color: #172B4D; text-align: center; margin-top: 24px; text-decoration: underline;">ANNUAL APPRAISAL & COMPENSATION REVISION</h3>

        <p>Dear <strong>${employeeName}</strong>,</p>
        <p>In recognition of your outstanding performance, dedication, and valuable contributions to the growth of Staffify Technologies Private Limited over the past appraisal cycle, the management is pleased to revise your compensation package.</p>

        <p>Effective <strong>${dateFormatted}</strong>, your Annual Cost to Company (CTC) has been revised to <strong>INR ₹${Number(annualCtc).toLocaleString("en-IN")}</strong> per annum.</p>

        <p>We take this opportunity to thank you for your ongoing commitment and look forward to your sustained excellence as we scale new milestones together.</p>

        <div style="margin-top: 40px;">
          <p>Warm regards,<br/>
          <strong>For Staffify Technologies Private Limited</strong><br/><br/>
          <strong>${signatoryName}</strong><br/>
          ${signatoryTitle}
          </p>
        </div>
      </div>
    `;
  }

  if (type === "Relieving_Experience") {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172B4D; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #0052CC; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0052CC; margin: 0;">STAFFIFY TECHNOLOGIES PRIVATE LIMITED</h2>
          <p style="font-size: 11px; color: #6B778C; margin: 4px 0 0 0;">Prestige Tech Park, Outer Ring Road, Bangalore - 560103, Karnataka, India</p>
        </div>

        <p style="text-align: right; font-size: 12px; color: #6B778C;"><strong>Ref No:</strong> ${refNo}<br/><strong>Date:</strong> ${dateFormatted}</p>

        <h3 style="color: #172B4D; text-align: center; margin-top: 24px; text-decoration: underline;">RELIEVING AND SERVICE EXPERIENCE CERTIFICATE</h3>

        <p style="margin-top: 20px;">Dear <strong>${employeeName}</strong>,</p>

        <p>This is with reference to your resignation from the services of Staffify Technologies Private Limited. We wish to confirm that you have been relieved of your duties and responsibilities as <strong>${designation}</strong> in <strong>${department}</strong> with effect from the close of business hours on <strong>${lwd || dateFormatted}</strong>.</p>

        <p>You joined the organization on <strong>${joiningDate}</strong> and have served the company with diligence and integrity throughout your tenure. All company assets and departmental clearances have been duly completed, and Full & Final settlement has been authorized.</p>

        <p>During your tenure with us, your conduct and character were found to be satisfactory. We appreciate the contributions made by you and wish you every success in your future professional endeavors.</p>

        <div style="margin-top: 48px;">
          <p>Authorized Signatory,<br/>
          <strong>For Staffify Technologies Private Limited</strong><br/><br/>
          <strong>${signatoryName}</strong><br/>
          ${signatoryTitle}
          </p>
        </div>
      </div>
    `;
  }

  // Fallback Address Proof
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172B4D; padding: 20px;">
      <div style="text-align: center; border-bottom: 2px solid #0052CC; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #0052CC; margin: 0;">STAFFIFY TECHNOLOGIES PRIVATE LIMITED</h2>
        <p style="font-size: 11px; color: #6B778C; margin: 4px 0 0 0;">Prestige Tech Park, Outer Ring Road, Bangalore - 560103, Karnataka, India</p>
      </div>

      <p style="text-align: right; font-size: 12px; color: #6B778C;"><strong>Ref No:</strong> ${refNo}<br/><strong>Date:</strong> ${dateFormatted}</p>
      <h3 style="text-align: center; text-decoration: underline;">RESIDENTIAL ADDRESS CONFIRMATION</h3>
      <p>This is to certify that <strong>${employeeName}</strong> (ID: ${employeeId}) has been employed as <strong>${designation}</strong> with us since <strong>${joiningDate}</strong>.</p>
      <p>As per official records submitted to HR, the residential address is verified for official documentation.</p>
      <div style="margin-top: 40px;">
        <p>For Staffify Technologies Private Limited<br/><br/><strong>${signatoryName}</strong><br/>${signatoryTitle}</p>
      </div>
    </div>
  `;
}

// Seed default documents if empty
async function seedDefaultDocuments() {
  const count = await HrDocument.countDocuments();
  if (count === 0) {
    const docData = {
      employeeName: "Employee User",
      employeeId: "EMP-DEV-03",
      designation: "Software Engineer",
      department: "Engineering",
      joiningDate: "15 April 2024",
      annualCtc: 600000,
      basicSalary: 270000,
      issueDate: new Date(),
      refNo: "STAFFIFY/HR/2026/0881",
      purpose: "HDFC Home Loan Application",
      bankOrConsulate: "HDFC Bank Retail Lending Division",
    };

    const content = buildDocumentContent("Bonafide_Certificate", docData);

    await HrDocument.create({
      documentId: "DOC-2026-0881",
      referenceNumber: "STAFFIFY/HR/2026/0881",
      employeeId: "EMP-DEV-03",
      employeeName: "Employee User",
      department: "Engineering",
      designation: "Software Engineer",
      templateType: "Bonafide_Certificate",
      title: "Employment Verification & Bonafide Certificate",
      contentHtml: content,
      status: "Issued",
      generatedBy: "HR Admin",
    });
  }
}

module.exports = function (app) {
  seedDefaultDocuments().catch((err) => console.error("Doc seed error:", err));

  /**
   * GET /api/documents
   * List all documents or filter by employeeId
   */
  apiRoutes.get("/", async (req, res) => {
    try {
      const { employeeId, templateType } = req.query;
      const filter = {};
      if (employeeId) filter.employeeId = employeeId;
      if (templateType && templateType !== "All") filter.templateType = templateType;

      const docs = await HrDocument.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: docs });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/documents/:id
   * Get single document
   */
  apiRoutes.get("/:id", async (req, res) => {
    try {
      const doc = await HrDocument.findOne({
        $or: [{ documentId: req.params.id }, { _id: req.params.id }],
      });
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      return res.status(200).json({ success: true, data: doc });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/documents/generate
   * Generates a new HR letter from a selected template
   */
  apiRoutes.post("/generate", async (req, res) => {
    try {
      const {
        employeeId,
        templateType,
        purpose,
        bankOrConsulate,
        customSalary,
        lwd,
        generatedBy = "HR Admin",
      } = req.body;

      if (!employeeId || !templateType) {
        return res.status(400).json({ error: "employeeId and templateType are required" });
      }

      const emp = await Employees.findOne({ employeeId });
      if (!emp) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const struct = await SalaryStructure.findOne({ employeeId });
      const annualCtc = customSalary ? Number(customSalary) : struct?.annualCtc || 600000;
      const basicSalary = struct?.breakdown?.basic || Math.round(annualCtc * 0.45);

      const refNo = `STAFFIFY/HR/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
      const documentId = "DOC-" + Date.now().toString().slice(-6);

      const joiningFormatted = emp.joiningDate
        ? new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
        : "15 April 2024";

      const content = buildDocumentContent(templateType, {
        employeeName: emp.name,
        employeeId: emp.employeeId,
        designation: emp.designation || "Software Engineer",
        department: emp.department || "Engineering",
        joiningDate: joiningFormatted,
        annualCtc,
        basicSalary,
        refNo,
        purpose,
        bankOrConsulate,
        lwd,
      });

      const titleMap = {
        Appointment_Offer: "Employment Offer & Appointment Letter",
        Bonafide_Certificate: "Employment Verification & Bonafide Certificate",
        Salary_Revision: "Annual Compensation Revision Letter",
        Relieving_Experience: "Relieving and Service Experience Certificate",
        Address_Proof: "Residential Address Confirmation Letter",
      };

      const doc = await HrDocument.create({
        documentId,
        referenceNumber: refNo,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department || "Engineering",
        designation: emp.designation || "Software Engineer",
        templateType,
        title: titleMap[templateType] || "HR Letter",
        contentHtml: content,
        status: "Issued",
        generatedBy,
      });

      return res.status(201).json({
        success: true,
        message: `${titleMap[templateType]} generated successfully`,
        data: doc,
      });
    } catch (err) {
      console.error("Doc generate error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/documents", apiRoutes);
};
