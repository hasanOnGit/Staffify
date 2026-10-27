import { useState, useEffect } from "react";
import {
  User,
  X,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";

function CandidateDossierModal({
  isOpen,
  onClose,
  candidate,
  onUpdateStage,
  onAddFeedback,
  onConvertToEmployee,
  currentUser,
}) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [roundName, setRoundName] = useState("Technical Round 1");
  const [rating, setRating] = useState(4);
  const [recommendation, setRecommendation] = useState("Yes");
  const [feedbackNotes, setFeedbackNotes] = useState("");

  // Hire Form
  const [showHireForm, setShowHireForm] = useState(false);
  const [joiningDate, setJoiningDate] = useState("");
  const [annualCtc, setAnnualCtc] = useState(1500000);

  useEffect(() => {
    setShowFeedbackForm(false);
    setShowHireForm(false);
    setRoundName("Technical Round 1");
    setRating(4);
    setRecommendation("Yes");
    setFeedbackNotes("");

    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 15);
    setJoiningDate(nextMonth.toISOString().split("T")[0]);
    setAnnualCtc(candidate?.offeredCtc || 1500000);
  }, [isOpen, candidate]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) return null;

  const PIPELINE_STAGES = [
    "Applied",
    "Screening",
    "Technical Round",
    "HR Interview",
    "Offered",
    "Hired",
    "Rejected",
  ];

  const handleStageChange = (newStage) => {
    onUpdateStage(candidate.candidateId, { stage: newStage });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    onAddFeedback(candidate.candidateId, {
      roundName,
      interviewerName: currentUser?.name || "Interviewer",
      rating: Number(rating),
      recommendation,
      notes: feedbackNotes,
    });
    setShowFeedbackForm(false);
    setFeedbackNotes("");
  };

  const handleHireSubmit = (e) => {
    e.preventDefault();
    onConvertToEmployee(candidate.candidateId, {
      dateOfJoining: joiningDate,
      annualCtc: Number(annualCtc),
    });
  };

  const getStageBadge = (st) => {
    switch (st) {
      case "Hired":
        return "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]";
      case "Offered":
        return "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]";
      case "Rejected":
        return "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]";
      case "Technical Round":
      case "HR Interview":
        return "bg-[#EAE6FF] text-[#403294] border-[#C0B6F2]";
      default:
        return "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]";
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#172B4D] text-sm">{candidate.name}</h3>
                <span className="text-[10px] text-[#6B778C]">({candidate.candidateId})</span>
              </div>
              <p className="text-[11px] text-[#6B778C]">
                Applied for <strong>{candidate.jobTitle}</strong> • {candidate.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Visual Pipeline Stage Stepper */}
          <div className="bg-[#FAFBFC] p-3.5 rounded-md border border-[#EBECF0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider block">
                Visual Pipeline Progression
              </span>
              <span className="text-[11px] font-semibold text-[#0052CC]">
                Current: {candidate.stage}
              </span>
            </div>

            {/* Stepper with connected lines */}
            <div className="relative flex items-center justify-between px-2 pt-1">
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#DFE1E6] -z-0" />
              {PIPELINE_STAGES.filter((st) => st !== "Rejected").map((st, idx, arr) => {
                const currentStageIdx = arr.indexOf(candidate.stage);
                const isPassed = currentStageIdx > -1 && idx < currentStageIdx;
                const isCurrent = candidate.stage === st;

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStageChange(st)}
                    className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${
                        isCurrent
                          ? "bg-[#0052CC] text-white ring-4 ring-[#DEEBFF] scale-110"
                          : isPassed
                          ? "bg-[#00875A] text-white"
                          : "bg-white text-[#6B778C] border-2 border-[#DFE1E6] group-hover:border-[#0052CC]"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <span
                      className={`mt-1.5 text-[10px] font-semibold tracking-tight transition max-w-[70px] text-center truncate ${
                        isCurrent
                          ? "text-[#0052CC] font-bold"
                          : isPassed
                          ? "text-[#00875A]"
                          : "text-[#6B778C] group-hover:text-[#172B4D]"
                      }`}
                    >
                      {st}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Alternative Stage / Reject Action */}
            <div className="pt-2 border-t border-[#EBECF0] flex items-center justify-between">
              <span className="text-[11px] text-[#6B778C]">Click any stage node to immediately shift candidate pipeline position.</span>
              <button
                type="button"
                onClick={() => handleStageChange("Rejected")}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                  candidate.stage === "Rejected"
                    ? "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
                    : "bg-white text-[#DE350B] border-[#FFBDAD] hover:bg-[#FFEBE6]"
                }`}
              >
                Mark as Rejected
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded bg-white border border-[#DFE1E6]">
              <span className="text-[10px] text-[#6B778C] block uppercase font-semibold">
                Experience
              </span>
              <span className="font-bold text-[#172B4D] mt-0.5 block">
                {candidate.totalExperienceYears} Years
              </span>
            </div>

            <div className="p-2.5 rounded bg-white border border-[#DFE1E6]">
              <span className="text-[10px] text-[#6B778C] block uppercase font-semibold">
                Current Role
              </span>
              <span className="font-bold text-[#172B4D] mt-0.5 block truncate">
                {candidate.currentDesignation || "N/A"}
              </span>
            </div>

            <div className="p-2.5 rounded bg-white border border-[#DFE1E6]">
              <span className="text-[10px] text-[#6B778C] block uppercase font-semibold">
                Current Firm
              </span>
              <span className="font-bold text-[#172B4D] mt-0.5 block truncate">
                {candidate.currentCompany || "N/A"}
              </span>
            </div>

            <div className="p-2.5 rounded bg-white border border-[#DFE1E6]">
              <span className="text-[10px] text-[#6B778C] block uppercase font-semibold">
                Offered CTC
              </span>
              <span className="font-bold text-[#00875A] mt-0.5 block">
                {candidate.offeredCtc ? `₹${(candidate.offeredCtc / 100000).toFixed(1)}L PA` : "TBD"}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-[#5E6C84] p-2.5 rounded bg-[#FAFBFC] border border-[#EBECF0]">
            <span className="flex items-center gap-1.5">
              <Mail size={13} className="text-[#6B778C]" />
              {candidate.email}
            </span>
            {candidate.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-[#6B778C]" />
                {candidate.phone}
              </span>
            )}
          </div>

          {/* Candidate Summary */}
          {candidate.summary && (
            <div>
              <span className="font-bold text-[#172B4D] block uppercase tracking-wider text-[10px] mb-1">
                Background & Profile Summary
              </span>
              <p className="text-xs text-[#172B4D] leading-relaxed bg-[#FAFBFC] p-3 rounded border border-[#EBECF0]">
                {candidate.summary}
              </p>
            </div>
          )}

          {/* Interview Evaluation Scorecards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#172B4D] block uppercase tracking-wider text-[10px]">
                Interview Evaluation Scorecards ({candidate.feedback?.length || 0})
              </span>
              <button
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="text-[11px] text-[#0052CC] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                {showFeedbackForm ? "Cancel Feedback" : "Add Evaluation"}
              </button>
            </div>

            {/* Scorecard Input Form */}
            {showFeedbackForm && (
              <form
                onSubmit={handleFeedbackSubmit}
                className="p-3 bg-[#FAFBFC] border border-[#0052CC] rounded-md space-y-3 mb-3 animate-in fade-in"
              >
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[#6B778C] block mb-1">Round Name</label>
                    <input
                      type="text"
                      required
                      value={roundName}
                      onChange={(e) => setRoundName(e.target.value)}
                      className="w-full px-2.5 py-1 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[#6B778C] block mb-1">Rating (1 to 5)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-2.5 py-1 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
                    >
                      <option value={5}>5 - Outstanding</option>
                      <option value={4}>4 - Strong Hire</option>
                      <option value={3}>3 - Meets Standard</option>
                      <option value={2}>2 - Weak</option>
                      <option value={1}>1 - Strong No</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#6B778C] block mb-1">Recommendation</label>
                    <select
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      className="w-full px-2.5 py-1 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
                    >
                      <option value="Strong Yes">Strong Yes</option>
                      <option value="Yes">Yes</option>
                      <option value="Hold">Hold</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[#6B778C] block mb-1">Interviewer Notes & Assessment</label>
                  <textarea
                    rows={2}
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Technical strengths, problem-solving depth, communication..."
                    className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition cursor-pointer"
                  >
                    Save Scorecard
                  </button>
                </div>
              </form>
            )}

            {/* Scorecards List */}
            <div className="space-y-2">
              {candidate.feedback?.length === 0 ? (
                <p className="text-[11px] text-[#8993A4] italic py-1">
                  No interview evaluation scorecards submitted yet.
                </p>
              ) : (
                candidate.feedback?.map((fb, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-[#DFE1E6] rounded-md space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#172B4D]">{fb.roundName}</span>
                        <span className="text-[10px] text-[#6B778C]">by {fb.interviewerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center text-[#FFAB00]">
                          <Star size={12} className="fill-[#FFAB00]" />
                          <span className="font-bold text-xs text-[#172B4D] ml-0.5">
                            {fb.rating}/5
                          </span>
                        </div>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#DEEBFF] text-[#0747A6]">
                          {fb.recommendation}
                        </span>
                      </div>
                    </div>
                    {fb.notes && <p className="text-xs text-[#5E6C84] leading-relaxed">{fb.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 1-Click Convert to Employee Box */}
          {candidate.stage !== "Hired" ? (
            <div className="p-3.5 bg-[#E3FCEF]/40 border border-[#ABF5D1] rounded-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#006644] text-xs flex items-center gap-1.5">
                    <UserCheck size={14} />
                    1-Click Onboard & Convert to Staffify Employee
                  </h4>
                  <p className="text-[11px] text-[#5E6C84]">
                    Instantly generates employee record, login account, and initializes personnel dossier.
                  </p>
                </div>
                {!showHireForm && (
                  <button
                    onClick={() => setShowHireForm(true)}
                    className="px-3 py-1.5 bg-[#00875A] hover:bg-[#006644] text-white font-medium rounded text-xs transition shadow-xs cursor-pointer shrink-0"
                  >
                    Hire Candidate
                  </button>
                )}
              </div>

              {showHireForm && (
                <form
                  onSubmit={handleHireSubmit}
                  className="pt-2 border-t border-[#ABF5D1] space-y-3 animate-in fade-in"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#006644] font-medium block mb-1">
                        Official Date of Joining
                      </label>
                      <input
                        type="date"
                        required
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#ABF5D1] rounded bg-white text-[#172B4D] font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[#006644] font-medium block mb-1">
                        Final Annual CTC (INR)
                      </label>
                      <input
                        type="number"
                        required
                        value={annualCtc}
                        onChange={(e) => setAnnualCtc(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#ABF5D1] rounded bg-white text-[#172B4D] font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowHireForm(false)}
                      className="px-3 py-1 border border-[#ABF5D1] text-[#006644] hover:bg-white rounded text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#00875A] hover:bg-[#006644] text-white font-bold rounded text-xs transition shadow-sm cursor-pointer"
                    >
                      Confirm Hire & Onboard
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="p-3 bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0747A6]">
                Candidate successfully hired as permanent employee!
              </span>
              <span className="font-mono font-bold text-[#0747A6]">
                Employee ID: {candidate.hiredEmployeeId}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateDossierModal;
