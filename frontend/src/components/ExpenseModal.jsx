import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { submitExpense } from "../services/expense";
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

function ExpenseModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    expenseCategory: "Internet & Mobile",
    claimDate: new Date().toISOString().split("T")[0],
    amount: "",
    merchantName: "",
    receiptNumber: "",
    attachmentName: "",
    description: "",
  });

  if (!isOpen) return null;

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
        description: formData.description.trim(),
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
              <label className="block font-semibold text-[#172B4D] mb-1">Claim Amount (INR ₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#6B778C]">₹</span>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC] font-semibold text-[#172B4D]"
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
