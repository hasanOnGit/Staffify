import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import AttendanceTable from "../components/AttendanceTable";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [statusFilter, setStatusFilter] = useState("All");

  // TEMP DATA (replace with API later)
  useEffect(() => {
    setAttendance([
      {
        id: 1,
        employeeName: "Rahul Sharma",
        status: "Present",
        checkIn: "09:10",
        checkOut: "18:05",
      },
      {
        id: 2,
        employeeName: "Pooja Verma",
        status: "Late",
        checkIn: "10:05",
        checkOut: "18:00",
      },
      {
        id: 3,
        employeeName: "Amit Kumar",
        status: "Absent",
        checkIn: "-",
        checkOut: "-",
      },
    ]);
  }, [selectedDate]);

  /* ---------- Calculations ---------- */
  const summary = useMemo(() => {
    return {
      Present: attendance.filter((a) => a.status === "Present").length,
      Absent: attendance.filter((a) => a.status === "Absent").length,
      Late: attendance.filter((a) => a.status === "Late").length,
      WFH: attendance.filter((a) => a.status === "WFH").length,
    };
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    if (statusFilter === "All") return attendance;
    return attendance.filter((a) => a.status === statusFilter);
  }, [attendance, statusFilter]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Attendance
          </h1>
          <p className="text-sm text-gray-500">
            Daily attendance overview
          </p>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Present" value={summary.Present} color="green" />
        <SummaryCard title="Absent" value={summary.Absent} color="red" />
        <SummaryCard title="Late" value={summary.Late} color="yellow" />
        <SummaryCard title="WFH" value={summary.WFH} color="blue" />
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Attendance Records
        </h2>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="All">All</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="WFH">WFH</option>
        </select>
      </div>

      {/* Table */}
      <AttendanceTable records={filteredAttendance} />
    </DashboardLayout>
  );
}

export default Attendance;

/* ---------- Summary Card ---------- */
function SummaryCard({ title, value, color }) {
  const colorMap = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-medium ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  );
}
