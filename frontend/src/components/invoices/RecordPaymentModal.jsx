import React, { useState } from "react";
import { X, CheckCircle2, CreditCard, Receipt, Building } from "lucide-react";
import { invoicesApi } from "../../services/api";
import toast from "react-hot-toast";

function RecordPaymentModal({ isOpen, onClose, invoice, onSuccess }) {
  if (!isOpen || !invoice) return null;

  const currentBalance =
    invoice.balanceDue !== undefined ? invoice.balanceDue : invoice.grandTotal - (invoice.amountPaid || 0);

  const [formData, setFormData] = useState({
    amount: Math.min(currentBalance, Math.round(invoice.grandTotal * 0.5)),
    tdsDeducted: Math.round(Math.min(currentBalance, Math.round(invoice.grandTotal * 0.5)) * 0.02), // 2% 194C TDS standard
    paymentReference: "",
    paymentMode: "NEFT/RTGS",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const totalThisEntry = (Number(formData.amount) || 0) + (Number(formData.tdsDeducted) || 0);
  const projectedBalance = Math.max(0, currentBalance - totalThisEntry);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid received amount.");
      return;
    }

    try {
      setLoading(true);
      const res = await invoicesApi.recordPayment(invoice._id, formData);
      toast.success(res.data.message || "Payment recorded successfully!");
      onSuccess?.(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0F131C] rounded-lg shadow-2xl border border-[#DFE1E6] dark:border-[#263042] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26]">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[#00875A]" />
            <h3 className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
              Record Client Invoice Collection
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white rounded"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Invoice Summary Box */}
          <div className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-[#0052CC] dark:text-[#579DFF]">
                {invoice.invoiceNumber}
              </span>
              <span className="font-semibold text-[#172B4D] dark:text-white">{invoice.clientName}</span>
            </div>
            <div className="flex justify-between text-[#6B778C] dark:text-neutral-400 pt-1 border-t border-[#DFE1E6] dark:border-[#263042]">
              <span>Grand Total: Rs {invoice.grandTotal?.toLocaleString()}</span>
              <span>Paid So Far: Rs {(invoice.amountPaid || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-[#172B4D] dark:text-white pt-0.5">
              <span>Current Outstanding Balance:</span>
              <span className="text-[#DE350B]">Rs {currentBalance?.toLocaleString()}</span>
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
              Payment Amount Received (Rs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              max={currentBalance}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs font-bold rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                TDS Withheld (194C 2%)
              </label>
              <input
                type="number"
                min="0"
                value={formData.tdsDeducted}
                onChange={(e) => setFormData({ ...formData, tdsDeducted: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
                Payment Mode
              </label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                <option value="NEFT/RTGS">NEFT / RTGS</option>
                <option value="Cheque">Corporate Cheque</option>
                <option value="UPI">UPI / Digital</option>
                <option value="Wire Transfer">Wire Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B4D] dark:text-neutral-300 mb-1">
              Bank Reference / UTR Number
            </label>
            <input
              type="text"
              placeholder="e.g. UTR-HDFC-99182371"
              value={formData.paymentReference}
              onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
            />
          </div>

          {/* Reconciliation Preview Box */}
          <div className="p-3 rounded bg-[#E3FCEF] dark:bg-[#00875A]/20 border border-[#00875A]/40 space-y-1 text-[11px] text-[#006644] dark:text-emerald-300">
            <div className="flex justify-between font-bold">
              <span>This Collection + TDS Credit:</span>
              <span>Rs {totalThisEntry.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Projected Remaining Balance:</span>
              <span className="font-mono font-bold">
                {projectedBalance === 0 ? "Fully Paid (Nil)" : `Rs ${projectedBalance.toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DFE1E6] dark:border-[#263042] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-semibold rounded bg-[#00875A] hover:bg-[#006644] text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span>Reconciling...</span>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  <span>Post Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordPaymentModal;
