import { useState } from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle, Eye } from "lucide-react";
import { reviewRegularization } from "../services/attendance";
import toast from "react-hot-toast";

function AttendanceTable({ records, isManager, onRefresh }) {
  const [selectedPunches, setSelectedPunches] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleReviewRegularize = async (attendanceId, status) => {
    setActionLoading(true);
    try {
      await reviewRegularization({
        attendanceId,
        status,
        approvedBy: "Manager",
      });
      toast.success(`Regularization ${status.toLowerCase()} successfully`);
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Failed to review regularization request");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5 text-left">Employee</th>
              <th className="px-6 py-3.5 text-left">Status</th>
              <th className="px-6 py-3.5 text-left">First In</th>
              <th className="px-6 py-3.5 text-left">Last Out</th>
              <th className="px-6 py-3.5 text-left">Total Hours</th>
              <th className="px-6 py-3.5 text-left">Swipes</th>
              <th className="px-6 py-3.5 text-right">Regularization</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                  <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-medium text-gray-600">No attendance records for this date</p>
                  <p className="text-xs text-gray-400 mt-1">Clock in using the Web Clock-In button above to create a record</p>
                </td>
              </tr>
            ) : (
              records.map((row) => (
                <tr key={row._id || row.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{row.employeeName}</p>
                    <p className="text-xs text-gray-400">{row.employeeId}</p>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-gray-700">
                    {formatTime(row.firstIn)}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-gray-700">
                    {formatTime(row.lastOut)}
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-700">
                    {row.totalHours ? `${row.totalHours} hrs` : "-"}
                  </td>

                  <td className="px-6 py-4">
                    {row.punches && row.punches.length > 0 ? (
                      <button
                        onClick={() => setSelectedPunches(row)}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition"
                      >
                        <Eye size={13} />
                        <span>{row.punches.length} swipes</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">No swipes</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {row.regularization?.status === "Pending" ? (
                      isManager ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReviewRegularize(row._id, "Approved")}
                            disabled={actionLoading}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Approve Regularization"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => handleReviewRegularize(row._id, "Rejected")}
                            disabled={actionLoading}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Reject Regularization"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle size={12} />
                          Req Pending
                        </span>
                      )
                    ) : row.regularization?.status === "Approved" ? (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Regularized
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Punch Swipes Modal */}
      {selectedPunches && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  Swipe Logs — {selectedPunches.employeeName}
                </h3>
                <p className="text-xs text-gray-400">Date: {selectedPunches.date}</p>
              </div>
              <button
                onClick={() => setSelectedPunches(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2.5 max-h-60 overflow-y-auto">
              {selectedPunches.punches.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        p.type === "IN"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {p.type}
                    </span>
                    <span className="font-mono text-gray-700 font-medium">
                      {p.timeStr || formatTime(p.time)}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px]">
                    Swipe #{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedPunches(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceTable;

/* ---------- Status Badge ---------- */
function StatusBadge({ status }) {
  const map = {
    Present: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Absent: "bg-rose-50 text-rose-700 border-rose-200",
    Late: "bg-amber-50 text-amber-700 border-amber-200",
    WFH: "bg-blue-50 text-blue-700 border-blue-200",
    "Half Day": "bg-purple-50 text-purple-700 border-purple-200",
    "On Leave": "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  const style = map[status] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {status || "Present"}
    </span>
  );
}
