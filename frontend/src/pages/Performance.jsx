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
    } catch (err) {
      console.error("Error updating progress:", err);
    }
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
              <span>Performance Management System</span>
            </h1>
            <p className="text-xs text-[#6B778C] mt-0.5">
              Staffify Continuous Appraisal System • Goals & OKRs, 2-Stage Cycles, 1-on-1s, and Bell Curve Analytics
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              New Goal
            </button>
            <button
              onClick={() => setIsOneOnOneModalOpen(true)}
              className="px-3.5 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-medium rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={14} className="text-[#6554C0]" />
              Log 1-on-1
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
            Performance Appraisals
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
            Analytics & Bell Curve
          </button>
        </div>

        {/* ========================================================
            TAB 1: GOALS & OKRs
            ======================================================== */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#0052CC]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Total Active Goals
                </span>
                <span className="text-xl font-bold text-[#172B4D] mt-1 block">
                  {totalGoalsCount}
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#00875A]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Average Completion
                </span>
                <span className="text-xl font-bold text-[#00875A] mt-1 block">
                  {avgProgress}%
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#36B37E]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Completed
                </span>
                <span className="text-xl font-bold text-[#172B4D] mt-1 block">
                  {completedGoalsCount}
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#0052CC]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  On Track
                </span>
                <span className="text-xl font-bold text-[#172B4D] mt-1 block">
                  {onTrackGoalsCount}
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#FFAB00]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  At Risk
                </span>
                <span className="text-xl font-bold text-[#FF8B00] mt-1 block">
                  {atRiskGoalsCount}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#DFE1E6] rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#6B778C]" />
                <input
                  type="text"
                  placeholder="Filter goals by keyword..."
                  value={goalSearch}
                  onChange={(e) => setGoalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] outline-none focus:ring-1 focus:ring-[#0052CC]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Filter size={13} className="text-[#6B778C]" />
                  <span className="text-[#6B778C] font-medium text-[11px]">Category:</span>
                </div>
                <select
                  value={goalFilterCategory}
                  onChange={(e) => setGoalFilterCategory(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Core Deliverable">Core Deliverable</option>
                  <option value="Innovation & Improvement">Innovation & Improvement</option>
                  <option value="Leadership & Teamwork">Leadership & Teamwork</option>
                  <option value="Skill & Mastery">Skill & Mastery</option>
                </select>

                <select
                  value={goalFilterStatus}
                  onChange={(e) => setGoalFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Goals Cards List */}
            {filteredGoals.length === 0 ? (
              <div className="bg-white border border-[#DFE1E6] rounded p-12 text-center">
                <Target size={32} className="mx-auto text-[#A5ADBA] mb-2" />
                <h3 className="font-bold text-sm text-[#172B4D]">No Goals Found</h3>
                <p className="text-xs text-[#6B778C] mt-1 mb-4">
                  Set objective key results to align your focus and drive team outcomes.
                </p>
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setIsGoalModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  Add First Goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredGoals.map((g) => {
                  const isCompleted = g.status === "Completed" || g.progressPercentage >= 100;
                  return (
                    <div
                      key={g.goalId || g._id}
                      className={`bg-white border rounded-md p-4 transition shadow-2xs hover:shadow-xs flex flex-col justify-between ${
                        isCompleted
                          ? "border-[#ABF5D1] bg-[#F6FDF9]/50"
                          : g.status === "At Risk"
                          ? "border-[#FFBDAD]"
                          : "border-[#DFE1E6]"
                      }`}
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0747A6]">
                              {g.category}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F4F5F7] text-[#42526E]">
                              {g.cycle}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EAE6FF] text-[#403294]">
                              {g.weightage}% Wt.
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingGoal(g);
                                setIsGoalModalOpen(true);
                              }}
                              className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
                              title="Edit Goal"
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

                        {/* Goal Title & Desc */}
                        <h4 className="font-bold text-[#172B4D] text-sm leading-snug">
                          {g.title}
                        </h4>
                        {g.description && (
                          <p className="text-xs text-[#5E6C84] mt-1.5 line-clamp-2 leading-relaxed">
                            {g.description}
                          </p>
                        )}
                      </div>

                      {/* Progress and Controls */}
                      <div className="mt-4 pt-3 border-t border-[#EBECF0] space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#6B778C] flex items-center gap-1">
                            Progress
                          </span>
                          <span
                            className={
                              isCompleted
                                ? "text-[#00875A]"
                                : g.status === "At Risk"
                                ? "text-[#DE350B]"
                                : "text-[#0052CC]"
                            }
                          >
                            {g.progressPercentage}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#EBECF0] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isCompleted
                                ? "bg-[#00875A]"
                                : g.status === "At Risk"
                                ? "bg-[#DE350B]"
                                : "bg-[#0052CC]"
                            }`}
                            style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                          />
                        </div>

                        {/* Quick Progress Buttons & Meta Footer */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleQuickProgress(g.goalId, g.progressPercentage, -10)
                              }
                              disabled={g.progressPercentage <= 0}
                              className="px-1.5 py-0.5 rounded border border-[#DFE1E6] text-[10px] font-bold text-[#42526E] hover:bg-[#F4F5F7] disabled:opacity-40 cursor-pointer"
                            >
                              -10%
                            </button>
                            <button
                              onClick={() =>
                                handleQuickProgress(g.goalId, g.progressPercentage, 10)
                              }
                              disabled={g.progressPercentage >= 100}
                              className="px-1.5 py-0.5 rounded border border-[#DFE1E6] text-[10px] font-bold text-[#42526E] hover:bg-[#F4F5F7] disabled:opacity-40 cursor-pointer"
                            >
                              +10%
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#6B778C]">
                            {g.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} />
                                {g.dueDate}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isCompleted
                                  ? "bg-[#E3FCEF] text-[#006644]"
                                  : g.status === "At Risk"
                                  ? "bg-[#FFEBE6] text-[#DE350B]"
                                  : "bg-[#DEEBFF] text-[#0747A6]"
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAE6FF] text-[#403294]">
                      In Calibration
                    </span>
                  </div>
                  <p className="text-xs text-[#6B778C] mt-1">
                    Staffify Dual-stage appraisal cycle: Employee Self-Assessment followed by Manager Review & Calibration
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
                    <span className="font-semibold text-[#172B4D] block">1. Self Appraisal</span>
                    <span className="text-[11px] text-[#6B778C]">
                      Employee shares achievements & rating
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded bg-[#FAFBFC] border border-[#EBECF0]">
                  <div className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-[#172B4D] block">2. Manager Review</span>
                    <span className="text-[11px] text-[#6B778C]">
                      Supervisor evaluation & score calibration
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded bg-[#FAFBFC] border border-[#EBECF0]">
                  <div className="w-6 h-6 rounded-full bg-[#6554C0] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-[#172B4D] block">3. Bell Curve Normalization</span>
                    <span className="text-[11px] text-[#6B778C]">
                      Executive approval & merit release
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
                                View Dossier
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
              <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                <BarChart3 size={16} className="text-[#0052CC]" />
                Staffify Appraisal Bell Curve & Performance Distribution
              </h3>
              <p className="text-xs text-[#6B778C] mt-1">
                Calibrated rating distribution comparing actual team scores against enterprise quota targets.
              </p>
            </div>

            {/* Bell Curve Graph Simulation */}
            <div className="bg-white border border-[#DFE1E6] rounded p-5 shadow-2xs space-y-4">
              <h4 className="font-bold text-xs text-[#172B4D] uppercase tracking-wider">
                Rating Distribution (5-Point Standard Scale)
              </h4>

              <div className="space-y-3 text-xs">
                {/* 5 Stars - Outstanding */}
                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-[#172B4D]">
                      <Star size={13} className="text-[#FFAB00] fill-[#FFAB00]" />
                      5 - Outstanding (Exemplary Performance)
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
                      4 - Exceeds Expectations
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
                      3 - Meets Expectations (Core Solid Performer)
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
                      2 - Developing / Needs Coaching
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

                {/* 1 Star - Needs Improvement */}
                <div>
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-[#172B4D]">
                      <Star size={13} className="text-[#DE350B]" />
                      1 - Unsatisfactory (PIP Required)
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
