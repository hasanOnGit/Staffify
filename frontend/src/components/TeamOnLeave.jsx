import { useEffect, useState } from "react";
import { getTeamOnLeave } from "../services/leave";
import { Users, UserX } from "lucide-react";

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
    <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden">
      <div className="p-3.5 border-b border-[#DFE1E6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#0052CC]" />
          <h3 className="font-semibold text-[#172B4D] text-xs">
            Colleagues on Leave Today
          </h3>
        </div>
        <span className="text-xs bg-[#DEEBFF] text-[#0747A6] font-semibold px-2 py-0.5 rounded border border-[#B3D4FF]">
          {teamMembers.length} Out of Office
        </span>
      </div>

      {loading ? (
        <div className="p-10 text-center text-[#6B778C] text-xs">
          Checking team availability...
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="p-10 text-center text-[#6B778C] text-xs">
          <UserX size={32} className="mx-auto mb-2 text-[#DFE1E6]" />
          <p className="font-semibold text-xs text-[#172B4D]">No one is on leave today</p>
          <p className="text-[11px] text-[#6B778C] mt-0.5">The whole team is present and active</p>
        </div>
      ) : (
        <div className="divide-y divide-[#DFE1E6]">
          {teamMembers.map((member) => (
            <div
              key={member._id}
              className="p-3.5 flex items-center justify-between hover:bg-[#F4F5F7] transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#DEEBFF] text-[#0052CC] font-bold flex items-center justify-center text-xs">
                  {member.employeeName?.slice(0, 2).toUpperCase() || "EM"}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#172B4D]">
                    {member.employeeName}
                  </h4>
                  <p className="text-[11px] text-[#6B778C] capitalize">
                    {member.leaveType} Leave {member.isHalfDay ? "(Half Day)" : ""}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-[#5E6C84] font-mono">
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
