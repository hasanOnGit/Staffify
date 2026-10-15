function LeaveTable({ leaves = [], onApprove, onReject, onDelete }) {
  if (!Array.isArray(leaves) || leaves.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
        No leave requests found.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-6 py-3">S.No</th>
            <th className="px-6 py-3">Employee</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">From</th>
            <th className="px-6 py-3">To</th>
            <th className="px-6 py-3">Reason</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {leaves.map((leave, index) => (
            <tr key={leave.leaveId} className="hover:bg-gray-50">
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4 font-medium">
                {leave.employeeName}
              </td>
              <td className="px-6 py-4 capitalize">
                {leave.leaveType}
              </td>
              <td className="px-6 py-4">
                {leave.fromDate
                  ? new Date(leave.fromDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-6 py-4">
                {leave.toDate
                  ? new Date(leave.toDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-6 py-4">{leave.reason}</td>

              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    leave.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : leave.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {leave.status}
                </span>
              </td>

              <td className="px-6 py-4 space-x-2">
                {leave.status === "Pending" && (
                  <>
                    <button
                      onClick={() => onApprove(leave)}
                      className="text-green-600 text-xs hover:underline"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(leave)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => onDelete(leave.leaveId)}
                  className="text-gray-500 text-xs hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaveTable;
