import { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  X,
  Briefcase,
  Mail,
  Phone,
  Building2,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import aiService from "../services/ai.service";
import toast from "react-hot-toast";

function CandidateModal({ isOpen, onClose, onSave, jobs = [] }) {
  const [jobId, setJobId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [totalExperienceYears, setTotalExperienceYears] = useState(3);
  const [summary, setSummary] = useState("");

  // Multimodal resume intelligence state
  const [parsingResume, setParsingResume] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (jobs.length > 0) {
      setJobId(jobs[0].jobId);
    }
    setName("");
    setEmail("");
    setPhone("");
    setCurrentCompany("");
    setCurrentDesignation("");
    setTotalExperienceYears(3);
    setSummary("");
    setMatchScore(null);
    setMatchedSkills([]);
    setMissingSkills([]);
    setInterviewQuestions([]);
  }, [isOpen, jobs]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingResume(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(",")[1];
          const mimeType = file.type || "application/pdf";
          const parsed = await aiService.parseResume(base64Data, mimeType, jobId);
          if (parsed) {
            if (parsed.name) setName(parsed.name);
            if (parsed.email) setEmail(parsed.email);
            if (parsed.phone) setPhone(parsed.phone);
            if (parsed.currentCompany) setCurrentCompany(parsed.currentCompany);
            if (parsed.currentDesignation) setCurrentDesignation(parsed.currentDesignation);
            if (parsed.totalExperienceYears) setTotalExperienceYears(parsed.totalExperienceYears);
            if (parsed.summary) setSummary(parsed.summary);
            if (parsed.matchScore !== undefined) setMatchScore(parsed.matchScore);
            if (parsed.matchedSkills) setMatchedSkills(parsed.matchedSkills);
            if (parsed.missingSkills) setMissingSkills(parsed.missingSkills);
            if (parsed.recommendedQuestions) setInterviewQuestions(parsed.recommendedQuestions);
            toast.success(`Resume scanned successfully! ATS Match Score: ${parsed.matchScore || 85}%`);
          }
        } catch (apiErr) {
          toast.error("Resume parsing error: " + (apiErr.response?.data?.error || apiErr.message));
        } finally {
          setParsingResume(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setParsingResume(false);
      toast.error("File reading error: " + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobId || !name.trim() || !email.trim()) return;

    onSave({
      jobId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      currentCompany: currentCompany.trim(),
      currentDesignation: currentDesignation.trim(),
      totalExperienceYears: Number(totalExperienceYears) || 0,
      summary: summary.trim(),
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center">
              <UserPlus size={14} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm">Add New Candidate Application</h3>
              <p className="text-[11px] text-[#6B778C]">
                Enter applicant details or auto-scan resume with Staffify Multimodal AI
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* AI Resume Upload Banner */}
          <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-600 text-white">
                  <Sparkles size={13} />
                </div>
                <div>
                  <h4 className="font-bold text-[#172B4D] text-xs">AI Resume Parser & ATS Match</h4>
                  <p className="text-[10px] text-[#6B778C]">
                    Upload PDF / Image to auto-fill candidate profile and compute match score
                  </p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleResumeFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={parsingResume}
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <UploadCloud size={13} />
                <span>{parsingResume ? "Scanning..." : "Upload Resume"}</span>
              </button>
            </div>

            {/* ATS Match Score Indicator */}
            {matchScore !== null && (
              <div className="mt-2.5 pt-2 border-t border-blue-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span className="font-semibold text-[#172B4D]">ATS Match Score:</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                      matchScore >= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : matchScore >= 60
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {matchScore}%
                  </span>
                </div>
                {matchedSkills.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-[#42526E]">
                    <span className="font-semibold">Matched Skills:</span>
                    <span>{matchedSkills.slice(0, 3).join(", ")}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">
              Target Requisition / Role <span className="text-[#DE350B]">*</span>
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white font-medium"
            >
              {jobs.map((j) => (
                <option key={j.jobId} value={j.jobId}>
                  [{j.jobId}] {j.title} ({j.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Candidate Full Name <span className="text-[#DE350B]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Candidate name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Email Address <span className="text-[#DE350B]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="candidate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Total Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={totalExperienceYears}
                onChange={(e) => setTotalExperienceYears(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Current Employer</label>
              <input
                type="text"
                placeholder="Current company name..."
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Current Designation
              </label>
              <input
                type="text"
                placeholder="e.g. SDE-2"
                value={currentDesignation}
                onChange={(e) => setCurrentDesignation(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">
              Resume Profile Summary & Technical Strengths
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Candidate background, core tech stack, highlights..."
              className="w-full px-3 py-2 border border-[#DFE1E6] rounded text-[#172B4D] resize-none"
            />
          </div>

          {/* Sticky Form Action Footer */}
          <div className="pt-3 border-t border-[#DFE1E6] flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E] font-medium rounded text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition shadow-sm cursor-pointer"
            >
              Enroll Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CandidateModal;
