import { useState, useMemo } from "react";
import {
  X,
  Calculator,
  DollarSign,
  Sliders,
  ShieldCheck,
  Check,
  Copy,
  Info,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

function CtcCalculatorModal({ isOpen, onClose, initialCtc = 900000 }) {
  const [annualCtc, setAnnualCtc] = useState(initialCtc || 900000);
  const [regime, setRegime] = useState("new");
  const [metroCity, setMetroCity] = useState(true);
  const [copied, setCopied] = useState(false);

  // Statutory & Salary computation
  const calculation = useMemo(() => {
    const ctc = Math.max(120000, Number(annualCtc) || 0);
    const monthlyCtc = Math.round(ctc / 12);

    // Employer PF (12% of basic) & Gratuity (4.81% of basic)
    // Basic is ~40-50% of Gross. Let's compute Gross from CTC
    // CTC = Monthly Gross + Employer PF + Gratuity + Employer Insurance/Bonus
    // Approx Gross = ctc * 0.88 / 12
    const monthlyGross = Math.round((ctc * 0.88) / 12);
    const basic = Math.round(monthlyGross * 0.5);
    const hra = Math.round(basic * (metroCity ? 0.5 : 0.4));
    const specialAllowance = Math.max(0, monthlyGross - basic - hra);

    // Deductions
    const employeePf = Math.min(1800, Math.round(basic * 0.12));
    const professionalTax = 200; // standard PT in India
    const esic = monthlyGross <= 21000 ? Math.round(monthlyGross * 0.0075) : 0;

    // Estimated monthly TDS (simplified tax estimate)
    let annualTaxable = ctc;
    let annualTds = 0;
    if (regime === "new") {
      // Standard deduction of ₹75,000
      annualTaxable = Math.max(0, ctc - 75000);
      if (annualTaxable <= 700000) {
        annualTds = 0; // 87A rebate
      } else if (annualTaxable <= 1000000) {
        annualTds = (annualTaxable - 700000) * 0.1 + 20000;
      } else if (annualTaxable <= 1200000) {
        annualTds = (annualTaxable - 1000000) * 0.15 + 50000;
      } else if (annualTaxable <= 1500000) {
        annualTds = (annualTaxable - 1200000) * 0.2 + 80000;
      } else {
        annualTds = (annualTaxable - 1500000) * 0.3 + 140000;
      }
    } else {
      // Old regime standard deduction ₹50,000 + 80C ~₹1,50,000
      annualTaxable = Math.max(0, ctc - 200000);
      if (annualTaxable <= 500000) {
        annualTds = 0;
      } else if (annualTaxable <= 1000000) {
        annualTds = (annualTaxable - 500000) * 0.2 + 12500;
      } else {
        annualTds = (annualTaxable - 1000000) * 0.3 + 112500;
      }
    }
    const monthlyTds = Math.round(annualTds / 12);

    const totalMonthlyDeductions = employeePf + professionalTax + esic + monthlyTds;
    const monthlyTakeHome = Math.max(0, monthlyGross - totalMonthlyDeductions);
    const annualTakeHome = monthlyTakeHome * 12;
    const takeHomePercent = Math.min(100, Math.round((annualTakeHome / ctc) * 100));

    // Employer share
    const employerPf = employeePf;
    const gratuity = Math.round((basic * 15) / 26 / 12);

    return {
      ctc,
      monthlyCtc,
      monthlyGross,
      basic,
      hra,
      specialAllowance,
      employeePf,
      professionalTax,
      esic,
      monthlyTds,
      totalMonthlyDeductions,
      monthlyTakeHome,
      annualTakeHome,
      takeHomePercent,
      employerPf,
      gratuity,
    };
  }, [annualCtc, regime, metroCity]);

  if (!isOpen) return null;

  const formatInr = (num = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);

  const presets = [600000, 1000000, 1500000, 2400000, 3500000];

  const handleCopySummary = () => {
    const text = [
      `Staffify CTC & Take-Home Simulation`,
      `Annual CTC: ${formatInr(calculation.ctc)}`,
      `Tax Regime: ${regime.toUpperCase()}`,
      `----------------------------------------`,
      `Monthly Gross: ${formatInr(calculation.monthlyGross)}`,
      `  • Basic Pay (50%): ${formatInr(calculation.basic)}`,
      `  • HRA Allowance: ${formatInr(calculation.hra)}`,
      `  • Special Allowance: ${formatInr(calculation.specialAllowance)}`,
      `Monthly Deductions: ${formatInr(calculation.totalMonthlyDeductions)}`,
      `  • Employee PF: ${formatInr(calculation.employeePf)}`,
      `  • Professional Tax: ${formatInr(calculation.professionalTax)}`,
      `  • Est. Monthly TDS: ${formatInr(calculation.monthlyTds)}`,
      `----------------------------------------`,
      `Estimated Monthly In-Hand: ${formatInr(calculation.monthlyTakeHome)}`,
      `Estimated Annual In-Hand: ${formatInr(calculation.annualTakeHome)} (${calculation.takeHomePercent}% of CTC)`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Compensation breakdown copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl border border-[#DFE1E6] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#0052CC] text-white flex items-center justify-center shadow-xs">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172B4D]">
                Interactive CTC & Take-Home Salary Calculator
              </h3>
              <p className="text-[11px] text-[#6B778C]">
                Statutory compliance simulation compliant with Indian Income Tax & PF guidelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B778C] hover:text-[#172B4D] p-1.5 rounded hover:bg-white cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Controls: Annual CTC Input & Slider */}
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                <Sliders size={14} className="text-[#0052CC]" />
                <span>Annual Cost to Company (CTC)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B778C] font-semibold">INR</span>
                <input
                  type="number"
                  min="120000"
                  max="10000000"
                  step="50000"
                  value={annualCtc}
                  onChange={(e) => setAnnualCtc(Number(e.target.value))}
                  className="w-36 text-right px-2.5 py-1 text-sm font-bold text-[#0052CC] bg-white border border-[#DFE1E6] rounded focus:outline-none focus:border-[#0052CC]"
                />
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="300000"
              max="5000000"
              step="50000"
              value={annualCtc}
              onChange={(e) => setAnnualCtc(Number(e.target.value))}
              className="w-full accent-[#0052CC] cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-[#6B778C] font-medium mr-1">Presets:</span>
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAnnualCtc(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold border transition cursor-pointer ${
                    annualCtc === preset
                      ? "bg-[#0052CC] text-white border-[#0052CC]"
                      : "bg-white text-[#172B4D] border-[#DFE1E6] hover:border-[#0052CC]"
                  }`}
                >
                  ₹{(preset / 100000).toFixed(0)} LPA
                </button>
              ))}
            </div>

            {/* Tax Regime & Metro toggles */}
            <div className="pt-2 border-t border-[#DFE1E6] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#6B778C] font-medium">Tax Regime:</span>
                <label className="inline-flex items-center gap-1 cursor-pointer font-medium text-[#172B4D]">
                  <input
                    type="radio"
                    name="regime"
                    checked={regime === "new"}
                    onChange={() => setRegime("new")}
                    className="text-[#0052CC]"
                  />
                  <span>New (Default)</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer font-medium text-[#172B4D]">
                  <input
                    type="radio"
                    name="regime"
                    checked={regime === "old"}
                    onChange={() => setRegime("old")}
                    className="text-[#0052CC]"
                  />
                  <span>Old Regime</span>
                </label>
              </div>

              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#172B4D] font-medium">
                <input
                  type="checkbox"
                  checked={metroCity}
                  onChange={(e) => setMetroCity(e.target.checked)}
                  className="rounded text-[#0052CC]"
                />
                <span>Metro City (50% HRA)</span>
              </label>
            </div>
          </div>

          {/* Key Result High-Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#E3FCEF]/40 border border-[#ABF5D1] rounded-lg p-3.5">
              <span className="text-[10px] font-bold text-[#006644] uppercase tracking-wider block">
                Estimated Monthly Take-Home
              </span>
              <div className="text-xl font-extrabold text-[#006644] mt-1">
                {formatInr(calculation.monthlyTakeHome)}
              </div>
              <p className="text-[10px] text-[#006644]/80 mt-1">
                Direct net bank credit / month
              </p>
            </div>

            <div className="bg-[#DEEBFF]/40 border border-[#B3D4FF] rounded-lg p-3.5">
              <span className="text-[10px] font-bold text-[#0747A6] uppercase tracking-wider block">
                Annual In-Hand Pay
              </span>
              <div className="text-xl font-extrabold text-[#0747A6] mt-1">
                {formatInr(calculation.annualTakeHome)}
              </div>
              <p className="text-[10px] text-[#0052CC] mt-1 font-semibold">
                {calculation.takeHomePercent}% of Total CTC
              </p>
            </div>

            <div className="bg-[#FFEBE6]/40 border border-[#FFBDAD] rounded-lg p-3.5">
              <span className="text-[10px] font-bold text-[#DE350B] uppercase tracking-wider block">
                Total Monthly Deductions
              </span>
              <div className="text-xl font-extrabold text-[#DE350B] mt-1">
                {formatInr(calculation.totalMonthlyDeductions)}
              </div>
              <p className="text-[10px] text-[#DE350B]/80 mt-1">
                PF, PT & Est. Income Tax (TDS)
              </p>
            </div>
          </div>

          {/* Efficiency Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-[#172B4D] flex items-center gap-1 font-semibold">
                <TrendingUp size={13} className="text-[#00875A]" />
                Take-Home vs Deductions Ratio
              </span>
              <span className="text-[#6B778C]">
                In-Hand: <strong>{calculation.takeHomePercent}%</strong> | Deductions: <strong>{100 - calculation.takeHomePercent}%</strong>
              </span>
            </div>
            <div className="w-full bg-[#FFEBE6] rounded-full h-2.5 overflow-hidden flex">
              <div
                className="bg-[#00875A] h-full transition-all duration-300"
                style={{ width: `${calculation.takeHomePercent}%` }}
                title={`Take-Home: ${calculation.takeHomePercent}%`}
              />
              <div
                className="bg-[#DE350B] h-full transition-all duration-300"
                style={{ width: `${100 - calculation.takeHomePercent}%` }}
                title={`Deductions: ${100 - calculation.takeHomePercent}%`}
              />
            </div>
          </div>

          {/* Granular Breakdown Table */}
          <div className="border border-[#DFE1E6] rounded-lg overflow-hidden text-xs">
            <div className="bg-[#F4F5F7] px-3.5 py-2 border-b border-[#DFE1E6] font-bold text-[#172B4D] flex items-center justify-between">
              <span>Salary Component</span>
              <span>Monthly Amount</span>
            </div>
            <div className="divide-y divide-[#DFE1E6]">
              {/* Earnings */}
              <div className="p-2.5 bg-blue-50/20 font-semibold text-[#0052CC] text-[11px] uppercase tracking-wider">
                Monthly Earnings
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#172B4D]">Basic Salary</span>
                  <span className="text-[10px] text-[#6B778C] block">50% of monthly gross</span>
                </div>
                <span className="font-semibold text-[#172B4D]">{formatInr(calculation.basic)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#172B4D]">House Rent Allowance (HRA)</span>
                  <span className="text-[10px] text-[#6B778C] block">{metroCity ? "50%" : "40%"} of basic pay</span>
                </div>
                <span className="font-semibold text-[#172B4D]">{formatInr(calculation.hra)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#172B4D]">Special & Flexi Allowance</span>
                  <span className="text-[10px] text-[#6B778C] block">Remaining gross salary bucket</span>
                </div>
                <span className="font-semibold text-[#172B4D]">{formatInr(calculation.specialAllowance)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between bg-[#FAFBFC] font-bold text-[#172B4D]">
                <span>Total Monthly Gross Earnings</span>
                <span className="text-[#0052CC]">{formatInr(calculation.monthlyGross)}</span>
              </div>

              {/* Deductions */}
              <div className="p-2.5 bg-rose-50/30 font-semibold text-[#DE350B] text-[11px] uppercase tracking-wider">
                Statutory Deductions (Employee Share)
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#172B4D]">Provident Fund (EPF)</span>
                  <span className="text-[10px] text-[#6B778C] block">12% statutory employee contribution</span>
                </div>
                <span className="font-semibold text-[#DE350B]">-{formatInr(calculation.employeePf)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#172B4D]">Professional Tax (PT)</span>
                  <span className="text-[10px] text-[#6B778C] block">State statutory standard deduction</span>
                </div>
                <span className="font-semibold text-[#DE350B]">-{formatInr(calculation.professionalTax)}</span>
              </div>
              {calculation.esic > 0 && (
                <div className="px-3.5 py-2 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[#172B4D]">ESIC Employee Contribution</span>
                    <span className="text-[10px] text-[#6B778C] block">0.75% for gross &lt;= 21,000</span>
                  </div>
                  <span className="font-semibold text-[#DE350B]">-{formatInr(calculation.esic)}</span>
                </div>
              )}
              <div className="px-3.5 py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#172B4D]">Estimated Income Tax (TDS)</span>
                  <span className="text-[10px] text-[#6B778C] block">Based on {regime.toUpperCase()} regime slabs</span>
                </div>
                <span className="font-semibold text-[#DE350B]">-{formatInr(calculation.monthlyTds)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between bg-[#FAFBFC] font-bold text-[#172B4D]">
                <span>Total Monthly Deductions</span>
                <span className="text-[#DE350B]">-{formatInr(calculation.totalMonthlyDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B778C]">
            <Info size={13} className="text-[#0052CC]" />
            <span>Estimates for calculation purposes; final payslip may vary by exemptions.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-white border border-[#DFE1E6] hover:bg-[#EBECF0] text-[#172B4D] transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-[#00875A]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-[#0052CC]" />
                  <span>Copy Breakdown</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CtcCalculatorModal;
