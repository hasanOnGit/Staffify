import { CheckCircle2, XCircle, AlertCircle, Calendar, Ban } from "lucide-react";

function LeaveTable({
  leaves = [],
  isManager = false,
  currentUserId,
  onApprove,
  onReject,
  onCancel,
  actionLoading = false,
}) {
  if (!Array.isArray(leaves) || leaves.length === 0) {
    return (
      <div className="bg-white border border-[#DFE1E6] rounded p-10 text-center text-[#6B778C]">
        <Calendar size={32} className="mx-auto mb-2 text-[#DFE1E6]" />
        <p className="font-semibold text-xs text-[#172B4D]">No leave requests found</p>
        <p className="text-[11px] text-[#6B778C] mt-0.5">Applications will appear here once submitted</p>
      </div>
    );
  }

  const getLeaveTypeBadge = (type = "") => {
    const t = type.toLowerCase();
    const map = {
      earned: { label: "Earned Leave (EL)", color: "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]" },
      casual: { label: "Casual Leave (CL)", color: "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]" },
      sick: { label: "Sick Leave (SL)", color: "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]" },
      paid: { label: "Paid Leave", color: "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]" },
      halfday: { label: "Half Day", color: "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]" },
      maternity: { label: "Maternity", color: "bg-[#EAE6FF] text-[#403294] border-[#C0B6F2]" },
      paternity: { label: "Paternity", color: "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]" },
      lop: { label: "Loss of Pay (LOP)", color: "bg-[#F4F5F7] text-[#172B4D] border-[#DFE1E6]" },
    };

    const style = map[t] || { label: type, color: "bg-[#F4F5F7] text-[#172B4D] border-[#DFE1E6]" };

    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${style.color}`}>
        {style.label}
      </span>
    );
  };

  const getStatusBadge = (status = "") => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1] px-2 py-0.5 rounded text-[11px] font-semibold">
            <CheckCircle2 size={11} />
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD] px-2 py-0.5 rounded text-[11px] font-semibold">
            <XCircle size={11} />
            Rejected
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 bg-[#F4F5F7] text-[#6B778C] border border-[#DFE1E6] px-2 py-0.5 rounded text-[11px] font-semibold">
            <Ban size={11} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380] px-2 py-0.5 rounded text-[11px] font-semibold">
            <AlertCircle size={11} />
            Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-[#F4F5F7] text-[#6B778C] border-b border-[#DFE1E6] font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Leave Type</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Dates</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#DFE1E6]">
            {leaves.map((leave) => {
              const isOwner = currentUserId && leave.employeeId === currentUserId;
              const canCancel = (isOwner || isManager) && leave.status === "Pending";

              return (
                <tr key={leave.leaveId || leave._id} className="hover:bg-[#F4F5F7] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#172B4D] leading-tight">
                      {leave.employeeName}
                    </p>
                    <p className="text-[11px] text-[#6B778C] mt-0.5">{leave.employeeId}</p>
                  </td>

                  <td className="px-4 py-3">
                    {getLeaveTypeBadge(leave.leaveType)}
                  </td>

                  <td className="px-4 py-3 font-semibold text-[#172B4D]">
                    {leave.daysCount} {leave.daysCount === 1 ? "Day" : "Days"}
                    {leave.isHalfDay && (
                      <span className="block text-[10px] font-normal text-[#FF991F]">
                        {leave.halfDaySession}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-[11px] font-mono text-[#5E6C84]">
                    <p>
                      {new Date(leave.fromDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-[#6B778C] text-[10px]">
                      to{" "}
                      {new Date(leave.toDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </td>

                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs text-[#172B4D] truncate" title={leave.reason}>
                      {leave.reason}
                    </p>
                    {leave.rejectionReason && (
                      <p className="text-[10px] text-[#DE350B] mt-0.5 italic">
                        Remark: {leave.rejectionReason}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {getStatusBadge(leave.status)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Manager Approval Actions */}
                      {isManager && leave.status === "Pending" && (
                        <>
                          <button
                            onClick={() => onApprove(leave)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-medium transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(leave)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-[#FFEBE6] hover:bg-[#FFD2CC] text-[#DE350B] border border-[#FFBDAD] rounded text-xs font-medium transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Employee Cancel / Withdraw */}
                      {canCancel && onCancel && (
                        <button
                          onClick={() => onCancel(leave.leaveId)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 text-xs text-[#6B778C] hover:text-[#DE350B] hover:bg-[#FFEBE6] border border-[#DFE1E6] rounded transition cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveTable;
