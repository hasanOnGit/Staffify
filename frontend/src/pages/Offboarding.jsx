import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getOffboardingCases,
  getOffboardingAnalytics,
  updateAssetClearance,
  updateAccountRevocation,
  submitExitInterview,
  finalizeOffboarding,
} from "../services/offboarding";
import toast from "react-hot-toast";
import {
  UserMinus,
  CheckCircle2,
  Clock,
  Laptop,
  ShieldCheck,
  Key,
  X,
  FileText,
  Building2,
  AlertCircle,
  ThumbsUp,
  Star,
  Check,
  Calendar,
  Lock,
  Unlock,
  MessageSquare,
  Sparkles,
} from "lucide-react";

function Offboarding() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("cases"); // "cases" | "assets" | "accounts" | "analytics"
  const [cases, setCases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeInterviewCase, setActiveInterviewCase] = useState(null);

  const [surveyForm, setSurveyForm] = useState({
    primaryReason: "Career Progression & Growth",
    reasonDetails: "",
    compensationRating: 4,
    workCultureRating: 5,
    managerSupportRating: 5,
    growthOpportunitiesRating: 4,
    wouldRecommendCompany: true,
    proudMomentsOrLikes: "",
    suggestionsForImprovement: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesRes, analRes] = await Promise.all([
        getOffboardingCases(),
        getOffboardingAnalytics(),
      ]);
      if (casesRes.success) setCases(casesRes.data || []);
      if (analRes.success) setAnalytics(analRes.data || null);
    } catch (err) {
      console.error("Offboarding load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAsset = async (caseId, assetIndex, currentStatus) => {
    try {
      const res = await updateAssetClearance(caseId, {
        assetIndex,
        returned: !currentStatus,
        verifiedBy: user?.name || "IT Admin",
        condition: !currentStatus ? "Verified & Cleared" : "Pending Return",
      });
      if (res.success) {
        toast.success("Asset clearance status updated");
        loadData();
      }
    } catch (err) {
      toast.error("Failed to update asset clearance");
    }
  };

  const handleToggleAccount = async (caseId, accountIndex, currentStatus) => {
    try {
      const res = await updateAccountRevocation(caseId, {
        accountIndex,
        revoked: !currentStatus,
        revokedBy: user?.name || "Security Admin",
      });
      if (res.success) {
        toast.success("System access revocation updated");
        loadData();
      }
    } catch (err) {
      toast.error("Failed to update account revocation");
    }
  };

  const handleFinalize = async (caseId) => {
    try {
      const res = await finalizeOffboarding(caseId);
      if (res.success) {
        toast.success("Final HR NOC issued and offboarding archived!");
        loadData();
      }
    } catch (err) {
      toast.error("Failed to finalize offboarding");
    }
  };

  const handleSubmitSurvey = async (e) => {
    e.preventDefault();
    if (!activeInterviewCase) return;
    try {
      const res = await submitExitInterview(activeInterviewCase._id || activeInterviewCase.offboardingId, {
        ...surveyForm,
        conductedBy: user?.name || "HR Operations",
      });
      if (res.success) {
        toast.success("Exit interview recorded successfully");
        setActiveInterviewCase(null);
        loadData();
      }
    } catch (err) {
      toast.error("Failed to submit exit interview");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD]">
                <UserMinus size={18} />
              </span>
              <h1 className="text-xl font-bold text-[#172B4D]">
                Operational Offboarding & Exit Interview Board
              </h1>
            </div>
            <p className="text-xs text-[#6B778C] mt-1">
              Physical IT hardware clearance, SaaS access deprovisioning, knowledge transfer, and confidential exit survey intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2]">
              HR NOC Clearance Active
            </span>
          </div>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Active Offboardings
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#172B4D]">
                {analytics?.inProgressOffboardings || 0}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380]">
                In Notice Handover
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Asset Recovery Rate
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#006644]">
                {analytics?.operationalCompliance?.assetReturnRate || 100}%
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                IT Hardware
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Account Deprovisioning
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#0052CC]">
                {analytics?.operationalCompliance?.accountRevokeRate || 100}%
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                Security Audit
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
              Exit Survey Culture Score
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-[#403294]">
                {analytics?.satisfactionScores?.culture || "4.8"} / 5.0
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2]">
                {analytics?.satisfactionScores?.recommendationRate || 100}% Would Recommend
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#DFE1E6] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("cases")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "cases"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <UserMinus size={14} />
            <span>Separation Cases</span>
            <span className="text-[10px] bg-[#F4F5F7] text-[#42526E] font-mono px-1.5 py-0.2 rounded-full">
              {cases.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("assets")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "assets"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Laptop size={14} />
            <span>Asset Handover Tracker</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "accounts"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Lock size={14} />
            <span>Account Deprovisioning</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "analytics"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <MessageSquare size={14} />
            <span>Exit Interview Insights</span>
          </button>
        </div>

        {/* TAB 1: SEPARATION CASES */}
        {activeTab === "cases" && (
          <div className="bg-white border border-[#DFE1E6] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F5F7] text-[#42526E] uppercase text-[10px] font-bold border-b border-[#DFE1E6]">
                <tr>
                  <th className="px-4 py-3">Case ID</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Resignation Date</th>
                  <th className="px-4 py-3">Last Working Day</th>
                  <th className="px-4 py-3 text-center">Notice Days</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Exit Survey</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {cases.map((c) => (
                  <tr key={c._id || c.offboardingId} className="hover:bg-[#FAFBFC] transition">
                    <td className="px-4 py-3 font-mono font-bold text-[#172B4D]">
                      {c.offboardingId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#172B4D]">{c.employeeName}</p>
                      <p className="text-[10px] text-[#6B778C]">{c.designation} • {c.department}</p>
                    </td>
                    <td className="px-4 py-3 text-[#42526E]">{c.resignationDate}</td>
                    <td className="px-4 py-3 font-semibold text-[#172B4D]">{c.lastWorkingDay}</td>
                    <td className="px-4 py-3 text-center font-mono">{c.noticePeriodDays}d</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          c.status === "Completed"
                            ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                            : "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                        }`}
                      >
                        {c.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.exitInterview?.completed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded border border-[#ABF5D1]">
                          <CheckCircle2 size={11} />
                          <span>Conducted</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveInterviewCase(c);
                            if (c.exitInterview) setSurveyForm(c.exitInterview);
                          }}
                          className="px-2 py-0.5 bg-[#DEEBFF] hover:bg-[#B3D4FF] text-[#0052CC] rounded text-[10px] font-semibold transition"
                        >
                          Conduct Survey
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.status !== "Completed" && isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleFinalize(c._id || c.offboardingId)}
                          className="px-3 py-1 bg-[#00875A] hover:bg-[#006644] text-white text-xs font-semibold rounded-lg transition"
                        >
                          Grant Final NOC
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#006644] flex items-center justify-end gap-1">
                          <Check size={12} />
                          <span>Archived</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: ASSET HANDOVER TRACKER */}
        {activeTab === "assets" && (
          <div className="space-y-4">
            {cases.map((c) => (
              <div key={c._id || c.offboardingId} className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#172B4D]">
                      {c.employeeName} ({c.employeeId})
                    </h3>
                    <p className="text-xs text-[#6B778C]">
                      {c.department} • Last Working Day: {c.lastWorkingDay}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0052CC] bg-[#DEEBFF] px-2.5 py-1 rounded border border-[#B3D4FF]">
                    {c.assetClearance?.filter((a) => a.returned).length} of {c.assetClearance?.length} Returned
                  </span>
                </div>

                <div className="space-y-2">
                  {c.assetClearance?.map((asset, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#DFE1E6] bg-[#FAFBFC] text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Laptop size={16} className={asset.returned ? "text-[#00875A]" : "text-[#6B778C]"} />
                        <div>
                          <p className="font-bold text-[#172B4D]">{asset.assetName}</p>
                          <p className="text-[10px] text-[#6B778C]">
                            S/N: {asset.serialNumber || "N/A"} • Category: {asset.assetCategory} • Condition: {asset.condition}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAsset(c._id || c.offboardingId, idx, asset.returned)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          asset.returned
                            ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                            : "bg-white text-[#42526E] border-[#DFE1E6] hover:bg-[#EBECF0]"
                        }`}
                      >
                        {asset.returned ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Returned & Verified</span>
                          </>
                        ) : (
                          <span>Mark as Returned</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: ACCOUNT DEPROVISIONING */}
        {activeTab === "accounts" && (
          <div className="space-y-4">
            {cases.map((c) => (
              <div key={c._id || c.offboardingId} className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#172B4D]">
                      {c.employeeName} ({c.employeeId})
                    </h3>
                    <p className="text-xs text-[#6B778C]">
                      SaaS & Infrastructure Credentials Deactivation Audit
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#006644] bg-[#E3FCEF] px-2.5 py-1 rounded border border-[#ABF5D1]">
                    {c.accountRevocation?.filter((a) => a.revoked).length} of {c.accountRevocation?.length} Revoked
                  </span>
                </div>

                <div className="space-y-2">
                  {c.accountRevocation?.map((acc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#DFE1E6] bg-[#FAFBFC] text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Lock size={15} className={acc.revoked ? "text-[#00875A]" : "text-[#DE350B]"} />
                        <div>
                          <p className="font-semibold text-[#172B4D]">{acc.systemName}</p>
                          <span className="text-[10px] text-[#6B778C]">Type: {acc.systemType}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAccount(c._id || c.offboardingId, idx, acc.revoked)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          acc.revoked
                            ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                            : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD] hover:bg-[#FFBDAD]"
                        }`}
                      >
                        {acc.revoked ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Access Revoked</span>
                          </>
                        ) : (
                          <span>Revoke Access Now</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: EXIT INTERVIEW ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Reasons for Leaving */}
              <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                  <UserMinus size={16} className="text-[#DE350B]" />
                  <span>Primary Drivers of Separation (Attrition Radar)</span>
                </h3>

                <div className="space-y-3 pt-1">
                  {analytics?.reasonDistribution &&
                    Object.entries(analytics.reasonDistribution).map(([reason, count]) => {
                      const pct = Math.round(
                        (count / Math.max(1, analytics.totalOffboardings)) * 100
                      );
                      return (
                        <div key={reason} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#172B4D]">{reason}</span>
                            <span className="text-[#6B778C] font-mono">{count} cases ({pct}%)</span>
                          </div>
                          <div className="w-full bg-[#F4F5F7] h-2 rounded-full overflow-hidden">
                            <div style={{ width: `${pct}%` }} className="bg-[#0052CC] h-full rounded-full" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Employee Experience Ratings */}
              <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                  <Star size={16} className="text-[#0052CC]" />
                  <span>Separating Employee Satisfaction Averages (out of 5.0)</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6]">
                    <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Work Culture</span>
                    <span className="text-xl font-bold text-[#006644] mt-0.5 block">
                      {analytics?.satisfactionScores?.culture || "4.8"} / 5
                    </span>
                    <span className="text-[10px] text-[#6B778C]">Healthy teamwork rating</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6]">
                    <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Manager Support</span>
                    <span className="text-xl font-bold text-[#0052CC] mt-0.5 block">
                      {analytics?.satisfactionScores?.managerSupport || "4.7"} / 5
                    </span>
                    <span className="text-[10px] text-[#6B778C]">Empathetic leadership</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6]">
                    <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Compensation</span>
                    <span className="text-xl font-bold text-[#172B4D] mt-0.5 block">
                      {analytics?.satisfactionScores?.compensation || "4.2"} / 5
                    </span>
                    <span className="text-[10px] text-[#6B778C]">Market benchmarked</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6]">
                    <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Growth Opportunities</span>
                    <span className="text-xl font-bold text-[#403294] mt-0.5 block">
                      {analytics?.satisfactionScores?.growth || "4.0"} / 5
                    </span>
                    <span className="text-[10px] text-[#6B778C]">Career progression</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exit Survey Modal */}
        {activeInterviewCase && (
          <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D]">
                    Confidential Exit Interview: {activeInterviewCase.employeeName}
                  </h3>
                  <p className="text-xs text-[#6B778C]">
                    HR Retention Feedback & Department Experience Survey
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInterviewCase(null)}
                  className="text-[#6B778C] hover:text-[#172B4D]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitSurvey} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">
                    Primary Reason for Separation *
                  </label>
                  <select
                    value={surveyForm.primaryReason}
                    onChange={(e) => setSurveyForm({ ...surveyForm, primaryReason: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] font-medium"
                  >
                    <option value="Better Compensation & Benefits">Better Compensation & Benefits</option>
                    <option value="Career Progression & Growth">Career Progression & Growth</option>
                    <option value="Role Alignment & Tech Stack">Role Alignment & Tech Stack</option>
                    <option value="Work-Life Balance & Commute">Work-Life Balance & Commute</option>
                    <option value="Personal / Relocation">Personal / Relocation</option>
                    <option value="Higher Education">Higher Education</option>
                    <option value="Management & Leadership">Management & Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">Detailed Context</label>
                  <textarea
                    rows={2}
                    placeholder="Specific factors or offer context..."
                    value={surveyForm.reasonDetails}
                    onChange={(e) => setSurveyForm({ ...surveyForm, reasonDetails: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#172B4D] mb-1">Work Culture (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={surveyForm.workCultureRating}
                      onChange={(e) => setSurveyForm({ ...surveyForm, workCultureRating: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#172B4D] mb-1">Manager Support (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={surveyForm.managerSupportRating}
                      onChange={(e) => setSurveyForm({ ...surveyForm, managerSupportRating: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">What did you enjoy most at Staffify?</label>
                  <textarea
                    rows={2}
                    value={surveyForm.proudMomentsOrLikes}
                    onChange={(e) => setSurveyForm({ ...surveyForm, proudMomentsOrLikes: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">Suggestions for Organization Improvement</label>
                  <textarea
                    rows={2}
                    value={surveyForm.suggestionsForImprovement}
                    onChange={(e) => setSurveyForm({ ...surveyForm, suggestionsForImprovement: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#DFE1E6]">
                  <button
                    type="button"
                    onClick={() => setActiveInterviewCase(null)}
                    className="px-3 py-1.5 border border-[#DFE1E6] rounded-lg text-[#42526E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded-lg"
                  >
                    Record Exit Interview
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Offboarding;
