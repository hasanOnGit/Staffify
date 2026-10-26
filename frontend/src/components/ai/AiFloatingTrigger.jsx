import { Sparkles } from "lucide-react";
import { useAiAssistant } from "../../context/AiAssistantContext";

export default function AiFloatingTrigger() {
  const { toggleAssistant, isOpen } = useAiAssistant();

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={toggleAssistant}
      className="fixed bottom-5 right-5 z-40 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer group border border-white/20 select-none"
      title="Open Staffify AI Copilot (Ctrl + J)"
      aria-label="Open Staffify AI Copilot Assistant"
    >
      <div className="relative">
        <Sparkles size={16} className="text-white group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00C7E6] rounded-full animate-ping" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold leading-tight">Ask Staffify AI</span>
      </div>
      <kbd className="hidden sm:inline-block text-[9px] bg-white/20 px-1.5 py-0.5 rounded text-white font-mono border border-white/25 ml-1">
        Ctrl+J
      </kbd>
    </button>
  );
}
