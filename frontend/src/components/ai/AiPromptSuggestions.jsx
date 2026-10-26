import { Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAiAssistant } from "../../context/AiAssistantContext";

export default function AiPromptSuggestions() {
  const location = useLocation();
  const { sendMessage } = useAiAssistant();

  // Route-based smart prompt presets
  const getRoutePrompts = () => {
    const path = location.pathname;

    if (path.includes("/payroll")) {
      return [
        "Show this month's payroll summary and total disbursed amount",
        "Compare this month's payroll with last month",
        "What is our total EPF and ESIC liability for October?",
      ];
    }

    if (path.includes("/leaves")) {
      return [
        "What is my current leave balance?",
        "Show all pending leave approval requests",
        "Who is on leave today or this week?",
      ];
    }

    if (path.includes("/attendance")) {
      return [
        "Who checked in late today?",
        "Show my attendance records for this month",
        "List pending attendance regularization requests",
      ];
    }

    if (path.includes("/performance")) {
      return [
        "Show active goals with progress below 50%",
        "How many performance appraisals are pending review?",
        "What is the average goal completion rate?",
      ];
    }

    if (path.includes("/recruitment")) {
      return [
        "How many active candidates are in the Interview stage?",
        "Show all open job requisitions for Engineering",
        "What is our average time-to-hire across departments?",
      ];
    }

    if (path.includes("/helpdesk")) {
      return [
        "List all High and Critical priority open tickets",
        "Which IT assets are currently assigned to me?",
        "Show tickets that have breached SLA response time",
      ];
    }

    // Default general prompts
    return [
      "Give me a department-wise employee count",
      "What is my current leave balance?",
      "Show all open support tickets",
      "Show active salary advances and total outstanding balance",
    ];
  };

  const prompts = getRoutePrompts();

  return (
    <div className="py-2">
      <p className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider mb-1.5 flex items-center gap-1">
        <Sparkles size={11} className="text-[#0052CC]" />
        <span>Contextual Quick Inquiries</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(p)}
            className="text-[11px] text-[#0747A6] bg-[#DEEBFF]/50 hover:bg-[#DEEBFF] border border-[#B3D4FF] px-2.5 py-1 rounded-full transition cursor-pointer text-left line-clamp-1 max-w-full"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
