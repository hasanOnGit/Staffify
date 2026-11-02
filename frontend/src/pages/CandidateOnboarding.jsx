import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Building,
  CreditCard,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { verifyOnboardingToken, submitCandidateOnboarding } from "../services/onboarding";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, name: "Personal Profile", icon: User },
  { id: 2, name: "Statutory & KYC", icon: ShieldCheck },
  { id: 3, name: "Bank & Payout", icon: CreditCard },
  { id: 4, name: "Document Vault", icon: UploadCloud },
  { id: 5, name: "Review & Sign", icon: FileText },
];

export default function CandidateOnboarding() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [candidate, setCandidate] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Personal
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    // Statutory
    pan: "",
    aadhaar: "",
    uan: "",
    esicNumber: "",
    // Bank
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    branchName: "",
    // Document Vault
    documents: {
      panCard: { uploaded: false, name: "" },
      aadhaarCard: { uploaded: false, name: "" },
      cancelledCheque: { uploaded: false, name: "" },
      relievingLetter: { uploaded: false, name: "" },
    },
    declarationAccepted: false,
  });

  useEffect(() => {
    if (token) {
      loadCandidate();
    }
  }, [token]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      const res = await verifyOnboardingToken(token);
      if (res?.success) {
        setCandidate(res.candidate);
        // Pre-populate if candidate exists
        const c = res.candidate;
        const nameParts = (c.name || "").split(" ");
        setFormData((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: c.email || "",
          phone: c.phone || "",
        }));

        if (c.onboardingStatus === "Submitted" || c.onboardingStatus === "Completed") {
          setSubmitted(true);
        }
      } else {
        toast.error(res?.error || "Invalid or expired onboarding invitation link");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to load onboarding session");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSimulatedUpload = (docKey, filename) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: { uploaded: true, name: filename || `${docKey}_verified.pdf` },
      },
    }));
    toast.success(`${docKey} securely attached to document vault`);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.email || !formData.phone) {
        toast.error("Please fill in required personal details");
        return;
      }
    } else if (currentStep === 2) {
      if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) {
        toast.error("Please enter a valid 10-character PAN (e.g. ABCDE1234F)");
        return;
      }
    } else if (currentStep === 3) {
      if (formData.accountNumber && formData.accountNumber !== formData.confirmAccountNumber) {
        toast.error("Bank account numbers do not match");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!formData.declarationAccepted) {
      toast.error("Please review and accept the digital onboarding declaration.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitCandidateOnboarding(token, {
        personalDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
          },
        },
        statutoryDetails: {
          pan: formData.pan.toUpperCase(),
          aadhaar: formData.aadhaar,
          uan: formData.uan,
          esicNumber: formData.esicNumber,
        },
        bankDetails: {
          accountHolderName: formData.accountHolderName || `${formData.firstName} ${formData.lastName}`,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          branchName: formData.branchName,
        },
        documents: formData.documents,
      });

      if (res?.success) {
        setSubmitted(true);
        toast.success(res.message || "Onboarding submitted successfully!");
      } else {
        toast.error(res?.error || "Submission failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to submit onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-sm w-full space-y-3">
          <Loader2 size={32} className="animate-spin text-[#0052CC] mx-auto" />
          <h2 className="text-sm font-bold text-[#172B4D]">Verifying Security Credentials...</h2>
          <p className="text-xs text-[#6B778C]">Validating single-use onboarding token with Staffify</p>
        </div>
      </div>
    );
  }

  if (!candidate && !submitted) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full space-y-3">
          <AlertCircle size={36} className="text-[#DE350B] mx-auto" />
          <h2 className="text-base font-bold text-[#172B4D]">Onboarding Link Invalid or Expired</h2>
          <p className="text-xs text-[#6B778C]">
            This digital onboarding link is either invalid, already completed, or has expired after 7 days. Please contact your HR department to issue a new onboarding invite.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full space-y-4 border border-[#DFE1E6]">
          <div className="w-16 h-16 rounded-full bg-[#E3FCEF] text-[#00875A] flex items-center justify-center mx-auto border border-[#ABF5D1]">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-lg font-bold text-[#172B4D]">Welcome Aboard to Staffify!</h2>
          <p className="text-xs text-[#42526E] leading-relaxed">
            Your digital self-onboarding profile and document vault have been securely transmitted to the HR People Operations team.
          </p>
          <div className="p-3 bg-[#DEEBFF]/50 border border-[#B3D4FF] rounded text-left text-xs text-[#0747A6] space-y-1">
            <p className="font-semibold">Next Steps:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#42526E]">
              <li>HR will audit your submitted KYC & statutory documents</li>
              <li>Official employee ID and portal credentials will be generated</li>
              <li>Your reporting manager will schedule your Day 1 induction</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] pb-12">
      {/* Top Enterprise Brand Navigation */}
      <header className="bg-white border-b border-[#DFE1E6] py-3.5 px-6 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#0052CC] text-white flex items-center justify-center font-black text-sm tracking-wider">
              S
            </div>
            <div>
              <span className="font-black text-sm text-[#0052CC] tracking-tight">STAFFIFY</span>
              <span className="text-xs text-[#6B778C] font-semibold ml-2">Digital Employee Onboarding</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B778C]">
            <Lock size={12} className="text-[#00875A]" />
            <span className="font-semibold text-[#006644]">256-Bit SSL Encrypted Vault</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto mt-6 px-4">
        {/* Candidate Welcome Banner */}
        <div className="bg-[#0052CC] text-white rounded-xl p-6 mb-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20">
              Candidate Offer Accepted
            </span>
            <h1 className="text-xl font-bold mt-1">Hello, {candidate?.name || "New Team Member"}!</h1>
            <p className="text-xs text-white/80 mt-0.5">
              Role: <strong>{candidate?.jobTitle || "Software Engineer"}</strong> • Dept: <strong>{candidate?.department || "Engineering"}</strong>
            </p>
          </div>
          <div className="text-right text-xs text-white/80 shrink-0">
            <span>Step {currentStep} of {STEPS.length}</span>
            <div className="w-36 h-2 bg-white/30 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Indicator Navigation */}
        <div className="bg-white rounded-lg border border-[#DFE1E6] p-3 mb-6 shadow-xs hidden md:flex items-center justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition cursor-pointer ${
                  isCurrent
                    ? "bg-[#DEEBFF] text-[#0052CC] font-bold"
                    : isCompleted
                    ? "text-[#00875A] font-semibold"
                    : "text-[#6B778C]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCurrent
                      ? "bg-[#0052CC] text-white"
                      : isCompleted
                      ? "bg-[#E3FCEF] text-[#00875A]"
                      : "bg-[#F4F5F7] text-[#6B778C]"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={14} /> : step.id}
                </div>
                <span className="text-xs">{step.name}</span>
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl border border-[#DFE1E6] p-6 shadow-sm">
          {/* STEP 1: PERSONAL PROFILE */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-[#DFE1E6] pb-3">
                <h3 className="font-bold text-sm text-[#172B4D]">Personal Details</h3>
                <p className="text-xs text-[#6B778C]">Please verify your official name and contact information.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold block mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold block mb-1">Residential Address</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Complete residential address with pin code..."
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="Name of relative / guardian"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="+91..."
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STATUTORY & KYC */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-b border-[#DFE1E6] pb-3">
                <h3 className="font-bold text-sm text-[#172B4D]">Statutory & KYC Identifiers</h3>
                <p className="text-xs text-[#6B778C]">
                  Required for Income Tax TDS, EPFO (Provident Fund), and ESIC compliance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold block mb-1">
                    Permanent Account Number (PAN) *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs font-mono uppercase outline-none focus:border-[#0052CC]"
                    required
                  />
                  <p className="text-[11px] text-[#6B778C] mt-1">10-character alphanumeric PAN format.</p>
                </div>

                <div>
                  <label className="font-bold block mb-1">Aadhaar Card Number (12 Digits)</label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                    placeholder="1234 5678 9012"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">EPFO Universal Account Number (UAN)</label>
                  <input
                    type="text"
                    value={formData.uan}
                    onChange={(e) => setFormData({ ...formData, uan: e.target.value })}
                    placeholder="101234567890 (if previous EPF exists)"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">ESIC Insurance Number</label>
                  <input
                    type="text"
                    value={formData.esicNumber}
                    onChange={(e) => setFormData({ ...formData, esicNumber: e.target.value })}
                    placeholder="17-digit ESIC IP number (optional)"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BANK & PAYOUT */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-[#DFE1E6] pb-3">
                <h3 className="font-bold text-sm text-[#172B4D]">Bank Account Details</h3>
                <p className="text-xs text-[#6B778C]">
                  Monthly salary disbursements will be routed to this account via direct bank API.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold block mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    placeholder={`${formData.firstName} ${formData.lastName}`}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank, ICICI Bank, State Bank of India"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Bank Account Number *</label>
                  <input
                    type="password"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Confirm Account Number *</label>
                  <input
                    type="text"
                    value={formData.confirmAccountNumber}
                    onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Bank IFSC Code *</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs font-mono uppercase outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    placeholder="e.g. Koramangala 5th Block, Bengaluru"
                    className="w-full border border-[#DFE1E6] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DOCUMENT VAULT */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-[#DFE1E6] pb-3">
                <h3 className="font-bold text-sm text-[#172B4D]">Digital Document Vault</h3>
                <p className="text-xs text-[#6B778C]">
                  Attach digital copies of your KYC credentials, bank passbook, and relieving letters.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  { key: "panCard", label: "PAN Card Copy", desc: "Clear scan or photo of your PAN card" },
                  { key: "aadhaarCard", label: "Aadhaar Card Copy", desc: "Front & back of Aadhaar card" },
                  { key: "cancelledCheque", label: "Cancelled Cheque / Passbook", desc: "Showing Name, Account No & IFSC" },
                  { key: "relievingLetter", label: "Relieving / Experience Letter", desc: "From previous employer (if applicable)" },
                ].map((doc) => {
                  const isUploaded = formData.documents[doc.key]?.uploaded;
                  return (
                    <div
                      key={doc.key}
                      className="p-3.5 border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#172B4D] block">{doc.label}</span>
                        <p className="text-[11px] text-[#6B778C]">{doc.desc}</p>
                        {isUploaded && (
                          <span className="text-[10px] text-[#006644] font-semibold flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            {formData.documents[doc.key].name}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDocumentSimulatedUpload(doc.key, `${doc.key}_signed.pdf`)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isUploaded
                            ? "bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]"
                            : "bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D]"
                        }`}
                      >
                        <UploadCloud size={13} />
                        {isUploaded ? "Uploaded" : "Upload File"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & DECLARATION */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-b border-[#DFE1E6] pb-3">
                <h3 className="font-bold text-sm text-[#172B4D]">Review & Digital Attestation</h3>
                <p className="text-xs text-[#6B778C]">Please review your submission before final transmission.</p>
              </div>

              {/* Review Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 border border-[#DFE1E6] rounded bg-[#FAFBFC]">
                  <span className="text-[10px] text-[#6B778C] uppercase font-bold block mb-1">Personal</span>
                  <p className="font-semibold">{formData.firstName} {formData.lastName}</p>
                  <p className="text-[#6B778C]">{formData.email}</p>
                  <p className="text-[#6B778C]">{formData.phone}</p>
                </div>
                <div className="p-3 border border-[#DFE1E6] rounded bg-[#FAFBFC]">
                  <span className="text-[10px] text-[#6B778C] uppercase font-bold block mb-1">Statutory KYC</span>
                  <p className="font-semibold">PAN: {formData.pan || "Not provided"}</p>
                  <p className="text-[#6B778C]">Aadhaar: {formData.aadhaar ? "Provided" : "Not provided"}</p>
                  <p className="text-[#6B778C]">UAN: {formData.uan || "None"}</p>
                </div>
                <div className="p-3 border border-[#DFE1E6] rounded bg-[#FAFBFC]">
                  <span className="text-[10px] text-[#6B778C] uppercase font-bold block mb-1">Bank Payout</span>
                  <p className="font-semibold">{formData.bankName || "Bank name"}</p>
                  <p className="text-[#6B778C]">IFSC: {formData.ifscCode}</p>
                  <p className="text-[#6B778C]">A/C: {formData.accountNumber ? "••••" + formData.accountNumber.slice(-4) : "None"}</p>
                </div>
              </div>

              {/* Legal Declaration */}
              <div className="p-4 border border-[#B3D4FF] bg-[#DEEBFF]/30 rounded-lg space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="legalDecl"
                    checked={formData.declarationAccepted}
                    onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                    className="mt-0.5 rounded text-[#0052CC] cursor-pointer"
                  />
                  <label htmlFor="legalDecl" className="text-xs text-[#0747A6] leading-relaxed cursor-pointer select-none">
                    <strong>Digital Employee Attestation:</strong> I hereby declare that all the particulars and documents furnished by me in this onboarding dossier are true, correct, and complete to the best of my knowledge and belief. I authorize the company to verify my credentials and conduct background verification as per standard employment policies.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-6 pt-4 border-t border-[#DFE1E6] flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-[#DFE1E6] rounded text-xs font-semibold hover:bg-[#F4F5F7] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Transmitting Dossier...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Complete & Submit Onboarding
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
