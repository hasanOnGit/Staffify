import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getJobs,
  createJob,
  updateJob,
  getCandidates,
  createCandidate,
  updateCandidateStage,
  addInterviewFeedback,
  convertCandidateToEmployee,
} from "../services/recruitment";
import JobModal from "../components/JobModal";
import CandidateModal from "../components/CandidateModal";
import CandidateDossierModal from "../components/CandidateDossierModal";
import {
  Briefcase,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Star,
  Building2,
  UserCheck,
  ChevronRight,
  BarChart3,
  X,
  Layers,
  MapPin,
  TrendingUp,
} from "lucide-react";

function Recruitment() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("pipeline"); // "pipeline" | "jobs" | "analytics"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState("All");

  // Candidates state
  const [candidates, setCandidates] = useState([]);
  const [searchCandidate, setSearchCandidate] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Load Jobs
  const loadJobs = async () => {
    try {
      const res = await getJobs();
      if (res.success) setJobs(res.data || []);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    }
  };

  // Load Candidates
  const loadCandidates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedJobFilter !== "All") params.jobId = selectedJobFilter;
      const res = await getCandidates(params);
      if (res.success) setCandidates(res.data || []);
    } catch (err) {
      console.error("Failed to load candidates:", err);
      setMessage({ type: "error", text: "Failed to load candidate applications." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [selectedJobFilter]);

  // Job Actions
  const handleCreateJob = async (jobData) => {
    try {
      const res = await createJob(jobData);
      setMessage({ type: "success", text: res.message || "Job requisition published." });
      setIsJobModalOpen(false);
      await loadJobs();
    } catch (err) {
      console.error("Error creating job:", err);
      setMessage({ type: "error", text: "Failed to create job requisition." });
    }
  };

  // Candidate Actions
  const handleCreateCandidate = async (candidateData) => {
    try {
      const res = await createCandidate(candidateData);
      setMessage({ type: "success", text: res.message || "Candidate enrolled in pipeline." });
      setIsCandidateModalOpen(false);
      await loadCandidates();
      await loadJobs();
    } catch (err) {
      console.error("Error creating candidate:", err);
      setMessage({ type: "error", text: "Failed to enroll candidate." });
    }
  };

  const handleUpdateStage = async (candidateId, stageData) => {
    try {
      await updateCandidateStage(candidateId, stageData);
      setCandidates((prev) =>
        prev.map((c) => (c.candidateId === candidateId ? { ...c, stage: stageData.stage } : c))
      );
      if (selectedCandidate?.candidateId === candidateId) {
        setSelectedCandidate((prev) => ({ ...prev, stage: stageData.stage }));
      }
    } catch (err) {
      console.error("Error updating stage:", err);
      setMessage({ type: "error", text: "Failed to move candidate stage." });
    }
  };

  const handleAddFeedback = async (candidateId, feedbackData) => {
    try {
      const res = await addInterviewFeedback(candidateId, feedbackData);
      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) => (c.candidateId === candidateId ? res.data : c))
        );
        setSelectedCandidate(res.data);
      }
    } catch (err) {
      console.error("Error adding feedback:", err);
    }
  };

  const handleConvertToEmployee = async (candidateId, payload) => {
    try {
      const res = await convertCandidateToEmployee(candidateId, payload);
      setMessage({ type: "success", text: res.message || "Candidate hired successfully!" });
      setIsDossierModalOpen(false);
      setSelectedCandidate(null);
      await loadCandidates();
    } catch (err) {
      console.error("Error converting candidate:", err);
      setMessage({ type: "error", text: "Failed to onboard candidate." });
    }
  };

  // Filtered Candidates
  const filteredCandidates = candidates.filter((c) => {
    if (!searchCandidate) return true;
    return (
      c.name.toLowerCase().includes(searchCandidate.toLowerCase()) ||
      c.email.toLowerCase().includes(searchCandidate.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchCandidate.toLowerCase()) ||
      c.candidateId.toLowerCase().includes(searchCandidate.toLowerCase())
    );
  });

  // Kanban Columns Definition
  const KANBAN_COLUMNS = [
    { id: "Applied", label: "Applied", color: "border-t-[#6B778C]", bg: "bg-[#FAFBFC]" },
    { id: "Screening", label: "Screening", color: "border-t-[#FFAB00]", bg: "bg-[#FAFBFC]" },
    { id: "Technical Round", label: "Technical Round", color: "border-t-[#6554C0]", bg: "bg-[#FAFBFC]" },
    { id: "HR Interview", label: "HR Interview", color: "border-t-[#0052CC]", bg: "bg-[#FAFBFC]" },
    { id: "Offered", label: "Offered", color: "border-t-[#00875A]", bg: "bg-[#FAFBFC]" },
    { id: "Hired", label: "Hired", color: "border-t-[#36B37E]", bg: "bg-[#FAFBFC]" },
  ];

  // Helper to move candidate next / prev stage
  const handleQuickMove = (candidate, direction) => {
    const stageIds = KANBAN_COLUMNS.map((col) => col.id);
    const currentIndex = stageIds.indexOf(candidate.stage);
    if (currentIndex === -1) return;

    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < stageIds.length) {
      handleUpdateStage(candidate.candidateId, { stage: stageIds[nextIndex] });
    }
  };

  // Compute Funnel Metrics
  const totalApplicants = candidates.length;
  const screenedCount = candidates.filter((c) => c.stage !== "Applied").length;
  const interviewedCount = candidates.filter(
    (c) => c.stage === "Technical Round" || c.stage === "HR Interview" || c.stage === "Offered" || c.stage === "Hired"
  ).length;
  const offeredCount = candidates.filter((c) => c.stage === "Offered" || c.stage === "Hired").length;
  const hiredCount = candidates.filter((c) => c.stage === "Hired").length;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#DFE1E6]">
          <div>
            <h1 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#0052CC] text-white flex items-center justify-center">
                <Briefcase size={16} />
              </div>
              <span>Recruitment & Applicant Tracking System (ATS)</span>
            </h1>
            <p className="text-xs text-[#6B778C] mt-0.5">
              Jira Agile Talent Acquisition • Candidate Pipeline Kanban, Job Requisitions, and 1-Click Onboarding
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              Publish Requisition
            </button>
            <button
              onClick={() => setIsCandidateModalOpen(true)}
              className="px-3.5 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-medium rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Users size={14} className="text-[#0052CC]" />
              Add Candidate
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
            onClick={() => setActiveTab("pipeline")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "pipeline"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Layers size={14} />
            Candidate Pipeline (Kanban)
            <span className="ml-1 px-1.5 py-0.2 bg-[#F4F5F7] text-[#42526E] rounded-full text-[10px]">
              {candidates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "jobs"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Briefcase size={14} />
            Job Requisitions
            <span className="ml-1 px-1.5 py-0.2 bg-[#F4F5F7] text-[#42526E] rounded-full text-[10px]">
              {jobs.length}
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
            Hiring Funnel & Metrics
          </button>
        </div>

        {/* ========================================================
            TAB 1: JIRA KANBAN CANDIDATE PIPELINE
            ======================================================== */}
        {activeTab === "pipeline" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-[#DFE1E6] rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#6B778C]" />
                <input
                  type="text"
                  placeholder="Filter candidate by name / role..."
                  value={searchCandidate}
                  onChange={(e) => setSearchCandidate(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] outline-none focus:ring-1 focus:ring-[#0052CC]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={13} className="text-[#6B778C]" />
                <span className="text-[#6B778C] font-medium text-[11px]">Requisition:</span>
                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Open Roles ({jobs.length})</option>
                  {jobs.map((j) => (
                    <option key={j.jobId} value={j.jobId}>
                      {j.title} ({j.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start overflow-x-auto pb-4">
              {KANBAN_COLUMNS.map((column) => {
                const columnCandidates = filteredCandidates.filter((c) => c.stage === column.id);

                return (
                  <div
                    key={column.id}
                    className={`bg-[#F4F5F7] border border-[#DFE1E6] rounded-md p-2.5 space-y-2 border-t-3 ${column.color} min-w-[200px] shrink-0`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-1">
                      <span className="font-bold text-xs text-[#172B4D]">{column.label}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-[#DFE1E6] text-[#42526E] font-bold text-[10px]">
                        {columnCandidates.length}
                      </span>
                    </div>

                    {/* Candidate Cards List */}
                    <div className="space-y-2 min-h-[300px]">
                      {columnCandidates.length === 0 ? (
                        <div className="py-8 text-center text-[11px] text-[#A5ADBA] italic">
                          No candidates
                        </div>
                      ) : (
                        columnCandidates.map((cand) => {
                          const avgRating =
                            cand.feedback?.length > 0
                              ? (
                                  cand.feedback.reduce((a, b) => a + b.rating, 0) /
                                  cand.feedback.length
                                ).toFixed(1)
                              : null;

                          return (
                            <div
                              key={cand.candidateId}
                              onClick={() => {
                                setSelectedCandidate(cand);
                                setIsDossierModalOpen(true);
                              }}
                              className="bg-white border border-[#DFE1E6] hover:border-[#0052CC] rounded p-2.5 shadow-2xs hover:shadow-xs transition cursor-pointer space-y-2 group"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-xs text-[#172B4D] group-hover:text-[#0052CC] transition truncate">
                                    {cand.name}
                                  </h4>
                                  <span className="text-[10px] text-[#6B778C]">
                                    {cand.candidateId}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#5E6C84] mt-0.5 truncate">
                                  {cand.jobTitle}
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-[#6B778C] pt-1 border-t border-[#EBECF0]">
                                <span>{cand.totalExperienceYears}y exp</span>
                                {avgRating ? (
                                  <span className="flex items-center text-[#FFAB00] font-bold">
                                    <Star size={10} className="fill-[#FFAB00] mr-0.5" />
                                    {avgRating}
                                  </span>
                                ) : (
                                  <span className="text-[#A5ADBA]">Unrated</span>
                                )}
                              </div>

                              {/* Stage Shifter Buttons */}
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-between pt-1 border-t border-[#EBECF0]"
                              >
                                <button
                                  type="button"
                                  disabled={column.id === "Applied"}
                                  onClick={() => handleQuickMove(cand, "prev")}
                                  className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F4F5F7] disabled:opacity-20 cursor-pointer"
                                  title="Move to previous stage"
                                >
                                  <ArrowLeft size={11} />
                                </button>

                                <span className="text-[10px] text-[#0052CC] font-semibold hover:underline cursor-pointer" onClick={() => {
                                  setSelectedCandidate(cand);
                                  setIsDossierModalOpen(true);
                                }}>
                                  Dossier
                                </span>

                                <button
                                  type="button"
                                  disabled={column.id === "Hired"}
                                  onClick={() => handleQuickMove(cand, "next")}
                                  className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F4F5F7] disabled:opacity-20 cursor-pointer"
                                  title="Advance to next stage"
                                >
                                  <ArrowRight size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: JOB REQUISITIONS & OPENINGS
            ======================================================== */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {jobs.map((j) => (
                <div
                  key={j.jobId}
                  className="bg-white border border-[#DFE1E6] rounded-md p-4 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DEEBFF] text-[#0747A6]">
                        {j.department}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3FCEF] text-[#006644]">
                        {j.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#172B4D]">{j.title}</h4>
                      <p className="text-xs text-[#6B778C] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} />
                        {j.location} • {j.employmentType}
                      </p>
                    </div>

                    {j.description && (
                      <p className="text-xs text-[#5E6C84] leading-relaxed line-clamp-2">
                        {j.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#EBECF0] space-y-2 text-xs">
                    <div className="flex justify-between text-[#6B778C]">
                      <span>Experience:</span>
                      <span className="font-semibold text-[#172B4D]">{j.experienceRequired}</span>
                    </div>
                    <div className="flex justify-between text-[#6B778C]">
                      <span>Budgeted CTC:</span>
                      <span className="font-semibold text-[#00875A]">{j.salaryRange}</span>
                    </div>
                    <div className="flex justify-between text-[#6B778C]">
                      <span>Total Openings:</span>
                      <span className="font-semibold text-[#172B4D]">{j.openings} positions</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0052CC]">
                        {j.applicantCount || 0} Applicants
                      </span>
                      <button
                        onClick={() => {
                          setSelectedJobFilter(j.jobId);
                          setActiveTab("pipeline");
                        }}
                        className="px-2.5 py-1 bg-white border border-[#0052CC] text-[#0052CC] hover:bg-[#DEEBFF] rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        View Pipeline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: HIRING FUNNEL & ANALYTICS
            ======================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#DFE1E6] rounded p-4 shadow-2xs">
              <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                <BarChart3 size={16} className="text-[#0052CC]" />
                Recruitment Funnel & Candidate Conversion Velocity
              </h3>
              <p className="text-xs text-[#6B778C] mt-1">
                Visualizing applicant progression from initial application to offer acceptance and hire
              </p>
            </div>

            {/* Funnel Bars */}
            <div className="bg-white border border-[#DFE1E6] rounded p-5 shadow-2xs space-y-4 text-xs">
              <h4 className="font-bold text-xs text-[#172B4D] uppercase tracking-wider">
                Hiring Stage Conversion Funnel
              </h4>

              <div className="space-y-3">
                {/* 1. Applied */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-[#172B4D]">1. Total Applications Received</span>
                    <span className="text-[#6B778C]">{totalApplicants} Candidates (100%)</span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-4 rounded-full overflow-hidden">
                    <div className="bg-[#6B778C] h-full rounded-full w-full" />
                  </div>
                </div>

                {/* 2. Screened */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-[#172B4D]">2. Resume Screened & Shortlisted</span>
                    <span className="text-[#6B778C]">
                      {screenedCount} Candidates (
                      {totalApplicants > 0 ? Math.round((screenedCount / totalApplicants) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FFAB00] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalApplicants > 0 ? (screenedCount / totalApplicants) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 3. Interviewed */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-[#172B4D]">3. Technical & Cultural Interviews</span>
                    <span className="text-[#6B778C]">
                      {interviewedCount} Candidates (
                      {totalApplicants > 0 ? Math.round((interviewedCount / totalApplicants) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-[#6554C0] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalApplicants > 0 ? (interviewedCount / totalApplicants) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 4. Offered */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-[#172B4D]">4. Formal Offers Extended</span>
                    <span className="text-[#6B778C]">
                      {offeredCount} Candidates (
                      {totalApplicants > 0 ? Math.round((offeredCount / totalApplicants) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0052CC] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalApplicants > 0 ? (offeredCount / totalApplicants) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 5. Hired */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-[#172B4D]">5. Successfully Hired & Onboarded</span>
                    <span className="text-[#00875A] font-bold">
                      {hiredCount} Candidates (
                      {totalApplicants > 0 ? Math.round((hiredCount / totalApplicants) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EBECF0] h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-[#00875A] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalApplicants > 0 ? (hiredCount / totalApplicants) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <JobModal
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          onSave={handleCreateJob}
          currentUser={user}
        />

        <CandidateModal
          isOpen={isCandidateModalOpen}
          onClose={() => setIsCandidateModalOpen(false)}
          onSave={handleCreateCandidate}
          jobs={jobs}
        />

        <CandidateDossierModal
          isOpen={isDossierModalOpen}
          onClose={() => {
            setIsDossierModalOpen(false);
            setSelectedCandidate(null);
          }}
          candidate={selectedCandidate}
          onUpdateStage={handleUpdateStage}
          onAddFeedback={handleAddFeedback}
          onConvertToEmployee={handleConvertToEmployee}
          currentUser={user}
        />
      </div>
    </DashboardLayout>
  );
}

export default Recruitment;
