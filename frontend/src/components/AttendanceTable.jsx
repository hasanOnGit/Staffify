import { useState } from "react";

function AttendanceTable({ records }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-6 py-3 text-left">Employee</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Check In</th>
            <th className="px-6 py-3 text-left">Check Out</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {records.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                No attendance records
              </td>
            </tr>
          ) : (
            records.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">
                  {row.employeeName}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>

                <td className="px-6 py-4">
                  {row.checkIn}
                </td>

                <td className="px-6 py-4">
                  {row.checkOut}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;

/* ---------- Status Badge ---------- */
function StatusBadge({ status }) {
  const map = {
    Present: "bg-green-100 text-green-700",
    Absent: "bg-red-100 text-red-700",
    Late: "bg-yellow-100 text-yellow-700",
    WFH: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}
