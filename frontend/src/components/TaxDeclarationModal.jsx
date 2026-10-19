import { useState, useEffect } from "react";
import {
  X,
  FileText,
  ShieldCheck,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Send,
  Building,
  HeartPulse,
  Home,
  GraduationCap,
} from "lucide-react";
import { getTaxDeclaration, saveTaxDeclaration, submitTaxDeclaration } from "../services/tax";
import toast from "react-hot-toast";

function TaxDeclarationModal({ isOpen, onClose, employeeId, employeeName, annualCtc = 600000 }) {
  const [financialYear, setFinancialYear] = useState("2024-2025");
  const [regime, setRegime] = useState("New");
  const [activeSection, setActiveSection] = useState("regime"); // "regime", "80c", "80d", "hra", "other"
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Draft");

  // Form Fields
  const [sec80C, setSec80C] = useState({
    ppf: 0,
    elss: 0,
    lifeInsurance: 0,
    epfVoluntary: 21600,
    tuitionFees: 0,
    housingLoanPrincipal: 0,
  });

  const [sec80D, setSec80D] = useState({
    selfAndFamily: 15000,
    parents: 0,
    parentsSeniorCitizen: false,
    preventiveHealthCheckup: 0,
  });

  const [hra, setHra] = useState({
    monthlyRent: 15000,
    landlordName: "",
    landlordPan: "",
    cityType: "Metro",
    rentalAddress: "",
  });

  const [sec24B, setSec24B] = useState({
    interestAmount: 0,
    lenderName: "",
    lenderPan: "",
  });

  const [other, setOther] = useState({
    section80E: 0,
    section80G: 0,
    section80CCD1B: 0,
  });

  const [comparison, setComparison] = useState(null);

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const loadDeclaration = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await getTaxDeclaration(employeeId, financialYear);
      if (res?.data) {
        const d = res.data;
        setRegime(d.regime || "New");
        setStatus(d.status || "Draft");
        if (d.section80C) setSec80C((prev) => ({ ...prev, ...d.section80C }));
        if (d.section80D) setSec80D((prev) => ({ ...prev, ...d.section80D }));
        if (d.hraDetails) setHra((prev) => ({ ...prev, ...d.hraDetails }));
        if (d.section24B) setSec24B((prev) => ({ ...prev, ...d.section24B }));
        if (d.otherDeductions) setOther((prev) => ({ ...prev, ...d.otherDeductions }));
      }
      if (res?.comparison) {
        setComparison(res.comparison);
      }
    } catch (err) {
      console.error("Failed to load tax declaration:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDeclaration();
    }
  }, [isOpen, employeeId, financialYear]);

  // Handle Save Draft
  const handleSave = async (submitNow = false) => {
    try {
      setSaving(true);
      const payload = {
        employeeId,
        financialYear,
        regime,
        section80C: sec80C,
        section80D: sec80D,
        hraDetails: hra,
        section24B: sec24B,
        otherDeductions: other,
      };

      const res = await saveTaxDeclaration(payload);
      if (submitNow) {
        await submitTaxDeclaration(employeeId, financialYear);
        setStatus("Submitted");
        toast.success("Tax declaration submitted for HR verification");
      } else {
        toast.success("Tax declaration draft saved");
      }

      if (res?.comparison) setComparison(res.comparison);
      if (submitNow) onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save declaration");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const total80C =
    Number(sec80C.ppf || 0) +
    Number(sec80C.elss || 0) +
    Number(sec80C.lifeInsurance || 0) +
    Number(sec80C.epfVoluntary || 0) +
    Number(sec80C.tuitionFees || 0) +
    Number(sec80C.housingLoanPrincipal || 0);

  const total80D =
    Number(sec80D.selfAndFamily || 0) +
    Number(sec80D.parents || 0) +
    Number(sec80D.preventiveHealthCheckup || 0);

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                <span>Income Tax Declaration & Form 12BB</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    status === "Verified"
                      ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                      : status === "Submitted"
                      ? "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]"
                      : "bg-[#F4F5F7] text-[#172B4D] border-[#DFE1E6]"
                  }`}
                >
                  {status}
                </span>
              </h2>
              <p className="text-xs text-[#6B778C]">
                FY {financialYear} • {employeeName} ({employeeId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-white border border-[#DFE1E6] rounded px-2.5 py-1 text-xs font-semibold text-[#172B4D] outline-none"
            >
              <option value="2024-2025">FY 2024-2025</option>
              <option value="2025-2026">FY 2025-2026</option>
            </select>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#6B778C] hover:bg-[#EBECF0] hover:text-[#172B4D] transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Tax Comparison Banner */}
        {comparison && (
          <div className="px-6 py-3 bg-[#DEEBFF]/50 border-b border-[#B3D4FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-white border border-[#B3D4FF] text-[#0052CC]">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#0747A6]">
                  Regime Recommendation: {comparison.recommendedRegime} Tax Regime
                </span>
                <p className="text-[11px] text-[#42526E]">
                  Old Regime Tax: {formatCurrency(comparison.oldRegime.estimatedTaxPayable)} • New
                  Regime Tax: {formatCurrency(comparison.newRegime.estimatedTaxPayable)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded border border-[#ABF5D1]">
                Potential Savings: {formatCurrency(comparison.taxSavings)}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-[#DFE1E6] bg-white flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveSection("regime")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t border-b-2 transition cursor-pointer ${
              activeSection === "regime"
                ? "border-[#0052CC] text-[#0052CC] bg-[#FAFBFC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            1. Tax Regime Selection
          </button>
          <button
            onClick={() => setActiveSection("80c")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t border-b-2 transition cursor-pointer flex items-center gap-1 ${
              activeSection === "80c"
                ? "border-[#0052CC] text-[#0052CC] bg-[#FAFBFC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <span>2. Section 80C</span>
            <span className="text-[10px] text-[#0052CC] font-bold">({formatCurrency(Math.min(150000, total80C))})</span>
          </button>
          <button
            onClick={() => setActiveSection("80d")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t border-b-2 transition cursor-pointer flex items-center gap-1 ${
              activeSection === "80d"
                ? "border-[#0052CC] text-[#0052CC] bg-[#FAFBFC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <span>3. Section 80D (Health)</span>
            <span className="text-[10px] text-[#00875A] font-bold">({formatCurrency(total80D)})</span>
          </button>
          <button
            onClick={() => setActiveSection("hra")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t border-b-2 transition cursor-pointer ${
              activeSection === "hra"
                ? "border-[#0052CC] text-[#0052CC] bg-[#FAFBFC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            4. HRA & Rent
          </button>
          <button
            onClick={() => setActiveSection("other")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t border-b-2 transition cursor-pointer ${
              activeSection === "other"
                ? "border-[#0052CC] text-[#0052CC] bg-[#FAFBFC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            5. Home Loan & Other
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#172B4D]">
          {/* TAB 1: REGIME SELECTION */}
          {activeSection === "regime" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D]">Select Preferred Income Tax Regime</h3>
                <p className="text-[#6B778C] mt-0.5">
                  Under the Indian Income Tax Act, you can choose between the default New Regime (Section 115BAC) or Old Regime with itemized Chapter VI-A deductions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setRegime("New")}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    regime === "New"
                      ? "border-[#0052CC] bg-[#DEEBFF]/20 shadow-xs"
                      : "border-[#DFE1E6] hover:border-[#B3D4FF]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#0052CC]">New Tax Regime (Section 115BAC)</span>
                    <span className="text-[10px] font-bold uppercase bg-[#EAE6FF] text-[#403294] px-2 py-0.5 rounded border border-[#C0B6F2]">
                      Default
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B778C] mt-2">
                    Lower tax slabs across bands. Standard deduction of ₹75,000. Full tax rebate under Section 87A up to ₹7,00,000 annual taxable income.
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#DFE1E6] flex justify-between text-[11px]">
                    <span className="text-[#6B778C]">Standard Deduction:</span>
                    <span className="font-semibold text-[#00875A]">₹75,000</span>
                  </div>
                </div>

                <div
                  onClick={() => setRegime("Old")}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    regime === "Old"
                      ? "border-[#0052CC] bg-[#DEEBFF]/20 shadow-xs"
                      : "border-[#DFE1E6] hover:border-[#B3D4FF]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#172B4D]">Old Tax Regime</span>
                    <span className="text-[10px] font-bold uppercase bg-[#F4F5F7] text-[#172B4D] px-2 py-0.5 rounded border border-[#DFE1E6]">
                      With Deductions
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B778C] mt-2">
                    Allows claiming deductions for Section 80C (up to ₹1.5L), 80D health insurance, HRA rent exemption, and home loan interest up to ₹2L.
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#DFE1E6] flex justify-between text-[11px]">
                    <span className="text-[#6B778C]">Max Deductions Claimable:</span>
                    <span className="font-semibold text-[#0052CC]">₹3,50,000+</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECTION 80C */}
          {activeSection === "80c" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D]">Section 80C Investments (Max Limit: ₹1,50,000)</h3>
                  <p className="text-[#6B778C] mt-0.5">
                    Total Declared: <strong className="text-[#0052CC]">{formatCurrency(total80C)}</strong> / Eligible: <strong className="text-[#00875A]">{formatCurrency(Math.min(150000, total80C))}</strong>
                  </p>
                </div>
                <div className="w-48 bg-[#EBECF0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0052CC] h-full"
                    style={{ width: `${Math.min(100, (total80C / 150000) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Public Provident Fund (PPF)</label>
                  <input
                    type="number"
                    value={sec80C.ppf}
                    onChange={(e) => setSec80C({ ...sec80C, ppf: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Equity Linked Savings Scheme (ELSS / Mutual Funds)</label>
                  <input
                    type="number"
                    value={sec80C.elss}
                    onChange={(e) => setSec80C({ ...sec80C, elss: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Life Insurance Premium (LIC / Term)</label>
                  <input
                    type="number"
                    value={sec80C.lifeInsurance}
                    onChange={(e) => setSec80C({ ...sec80C, lifeInsurance: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Employee Provident Fund (EPF Auto/VPF)</label>
                  <input
                    type="number"
                    value={sec80C.epfVoluntary}
                    onChange={(e) => setSec80C({ ...sec80C, epfVoluntary: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Children Tuition Fees (Up to 2 children)</label>
                  <input
                    type="number"
                    value={sec80C.tuitionFees}
                    onChange={(e) => setSec80C({ ...sec80C, tuitionFees: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Housing Loan Principal Repayment</label>
                  <input
                    type="number"
                    value={sec80C.housingLoanPrincipal}
                    onChange={(e) => setSec80C({ ...sec80C, housingLoanPrincipal: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTION 80D */}
          {activeSection === "80d" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D]">Section 80D Mediclaim & Health Insurance</h3>
                <p className="text-[#6B778C] mt-0.5">
                  Deductions for medical insurance premiums paid for self, spouse, children, and parents.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Self, Spouse & Dependent Children (Max ₹25,000)</label>
                  <input
                    type="number"
                    value={sec80D.selfAndFamily}
                    onChange={(e) => setSec80D({ ...sec80D, selfAndFamily: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Parents Mediclaim Premium (Max ₹25,000 / ₹50,000 if Senior Citizen)</label>
                  <input
                    type="number"
                    value={sec80D.parents}
                    onChange={(e) => setSec80D({ ...sec80D, parents: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-semibold text-[#172B4D] block mb-1">Preventive Health Checkup (Max ₹5,000 within total)</label>
                  <input
                    type="number"
                    value={sec80D.preventiveHealthCheckup}
                    onChange={(e) => setSec80D({ ...sec80D, preventiveHealthCheckup: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HRA & RENT DETAILS */}
          {activeSection === "hra" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D]">House Rent Allowance (HRA) Exemption</h3>
                <p className="text-[#6B778C] mt-0.5">
                  Exemption is calculated as the lowest of: (Actual HRA, 50% Basic for Metro or 40% Non-Metro, Rent paid minus 10% of Basic).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Monthly Rent Paid (INR ₹)</label>
                  <input
                    type="number"
                    value={hra.monthlyRent}
                    onChange={(e) => setHra({ ...hra, monthlyRent: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                  <p className="text-[11px] text-[#6B778C] mt-1">
                    Annual Rent: {formatCurrency((hra.monthlyRent || 0) * 12)}
                  </p>
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">City Classification</label>
                  <select
                    value={hra.cityType}
                    onChange={(e) => setHra({ ...hra, cityType: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  >
                    <option value="Metro">Metro City (Mumbai, Delhi, Kolkata, Chennai - 50%)</option>
                    <option value="Non-Metro">Non-Metro City (Bangalore, Pune, Hyderabad, Others - 40%)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Landlord Name</label>
                  <input
                    type="text"
                    value={hra.landlordName}
                    onChange={(e) => setHra({ ...hra, landlordName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">
                    Landlord PAN Card (Mandatory if Annual Rent &gt; ₹1,00,000)
                  </label>
                  <input
                    type="text"
                    value={hra.landlordPan}
                    onChange={(e) => setHra({ ...hra, landlordPan: e.target.value.toUpperCase() })}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-semibold text-[#172B4D] block mb-1">Rented Residence Address</label>
                  <textarea
                    rows={2}
                    value={hra.rentalAddress}
                    onChange={(e) => setHra({ ...hra, rentalAddress: e.target.value })}
                    placeholder="Complete residential address of rental premises..."
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HOME LOAN & OTHER */}
          {activeSection === "other" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D]">Section 24(b) Home Loan & Other Deductions</h3>
                <p className="text-[#6B778C] mt-0.5">
                  Interest on self-occupied housing loan up to ₹2,00,000 and Chapter VI-A supplementary deductions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Home Loan Interest Paid (Section 24b - Max ₹2,00,000)</label>
                  <input
                    type="number"
                    value={sec24B.interestAmount}
                    onChange={(e) => setSec24B({ ...sec24B, interestAmount: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Lending Bank / Financial Institution</label>
                  <input
                    type="text"
                    value={sec24B.lenderName}
                    onChange={(e) => setSec24B({ ...sec24B, lenderName: e.target.value })}
                    placeholder="e.g. HDFC Bank Ltd"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Section 80CCD(1B) - Additional NPS (Max ₹50,000)</label>
                  <input
                    type="number"
                    value={other.section80CCD1B}
                    onChange={(e) => setOther({ ...other, section80CCD1B: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Section 80E - Higher Education Loan Interest</label>
                  <input
                    type="number"
                    value={other.section80E}
                    onChange={(e) => setOther({ ...other, section80E: Number(e.target.value) })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#6B778C] flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#00875A]" />
            <span>Computations strictly adhere to Indian Income Tax Act 1961</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-[#DFE1E6] hover:bg-[#EBECF0] rounded text-xs font-semibold text-[#172B4D] transition cursor-pointer"
            >
              Close
            </button>
            <button
              disabled={saving}
              onClick={() => handleSave(false)}
              className="px-3.5 py-1.5 bg-[#F4F5F7] hover:bg-[#EBECF0] border border-[#DFE1E6] rounded text-xs font-semibold text-[#172B4D] transition cursor-pointer flex items-center gap-1.5"
            >
              <Save size={13} />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </button>
            <button
              disabled={saving}
              onClick={() => handleSave(true)}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white rounded text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>Submit Form 12BB</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxDeclarationModal;
