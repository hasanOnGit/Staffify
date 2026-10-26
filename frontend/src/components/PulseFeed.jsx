import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getBroadcasts,
  createBroadcast,
  acknowledgeBroadcast,
  getKudos,
  giveKudos,
  likeKudos,
  getMilestones,
} from "../services/pulse";
import { getEmployees } from "../services/employee";
import toast from "react-hot-toast";
import {
  Megaphone,
  Award,
  Sparkles,
  Heart,
  Calendar,
  Cake,
  Pin,
  CheckCircle2,
  Plus,
  Send,
  X,
  User,
  Users,
  ShieldCheck,
  Building2,
  Tag,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";

const KUDOS_BADGES = [
  "Problem Solver",
  "Team Player",
  "Rockstar",
  "Customer Hero",
  "Innovator",
  "Leadership Champion",
];

function PulseFeed() {
  const { user, isAdmin } = useAuth();
  const [broadcasts, setBroadcasts] = useState([]);
  const [kudosList, setKudosList] = useState([]);
  const [milestones, setMilestones] = useState({
    birthdays: [],
    anniversaries: [],
    newJoiners: [],
  });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showKudosModal, setShowKudosModal] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Form states
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    category: "Announcement",
    content: "",
    pinned: false,
    acknowledgementRequired: false,
  });

  const [kudosForm, setKudosForm] = useState({
    toEmployeeId: "",
    badge: "Problem Solver",
    message: "",
  });

  const loadPulse = async () => {
    try {
      setLoading(true);
      const [bRes, kRes, mRes] = await Promise.all([
        getBroadcasts(),
        getKudos(),
        getMilestones(),
      ]);
      if (bRes.success) setBroadcasts(bRes.data || []);
      if (kRes.success) setKudosList(kRes.data || []);
      if (mRes.success) setMilestones(mRes.data || { birthdays: [], anniversaries: [], newJoiners: [] });
    } catch (err) {
      console.error("Pulse load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPulse();
  }, []);

  const handleOpenKudos = async () => {
    try {
      const emps = await getEmployees();
      setEmployees(Array.isArray(emps) ? emps : []);
      if (emps?.length > 0) {
        setKudosForm((prev) => ({
          ...prev,
          toEmployeeId: emps[0].employeeId,
        }));
      }
      setShowKudosModal(true);
    } catch (err) {
      toast.error("Failed to load staff list");
    }
  };

  const handleAcknowledge = async (broadcastId) => {
    try {
      const empId = user?.employeeId || user?.userId;
      const res = await acknowledgeBroadcast(broadcastId, { employeeId: empId });
      if (res.success) {
        toast.success("Policy acknowledged");
        loadPulse();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Acknowledgement failed");
    }
  };

  const handleLikeKudos = async (kudosId) => {
    try {
      const empId = user?.employeeId || user?.userId;
      const res = await likeKudos(kudosId, { employeeId: empId });
      if (res.success) {
        loadPulse();
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.content.trim()) {
      toast.error("Please fill title and content");
      return;
    }
    try {
      const res = await createBroadcast({
        ...broadcastForm,
        publishedBy: user?.name || "Admin User",
        publishedRole: user?.role || "Management",
      });
      if (res.success) {
        toast.success("Broadcast published to Company Pulse!");
        setShowBroadcastModal(false);
        setBroadcastForm({
          title: "",
          category: "Announcement",
          content: "",
          pinned: false,
          acknowledgementRequired: false,
        });
        loadPulse();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Broadcast creation failed");
    }
  };

  const handleSendKudos = async (e) => {
    e.preventDefault();
    if (!kudosForm.message.trim()) {
      toast.error("Please add an appreciation message");
      return;
    }
    const targetEmp = employees.find((e) => e.employeeId === kudosForm.toEmployeeId);
    try {
      const res = await giveKudos({
        fromEmployeeId: user?.employeeId || user?.userId || "EMP-DEV-03",
        fromEmployeeName: user?.name || "Colleague",
        toEmployeeId: kudosForm.toEmployeeId,
        toEmployeeName: targetEmp?.name || "Colleague",
        badge: kudosForm.badge,
        message: kudosForm.message.trim(),
      });
      if (res.success) {
        toast.success(`Kudos sent to ${targetEmp?.name || "Colleague"}!`);
        setShowKudosModal(false);
        setKudosForm({ toEmployeeId: "", badge: "Problem Solver", message: "" });
        loadPulse();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to give kudos");
    }
  };

  return (
    <div className="space-y-6">
      {/* Pulse Header & Action Buttons */}
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-sm flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#4C9AFF] border border-[#B3D4FF] dark:border-[#263042]">
            <Sparkles size={18} />
          </span>
          <div>
            <h3 className="font-bold text-sm text-[#172B4D] dark:text-neutral-100">Company Pulse & Community</h3>
            <p className="text-xs text-[#6B778C] dark:text-neutral-400">Corporate announcements, peer appreciation & team milestones</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenKudos}
            className="px-3 py-1.5 bg-gradient-to-r from-[#0052CC] to-[#0747A6] hover:opacity-95 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <Award size={13} />
            <span>Give Kudos</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowBroadcastModal(true)}
              className="px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#1C2331] hover:bg-[#EBECF0] dark:hover:bg-[#263042] text-[#172B4D] dark:text-neutral-100 border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Megaphone size={13} className="text-[#0052CC] dark:text-[#4C9AFF]" />
              <span>Broadcast</span>
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Announcements Stream */}
      <div className="space-y-3">
        {broadcasts.map((b) => {
          const empId = user?.employeeId || user?.userId;
          const isAcked = b.acknowledgedBy?.some((a) => a.employeeId === empId);

          return (
            <div
              key={b._id || b.broadcastId}
              className={`bg-white dark:bg-[#151B26] border rounded-xl p-4 shadow-sm transition-all duration-150 ${
                b.pinned
                  ? "border-[#0052CC]/40 dark:border-[#0052CC]/60 bg-gradient-to-r from-[#DEEBFF]/15 via-white to-white dark:from-[#1C2331]/40 dark:via-[#151B26] dark:to-[#151B26]"
                  : "border-[#DFE1E6] dark:border-[#263042]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {b.pinned && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                        <Pin size={10} className="fill-[#0052CC]" />
                        <span>Pinned</span>
                      </span>
                    )}

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F4F5F7] text-[#42526E] border border-[#DFE1E6]">
                      {b.category?.replace("_", " ")}
                    </span>

                    <span className="text-[10px] text-[#6B778C]">
                      By {b.publishedBy} • {new Date(b.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#172B4D] mt-1">{b.title}</h4>
                  <p className="text-xs text-[#42526E] leading-relaxed mt-1">{b.content}</p>
                </div>

                {b.acknowledgementRequired && (
                  <div className="shrink-0">
                    {isAcked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                        <CheckCircle2 size={13} />
                        <span>Acknowledged</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(b._id || b.broadcastId)}
                        className="px-3 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Acknowledge Policy</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Grid: Peer Kudos Feed & Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Peer Kudos Wall */}
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-[#172B4D] uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-[#0052CC]" />
              <span>Peer Recognition Wall</span>
            </h4>
            <span className="text-[11px] text-[#6B778C]">Celebrating company values</span>
          </div>

          <div className="space-y-3">
            {kudosList.length > 0 ? (
              kudosList.map((k) => {
                const empId = user?.employeeId || user?.userId;
                const hasLiked = k.likedBy?.includes(empId);

                return (
                  <div
                    key={k._id || k.kudosId}
                    className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm hover:border-[#0052CC]/40 transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center font-bold text-xs">
                          {k.toEmployeeName ? k.toEmployeeName[0] : "C"}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-[#172B4D]">
                            {k.toEmployeeName}
                          </p>
                          <span className="text-[10px] text-[#6B778C]">
                            from {k.fromEmployeeName}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2] flex items-center gap-1">
                        <Sparkles size={10} />
                        <span>{k.badge}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#344563] bg-[#FAFBFC] p-3 rounded-lg border border-[#F4F5F7] italic">
                      "{k.message}"
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-[#6B778C]">
                      <span>
                        {new Date(k.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleLikeKudos(k._id || k.kudosId)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                          hasLiked
                            ? "bg-[#FFEBE6] text-[#DE350B] font-bold"
                            : "hover:bg-[#F4F5F7] text-[#6B778C]"
                        }`}
                      >
                        <Heart
                          size={13}
                          className={hasLiked ? "fill-[#DE350B] text-[#DE350B]" : ""}
                        />
                        <span>{k.likesCount || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-[#DFE1E6] rounded-xl p-8 text-center text-xs text-[#6B778C]">
                No recognition posts yet. Be the first to give kudos to a teammate!
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Milestones Widget */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-bold text-xs text-[#172B4D] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-[#0052CC]" />
            <span>Upcoming Milestones</span>
          </h4>

          {/* Work Anniversaries */}
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm space-y-2.5">
            <span className="text-[10px] font-bold text-[#0052CC] uppercase tracking-wider block">
              Work Anniversaries
            </span>
            {milestones.anniversaries?.length > 0 ? (
              milestones.anniversaries.map((ann, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#F4F5F7] last:border-0">
                  <div>
                    <p className="font-semibold text-[#172B4D]">{ann.name}</p>
                    <p className="text-[10px] text-[#6B778C]">{ann.department}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded border border-[#ABF5D1]">
                    {ann.years} Year{ann.years > 1 ? "s" : ""}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-[#6B778C]">No anniversaries this month.</p>
            )}
          </div>

          {/* New Joiners */}
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm space-y-2.5">
            <span className="text-[10px] font-bold text-[#00875A] uppercase tracking-wider block">
              Welcome New Teammates
            </span>
            {milestones.newJoiners?.length > 0 ? (
              milestones.newJoiners.map((nj, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#F4F5F7] last:border-0">
                  <div>
                    <p className="font-semibold text-[#172B4D]">{nj.name}</p>
                    <p className="text-[10px] text-[#6B778C]">{nj.designation}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B778C]">{nj.joinedOn}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-[#6B778C]">No recent joiners.</p>
            )}
          </div>
        </div>
      </div>

      {/* Give Kudos Modal */}
      {showKudosModal && (
        <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#EAE6FF] text-[#403294]">
                  <Award size={18} />
                </span>
                <h3 className="font-bold text-sm text-[#172B4D]">Send Peer Kudos</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKudosModal(false)}
                className="text-[#6B778C] hover:text-[#172B4D]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendKudos} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">
                  Recipient Teammate *
                </label>
                <select
                  required
                  value={kudosForm.toEmployeeId}
                  onChange={(e) => setKudosForm({ ...kudosForm, toEmployeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Recognition Badge *</label>
                <select
                  value={kudosForm.badge}
                  onChange={(e) => setKudosForm({ ...kudosForm, badge: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] font-semibold text-[#0052CC]"
                >
                  {KUDOS_BADGES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Appreciation Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share how this colleague inspired, solved a blocker, or exemplified excellence..."
                  value={kudosForm.message}
                  onChange={(e) => setKudosForm({ ...kudosForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKudosModal(false)}
                  className="px-3 py-1.5 border border-[#DFE1E6] rounded-lg text-[#42526E] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Send Appreciation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#DEEBFF] text-[#0052CC]">
                  <Megaphone size={18} />
                </span>
                <h3 className="font-bold text-sm text-[#172B4D]">New Corporate Broadcast</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="text-[#6B778C] hover:text-[#172B4D]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Broadcast Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Company All-Hands & Strategy Meeting"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Category *</label>
                <select
                  value={broadcastForm.category}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC]"
                >
                  <option value="Announcement">General Announcement</option>
                  <option value="Policy_Update">Policy Update (Compliance)</option>
                  <option value="Event">Corporate Event / Townhall</option>
                  <option value="Celebration">Celebration & Milestone</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172B4D] mb-1">Detailed Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write clear, actionable information for all staff..."
                  value={broadcastForm.content}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] resize-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={broadcastForm.pinned}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, pinned: e.target.checked })}
                    className="rounded border-[#DFE1E6] text-[#0052CC]"
                  />
                  <span className="font-semibold text-[#172B4D]">Pin to top of feed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={broadcastForm.acknowledgementRequired}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, acknowledgementRequired: e.target.checked })}
                    className="rounded border-[#DFE1E6] text-[#0052CC]"
                  />
                  <span className="font-semibold text-[#172B4D]">Require employee acknowledgement</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DFE1E6]">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-3 py-1.5 border border-[#DFE1E6] rounded-lg text-[#42526E] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Megaphone size={13} />
                  <span>Publish Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PulseFeed;
