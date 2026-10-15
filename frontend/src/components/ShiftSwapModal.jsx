import { useState, useEffect } from "react";
import { ArrowLeftRight, Calendar, User, Clock, X, AlertCircle } from "lucide-react";

function ShiftSwapModal({ isOpen, onClose, onSave, currentUser, employees = [], shifts = [] }) {
  const [requesterDate, setRequesterDate] = useState("");
  const [requesterShift, setRequesterShift] = useState("GS");
  const [peerId, setPeerId] = useState("");
  const [peerDate, setPeerDate] = useState("");
  const [peerShift, setPeerShift] = useState("GS");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setRequesterDate(today);
    setPeerDate(today);
    setRequesterShift("GS");
    setPeerShift("MS");
    setReason("");

    // Choose first eligible peer
    const firstPeer = employees.find((e) => e.employeeId !== currentUser?.employeeId);
    if (firstPeer) {
      setPeerId(firstPeer.employeeId);
    }
  }, [isOpen, currentUser, employees]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const eligiblePeers = employees.filter((e) => e.employeeId !== currentUser?.employeeId);
  const selectedPeerObj = employees.find((e) => e.employeeId === peerId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!peerId || !requesterDate || !peerDate) return;

    onSave({
      requesterId: currentUser?.employeeId,
      requesterName: currentUser?.name,
      requesterDate,
      requesterShift,
      peerId,
      peerName: selectedPeerObj?.name || "Peer Employee",
      peerDate,
      peerShift,
      reason,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#6554C0] text-white flex items-center justify-center">
              <ArrowLeftRight size={14} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm">Request Shift Swap</h3>
              <p className="text-[11px] text-[#6B778C]">
                Exchange a scheduled shift date with an eligible squad member
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Swap Comparison Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FAFBFC] border border-[#EBECF0] rounded-md">
            {/* Requester (You) */}
            <div className="space-y-2">
              <span className="font-bold text-[#172B4D] block uppercase tracking-wider text-[10px]">
                Your Shift to Give Up
              </span>
              <div>
                <label className="text-[#6B778C] block mb-1">Your Date</label>
                <input
                  type="date"
                  required
                  value={requesterDate}
                  onChange={(e) => setRequesterDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
                />
              </div>

              <div>
                <label className="text-[#6B778C] block mb-1">Your Current Shift</label>
                <select
                  value={requesterShift}
                  onChange={(e) => setRequesterShift(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
                >
                  {shifts.map((s) => (
                    <option key={s.shiftCode} value={s.shiftCode}>
                      [{s.shiftCode}] {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Peer */}
            <div className="space-y-2">
              <span className="font-bold text-[#172B4D] block uppercase tracking-wider text-[10px]">
                Target Peer Shift to Receive
              </span>
              <div>
                <label className="text-[#6B778C] block mb-1">Select Peer</label>
                <select
                  value={peerId}
                  onChange={(e) => setPeerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
                >
                  {eligiblePeers.map((p) => (
                    <option key={p.employeeId} value={p.employeeId}>
                      {p.name} ({p.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#6B778C] block mb-1">Peer Date</label>
                <input
                  type="date"
                  required
                  value={peerDate}
                  onChange={(e) => setPeerDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
                />
              </div>

              <div>
                <label className="text-[#6B778C] block mb-1">Peer Shift Type</label>
                <select
                  value={peerShift}
                  onChange={(e) => setPeerShift(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
                >
                  {shifts.map((s) => (
                    <option key={s.shiftCode} value={s.shiftCode}>
                      [{s.shiftCode}] {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">
              Reason for Shift Exchange
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Personal family emergency on Thursday; agreeing to cover Saturday morning shift..."
              className="w-full px-3 py-2 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] placeholder:text-[#A5ADBA] leading-relaxed resize-none"
            />
          </div>

          <div className="p-2.5 rounded bg-[#DEEBFF]/30 border border-[#B3D4FF] text-[11px] text-[#0747A6] flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>
              Once submitted, your shift swap will be routed to your squad manager for review. Upon approval, both schedules update automatically in the Roster.
            </span>
          </div>

          {/* Sticky Form Action Footer */}
          <div className="pt-3 border-t border-[#DFE1E6] flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E] font-medium rounded text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition shadow-sm cursor-pointer"
            >
              Submit Swap Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShiftSwapModal;
