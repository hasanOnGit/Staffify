import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
} from "../services/leave";
import LeaveTable from "../components/LeaveTable";

/* ===============================
   Helper: derive display name
=============================== */
const getNameFromEmail = (email) => {
  if (!email) return "User";
  return email
    .split("@")[0]
    .split(/[._-]/)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};

/* ===============================
   Normalize API data
=============================== */
const normalizeLeaves = (rawLeaves = []) =>
  rawLeaves.map((leave) => ({
    _id: leave._id,
    leaveId: leave.leaveId || leave._id,
    employeeName: leave.employeeName || "Unknown",
    leaveType: (leave.leaveType || "paid").toLowerCase(),
    fromDate: leave.fromDate || null,
    toDate: leave.toDate || null,
    reason: leave.reason || "-",
    status: leave.status || "Pending",
    createdAt: leave.createdAt,
  }));

function Leaves() {
  const { user } = useAuth();
  const employeeName = user?.name || getNameFromEmail(user?.email);

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const initialForm = {
    leaveType: "paid",
    fromDate: "",
    toDate: "",
    reason: "",
  };

  const [formData, setFormData] = useState(initialForm);

  /* =============================
     FETCH LEAVES
  ============================= */
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const rawLeaves = await getLeaves(); // ✅ ARRAY directly
      const normalized = normalizeLeaves(rawLeaves);

      setLeaves(normalized);
    } catch (err) {
      console.error("Fetch Leaves Error:", err);
      setError("Unable to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  /* =============================
     INPUT HANDLER
  ============================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* =============================
     APPLY LEAVE
  ============================= */
  const handleApplyLeave = async () => {
    if (!formData.fromDate || !formData.toDate) {
      alert("Please select From and To dates");
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      alert("From date cannot be after To date");
      return;
    }

    try {
      setActionLoading(true);

      await createLeave({
        employeeId: user?.userId,
        employeeName,
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
      });

      await fetchLeaves();
      setShowForm(false);
      setFormData(initialForm);
    } catch {
      setError("Failed to apply leave");
    } finally {
      setActionLoading(false);
    }
  };

  /* =============================
     APPROVE / REJECT / DELETE
  ============================= */
  const handleApprove = async (leave) => {
    setActionLoading(true);
    await updateLeave(leave.leaveId, "Approved", employeeName);
    await fetchLeaves();
    setActionLoading(false);
  };

  const handleReject = async (leave) => {
    setActionLoading(true);
    await updateLeave(leave.leaveId, "Rejected", employeeName);
    await fetchLeaves();
    setActionLoading(false);
  };

  const handleDelete = async (leaveId) => {
    if (!window.confirm("Delete this leave request?")) return;
    setActionLoading(true);
    await deleteLeave(leaveId);
    await fetchLeaves();
    setActionLoading(false);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Leave Management</h1>
          <p className="text-sm text-gray-500">
            Apply and manage leave requests
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
        >
          {showForm ? "Close" : "Apply Leave"}
        </button>
      </div>

      {/* Apply Form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Apply Leave</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={employeeName}
              disabled
              className="border rounded-md px-3 py-2 bg-gray-100"
            />

            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
            >
              <option value="paid">Paid Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
            </select>

            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
            />

            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
            />

            <input
              name="reason"
              placeholder="Reason"
              value={formData.reason}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 md:col-span-2"
            />
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="border px-4 py-2 rounded-md"
            >
              Cancel
            </button>

            <button
              onClick={handleApplyLeave}
              disabled={actionLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md"
            >
              {actionLoading ? "Processing..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading leave requests...
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <LeaveTable
          leaves={leaves}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}
    </DashboardLayout>
  );
}

export default Leaves;
