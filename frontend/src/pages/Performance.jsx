import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getAppraisals,
  submitSelfAppraisal,
  submitManagerReview,
  getOneOnOne,
  createOneOnOne,
  getPerformanceAnalytics,
} from "../services/performance";
import GoalModal from "../components/GoalModal";
import AppraisalReviewModal from "../components/AppraisalReviewModal";
import OneOnOneModal from "../components/OneOnOneModal";
import toast from "react-hot-toast";
import {
  Target,
  Award,
  MessageSquare,
  BarChart3,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Sliders,
  Calendar,
  User,
  Star,
  CheckSquare,
  Edit2,
  Trash2,
  ChevronRight,
  Filter,
  Check,
  X,
  FileText,
  Activity,
  Layers,
  HelpCircle,
  Info,
  Sparkles,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

function Performance() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("goals"); // "goals" | "appraisals" | "oneOnOne" | "analytics"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Goals State
  const [goals, setGoals] = useState([]);
  const [goalFilterCategory, setGoalFilterCategory] = useState("All");
  const [goalFilterStatus, setGoalFilterStatus] = useState("All");
  const [goalSearch, setGoalSearch] = useState("");
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showOkrGuide, setShowOkrGuide] = useState(false);

  // Appraisals State
  const [appraisals, setAppraisals] = useState([]);
  const [isAppraisalModalOpen, setIsAppraisalModalOpen] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [appraisalModalMode, setAppraisalModalMode] = useState("self"); // "self" | "manager"

  // 1-on-1s State
  const [oneOnOnes, setOneOnOnes] = useState([]);
  const [isOneOnOneModalOpen, setIsOneOnOneModalOpen] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "goals") {
        const params = {};
        if (user?.role === "Employee") {
          params.employeeId = user?.employeeId || user?.userId;
        }
        const res = await getGoals(params);
        if (res.success) setGoals(res.data || []);
      } else if (activeTab === "appraisals") {
        const params = {};
        if (user?.role === "Employee") {
          params.employeeId = user?.employeeId || user?.userId;
        }
        const res = await getAppraisals(params);
        if (res.success) setAppraisals(res.data || []);
      } else if (activeTab === "oneOnOne") {
        const params = {};
        if (user?.role === "Employee") {
          params.employeeId = user?.employeeId || user?.userId;
        }
        const res = await getOneOnOne(params);
        if (res.success) setOneOnOnes(res.data || []);
      } else if (activeTab === "analytics") {
        const res = await getPerformanceAnalytics();
        if (res.success) setAnalytics(res.data || null);
      }
    } catch (err) {
      console.error("Error loading performance data:", err);
      setMessage({ type: "error", text: "Failed to load performance data from server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Goal Actions
  const handleSaveGoal = async (goalData) => {
    try {
      if (goalData.goalId) {
        await updateGoal(goalData.goalId, goalData);
        setMessage({ type: "success", text: "Goal updated successfully." });
      } else {
        await createGoal(goalData);
        setMessage({ type: "success", text: "New Goal created successfully." });
      }
      setIsGoalModalOpen(false);
      setEditingGoal(null);
      await loadData();
    } catch (err) {
      console.error("Failed to save goal:", err);
      setMessage({ type: "error", text: "Failed to save goal. Please try again." });
    }
  };

  const handleQuickProgress = async (goalId, currentVal, delta) => {
    const newVal = Math.min(100, Math.max(0, currentVal + delta));
    const newStatus = newVal >= 100 ? "Completed" : newVal >= 70 ? "On Track" : "In Progress";
    try {
      await updateGoal(goalId, { progressPercentage: newVal, status: newStatus });
      setGoals((prev) =>
        prev.map((g) =>
          g.goalId === goalId ? { ...g, progressPercentage: newVal, status: newStatus } : g
        )
      );
      toast.success(newVal >= 100 ? "Goal marked as Completed!" : `Progress updated to ${newVal}%`);
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  // Helper to parse key results / milestones from description
  const parseMilestones = (desc = "") => {
    if (!desc) return [];
    const lines = desc.split("\n");
    const milestones = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const text = trimmed.replace(/^[•\-*]\s*/, "");
        const isDone = text.startsWith("[x]") || text.startsWith("[X]");
        const cleanText = text.replace(/^\[[ xX]\]\s*/, "");
        if (cleanText) {
          milestones.push({ text: cleanText, isDone });
        }
      }
    });
    return milestones;
  };

  // Helper to toggle milestone check and recalculate progress %
  const handleToggleMilestone = async (goal, milestoneIndex) => {
    const lines = (goal.description || "").split("\n");
    let mCount = 0;
    let doneCount = 0;
    let totalMilestones = 0;

    lines.forEach((line) => {
      const t = line.trim();
      if (t.startsWith("•") || t.startsWith("-") || t.startsWith("*")) {
        totalMilestones++;
      }
    });

    const updatedLines = lines.map((line) => {
      const t = line.trim();
      if (t.startsWith("•") || t.startsWith("-") || t.startsWith("*")) {
        const prefix = t[0];
        const rest = t.slice(1).trim();
        const isAlreadyDone = rest.startsWith("[x]") || rest.startsWith("[X]");
        const clean = rest.replace(/^\[[ xX]\]\s*/, "");

        let newDone = isAlreadyDone;
        if (mCount === milestoneIndex) {
          newDone = !isAlreadyDone;
        }
        if (newDone) doneCount++;
        mCount++;
        return `${prefix} [${newDone ? "x" : " "}] ${clean}`;
      }
      return line;
    });

    const newDescription = updatedLines.join("\n");
    const newProgress =
      totalMilestones > 0
        ? Math.round((doneCount / totalMilestones) * 100)
        : goal.progressPercentage;
    const newStatus =
      newProgress >= 100 ? "Completed" : newProgress >= 60 ? "On Track" : "In Progress";

    try {
      await updateGoal(goal.goalId, {
        description: newDescription,
        progressPercentage: newProgress,
        status: newStatus,
      });
      setGoals((prev) =>
        prev.map((g) =>
          g.goalId === goal.goalId
            ? {
                ...g,
                description: newDescription,
                progressPercentage: newProgress,
                status: newStatus,
              }
            : g
        )
      );
      toast.success(
        newProgress >= 100
          ? "Goal completed! All milestones finished."
          : `Milestone updated! Progress is now ${newProgress}%.`
      );
    } catch (err) {
      console.error("Failed to toggle milestone:", err);
      toast.error("Failed to update milestone progress");
    }
  };

  const getDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return null;
    const target = new Date(dueDateStr + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)}d`, isOverdue: true };
    if (diffDays === 0) return { text: `Due today`, isDueSoon: true };
    if (diffDays <= 7) return { text: `Due in ${diffDays}d`, isDueSoon: true };
    return { text: `Due in ${diffDays}d`, isDueSoon: false };
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to remove this goal?")) return;
    try {
      await deleteGoal(goalId);
      setMessage({ type: "success", text: "Goal removed successfully." });
      setGoals((prev) => prev.filter((g) => g.goalId !== goalId));
    } catch (err) {
      console.error("Error deleting goal:", err);
      setMessage({ type: "error", text: "Failed to delete goal." });
    }
  };

  // Appraisal Actions
  const handleOpenAppraisalModal = (appraisal, mode) => {
    setSelectedAppraisal(appraisal);
    setAppraisalModalMode(mode);
    setIsAppraisalModalOpen(true);
  };

  const handleSaveAppraisal = async (payload) => {
    try {
      if (appraisalModalMode === "self") {
        await submitSelfAppraisal(payload);
        setMessage({ type: "success", text: "Self-appraisal submitted for manager review." });
      } else {
        await submitManagerReview(payload);
        setMessage({ type: "success", text: "Manager review submitted. Appraisal completed." });
      }
      setIsAppraisalModalOpen(false);
      setSelectedAppraisal(null);
      await loadData();
    } catch (err) {
      console.error("Error submitting appraisal:", err);
      setMessage({ type: "error", text: "Failed to submit appraisal review." });
    }
  };

  // 1-on-1 Actions
  const handleSaveOneOnOne = async (meetingData) => {
    try {
      await createOneOnOne(meetingData);
      setMessage({ type: "success", text: "1-on-1 check-in logged successfully." });
      setIsOneOnOneModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Error logging 1-on-1:", err);
      setMessage({ type: "error", text: "Failed to save 1-on-1 session." });
    }
  };

  // Filtered goals
  const filteredGoals = goals.filter((g) => {
    const matchesCategory = goalFilterCategory === "All" || g.category === goalFilterCategory;
    const matchesStatus = goalFilterStatus === "All" || g.status === goalFilterStatus;
    const matchesSearch =
      !goalSearch ||
      g.title.toLowerCase().includes(goalSearch.toLowerCase()) ||
      g.employeeName.toLowerCase().includes(goalSearch.toLowerCase()) ||
      g.employeeId.toLowerCase().includes(goalSearch.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Calculate quick metrics for Goals tab
  const totalGoalsCount = goals.length;
  const completedGoalsCount = goals.filter((g) => g.status === "Completed").length;
  const onTrackGoalsCount = goals.filter((g) => g.status === "On Track").length;
  const atRiskGoalsCount = goals.filter((g) => g.status === "At Risk").length;
  const avgProgress =
    totalGoalsCount > 0
      ? Math.round(goals.reduce((acc, g) => acc + (g.progressPercentage || 0), 0) / totalGoalsCount)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#DFE1E6]">
          <div>
            <h1 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#0052CC] text-white flex items-center justify-center">
                <Target size={16} />
              </div>
              <span>Performance & OKRs Hub</span>
            </h1>
            <p className="text-xs text-[#6B778C] mt-0.5">
              Continuous goal alignment, measurable key results, and quarterly review touchpoints
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowOkrGuide((prev) => !prev)}
              className="px-3 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-medium rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <HelpCircle size={14} className="text-[#0052CC]" />
              <span>{showOkrGuide ? "Hide OKR Guide" : "How OKRs Work"}</span>
            </button>
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>New Objective / OKR</span>
            </button>
            <button
              onClick={() => setIsOneOnOneModalOpen(true)}
              className="px-3 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-medium rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <MessageSquare size={14} className="text-[#6554C0]" />
              <span>Log 1-on-1</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {message && (
          <div
            className={`p-3 rounded border text-xs font-medium flex items-center justify-between ${
              message.type === "success"
                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-[#6B778C] hover:text-[#172B4D] p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Friendly OKR 101 Quick Guide (Collapsible) */}
        {showOkrGuide && (
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-[#B3D4FF] rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between pb-2 border-b border-[#B3D4FF]/60 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#0052CC]" />
                <h3 className="text-xs font-bold text-[#0747A6] uppercase tracking-wider">
                  How OKRs Work: A 30-Second Guide
                </h3>
              </div>
              <button
                onClick={() => setShowOkrGuide(false)}
                className="text-[#6B778C] hover:text-[#172B4D] text-xs font-semibold cursor-pointer"
              >
                Hide Guide
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white/80 p-3 rounded-md border border-[#DEEBFF] space-y-1">
                <span className="font-bold text-[#0052CC] block flex items-center gap-1">
                  <Target size={13} /> 1. The Objective (The "What")
                </span>
                <p className="text-[#42526E] text-[11px] leading-relaxed">
                  Your qualitative, inspiring destination. Example: <em>"Deliver a lightning-fast mobile check-in experience."</em>
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-md border border-[#DEEBFF] space-y-1">
                <span className="font-bold text-[#00875A] block flex items-center gap-1">
                  <CheckSquare size={13} /> 2. Key Results (The "How")
                </span>
                <p className="text-[#42526E] text-[11px] leading-relaxed">
                  The 2-3 measurable milestones that prove success. Example: <em>"Reach 99.9% uptime"</em> or <em>"Launch to 500 beta users"</em>.
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-md border border-[#DEEBFF] space-y-1">
                <span className="font-bold text-[#6554C0] block flex items-center gap-1">
                  <TrendingUp size={13} /> 3. Simple Check-Ins
                </span>
                <p className="text-[#42526E] text-[11px] leading-relaxed">
                  Check off milestones or bump progress (+10% / +25%) directly on your card anytime. Mark <em>At Risk</em> if you need manager support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-[#DFE1E6] gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab("goals")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "goals"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Target size={14} />
            Goals & OKRs
            <span className="ml-1 px-1.5 py-0.2 bg-[#F4F5F7] text-[#42526E] rounded-full text-[10px]">
              {goals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("appraisals")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "appraisals"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Award size={14} />
            Performance Reviews
            <span className="ml-1 px-1.5 py-0.2 bg-[#EAE6FF] text-[#403294] font-bold rounded-full text-[10px]">
              Q4 Cycle
            </span>
          </button>

          <button
            onClick={() => setActiveTab("oneOnOne")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "oneOnOne"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <MessageSquare size={14} />
            1-on-1 Check-ins
            <span className="ml-1 px-1.5 py-0.2 bg-[#F4F5F7] text-[#42526E] rounded-full text-[10px]">
              {oneOnOnes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "analytics"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <BarChart3 size={14} />
            Team Analytics & Bell Curve
          </button>
        </div>

        {/* ========================================================
            TAB 1: GOALS & OKRs
            ======================================================== */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            {/* Friendly Hero Progress & Motivation Card */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-lg p-5 shadow-sm border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  {/* Progress Donut / Circle */}
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center bg-blue-500/10 rounded-full border-2 border-blue-400/30">
                    <span className="text-xl font-black text-white">{avgProgress}%</span>
                    <span className="absolute -bottom-1 text-[9px] font-bold px-1.5 py-0.2 bg-blue-500 text-white rounded-full">
                      Avg
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-white">
                        {user?.name ? `${user.name.split(" ")[0]}'s Focus & OKRs` : "Workforce OKR Dashboard"}
                      </h2>
                      <span className="text-[10px] font-semibold bg-white/10 px-2 py-0.5 rounded text-blue-200">
                        {goals[0]?.cycle || "Q4 2026"} Cycle
                      </span>
                    </div>
                    <p className="text-xs text-blue-200/90 mt-1 max-w-lg leading-relaxed">
                      {avgProgress >= 80
                        ? "Outstanding work! Most quarterly objectives are near or at full completion."
                        : avgProgress >= 50
                        ? "Great momentum! You have passed the halfway milestone. Keep checking off results."
                        : "Focus on your top key milestones this sprint to move objectives forward."}
                    </p>
                  </div>
                </div>

                {/* Stat Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-md text-center border border-white/10 min-w-[70px]">
                    <span className="text-lg font-bold text-white block leading-tight">{totalGoalsCount}</span>
                    <span className="text-[10px] text-blue-200 font-medium uppercase">Total</span>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur-xs px-3 py-2 rounded-md text-center border border-emerald-400/30 min-w-[70px]">
                    <span className="text-lg font-bold text-emerald-300 block leading-tight">{completedGoalsCount}</span>
                    <span className="text-[10px] text-emerald-200 font-medium uppercase">Done</span>
                  </div>
                  <div className="bg-blue-500/20 backdrop-blur-xs px-3 py-2 rounded-md text-center border border-blue-400/30 min-w-[70px]">
                    <span className="text-lg font-bold text-blue-300 block leading-tight">{onTrackGoalsCount}</span>
                    <span className="text-[10px] text-blue-200 font-medium uppercase">On Track</span>
                  </div>
                  <div className="bg-amber-500/20 backdrop-blur-xs px-3 py-2 rounded-md text-center border border-amber-400/30 min-w-[70px]">
                    <span className="text-lg font-bold text-amber-300 block leading-tight">{atRiskGoalsCount}</span>
                    <span className="text-[10px] text-amber-200 font-medium uppercase">At Risk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Chips & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "All", label: "All Objectives", count: totalGoalsCount },
                  { id: "In Progress", label: "In Progress", count: goals.filter((g) => g.status === "In Progress").length },
                  { id: "On Track", label: "On Track", count: onTrackGoalsCount },
                  { id: "At Risk", label: "Needs Help (At Risk)", count: atRiskGoalsCount },
                  { id: "Completed", label: "Completed", count: completedGoalsCount },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setGoalFilterStatus(chip.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                      goalFilterStatus === chip.id
                        ? "bg-[#0052CC] text-white border-[#0052CC] shadow-xs"
                        : "bg-white text-[#42526E] border-[#DFE1E6] hover:bg-[#F4F5F7]"
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        goalFilterStatus === chip.id
                          ? "bg-white/20 text-white"
                          : "bg-[#F4F5F7] text-[#6B778C]"
                      }`}
                    >
                      {chip.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Keyword Search & Category Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={goalFilterCategory}
                  onChange={(e) => setGoalFilterCategory(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded-md text-xs font-semibold text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Core Deliverable">Core Deliverable</option>
                  <option value="Skill Development">Skill Development</option>
                  <option value="Operational Excellence">Operational Excellence</option>
                  <option value="Leadership & Culture">Leadership & Culture</option>
                </select>

                <div className="relative w-full sm:w-56">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-[#6B778C]" />
                  <input
                    type="text"
                    placeholder="Search goals or milestones..."
                    value={goalSearch}
                    onChange={(e) => setGoalSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DFE1E6] rounded-md text-[#172B4D] text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>

            {/* Goals Cards List */}
            {filteredGoals.length === 0 ? (
              <div className="bg-white border border-[#DFE1E6] rounded-lg p-12 text-center shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center mx-auto mb-3">
                  <Target size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#172B4D]">No Goals Found in this View</h3>
                <p className="text-xs text-[#6B778C] mt-1 mb-4 max-w-md mx-auto">
                  {goalSearch || goalFilterStatus !== "All"
                    ? "Try clearing your search query or switching your status filter chip."
                    : "Setting clear objectives and key results keeps your daily work focused and measurable."}
                </p>
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setIsGoalModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded-md text-xs transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create Your First Objective</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGoals.map((g) => {
                  const isCompleted = g.status === "Completed" || g.progressPercentage >= 100;
                  const milestones = parseMilestones(g.description);
                  const daysInfo = getDaysRemaining(g.dueDate);

                  // Extract clean non-bullet summary description
                  const summaryText = (g.description || "")
                    .split("\n")
                    .filter(
                      (l) =>
                        !l.trim().startsWith("•") &&
                        !l.trim().startsWith("-") &&
                        !l.trim().startsWith("*") &&
                        !l.trim().toLowerCase().startsWith("key milestones")
                    )
                    .join(" ")
                    .trim();

                  return (
                    <div
                      key={g.goalId || g._id}
                      className={`bg-white border rounded-lg p-4.5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between ${
                        isCompleted
                          ? "border-[#ABF5D1] bg-[#F6FDF9]/40"
                          : g.status === "At Risk"
                          ? "border-[#FFBDAD] bg-[#FFF8F7]/50"
                          : "border-[#DFE1E6] hover:border-[#0052CC]"
                      }`}
                    >
                      <div>
                        {/* Header Badges & Actions */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0747A6]">
                              {g.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                g.weightage >= 40
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-[#F4F5F7] text-[#42526E]"
                              }`}
                            >
                              {g.weightage >= 40 ? "High Focus" : "Standard"} ({g.weightage}%)
                            </span>
                            <span className="text-[10px] font-semibold text-[#6B778C]">
                              {g.cycle}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingGoal(g);
                                setIsGoalModalOpen(true);
                              }}
                              className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
                              title="Edit Objective & Milestones"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(g.goalId)}
                              className="p-1 rounded text-[#6B778C] hover:text-[#DE350B] hover:bg-[#FFEBE6] transition cursor-pointer"
                              title="Delete Goal"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Goal Title */}
                        <h4 className="font-bold text-[#172B4D] text-sm leading-snug">
                          {g.title}
                        </h4>

                        {/* Summary Description */}
                        {summaryText && (
                          <p className="text-xs text-[#5E6C84] mt-1.5 leading-relaxed">
                            {summaryText}
                          </p>
                        )}

                        {/* Interactive Key Milestones Checklist */}
                        {milestones.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-[#EBECF0] space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B778C]">
                              <span className="flex items-center gap-1">
                                <CheckSquare size={12} className="text-[#0052CC]" />
                                Key Milestones ({milestones.filter((m) => m.isDone).length}/
                                {milestones.length})
                              </span>
                              <span className="text-[10px] text-[#A5ADBA]">Click step to update</span>
                            </div>
                            <div className="space-y-1">
                              {milestones.map((m, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleToggleMilestone(g, idx)}
                                  className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 border transition cursor-pointer ${
                                    m.isDone
                                      ? "bg-[#E3FCEF]/60 border-[#ABF5D1] text-[#006644] line-through font-medium"
                                      : "bg-[#FAFBFC] border-[#DFE1E6] text-[#172B4D] hover:bg-white hover:border-[#0052CC]"
                                  }`}
                                >
                                  <div
                                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                                      m.isDone
                                        ? "bg-[#00875A] border-[#00875A] text-white"
                                        : "border-[#DFE1E6] bg-white"
                                    }`}
                                  >
                                    {m.isDone && <Check size={10} />}
                                  </div>
                                  <span className="truncate">{m.text}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Manager Coaching Feedback Bubble */}
                        {g.managerFeedback && (
                          <div className="mt-2.5 p-2 bg-[#DEEBFF]/40 border border-[#B3D4FF] rounded text-[11px] text-[#0747A6] flex items-start gap-1.5">
                            <Info size={13} className="shrink-0 text-[#0052CC] mt-0.5" />
                            <span>
                              <strong>Manager Note:</strong> {g.managerFeedback}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress and Controls Footer */}
                      <div className="mt-4 pt-3 border-t border-[#EBECF0] space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#6B778C]">Completion Progress</span>
                          <span
                            className={
                              isCompleted
                                ? "text-[#00875A] font-bold"
                                : g.status === "At Risk"
                                ? "text-[#DE350B] font-bold"
                                : "text-[#0052CC] font-bold"
                            }
                          >
                            {g.progressPercentage}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#EBECF0] h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isCompleted
                                ? "bg-[#00875A]"
                                : g.status === "At Risk"
                                ? "bg-[#FFAB00]"
                                : "bg-[#0052CC]"
                            }`}
                            style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                          />
                        </div>

                        {/* Quick Progress Buttons & Meta Footer */}
                        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickProgress(g.goalId, g.progressPercentage, -10)}
                              disabled={g.progressPercentage <= 0}
                              className="px-2 py-0.5 rounded border border-[#DFE1E6] text-[10px] font-bold text-[#42526E] hover:bg-[#F4F5F7] disabled:opacity-40 cursor-pointer"
                              title="Decrease 10%"
                            >
                              -10%
                            </button>
                            <button
                              onClick={() => handleQuickProgress(g.goalId, g.progressPercentage, 10)}
                              disabled={g.progressPercentage >= 100}
                              className="px-2 py-0.5 rounded border border-[#DFE1E6] text-[10px] font-bold text-[#42526E] hover:bg-[#F4F5F7] disabled:opacity-40 cursor-pointer"
                              title="Increase 10%"
                            >
                              +10%
                            </button>
                            <button
                              onClick={() => handleQuickProgress(g.goalId, g.progressPercentage, 25)}
                              disabled={g.progressPercentage >= 100}
                              className="px-2 py-0.5 rounded border border-[#DFE1E6] text-[10px] font-bold text-[#42526E] hover:bg-[#F4F5F7] disabled:opacity-40 cursor-pointer"
                              title="Increase 25%"
                            >
                              +25%
                            </button>
                            {!isCompleted && (
                              <button
                                onClick={() => handleQuickProgress(g.goalId, 0, 100)}
                                className="px-2 py-0.5 rounded bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1] text-[10px] font-bold hover:bg-[#D3F9E5] transition cursor-pointer"
                                title="Mark goal 100% complete"
                              >
                                Done
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#6B778C]">
                            {daysInfo && (
                              <span
                                className={`flex items-center gap-1 font-medium ${
                                  daysInfo.isOverdue
                                    ? "text-[#DE350B] font-bold"
                                    : daysInfo.isDueSoon
                                    ? "text-[#FF8B00]"
                                    : "text-[#6B778C]"
                                }`}
                                title={`Due Date: ${g.dueDate}`}
                              >
                                <Calendar size={11} />
                                {daysInfo.text}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isCompleted
                                  ? "bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]"
                                  : g.status === "At Risk"
                                  ? "bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD]"
                                  : "bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]"
                              }`}
                            >
                              {g.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: PERFORMANCE APPRAISALS (2-STAGE REVIEW)
            ======================================================== */}
        {activeTab === "appraisals" && (
          <div className="space-y-4">
            {/* Active Cycle Workflow Stepper Banner */}
            <div className="bg-white border border-[#DFE1E6] rounded p-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EBECF0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00875A] animate-pulse" />
                    <h3 className="font-bold text-sm text-[#172B4D]">
                      Q4 2026 Performance Appraisal Cycle
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DEEBFF] text-[#0747A6]">
                      Review Cycle Active
                    </span>
                  </div>
                  <p className="text-xs text-[#6B778C] mt-1">
                    Staffify 3-step appraisal process: share your wins, get coaching feedback from your manager, and align on growth and recognition.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#6B778C] block">Cycle Deadline</span>
                  <span className="text-xs font-bold text-[#172B4D]">October 31, 2026</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
                <div className="flex items-center gap-2.5 p-2 rounded bg-[#FAFBFC] border border-[#EBECF0]">
                  <div className="w-6 h-6 rounded-full bg-[#00875A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-[#172B4D] block">1. Share Your Wins</span>
                    <span className="text-[11px] text-[#6B778C]">
                      Reflect on achievements & self-rating
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded bg-[#FAFBFC] border border-[#EBECF0]">
                  <div className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-[#172B4D] block">2. Manager Coaching</span>
                    <span className="text-[11px] text-[#6B778C]">
                      Constructive feedback & guidance
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded bg-[#FAFBFC] border border-[#EBECF0]">
                  <div className="w-6 h-6 rounded-full bg-[#6554C0] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-[#172B4D] block">3. Growth & Recognition</span>
                    <span className="text-[11px] text-[#6B778C]">
                      Fair calibration & merit alignment
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appraisals List */}
            <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between">
                <span className="font-bold text-xs text-[#172B4D] uppercase tracking-wider">
                  Employee Appraisal Records ({appraisals.length})
                </span>
                <span className="text-[11px] text-[#6B778C]">
                  Showing Q4 2026 Cycle
                </span>
              </div>

              {appraisals.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6B778C]">
                  No appraisal records found.
                </div>
              ) : (
                <div className="divide-y divide-[#EBECF0]">
                  {appraisals.map((apr) => {
                    const isCompleted = apr.status === "Completed";
                    const isSelfPending = apr.status === "Pending Self Review";
                    const isMgrPending = apr.status === "Pending Manager Review";

                    return (
                      <div
                        key={apr.appraisalId || apr._id}
                        className="p-4 hover:bg-[#FAFBFC] transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#DFE1E6] text-[#172B4D] font-bold text-xs flex items-center justify-center shrink-0">
                            {apr.employeeName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-[#172B4D] text-sm">
                                {apr.employeeName}
                              </h4>
                              <span className="text-[11px] text-[#6B778C]">
                                ({apr.employeeId})
                              </span>
                            </div>
                            <p className="text-xs text-[#5E6C84]">
                              {apr.designation} • {apr.department}
                            </p>
                            <p className="text-[11px] text-[#8993A4] mt-0.5">
                              Manager: {apr.managerName}
                            </p>
                          </div>
                        </div>

                        {/* Scores & Status */}
                        <div className="flex items-center gap-4 flex-wrap">
                          {/* Self Score */}
                          <div className="text-center">
                            <span className="text-[10px] text-[#6B778C] font-semibold block uppercase">
                              Self Rating
                            </span>
                            <div className="flex items-center gap-1 justify-center mt-0.5">
                              <Star size={12} className="text-[#FFAB00] fill-[#FFAB00]" />
                              <span className="text-xs font-bold text-[#172B4D]">
                                {apr.selfAppraisal?.rating ? `${apr.selfAppraisal.rating}/5` : "-"}
                              </span>
                            </div>
                          </div>

                          {/* Manager Score */}
                          <div className="text-center">
                            <span className="text-[10px] text-[#6B778C] font-semibold block uppercase">
                              Mgr Rating
                            </span>
                            <div className="flex items-center gap-1 justify-center mt-0.5">
                              <Star size={12} className="text-[#0052CC] fill-[#0052CC]" />
                              <span className="text-xs font-bold text-[#172B4D]">
                                {apr.managerReview?.rating ? `${apr.managerReview.rating}/5` : "-"}
                              </span>
                            </div>
                          </div>

                          {/* Final Score */}
                          <div className="text-center">
                            <span className="text-[10px] text-[#6B778C] font-semibold block uppercase">
                              Final Score
                            </span>
                            <span className="text-xs font-black text-[#00875A] mt-0.5 block">
                              {apr.finalScore ? `${apr.finalScore}/5` : "-"}
                            </span>
                          </div>

                          {/* Status Pill */}
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              isCompleted
                                ? "bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]"
                                : isMgrPending
                                ? "bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]"
                                : "bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380]"
                            }`}
                          >
                            {apr.status}
                          </span>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {/* If Employee and Self is pending */}
                            {(user?.role === "Employee" || (user?.employeeId || user?.userId) === apr.employeeId) &&
                              isSelfPending && (
                                <button
                                  onClick={() => handleOpenAppraisalModal(apr, "self")}
                                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition cursor-pointer"
                                >
                                  Submit Self Review
                                </button>
                              )}

                            {/* If Manager or Admin and manager review can be submitted */}
                            {(user?.role === "Manager" || user?.role === "Admin") && (
                              <button
                                onClick={() => handleOpenAppraisalModal(apr, "manager")}
                                className="px-3 py-1.5 bg-white border border-[#0052CC] text-[#0052CC] hover:bg-[#DEEBFF] font-medium rounded text-xs transition cursor-pointer"
                              >
                                {isCompleted ? "Re-evaluate" : "Manager Review"}
                              </button>
                            )}

                            {/* View Summary Modal */}
                            {isCompleted && (
                              <button
                                onClick={() => handleOpenAppraisalModal(apr, "manager")}
                                className="px-2.5 py-1.5 border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E] font-medium rounded text-xs transition cursor-pointer"
                                title="View Appraisal Details"
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: 1-ON-1 CONTINUOUS FEEDBACK
            ======================================================== */}
        {activeTab === "oneOnOne" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-[#DFE1E6] rounded p-4 shadow-2xs">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-1.5">
                  <MessageSquare size={16} className="text-[#6554C0]" />
                  Continuous Feedback & 1-on-1 Touchpoints
                </h3>
                <p className="text-xs text-[#6B778C] mt-0.5">
                  Regular sprint retrospectives, career growth coaching, and actionable commitments
                </p>
              </div>

              <button
                onClick={() => setIsOneOnOneModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Plus size={14} />
                Log 1-on-1 Meeting
              </button>
            </div>

            {/* Friendly 1-on-1 Guide Card */}
            <div className="bg-[#FAF5FF] border border-[#E9D8FD] rounded-lg p-3.5 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#6554C0] text-white flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare size={16} />
              </div>
              <div className="text-xs flex-1">
                <h4 className="font-bold text-[#403294]">
                  3 Questions for an Inspiring 1-on-1:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-[11px] text-[#553C9A]">
                  <div className="bg-white/85 p-2 rounded border border-[#D6BCFA]">
                    <strong className="block text-[#403294] font-semibold">1. Wins & Energy</strong>
                    What project or milestone felt most rewarding recently?
                  </div>
                  <div className="bg-white/85 p-2 rounded border border-[#D6BCFA]">
                    <strong className="block text-[#403294] font-semibold">2. Hurdle Clearing</strong>
                    Where are you feeling friction, and what support do you need?
                  </div>
                  <div className="bg-white/85 p-2 rounded border border-[#D6BCFA]">
                    <strong className="block text-[#403294] font-semibold">3. Growth Next Steps</strong>
                    What is our key priority and learning focus for the next sprint?
                  </div>
                </div>
              </div>
            </div>

            {/* Meetings List */}
            {oneOnOnes.length === 0 ? (
              <div className="bg-white border border-[#DFE1E6] rounded p-12 text-center">
                <MessageSquare size={32} className="mx-auto text-[#A5ADBA] mb-2" />
                <h3 className="font-bold text-sm text-[#172B4D]">No 1-on-1 Sessions Recorded</h3>
                <p className="text-xs text-[#6B778C] mt-1 mb-4">
                  Schedule regular 1-on-1 syncs with team members to resolve blockers and discuss career growth.
                </p>
                <button
                  onClick={() => setIsOneOnOneModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  Record First 1-on-1
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {oneOnOnes.map((meeting) => (
                  <div
                    key={meeting.meetingId || meeting._id}
                    className="bg-white border border-[#DFE1E6] rounded-md p-4 shadow-2xs hover:shadow-xs transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-[#EBECF0]">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DEEBFF] text-[#0747A6] flex items-center gap-1">
                          <Calendar size={11} />
                          {meeting.meetingDate}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAE6FF] text-[#403294]">
                          {meeting.feedbackType}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#6B778C]">
                        <span>
                          <strong className="text-[#172B4D]">Employee:</strong> {meeting.employeeName}
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="text-[#172B4D]">Manager:</strong> {meeting.managerName}
                        </span>
                      </div>
                    </div>

                    {/* Talking Points */}
                    {meeting.talkingPoints && (
                      <div className="mt-3">
                        <span className="text-[11px] font-semibold text-[#6B778C] block uppercase tracking-wider mb-1">
                          Discussion Points & Notes
                        </span>
                        <p className="text-xs text-[#172B4D] leading-relaxed bg-[#FAFBFC] p-2.5 rounded border border-[#EBECF0]">
                          {meeting.talkingPoints}
                        </p>
                      </div>
                    )}

                    {/* Action Items */}
                    {meeting.actionItems && meeting.actionItems.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[11px] font-semibold text-[#6B778C] block uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CheckSquare size={12} className="text-[#0052CC]" />
                          Action Items ({meeting.actionItems.filter((a) => a.isCompleted).length}/
                          {meeting.actionItems.length} Done)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                          {meeting.actionItems.map((item, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 p-2 rounded text-xs border ${
                                item.isCompleted
                                  ? "bg-[#E3FCEF]/40 border-[#ABF5D1] text-[#006644] line-through"
                                  : "bg-white border-[#DFE1E6] text-[#172B4D]"
                              }`}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                                  item.isCompleted
                                    ? "bg-[#00875A] border-[#00875A] text-white"
                                    : "border-[#DFE1E6]"
                                }`}
                              >
                                {item.isCompleted && <Check size={10} />}
                              </div>
                              <span className="truncate">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: ANALYTICS & BELL CURVE NORMALIZATION
            ======================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            {/* Bell Curve Explanation Header */}
            <div className="bg-white border border-[#DFE1E6] rounded p-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                    <BarChart3 size={16} className="text-[#0052CC]" />
                    Team Performance Distribution & Score Insights
                  </h3>
                  <p className="text-xs text-[#6B778C] mt-1 max-w-2xl leading-relaxed">
                    Why we look at score distribution: Healthy teams have a natural mix of reliable core contributors and standout leaders. This transparent view ensures balanced, fair, and unbiased evaluations across the organization.
                  </p>
                </div>
                <div className="px-2.5 py-1.5 rounded bg-[#FAFBFC] border border-[#DFE1E6] text-[11px] text-[#42526E] shrink-0">
                  <span className="font-bold text-[#172B4D]">Scale:</span> 1 (Needs Support) to 5 (Outstanding)
                </div>
              </div>
            </div>

            {/* Bell Curve Graph Simulation */}
            <div className="bg-white border border-[#DFE1E6] rounded p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#172B4D] uppercase tracking-wider">
                  Rating Distribution (5-Point Standard Scale)
                </h4>
                <span className="text-[11px] text-[#6B778C]">
                  Target: ~10% Top Tier, ~70% Core, ~20% Developing
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* 5 Stars - Outstanding */}
                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-[#172B4D]">
                      <Star size={13} className="text-[#FFAB00] fill-[#FFAB00]" />
                      5 - Outstanding (Role Model & Pioneer)
                    </span>
                    <span className="text-[#6B778C] text-[11px]">
                      Target: 10% | Actual: {analytics?.appraisals?.ratingDistribution?.[5] || 0} Employees
                    </span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-3.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#00875A] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          5,
                          ((analytics?.appraisals?.ratingDistribution?.[5] || 1) /
                            Math.max(1, analytics?.appraisals?.total || 3)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 4 Stars - Exceeds */}
                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-[#172B4D]">
                      <Star size={13} className="text-[#0052CC] fill-[#0052CC]" />
                      4 - Exceeds Expectations (High Impact Contributor)
                    </span>
                    <span className="text-[#6B778C] text-[11px]">
                      Target: 20% | Actual: {analytics?.appraisals?.ratingDistribution?.[4] || 0} Employees
                    </span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-3.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#0052CC] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          10,
                          ((analytics?.appraisals?.ratingDistribution?.[4] || 1) /
                            Math.max(1, analytics?.appraisals?.total || 3)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 3 Stars - Meets Expectations */}
                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-[#172B4D]">
                      <Star size={13} className="text-[#6554C0] fill-[#6554C0]" />
                      3 - Meets Expectations (Solid & Reliable Core Performer)
                    </span>
                    <span className="text-[#6B778C] text-[11px]">
                      Target: 50% | Actual: {analytics?.appraisals?.ratingDistribution?.[3] || 1} Employees
                    </span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-3.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#6554C0] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          25,
                          ((analytics?.appraisals?.ratingDistribution?.[3] || 1) /
                            Math.max(1, analytics?.appraisals?.total || 3)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 2 Stars - Developing */}
                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-[#172B4D]">
                      <Star size={13} className="text-[#FFAB00]" />
                      2 - Developing / Coaching (Skill Building in Progress)
                    </span>
                    <span className="text-[#6B778C] text-[11px]">
                      Target: 15% | Actual: {analytics?.appraisals?.ratingDistribution?.[2] || 0} Employees
                    </span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-3.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#FFAB00] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          5,
                          ((analytics?.appraisals?.ratingDistribution?.[2] || 0) /
                            Math.max(1, analytics?.appraisals?.total || 3)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 1 Star - Needs Support */}
                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-[#172B4D]">
                      <Star size={13} className="text-[#DE350B]" />
                      1 - Needs Support (Focused Action Plan Required)
                    </span>
                    <span className="text-[#6B778C] text-[11px]">
                      Target: 5% | Actual: {analytics?.appraisals?.ratingDistribution?.[1] || 0} Employees
                    </span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-3.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#DE350B] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          3,
                          ((analytics?.appraisals?.ratingDistribution?.[1] || 0) /
                            Math.max(1, analytics?.appraisals?.total || 3)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Goal Health Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#DFE1E6] rounded p-4 shadow-2xs">
                <h4 className="font-bold text-xs text-[#172B4D] uppercase tracking-wider mb-3">
                  Goal Health Overview
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B778C]">Completed Goals</span>
                    <span className="font-bold text-[#00875A]">
                      {analytics?.goals?.statusCounts?.Completed || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B778C]">On Track</span>
                    <span className="font-bold text-[#0052CC]">
                      {analytics?.goals?.statusCounts?.["On Track"] || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B778C]">In Progress</span>
                    <span className="font-bold text-[#172B4D]">
                      {analytics?.goals?.statusCounts?.["In Progress"] || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B778C]">At Risk</span>
                    <span className="font-bold text-[#DE350B]">
                      {analytics?.goals?.statusCounts?.["At Risk"] || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-4 shadow-2xs">
                <h4 className="font-bold text-xs text-[#172B4D] uppercase tracking-wider mb-3">
                  Appraisal Cycle Completion Status
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B778C]">Completed & Calibrated</span>
                    <span className="font-bold text-[#00875A]">
                      {analytics?.appraisals?.completed || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B778C]">Awaiting Manager Review</span>
                    <span className="font-bold text-[#0052CC]">
                      {analytics?.appraisals?.pendingManager || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B778C]">Awaiting Self Submission</span>
                    <span className="font-bold text-[#FFAB00]">
                      {analytics?.appraisals?.pendingSelf || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B778C]">Total Cycle Participants</span>
                    <span className="font-bold text-[#172B4D]">
                      {analytics?.appraisals?.total || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => {
            setIsGoalModalOpen(false);
            setEditingGoal(null);
          }}
          onSave={handleSaveGoal}
          employeeId={user?.employeeId || user?.userId}
          employeeName={user?.name}
          department={user?.department}
          initialData={editingGoal}
        />

        <AppraisalReviewModal
          isOpen={isAppraisalModalOpen}
          onClose={() => {
            setIsAppraisalModalOpen(false);
            setSelectedAppraisal(null);
          }}
          appraisal={selectedAppraisal}
          mode={appraisalModalMode}
          onSave={handleSaveAppraisal}
        />

        <OneOnOneModal
          isOpen={isOneOnOneModalOpen}
          onClose={() => setIsOneOnOneModalOpen(false)}
          onSave={handleSaveOneOnOne}
          currentUser={user}
        />
      </div>
    </DashboardLayout>
  );
}

export default Performance;
