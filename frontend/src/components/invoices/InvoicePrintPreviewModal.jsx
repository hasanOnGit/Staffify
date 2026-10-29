import React, { useEffect, useState } from "react";
import {
  X,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Building2,
  Briefcase,
  CreditCard,
  FileText,
} from "lucide-react";
import StatusLozenge from "../StatusLozenge";
import { invoicesApi } from "../../services/api";
import toast from "react-hot-toast";

function InvoicePrintPreviewModal({ invoiceId, isOpen, onClose, onSuccess }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoice();
    }
  }, [isOpen, invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const res = await invoicesApi.getById(invoiceId);
      setInvoice(res.data.data);
    } catch (err) {
      toast.error("Failed to load invoice details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setProcessingPayment(true);
      await invoicesApi.updateStatus(invoice.invoiceNumber, {
        status: "Paid",
        paymentReference: `UTR-${Date.now().toString().slice(-8)}`,
      });
      toast.success(`Invoice ${invoice.invoiceNumber} paid! PO budget deducted successfully.`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const po = invoice?.purchaseOrder;
  const currentPoRemaining = po ? Math.max(0, po.poValue - po.utilizedAmount) : 0;
  const newPoRemaining = po ? Math.max(0, currentPoRemaining - invoice.grandTotal) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden my-auto animate-page-enter">
        {/* Modal Toolbar (hidden in print) */}
        <div className="px-5 py-3.5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C] print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#0052CC] dark:text-[#579DFF]">
              {invoice?.invoiceNumber}
            </span>
            {invoice && <StatusLozenge status={invoice.status} size="xs" />}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-[#172B4D] dark:text-neutral-200 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={13} />
              <span>Print / PDF</span>
            </button>

            {invoice?.status !== "Paid" && (
              <button
                type="button"
                onClick={handleMarkAsPaid}
                disabled={processingPayment}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00875A] hover:bg-[#006644] rounded transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 size={13} />
                <span>{processingPayment ? "Processing..." : "Mark as Paid & Deduct PO"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6B778C]">
            Loading invoice details...
          </div>
        ) : invoice ? (
          <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto text-[#172B4D] dark:text-[#F1F5F9] bg-white dark:bg-[#151B26]">
            {/* Invoice Top Branding */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-[#DFE1E6] dark:border-[#263042]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052CC] dark:text-[#579DFF] block">
                  Tax Invoice / Vendor Settlement
                </span>
                <h1 className="text-xl font-bold tracking-tight mt-0.5">
                  {invoice.vendorName}
                </h1>
                <p className="text-xs text-[#6B778C] dark:text-neutral-400 mt-1">
                  GSTIN: <span className="font-mono font-semibold">{invoice.vendorDetails?.gstin || "27AABCA1234F1Z5"}</span> • PAN: <span className="font-mono font-semibold">{invoice.vendorDetails?.pan || "AABCA1234F"}</span>
                </p>
                <p className="text-xs text-[#6B778C] dark:text-neutral-400">
                  {invoice.vendorDetails?.billingAddress?.street || "Industrial Area"}, {invoice.vendorDetails?.billingAddress?.city || "Mumbai"}
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="text-sm font-mono font-bold text-[#0052CC] dark:text-[#579DFF]">
                  {invoice.invoiceNumber}
                </div>
                <div className="text-xs text-[#6B778C] dark:text-neutral-400">
                  Issue Date: <span className="font-medium text-[#172B4D] dark:text-white">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-[#6B778C] dark:text-neutral-400">
                  Billing Period: <span className="font-semibold text-[#172B4D] dark:text-white">{invoice.billingPeriod?.month} {invoice.billingPeriod?.year}</span>
                </div>
                <div className="pt-1">
                  <StatusLozenge status={invoice.status} size="sm" />
                </div>
              </div>
            </div>

            {/* Bill To & PO Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B778C] dark:text-neutral-400 block">
                  Billed To (Client Entity):
                </span>
                <h3 className="font-bold text-[#172B4D] dark:text-white text-sm">
                  {invoice.clientName}
                </h3>
                <p className="font-mono text-[#42526E] dark:text-neutral-300">
                  GSTIN: {invoice.clientDetails?.gstin || "29AABCT8899E1Z8"}
                </p>
                <p className="text-[#6B778C] dark:text-neutral-400">
                  {invoice.clientDetails?.billingAddress?.city || "Bengaluru"}, India
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B778C] dark:text-neutral-400 block">
                  Contract & PO Reference:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B778C] dark:text-neutral-400">PO Number:</span>
                  <span className="font-mono font-bold text-[#0052CC] dark:text-[#579DFF]">
                    {invoice.poNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B778C] dark:text-neutral-400">Contract MSA:</span>
                  <span className="font-mono">{invoice.contractNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B778C] dark:text-neutral-400">Payment Due:</span>
                  <span>{new Date(invoice.dueDate || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-[#DFE1E6] dark:border-[#263042] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFBFC] dark:bg-[#0F131C] text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400 border-b border-[#DFE1E6] dark:border-[#263042]">
                  <tr>
                    <th className="px-4 py-2.5">Contractor / Worker</th>
                    <th className="px-4 py-2.5">Designation</th>
                    <th className="px-4 py-2.5 text-center">Days/Units</th>
                    <th className="px-4 py-2.5">Contract Rate</th>
                    <th className="px-4 py-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                  {invoice.lineItems?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFBFC] dark:hover:bg-[#1C2331]">
                      <td className="px-4 py-2.5 font-semibold text-[#172B4D] dark:text-white">
                        {item.workerName}
                      </td>
                      <td className="px-4 py-2.5 text-[#42526E] dark:text-neutral-300">
                        {item.designation}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono">
                        {item.daysOrHoursWorked} Days
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[#6B778C] dark:text-neutral-400">
                        ₹{item.rate.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#172B4D] dark:text-white">
                        ₹{item.lineTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
              {/* Bank Settlement Info */}
              <div className="text-xs space-y-1 text-[#6B778C] dark:text-neutral-400 max-w-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-[#172B4D] dark:text-white">
                  Bank Settlement Coordinates:
                </span>
                <p>Bank: {invoice.vendorDetails?.bankDetails?.bankName || "HDFC Bank"}</p>
                <p className="font-mono">Account: {invoice.vendorDetails?.bankDetails?.accountNumber || "91802001928374"}</p>
                <p className="font-mono">IFSC: {invoice.vendorDetails?.bankDetails?.ifscCode || "HDFC0000240"}</p>
              </div>

              {/* Totals Box */}
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#6B778C] dark:text-neutral-400">
                  <span>Services Subtotal:</span>
                  <span className="font-mono font-semibold text-[#172B4D] dark:text-white">
                    ₹{invoice.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#6B778C] dark:text-neutral-400">
                  <span>Statutory GST (18%):</span>
                  <span className="font-mono font-semibold text-[#172B4D] dark:text-white">
                    ₹{invoice.gstAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between text-sm font-bold text-[#172B4D] dark:text-white">
                  <span>Grand Total (INR):</span>
                  <span className="font-mono text-[#0052CC] dark:text-[#579DFF] text-base">
                    ₹{invoice.grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* PO Balance Write-Down Alert */}
            {po && invoice.status !== "Paid" && (
              <div className="p-3.5 rounded-lg border border-[#B3D4FF] dark:border-[#263042] bg-[#DEEBFF]/50 dark:bg-[#1C2331] text-xs space-y-1 print:hidden">
                <span className="font-bold text-[#0052CC] dark:text-[#579DFF] flex items-center gap-1.5">
                  <CreditCard size={14} />
                  <span>PO Balance Write-Down Impact</span>
                </span>
                <p className="text-[#42526E] dark:text-neutral-300">
                  When marked as Paid, this invoice will write down Purchase Order{" "}
                  <span className="font-mono font-bold text-[#0052CC]">{invoice.poNumber}</span> from{" "}
                  <span className="font-mono font-semibold">₹{currentPoRemaining.toLocaleString("en-IN")}</span> to{" "}
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">₹{newPoRemaining.toLocaleString("en-IN")}</span>.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default InvoicePrintPreviewModal;
