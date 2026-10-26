import { useState } from "react";
import { CheckCircle2, X, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { useAiAssistant } from "../../context/AiAssistantContext";

export default function AiActionCard({ draft }) {
  const { confirmAction, loading } = useAiAssistant();
  const [cancelled, setCancelled] = useState(false);

  if (!draft || cancelled) return null;

  const isLeave = draft.actionType === "apply_leave";
  const isPunch = draft.actionType === "punch_attendance";
  const isTicket = draft.actionType === "create_ticket";
  const isLoan = draft.actionType === "apply_loan";

  return (
    <div className="my-3 border-2 border-[#B3D4FF] bg-[#DEEBFF]/30 rounded-lg p-3 text-xs shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#B3D4FF]/60 mb-2.5">
        <div className="flex items-center gap-1.5 font-bold text-[#0747A6]">
          <ShieldCheck size={15} />
          <span>Workflow Confirmation Required</span>
        </div>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#0052CC] text-white">
          {draft.title || "Action Request"}
        </span>
      </div>

      {/* Parameter Details */}
      <div className="space-y-1.5 text-[#172B4D] mb-3">
        {isLeave && (
          <>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Leave Category:</span>
              <span className="font-semibold uppercase">{draft.leaveType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Duration:</span>
              <span className="font-semibold">
                {draft.daysCount} Day(s) ({draft.fromDate} to {draft.toDate})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Reason:</span>
              <span className="font-medium text-right max-w-[200px] truncate">{draft.reason}</span>
            </div>
          </>
        )}

        {isPunch && (
          <>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Swipe Direction:</span>
              <span className="font-bold text-[#0052CC]">{draft.type} (Clock {draft.type})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Punch Time:</span>
              <span className="font-semibold">{draft.time}</span>
            </div>
          </>
        )}

        {isTicket && (
          <>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Subject:</span>
              <span className="font-semibold">{draft.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Category:</span>
              <span>{draft.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Priority:</span>
              <span className="font-bold text-[#FF5630]">{draft.priority}</span>
            </div>
          </>
        )}

        {isLoan && (
          <>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Advance Amount:</span>
              <span className="font-bold text-[#0052CC]">₹{Number(draft.principalAmount).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B778C]">Monthly EMI:</span>
              <span className="font-semibold">₹{Number(draft.monthlyEmi).toLocaleString("en-IN")} ({draft.tenureMonths} Months)</span>
            </div>
          </>
        )}
      </div>

      <div className="p-2 bg-white rounded border border-[#B3D4FF] text-[11px] text-[#6B778C] flex items-start gap-1.5 mb-3">
        <AlertTriangle size={13} className="text-[#FFAB00] shrink-0 mt-0.5" />
        <span>This action will update live database records. Please review carefully before confirming.</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setCancelled(true)}
          disabled={loading}
          className="px-3 py-1.5 border border-[#DFE1E6] hover:bg-[#EBECF0] text-[#42526E] rounded font-medium transition cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => confirmAction(draft)}
          disabled={loading}
          className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <CheckCircle2 size={13} />
          <span>Confirm & Execute</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
