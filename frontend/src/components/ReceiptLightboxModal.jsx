import { useState } from "react";
import {
  X,
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  Building2,
  Calendar,
  CheckCircle2,
  Tag,
  CreditCard,
  Eye,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

function ReceiptLightboxModal({ isOpen, onClose, claim }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen || !claim) return null;

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDownload = () => {
    // Generate text/html voucher download
    const content = [
      `STAFFIFY ENTERPRISE EXPENSE RECEIPT VOUCHER`,
      `--------------------------------------------------`,
      `Claim ID: ${claim.claimId}`,
      `Employee: ${claim.employeeName} (${claim.employeeId})`,
      `Merchant: ${claim.merchantName}`,
      `Invoice / Receipt #: ${claim.receiptNumber || "N/A"}`,
      `Expense Category: ${claim.expenseCategory}`,
      `Claim Date: ${claim.claimDate || new Date().toISOString().split("T")[0]}`,
      `Amount: ${formatCurrency(claim.amount)}`,
      `Status: ${claim.status}`,
      `File: ${claim.attachmentName || "voucher_receipt.pdf"}`,
      `--------------------------------------------------`,
      `Audit Timestamp: ${new Date().toISOString()}`,
      `Status: Verified by Staffify Enterprise Claims Engine`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Staffify_Receipt_${claim.claimId || "Claim"}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Receipt voucher downloaded");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#091E42]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#DFE1E6] bg-[#F4F5F7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm flex items-center gap-2">
                <span>Receipt Lightbox & Verification</span>
                <span className="text-[10px] font-mono text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded border border-[#B3D4FF]">
                  {claim.claimId}
                </span>
              </h3>
              <p className="text-[11px] text-[#6B778C]">
                {claim.merchantName} • {formatCurrency(claim.amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              title="Zoom Out"
              className="p-1.5 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[11px] font-mono font-semibold text-[#6B778C] w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
              title="Zoom In"
              className="p-1.5 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
            >
              <ZoomIn size={15} />
            </button>
            <div className="h-4 w-px bg-[#DFE1E6] mx-1" />
            <button
              onClick={handleDownload}
              title="Download Receipt"
              className="p-1.5 rounded text-[#0052CC] hover:bg-[#DEEBFF] transition cursor-pointer"
            >
              <Download size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 overflow-auto p-6 bg-[#FAFBFC] flex items-center justify-center">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
            className="transition-transform duration-150 w-full max-w-md bg-white border border-[#DFE1E6] rounded-lg shadow-md p-6 font-mono text-xs text-[#172B4D] space-y-4"
          >
            {/* Simulated Receipt Invoice View */}
            <div className="text-center border-b border-dashed border-[#DFE1E6] pb-4">
              <div className="text-base font-bold text-[#172B4D] uppercase tracking-wider">
                {claim.merchantName || "AUTHORIZED MERCHANT"}
              </div>
              <div className="text-[10px] text-[#6B778C] mt-0.5">
                TAX INVOICE / OFFICIAL EXPENSE RECEIPT
              </div>
              <div className="text-[9px] text-[#A5ADBA] mt-0.5">
                GSTIN: 27AABCS1429B1Z • SAC: 998311
              </div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#6B778C]">Receipt No:</span>
                <span className="font-bold">{claim.receiptNumber || "REC-492019"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B778C]">Date of Issue:</span>
                <span>{claim.claimDate || new Date().toISOString().split("T")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B778C]">Billed To:</span>
                <span>{claim.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B778C]">Category:</span>
                <span>{claim.expenseCategory}</span>
              </div>
            </div>

            <div className="border-t border-b border-[#DFE1E6] py-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-[#6B778C] text-[10px] uppercase">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="truncate max-w-[200px]">
                  {claim.description || claim.expenseCategory}
                </span>
                <span>{formatCurrency(claim.amount)}</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-[#6B778C]">
                <span>Net Subtotal:</span>
                <span>{formatCurrency(Math.round(claim.amount * 0.8475))}</span>
              </div>
              <div className="flex justify-between text-[#6B778C]">
                <span>CGST (9%) + SGST (9%):</span>
                <span>{formatCurrency(Math.round(claim.amount * 0.1525))}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#0052CC] pt-1 border-t border-dashed border-[#DFE1E6]">
                <span>Total Amount Paid:</span>
                <span>{formatCurrency(claim.amount)}</span>
              </div>
            </div>

            <div className="text-center pt-3 border-t border-[#DFE1E6] text-[10px] text-[#00875A] font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 size={12} />
              <span>PAID & VERIFIED VIA DIGITAL PAYMENT</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#DFE1E6] bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#6B778C]">Claim Status:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                claim.status === "Finance_Approved"
                  ? "bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]"
                  : claim.status === "Manager_Approved"
                  ? "bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]"
                  : claim.status === "Rejected"
                  ? "bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD]"
                  : "bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380]"
              }`}
            >
              {claim.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-[#F4F5F7] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] transition cursor-pointer flex items-center gap-1"
            >
              <Download size={13} />
              <span>Download Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-[#0052CC] hover:bg-[#0747A6] text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptLightboxModal;
