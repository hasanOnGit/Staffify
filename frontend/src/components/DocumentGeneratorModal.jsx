import { useState, useEffect } from "react";
import { getEmployees } from "../services/employee";
import { generateDocument, getDocumentTemplates } from "../services/hrDocument";
import toast from "react-hot-toast";
import {
  FileText,
  Printer,
  X,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  Download,
  Sparkles,
  ChevronRight,
} from "lucide-react";

function DocumentGeneratorModal({ isOpen, onClose, preselectedEmpId, onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: preselectedEmpId || "",
    templateType: "Appointment_Offer",
    purpose: "Bank Home Loan & Visa Documentation",
    bankOrConsulate: "HDFC Bank Ltd.",
    revisedCtc: "",
    revisedBasic: "",
    relievingDate: "",
    conduct: "exemplary",
    signatoryName: "Ananya Sharma",
    signatoryTitle: "Head of People & Operations",
  });

  useEffect(() => {
    if (!isOpen) {
      setGeneratedDoc(null);
      return;
    }
    const init = async () => {
      try {
        setLoading(true);
        const [empRes, tplRes] = await Promise.all([
          getEmployees(),
          getDocumentTemplates(),
        ]);
        setEmployees(Array.isArray(empRes) ? empRes : []);
        if (tplRes.success) setTemplates(tplRes.data || []);
        if (preselectedEmpId) {
          setFormData((prev) => ({ ...prev, employeeId: preselectedEmpId }));
        } else if (empRes?.length > 0) {
          setFormData((prev) => ({ ...prev, employeeId: empRes[0].employeeId }));
        }
      } catch (err) {
        console.error("Failed to load document generator dependencies:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isOpen, preselectedEmpId]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    try {
      setGenerating(true);
      const res = await generateDocument(formData);
      if (res.success) {
        toast.success(res.message);
        setGeneratedDoc(res.data);
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Letter generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!generatedDoc) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${generatedDoc.title} - ${generatedDoc.employeeName}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #172B4D; margin: 0; padding: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
            th, td { border: 1px solid #DFE1E6; padding: 8px 10px; font-size: 12px; }
            th { background-color: #F4F5F7; text-align: left; }
          </style>
        </head>
        <body>
          ${generatedDoc.contentHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
              <FileText size={18} />
            </span>
            <div>
              <h2 className="font-bold text-sm text-[#172B4D]">
                Official HR Letter & Document Generator
              </h2>
              <p className="text-xs text-[#6B778C]">
                Corporate Appointment, Bonafide, Salary Revision & Relieving Letters
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B778C] hover:text-[#172B4D] p-1.5 rounded-md hover:bg-[#EBECF0] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Form Configuration (5 cols) */}
          <div className="md:col-span-5 p-5 border-r border-[#DFE1E6] overflow-y-auto space-y-4 text-xs bg-[#FAFBFC]">
            <form id="doc-form" onSubmit={handleGenerate} className="space-y-3.5">
              {/* Select Employee */}
              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">
                  Target Employee *
                </label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-white font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Type */}
              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">
                  Letter Template *
                </label>
                <select
                  required
                  value={formData.templateType}
                  onChange={(e) => setFormData({ ...formData, templateType: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-white font-medium"
                >
                  <option value="Appointment_Offer">Formal Appointment & CTC Annexure</option>
                  <option value="Bonafide_Letter">Bonafide / Proof of Employment</option>
                  <option value="Salary_Revision">Salary Revision & Promotion Letter</option>
                  <option value="Relieving_Experience">Relieving & Experience Certificate</option>
                </select>
              </div>

              {/* Conditional Inputs: Bonafide */}
              {formData.templateType === "Bonafide_Letter" && (
                <>
                  <div>
                    <label className="block font-semibold text-[#172B4D] mb-1">Purpose of Letter</label>
                    <input
                      type="text"
                      placeholder="e.g. Visa Processing / Bank Loan"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B4D] mb-1">Addressed Organization / Bank</label>
                    <input
                      type="text"
                      placeholder="e.g. Consulate General / State Bank of India"
                      value={formData.bankOrConsulate}
                      onChange={(e) => setFormData({ ...formData, bankOrConsulate: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-white"
                    />
                  </div>
                </>
              )}

              {/* Conditional Inputs: Salary Revision */}
              {formData.templateType === "Salary_Revision" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-[#172B4D] mb-1">New Annual CTC (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500000"
                      value={formData.revisedCtc}
                      onChange={(e) => setFormData({ ...formData, revisedCtc: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B4D] mb-1">New Monthly Basic (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 62500"
                      value={formData.revisedBasic}
                      onChange={(e) => setFormData({ ...formData, revisedBasic: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Conditional Inputs: Relieving */}
              {formData.templateType === "Relieving_Experience" && (
                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">Last Working Day (LWD)</label>
                  <input
                    type="date"
                    value={formData.relievingDate}
                    onChange={(e) => setFormData({ ...formData, relievingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-white"
                  />
                </div>
              )}

              {/* Signatory Info */}
              <div className="pt-2 border-t border-[#DFE1E6] space-y-2">
                <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
                  Authorized Signatory
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Signatory Name"
                    value={formData.signatoryName}
                    onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded-lg bg-white text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Signatory Title"
                    value={formData.signatoryTitle}
                    onChange={(e) => setFormData({ ...formData, signatoryTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded-lg bg-white text-[11px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                {generating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rendering Template...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Official Letter</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Live Printable Preview (7 cols) */}
          <div className="md:col-span-7 bg-white p-6 overflow-y-auto flex flex-col justify-between">
            {generatedDoc ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DFE1E6]">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded border border-[#B3D4FF]">
                      Ref: {generatedDoc.refNo}
                    </span>
                    <h3 className="font-bold text-sm text-[#172B4D] mt-1">{generatedDoc.title}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer size={13} />
                    <span>Print / Save PDF</span>
                  </button>
                </div>

                {/* Render HTML Document */}
                <div
                  className="bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs text-xs text-[#172B4D] min-h-[420px]"
                  dangerouslySetInnerHTML={{ __html: generatedDoc.contentHtml }}
                />
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 text-[#6B778C]">
                <div className="w-12 h-12 rounded-xl bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center mb-3">
                  <FileText size={24} />
                </div>
                <h4 className="font-bold text-sm text-[#172B4D]">No Letter Generated Yet</h4>
                <p className="text-xs text-[#6B778C] max-w-sm mt-1">
                  Configure the employee details, choose a letter template on the left panel, and click "Generate Official Letter" to view the live legal letterhead preview.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F4F5F7] border-t border-[#DFE1E6] flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-[#6B778C]">
            All generated documents are digitally archived with unique tracking numbers.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-[#DFE1E6] rounded-lg font-semibold text-[#42526E] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentGeneratorModal;
