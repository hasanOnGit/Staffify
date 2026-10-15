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
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 shadow-xs">
        <Calendar size={36} className="mx-auto mb-2 text-gray-300" />
        <p className="font-semibold text-gray-700">No leave requests found</p>
        <p className="text-xs text-gray-400 mt-1">Applications will appear here once submitted</p>
      </div>
    );
  }

  const getLeaveTypeBadge = (type = "") => {
    const t = type.toLowerCase();
    const map = {
      earned: { label: "Earned Leave (EL)", color: "bg-blue-50 text-blue-700 border-blue-200" },
      casual: { label: "Casual Leave (CL)", color: "bg-purple-50 text-purple-700 border-purple-200" },
      sick: { label: "Sick Leave (SL)", color: "bg-rose-50 text-rose-700 border-rose-200" },
      paid: { label: "Paid Leave", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      halfday: { label: "Half Day", color: "bg-amber-50 text-amber-700 border-amber-200" },
      maternity: { label: "Maternity", color: "bg-pink-50 text-pink-700 border-pink-200" },
      paternity: { label: "Paternity", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
      lop: { label: "Loss of Pay (LOP)", color: "bg-gray-100 text-gray-700 border-gray-300" },
    };

    const style = map[t] || { label: type, color: "bg-gray-50 text-gray-700 border-gray-200" };

    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style.color}`}>
        {style.label}
      </span>
    );
  };

  const getStatusBadge = (status = "") => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <CheckCircle2 size={12} />
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <XCircle size={12} />
            Rejected
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <Ban size={12} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <AlertCircle size={12} />
            Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5 text-left">Employee</th>
              <th className="px-5 py-3.5 text-left">Leave Type</th>
              <th className="px-5 py-3.5 text-left">Duration</th>
              <th className="px-5 py-3.5 text-left">Dates</th>
              <th className="px-5 py-3.5 text-left">Reason</th>
              <th className="px-5 py-3.5 text-left">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {leaves.map((leave) => {
              const isOwner = currentUserId && leave.employeeId === currentUserId;
              const canCancel = (isOwner || isManager) && leave.status === "Pending";

              return (
                <tr key={leave.leaveId || leave._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800 leading-tight">
                      {leave.employeeName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{leave.employeeId}</p>
                  </td>

                  <td className="px-5 py-4">
                    {getLeaveTypeBadge(leave.leaveType)}
                  </td>

                  <td className="px-5 py-4 font-semibold text-gray-700">
                    {leave.daysCount} {leave.daysCount === 1 ? "Day" : "Days"}
                    {leave.isHalfDay && (
                      <span className="block text-[11px] font-normal text-amber-600">
                        {leave.halfDaySession}
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-xs font-mono text-gray-600">
                    <p>
                      {new Date(leave.fromDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      to{" "}
                      {new Date(leave.toDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </td>

                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-xs text-gray-700 truncate" title={leave.reason}>
                      {leave.reason}
                    </p>
                    {leave.rejectionReason && (
                      <p className="text-[11px] text-rose-600 mt-0.5 italic">
                        Remark: {leave.rejectionReason}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {getStatusBadge(leave.status)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Manager Approval Actions */}
                      {isManager && leave.status === "Pending" && (
                        <>
                          <button
                            onClick={() => onApprove(leave)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition shadow-2xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(leave)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium transition"
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
                          className="px-2.5 py-1 text-xs text-gray-500 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 rounded-md transition"
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
