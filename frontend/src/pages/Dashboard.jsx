import DashboardLayout from "../layouts/DashboardLayout";

/**
 * TEMP: Role simulation
 * Later this will come from AuthContext / API
 */
const USER_ROLE = "Manager"; // "Employee" | "Manager"

function Dashboard() {
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500">
          Here’s what’s happening today
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <KpiCard title="Total Employees" value="42" />
        <KpiCard title="Present Today" value="36" />
        <KpiCard title="On Leave" value="4" />
        <KpiCard title="Late Arrivals" value="2" />
      </div>

      {/* MANAGER VIEW */}
      {USER_ROLE === "Manager" && (
        <div className="space-y-10">
          {/* Team Attendance */}
          <section>
            <SectionHeader
              title="Team Attendance Overview"
              subtitle="Real-time snapshot of your team"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Present" value="36" color="green" />
              <StatCard label="Absent" value="3" color="red" />
              <StatCard label="On Leave" value="4" color="yellow" />
              <StatCard label="Late" value="2" color="orange" />
            </div>
          </section>

          {/* Pending Leave Approvals */}
          <section>
            <SectionHeader
              title="Pending Leave Approvals"
              subtitle="Action required"
            />

            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left">Employee</th>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-left">Dates</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4">Rahul Sharma</td>
                    <td className="px-6 py-4">Sick</td>
                    <td className="px-6 py-4">12–13 Feb</td>
                    <td className="px-6 py-4 space-x-2">
                      <button className="px-3 py-1 text-xs bg-green-600 text-white rounded">
                        Approve
                      </button>
                      <button className="px-3 py-1 text-xs bg-red-600 text-white rounded">
                        Reject
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Manager Todos */}
          <section>
            <SectionHeader
              title="Manager Tasks"
              subtitle="Things you should not miss"
            />

            <TodoList
              todos={[
                "Approve pending leaves",
                "Review attendance anomalies",
                "Finalize weekly report",
              ]}
            />
          </section>
        </div>
      )}

      {/* EMPLOYEE VIEW */}
      {USER_ROLE === "Employee" && (
        <div className="space-y-10">
          {/* My Stats */}
          <section>
            <SectionHeader
              title="My Overview"
              subtitle="Your daily summary"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KpiCard title="My Attendance" value="Present" />
              <KpiCard title="Leave Balance" value="8 Days" />
              <KpiCard title="Pending Requests" value="1" />
            </div>
          </section>

          {/* My Todos */}
          <section>
            <SectionHeader
              title="My Tasks"
              subtitle="Stay on track"
            />
            <TodoList
              todos={[
                "Submit weekly report",
                "Update timesheet",
                "Apply leave for next week",
              ]}
            />
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Dashboard;

/* ---------- Reusable Components ---------- */

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {title}
      </h2>
      <p className="text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-1">
        {value}
      </p>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${colorMap[color]}`}
      >
        {value}
      </p>
    </div>
  );
}

function TodoList({ todos }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <ul className="space-y-3 text-sm text-gray-700">
        {todos.map((todo, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-1 w-2 h-2 bg-purple-600 rounded-full"></span>
            {todo}
          </li>
        ))}
      </ul>
    </div>
  );
}
