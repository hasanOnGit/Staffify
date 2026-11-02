import { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Check,
  AlertTriangle,
  Save,
  Building,
  UserCheck,
} from "lucide-react";
import { verifyTaxDeclaration } from "../services/tax";
import toast from "react-hot-toast";

function TaxProofAuditModal({ isOpen, onClose, declaration, onRefresh }) {
  const [proofs, setProofs] = useState([]);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [overallStatus, setOverallStatus] = useState("Verified");

  useEffect(() => {
    if (declaration) {
      setProofs(
        (declaration.proofs || []).map((p) => ({
          proofId: p.proofId || p._id,
          section: p.section,
          documentTitle: p.documentTitle,
          declaredAmount: p.declaredAmount || 0,
          verifiedAmount: p.verifiedAmount !== undefined ? p.verifiedAmount : p.declaredAmount || 0,
          documentUrl: p.documentUrl || "",
          status: p.status || "Pending",
          remarks: p.remarks || "",
        }))
      );
      setAdminRemarks(declaration.adminRemarks || "");
      setOverallStatus(declaration.status === "Rejected" ? "Rejected" : "Verified");
    }
  }, [declaration, isOpen]);

  if (!isOpen || !declaration) return null;

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleUpdateProofStatus = (proofId, newStatus) => {
    setProofs((prev) =>
      prev.map((p) => {
        if (p.proofId === proofId) {
          const verifiedAmt = newStatus === "Rejected" ? 0 : p.declaredAmount;
          return { ...p, status: newStatus, verifiedAmount: verifiedAmt };
        }
        return p;
      })
    );
  };

  const handleUpdateVerifiedAmount = (proofId, amt) => {
    const num = Math.max(0, Number(amt) || 0);
    setProofs((prev) =>
      prev.map((p) => (p.proofId === proofId ? { ...p, verifiedAmount: num } : p))
    );
  };

  const handleUpdateProofRemark = (proofId, remarks) => {
    setProofs((prev) =>
      prev.map((p) => (p.proofId === proofId ? { ...p, remarks } : p))
    );
  };

  const totalDeclared = proofs.reduce((sum, p) => sum + (Number(p.declaredAmount) || 0), 0);
  const totalVerified = proofs.reduce((sum, p) => sum + (Number(p.verifiedAmount) || 0), 0);

  const handleSaveAudit = async () => {
    try {
      setSaving(true);
      const proofUpdates = proofs.map((p) => ({
        proofId: p.proofId,
        status: p.status,
        verifiedAmount: p.verifiedAmount,
        remarks: p.remarks,
      }));

      await verifyTaxDeclaration({
        declarationId: declaration.declarationId,
        status: overallStatus,
        adminRemarks,
        proofUpdates,
        verifiedBy: "HR Administrator",
      });

      toast.success("Tax proof verification completed successfully!");
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to verify tax declaration");
    } finally {
      setSaving(false);
    }
  };

  // Landlord PAN validation check if rent > 1,00,000
  const annualRent = declaration.hraDetails?.annualRent || (declaration.hraDetails?.monthlyRent || 0) * 12;
  const isPanRequired = annualRent > 100000;
  const landlordPan = declaration.hraDetails?.landlordPan || "";
  const isValidPan = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(landlordPan);

  return (
    <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#172B4D] text-sm">
                  Income Tax Proof Verification & Audit Tray
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DEEBFF] text-[#0052CC]">
                  {declaration.financialYear || "FY 2024-25"}
                </span>
              </div>
              <p className="text-[11px] text-[#6B778C]">
                Review submitted employee investment receipts, validate landlord PAN, and approve verified tax deductions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Employee Overview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FAFBFC] p-3.5 rounded-lg border border-[#DFE1E6]">
            <div>
              <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Employee</span>
              <span className="font-bold text-[#172B4D] block mt-0.5">
                {declaration.employeeName} ({declaration.employeeId})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Tax Regime</span>
              <span className="font-bold text-[#0052CC] block mt-0.5">
                {declaration.regime} Tax Regime
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Total Declared</span>
              <span className="font-bold text-[#172B4D] block mt-0.5">
                {formatCurrency(totalDeclared)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Total Verified</span>
              <span className="font-bold text-[#00875A] block mt-0.5">
                {formatCurrency(totalVerified)}
              </span>
            </div>
          </div>

          {/* HRA Landlord PAN Audit Alert */}
          {declaration.hraDetails && (
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-[#0747A6]">
              <Building size={16} className="text-[#0052CC] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">HRA & Rental Address Verification:</span>
                  <span className="text-[10px] font-semibold">
                    Annual Rent: {formatCurrency(annualRent)}
                  </span>
                </div>
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#172B4D]">
                  <div>Landlord: <strong>{declaration.hraDetails.landlordName || "Not Specified"}</strong></div>
                  <div>
                    Landlord PAN:{" "}
                    <strong>{landlordPan || "Not Provided"}</strong>{" "}
                    {isPanRequired && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isValidPan ? "bg-[#E3FCEF] text-[#006644]" : "bg-[#FFEBE6] text-[#DE350B]"
                        }`}
                      >
                        {isValidPan ? "Valid PAN Format" : "Invalid / Missing PAN"}
                      </span>
                    )}
                  </div>
                  <div>City Category: <strong>{declaration.hraDetails.cityType}</strong></div>
                </div>
                {isPanRequired && !isValidPan && (
                  <p className="text-[10px] text-[#DE350B] mt-1 font-semibold">
                    Alert: Annual rent exceeds INR 1,00,000. Valid 10-digit Landlord PAN is statutory under IT Section 194-IB.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Proofs Table */}
          <div className="border border-[#DFE1E6] rounded-lg overflow-hidden">
            <div className="px-3.5 py-2 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between">
              <span className="font-bold text-[#172B4D] text-xs">
                Investment Receipts & Documents ({proofs.length})
              </span>
              <span className="text-[11px] text-[#6B778C]">
                Check receipts against declared amounts and adjust verified limits
              </span>
            </div>

            {proofs.length === 0 ? (
              <div className="p-8 text-center text-[#6B778C]">
                <FileText size={28} className="mx-auto text-[#DFE1E6] mb-1" />
                <p className="font-semibold text-xs text-[#172B4D]">No proofs attached yet</p>
                <p className="text-[11px]">Employee has not uploaded physical receipts for this cycle.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#DFE1E6]">
                {proofs.map((proof, idx) => (
                  <div key={idx} className="p-3.5 space-y-2 bg-white hover:bg-[#FAFBFC] transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                          {proof.section}
                        </span>
                        <span className="font-bold text-[#172B4D] text-xs">
                          {proof.documentTitle}
                        </span>
                        {proof.documentUrl && (
                          <a
                            href={proof.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-[#0052CC] hover:underline flex items-center gap-0.5"
                          >
                            <ExternalLink size={10} />
                            <span>View Doc</span>
                          </a>
                        )}
                      </div>

                      {/* Approval Status Switcher */}
                      <div className="flex items-center gap-1.5">
                        {["Approved", "Rejected", "Pending"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateProofStatus(proof.proofId, st)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${
                              proof.status === st
                                ? st === "Approved"
                                  ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                                  : st === "Rejected"
                                  ? "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                                  : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                                : "bg-white text-[#6B778C] border-[#DFE1E6] hover:bg-[#F4F5F7]"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                      <div>
                        <span className="text-[#6B778C] block text-[10px]">Declared Amount</span>
                        <span className="font-semibold text-[#172B4D]">
                          {formatCurrency(proof.declaredAmount)}
                        </span>
                      </div>

                      <div>
                        <label className="text-[#6B778C] block text-[10px] font-bold">
                          Verified Allowed Amount (INR)
                        </label>
                        <input
                          type="number"
                          value={proof.verifiedAmount}
                          onChange={(e) => handleUpdateVerifiedAmount(proof.proofId, e.target.value)}
                          className="w-full px-2 py-1 border border-[#DFE1E6] rounded text-[#172B4D] font-bold outline-none focus:border-[#0052CC] bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[#6B778C] block text-[10px]">HR Audit Remarks</label>
                        <input
                          type="text"
                          placeholder="e.g. Receipt verified with LIC stamp"
                          value={proof.remarks}
                          onChange={(e) => handleUpdateProofRemark(proof.proofId, e.target.value)}
                          className="w-full px-2 py-1 border border-[#DFE1E6] rounded text-[#172B4D] outline-none focus:border-[#0052CC] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overall Audit Remarks */}
          <div className="bg-[#FAFBFC] p-3 rounded-lg border border-[#DFE1E6] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#172B4D] text-xs">
                Final HR Verification Determination
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setOverallStatus("Verified")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border cursor-pointer transition ${
                    overallStatus === "Verified"
                      ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                      : "bg-white text-[#6B778C] border-[#DFE1E6]"
                  }`}
                >
                  Mark All Verified
                </button>
                <button
                  type="button"
                  onClick={() => setOverallStatus("Rejected")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border cursor-pointer transition ${
                    overallStatus === "Rejected"
                      ? "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                      : "bg-white text-[#6B778C] border-[#DFE1E6]"
                  }`}
                >
                  Reject Declaration
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="Official audit feedback for the employee..."
              className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-xs bg-white text-[#172B4D] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#F4F5F7] border-t border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#6B778C]">
            Verified Total: <strong className="text-[#00875A]">{formatCurrency(totalVerified)}</strong> / {formatCurrency(totalDeclared)} Declared
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-[#DFE1E6] rounded text-xs font-semibold text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAudit}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save size={13} />
              <span>{saving ? "Saving Verification..." : "Save & Finalize Verification"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxProofAuditModal;
