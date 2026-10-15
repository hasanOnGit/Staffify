import { useEffect, useState } from "react";
import { getTeamOnLeave } from "../services/leave";
import { Users, UserX, Calendar } from "lucide-react";

function TeamOnLeave() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const data = await getTeamOnLeave();
        setTeamMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch team on leave error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-purple-600" />
          <h3 className="font-semibold text-gray-800 text-sm">
            Colleagues on Leave Today
          </h3>
        </div>
        <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
          {teamMembers.length} Out of Office
        </span>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400 text-sm">
          Checking team availability...
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="p-10 text-center text-gray-400 text-sm">
          <UserX size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="font-medium text-gray-600">No one is on leave today!</p>
          <p className="text-xs text-gray-400 mt-0.5">The whole team is active</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {teamMembers.map((member) => (
            <div
              key={member._id}
              className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  {member.employeeName?.slice(0, 2).toUpperCase() || "EM"}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-800">
                    {member.employeeName}
                  </h4>
                  <p className="text-[11px] text-gray-400 capitalize">
                    {member.leaveType} Leave {member.isHalfDay ? "(Half Day)" : ""}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-gray-500 font-mono">
                <p>
                  Until{" "}
                  {new Date(member.toDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeamOnLeave;
