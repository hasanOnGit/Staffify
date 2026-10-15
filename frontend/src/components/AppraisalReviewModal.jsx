import { useState, useEffect } from "react";
import { Award, X, Check, Star } from "lucide-react";

const RATING_LABELS = {
  1: "1 - Needs Improvement",
  2: "2 - Developing",
  3: "3 - Meets Expectations",
  4: "4 - Exceeds Expectations",
  5: "5 - Outstanding",
};

function AppraisalReviewModal({ isOpen, onClose, appraisal, mode, onSubmit }) {
  const [rating, setRating] = useState(3);
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [field3, setField3] = useState("");
  const [recommendation, setRecommendation] = useState("Continue in Role");

  const isSelf = mode === "self";

  useEffect(() => {
    if (appraisal) {
      if (isSelf) {
        setRating(appraisal.selfAppraisal?.rating || 3);
        setField1(appraisal.selfAppraisal?.achievements || "");
        setField2(appraisal.selfAppraisal?.challenges || "");
        setField3(appraisal.selfAppraisal?.developmentGoals || "");
      } else {
        setRating(appraisal.managerReview?.rating || 4);
        setField1(appraisal.managerReview?.strengths || "");
        setField2(appraisal.managerReview?.growthAreas || "");
        setRecommendation(appraisal.managerReview?.recommendation || "Merit Increment");
      }
    }
  }, [appraisal, mode, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !appraisal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSelf) {
      onSubmit({
        appraisalId: appraisal.appraisalId,
        rating,
        achievements: field1,
        challenges: field2,
        developmentGoals: field3,
      });
    } else {
      onSubmit({
        appraisalId: appraisal.appraisalId,
        rating,
        strengths: field1,
        growthAreas: field2,
        recommendation,
      });
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center">
              <Award size={14} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm">
                {isSelf ? "Self-Appraisal Evaluation" : `Manager Review: ${appraisal.employeeName}`}
              </h3>
              <p className="text-[10px] text-[#6B778C]">{appraisal.cycleName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Employee Info Header */}
          <div className="p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#172B4D] block">{appraisal.employeeName}</span>
              <span className="text-[11px] text-[#6B778C]">
                {appraisal.employeeId} • {appraisal.designation} ({appraisal.department})
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]">
              {appraisal.status}
            </span>
          </div>

          {/* 5-Point Rating Selector */}
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1.5">
              {isSelf ? "Self Performance Rating (1 to 5 Scale)" : "Manager Rating (1 to 5 Scale)"}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={`py-2 px-1 rounded border text-center transition cursor-pointer ${
                    rating === num
                      ? "bg-[#0052CC] text-white border-[#0052CC] font-bold shadow-xs"
                      : "bg-[#FAFBFC] hover:bg-[#EBECF0] border-[#DFE1E6] text-[#172B4D]"
                  }`}
                >
                  <span className="text-sm font-bold block">{num}</span>
                  <span className="text-[9px] block truncate">
                    {num === 1
                      ? "Needs Imp."
                      : num === 2
                      ? "Developing"
                      : num === 3
                      ? "Meets"
                      : num === 4
                      ? "Exceeds"
                      : "Outstanding"}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#0052CC] font-semibold mt-1">
              Selected: {RATING_LABELS[rating]}
            </p>
          </div>

          {/* Qualitative Questions for Self Review */}
          {isSelf ? (
            <>
              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Key Accomplishments & Delivered OKRs
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Summarize your key outcomes, contributions, and milestones completed this cycle..."
                  value={field1}
                  onChange={(e) => setField1(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] text-[#172B4D]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Challenges & Roadblocks Faced
                </label>
                <textarea
                  rows="2"
                  placeholder="Any operational challenges, cross-team dependencies, or resource blockers..."
                  value={field2}
                  onChange={(e) => setField2(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] text-[#172B4D]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Professional Development Goals for Next Cycle
                </label>
                <textarea
                  rows="2"
                  placeholder="Skills, technical certifications, or leadership goals for the coming cycle..."
                  value={field3}
                  onChange={(e) => setField3(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] text-[#172B4D]"
                />
              </div>
            </>
          ) : (
            /* Qualitative Questions for Manager Review */
            <>
              {appraisal.selfAppraisal?.rating > 0 && (
                <div className="p-3 bg-[#DEEBFF]/30 border border-[#B3D4FF] rounded text-xs space-y-1">
                  <span className="font-bold text-[#0747A6] block">
                    Employee Self-Rating: {appraisal.selfAppraisal.rating} / 5
                  </span>
                  <p className="text-[11px] text-[#42526E]">
                    <span className="font-semibold">Accomplishments:</span>{" "}
                    {appraisal.selfAppraisal.achievements || "Not specified."}
                  </p>
                </div>
              )}

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Core Strengths & Performance Highlights
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detail employee's key strengths, sprint impact, and execution quality..."
                  value={field1}
                  onChange={(e) => setField1(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] text-[#172B4D]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Areas of Improvement & Guidance
                </label>
                <textarea
                  rows="2"
                  placeholder="Constructive feedback, mentorship focus areas, or skill gaps..."
                  value={field2}
                  onChange={(e) => setField2(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] text-[#172B4D]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Manager Recommendation
                </label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC] bg-white text-[#172B4D]"
                >
                  <option value="Promotion">Recommend for Promotion</option>
                  <option value="Merit Increment">Merit Salary Increment</option>
                  <option value="Continue in Role">Continue in Current Role</option>
                  <option value="PIP">Performance Improvement Plan (PIP)</option>
                </select>
              </div>
            </>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#DFE1E6]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#DFE1E6] rounded text-xs text-[#172B4D] hover:bg-[#EBECF0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Check size={13} />
              <span>{isSelf ? "Submit Self-Appraisal" : "Submit Manager Evaluation"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppraisalReviewModal;
