import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import TeamMembersTable from "../components/TeamMembersTable";

function TeamDetails() {
  /**
   * TEMP DATA
   * Later this will come from API using teamId from route params
   */
  const [team] = useState({
    id: 1,
    name: "Frontend Team",
    description: "Handles UI and frontend architecture",
    managers: [
      { id: 1, name: "Amit Kumar", email: "amit@company.com" },
      { id: 2, name: "Neha Singh", email: "neha@company.com" },
    ],
  });

  const [members, setMembers] = useState([
    {
      id: 11,
      name: "Rahul Sharma",
      email: "rahul@company.com",
      role: "Developer",
      status: "Active",
    },
    {
      id: 12,
      name: "Pooja Verma",
      email: "pooja@company.com",
      role: "QA",
      status: "Active",
    },
  ]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          {team.name}
        </h1>
        <p className="text-sm text-gray-500">
          {team.description}
        </p>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard label="Managers" value={team.managers.length} />
        <SummaryCard label="Members" value={members.length} />
        <SummaryCard label="Status" value="Active" />
      </div>

      {/* Managers */}
      <section className="mb-10">
        <SectionHeader
          title="Team Managers"
          subtitle="Managers responsible for this team"
        />

        <div className="bg-white border rounded-xl p-6">
          <ul className="space-y-3">
            {team.managers.map((manager) => (
              <li
                key={manager.id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {manager.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {manager.email}
                  </p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  Manager
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team Members */}
      <section>
        <SectionHeader
          title="Team Members"
          subtitle="Employees assigned to this team"
        />

        <TeamMembersTable
          members={members}
          onRemove={(id) =>
            setMembers((prev) => prev.filter((m) => m.id !== id))
          }
        />
      </section>
    </DashboardLayout>
  );
}

export default TeamDetails;

/* ---------- Reusable UI Blocks ---------- */

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

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-1">
        {value}
      </p>
    </div>
  );
}
