import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { submitExpense } from "../services/expense";
import aiService from "../services/ai.service";
import toast from "react-hot-toast";
import {
  Receipt,
  Upload,
  Calendar,
  Building2,
  DollarSign,
  FileText,
  X,
  CreditCard,
  AlertCircle,
  Tag,
  Sparkles,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

const CATEGORIES = [
  "Internet & Mobile",
  "Travel & Fuel",
  "Training & Certifications",
  "Food & Dining",
  "Books & Periodicals",
  "Medical & Health",
  "Office Supplies",
  "Client Entertainment",
];

const CURRENCY_RATES = {
  INR: 1,
  USD: 86.50,
  EUR: 93.20,
  GBP: 111.40,
  AED: 23.55,
};

function ExpenseModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const receiptFileRef = useRef(null);
  const [claimCurrency, setClaimCurrency] = useState("INR");
  const [foreignAmount, setForeignAmount] = useState("");
  const [formData, setFormData] = useState({
    expenseCategory: "Internet & Mobile",
    claimDate: new Date().toISOString().split("T")[0],
    amount: "",
    merchantName: "",
    receiptNumber: "",
    attachmentName: "",
    description: "",
  });

  const handleCurrencyChange = (newCurr) => {
    setClaimCurrency(newCurr);
    if (newCurr === "INR") {
      setForeignAmount("");
    } else if (foreignAmount) {
      const converted = Math.round(Number(foreignAmount) * (CURRENCY_RATES[newCurr] || 1));
      setFormData((prev) => ({ ...prev, amount: String(converted) }));
    }
  };

  const handleForeignAmountChange = (val) => {
    setForeignAmount(val);
    const rate = CURRENCY_RATES[claimCurrency] || 1;
    const num = Number(val);
    if (num > 0) {
      const converted = Math.round(num * rate);
      setFormData((prev) => ({ ...prev, amount: String(converted) }));
    } else {
      setFormData((prev) => ({ ...prev, amount: "" }));
    }
  };

  if (!isOpen) return null;

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningReceipt(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(",")[1];
          const mimeType = file.type || "image/jpeg";
          const parsed = await aiService.parseReceipt(base64Data, mimeType);
          if (parsed) {
            setFormData((prev) => ({
              ...prev,
              merchantName: parsed.merchantName || prev.merchantName,
              amount: parsed.amount ? String(parsed.amount) : prev.amount,
              claimDate: parsed.date || prev.claimDate,
              receiptNumber: parsed.invoiceNumber || prev.receiptNumber,
              expenseCategory: parsed.category || prev.expenseCategory,
              description: parsed.description || prev.description,
              attachmentName: file.name,
            }));
            toast.success(
              `Receipt parsed! Extracted ${parsed.amount || ""} INR from ${parsed.merchantName || "receipt"}`
            );
          }
        } catch (apiErr) {
          toast.error("Receipt parsing error: " + (apiErr.response?.data?.error || apiErr.message));
        } finally {
          setScanningReceipt(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setScanningReceipt(false);
      toast.error("File read error: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid expense amount");
      return;
    }
    if (!formData.merchantName.trim()) {
      toast.error("Please specify merchant or vendor name");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        employeeId: user?.employeeId || user?.userId || "EMP-DEV-03",
        employeeName: user?.name || "Employee User",
        department: user?.department || "Engineering",
        expenseCategory: formData.expenseCategory,
        claimDate: formData.claimDate,
        amount: Number(formData.amount),
        merchantName: formData.merchantName.trim(),
        receiptNumber: formData.receiptNumber.trim() || `REC-${Date.now().toString().slice(-6)}`,
        attachmentName: formData.attachmentName || "invoice_receipt.pdf",
        description:
          claimCurrency !== "INR" && foreignAmount
            ? `${formData.description.trim()} [Original Invoice: ${foreignAmount} ${claimCurrency} @ ₹${CURRENCY_RATES[claimCurrency]}]`.trim()
            : formData.description.trim(),
      };

      const res = await submitExpense(payload);
      if (res.success) {
        toast.success(`Expense claim #${res.data.claimId} submitted successfully`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to submit expense claim");
      }
    } catch (err) {
      console.error("Expense submit error:", err);
      toast.error(err.response?.data?.error || "Error submitting claim");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
              <Receipt size={18} />
            </span>
            <div>
              <h2 className="font-bold text-sm text-[#172B4D]">Submit Reimbursement Claim</h2>
              <p className="text-xs text-[#6B778C]">Flexible Benefit & Expense Reimbursement Workflow</p>
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

        {/* Scrollable Form Body */}
        <form id="expense-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Employee Meta Banner */}
          <div className="p-3 rounded-lg bg-[#F4F5F7] border border-[#DFE1E6] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#6B778C] uppercase font-bold block">Claimant</span>
              <span className="font-semibold text-[#172B4D]">{user?.name}</span>
              <span className="text-[#6B778C] ml-1.5">({user?.employeeId || user?.userId})</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
              {user?.department || "Engineering"}
            </span>
          </div>

          {/* AI Smart Receipt OCR Banner */}
          <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-600 text-white">
                  <Sparkles size={13} />
                </div>
                <div>
                  <h4 className="font-bold text-[#172B4D] text-xs">AI Smart Receipt Scanner</h4>
                  <p className="text-[10px] text-[#6B778C]">
                    Upload receipt or invoice image/PDF to auto-extract merchant, date, and amount
                  </p>
                </div>
              </div>

              <input
                type="file"
                ref={receiptFileRef}
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleReceiptUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={scanningReceipt}
                onClick={() => receiptFileRef.current?.click()}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <UploadCloud size={13} />
                <span>{scanningReceipt ? "Extracting..." : "Scan Receipt"}</span>
              </button>
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Expense Category *</label>
              <div className="relative">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C]" />
                <select
                  value={formData.expenseCategory}
                  onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Claim / Invoice Date *</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C]" />
                <input
                  type="date"
                  required
                  value={formData.claimDate}
                  onChange={(e) => setFormData({ ...formData, claimDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC]"
                />
              </div>
            </div>
          </div>

          {/* Multi-Currency Claim Converter */}
          <div className="bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#0747A6] flex items-center gap-1.5">
                <DollarSign size={13} className="text-[#0052CC]" />
                <span>Multi-Currency Claim Converter</span>
              </span>
              <span className="text-[10px] text-[#0052CC] font-mono">Benchmark FX Rates</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-[#42526E] font-semibold block mb-0.5">Billing Currency</label>
                <select
                  value={claimCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-[#DFE1E6] rounded text-xs font-semibold text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="AED">AED (AED) — UAE Dirham</option>
                </select>
              </div>

              {claimCurrency !== "INR" ? (
                <>
                  <div>
                    <label className="text-[10px] text-[#42526E] font-semibold block mb-0.5">
                      Foreign Invoice Amount ({claimCurrency})
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="0.00"
                      value={foreignAmount}
                      onChange={(e) => handleForeignAmountChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#DFE1E6] rounded text-xs font-bold text-[#0052CC] focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#42526E] font-semibold block mb-0.5">Corporate FX Benchmark</label>
                    <div className="px-2.5 py-1.5 bg-[#F4F5F7] border border-[#DFE1E6] rounded text-xs font-mono font-semibold text-[#172B4D]">
                      1 {claimCurrency} = ₹{CURRENCY_RATES[claimCurrency]}
                    </div>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 flex items-center text-[11px] text-[#6B778C]">
                  Direct domestic INR reimbursement. Switch currency for international flights, client visits or SaaS tools.
                </div>
              )}
            </div>
          </div>

          {/* Merchant & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Merchant / Vendor Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Airtel, Amazon AWS, Indigo"
                value={formData.merchantName}
                onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Claim Amount (INR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#6B778C] text-[10px]">INR</span>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC] font-semibold text-[#172B4D]"
                />
              </div>
            </div>
          </div>

          {/* Receipt Number & Attachment Mock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Invoice / Receipt Ref No.</label>
              <input
                type="text"
                placeholder="e.g. INV-2026-9921"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#172B4D] mb-1">Receipt File Name / Doc</label>
              <div className="relative">
                <Upload size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C]" />
                <input
                  type="text"
                  placeholder="receipt_october2026.pdf"
                  value={formData.attachmentName}
                  onChange={(e) => setFormData({ ...formData, attachmentName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC]"
                />
              </div>
            </div>
          </div>

          {/* Description / Business Justification */}
          <div>
            <label className="block font-semibold text-[#172B4D] mb-1">
              Business Purpose / Remarks *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide business justification, project association or team context..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC] resize-none"
            />
          </div>

          {/* Statutory Policy Notice */}
          <div className="p-3 rounded-lg bg-[#DEEBFF]/30 border border-[#B3D4FF] flex items-start gap-2.5 text-[#0747A6]">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-[#0052CC]" />
            <p className="text-[11px] leading-relaxed">
              Approved claims are settled either via corporate bank transfer or credited directly into the upcoming monthly payroll cycle as a non-taxable reimbursement allowance.
            </p>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-6 py-3.5 bg-[#F4F5F7] border-t border-[#DFE1E6] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#DFE1E6] rounded-lg text-xs font-semibold text-[#42526E] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="expense-form"
            disabled={submitting}
            className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Claim...</span>
              </>
            ) : (
              <>
                <Receipt size={14} />
                <span>Submit Claim</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpenseModal;
