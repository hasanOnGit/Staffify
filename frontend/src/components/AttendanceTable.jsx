import { useState } from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle, Eye, X, MapPin, Wifi, ShieldCheck } from "lucide-react";
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
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "-";
    }
  };

  return (
    <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-[#F4F5F7] text-[#6B778C] border-b border-[#DFE1E6] font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">First In</th>
              <th className="px-4 py-3 text-left">Last Out</th>
              <th className="px-4 py-3 text-left">Total Hours</th>
              <th className="px-4 py-3 text-left">Punch Swipes & Location</th>
              <th className="px-4 py-3 text-right">Regularize</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#DFE1E6]">
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center text-[#6B778C]">
                  <Clock size={32} className="mx-auto mb-2 text-[#DFE1E6]" />
                  <p className="font-semibold text-xs text-[#172B4D]">No attendance records for this date</p>
                  <p className="text-[11px] text-[#6B778C] mt-0.5">Clock in using the Web Clock-In button above to create a record</p>
                </td>
              </tr>
            ) : (
              records.map((row) => (
                <tr key={row._id || row.id} className="hover:bg-[#F4F5F7] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#172B4D]">{row.employeeName}</p>
                    <p className="text-[11px] text-[#6B778C]">{row.employeeId}</p>
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-[#172B4D]">
                    {formatTime(row.firstIn)}
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-[#172B4D]">
                    {formatTime(row.lastOut)}
                  </td>

                  <td className="px-4 py-3 font-semibold text-[#172B4D]">
                    {row.totalHours ? `${row.totalHours} hrs` : "-"}
                  </td>

                  <td className="px-4 py-3">
                    {row.punches && row.punches.length > 0 ? (
                      <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelectedPunches(row)}
                            className="flex items-center gap-1 text-[11px] text-[#0052CC] hover:text-[#0747A6] font-medium bg-[#DEEBFF] hover:bg-[#B3D4FF]/40 px-2 py-0.5 rounded border border-[#B3D4FF] transition cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>{row.punches.length} swipes</span>
                          </button>
                          {(row.ipAddress || row.punches[row.punches.length - 1]?.ipAddress) && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6]"
                              title={`Verified Network IP: ${row.ipAddress || row.punches[row.punches.length - 1]?.ipAddress}`}
                            >
                              <Wifi size={9} className="text-[#0052CC]" />
                              <span>{row.ipAddress || row.punches[row.punches.length - 1]?.ipAddress}</span>
                            </span>
                          )}
                        </div>
                        {row.punches[row.punches.length - 1]?.location?.zoneName && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                              row.punches[row.punches.length - 1].location.isWithinGeofence
                                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                                : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                            }`}
                          >
                            <MapPin size={9} />
                            <span className="truncate max-w-[120px]">
                              {row.punches[row.punches.length - 1].location.zoneName}
                            </span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#6B778C]">No swipes</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {row.regularization?.status === "Pending" ? (
                      isManager ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReviewRegularize(row._id, "Approved")}
                            disabled={actionLoading}
                            className="p-1 text-[#00875A] hover:bg-[#E3FCEF] rounded cursor-pointer"
                            title="Approve Regularization"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => handleReviewRegularize(row._id, "Rejected")}
                            disabled={actionLoading}
                            className="p-1 text-[#DE350B] hover:bg-[#FFEBE6] rounded cursor-pointer"
                            title="Reject Regularization"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#172B4D] bg-[#FFF0B3] px-2 py-0.5 rounded border border-[#FFE380]">
                          <AlertCircle size={11} />
                          Req Pending
                        </span>
                      )
                    ) : row.regularization?.status === "Approved" ? (
                      <span className="text-[11px] text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded border border-[#ABF5D1]">
                        Regularized
                      </span>
                    ) : (
                      <span className="text-xs text-[#6B778C]">-</span>
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
          <div className="bg-white rounded max-w-lg w-full p-5 shadow-lg border border-[#DFE1E6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE1E6]">
              <div>
                <h3 className="text-sm font-semibold text-[#172B4D]">
                  Swipe Audit & Location Logs — {selectedPunches.employeeName}
                </h3>
                <p className="text-[11px] text-[#6B778C]">Date: {selectedPunches.date}</p>
              </div>
              <button
                onClick={() => setSelectedPunches(null)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-3.5 space-y-2.5 max-h-80 overflow-y-auto">
              {selectedPunches.punches.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-[#F4F5F7] border border-[#DFE1E6] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                          p.type === "IN"
                            ? "bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]"
                            : "bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD]"
                        }`}
                      >
                        {p.type}
                      </span>
                      <span className="font-mono text-[#172B4D] font-semibold text-xs">
                        {formatTime(p.time)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border bg-white text-[#172B4D] border-[#DFE1E6]"
                        title={p.networkType || "Verified Network IP"}
                      >
                        <Wifi size={10} className="text-[#0052CC]" />
                        <span>{p.ipAddress || selectedPunches.ipAddress || "127.0.0.1"}</span>
                        {p.ipVerified !== false && (
                          <ShieldCheck size={10} className="text-[#00875A]" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Geofence & Network details */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#DFE1E6]/60 text-[11px] text-[#6B778C]">
                    <div className="flex items-center gap-1">
                      {p.location ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${
                            p.location.isWithinGeofence
                              ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                              : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                          }`}
                          title={`GPS: ${p.location.latitude?.toFixed(4)}, ${p.location.longitude?.toFixed(4)}`}
                        >
                          <MapPin size={10} />
                          <span>{p.location.zoneName || "Office Perimeter"}</span>
                          <span className="font-mono">
                            ({p.location.distanceMeters < 1000
                              ? `${p.location.distanceMeters}m`
                              : `${(p.location.distanceMeters / 1000).toFixed(1)}km`})
                          </span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6B778C]">Standard GPS Swipe</span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-[#42526E]">
                      {p.networkType || "Office Localhost / Corporate Gateway"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#DFE1E6] flex justify-end">
              <button
                onClick={() => setSelectedPunches(null)}
                className="px-3.5 py-1.5 bg-[#F4F5F7] text-[#172B4D] border border-[#DFE1E6] rounded text-xs font-medium hover:bg-[#EBECF0] transition cursor-pointer"
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
    Present: "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]",
    Absent: "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]",
    Late: "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]",
    WFH: "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]",
    "Half Day": "bg-[#EAE6FF] text-[#403294] border-[#C0B6F2]",
    "On Leave": "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]",
  };

  const style = map[status] || "bg-[#F4F5F7] text-[#172B4D] border-[#DFE1E6]";

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${style}`}>
      {status || "Present"}
    </span>
  );
}
