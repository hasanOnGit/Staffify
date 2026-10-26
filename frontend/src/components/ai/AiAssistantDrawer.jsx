import { useState, useRef, useEffect } from "react";
import { X, Send, RefreshCw, Sparkles, Database, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAiAssistant } from "../../context/AiAssistantContext";
import StaffifyLogo from "../StaffifyLogo";
import StaffifyLoader from "../StaffifyLoader";
import AiMessageItem from "./AiMessageItem";
import AiPromptSuggestions from "./AiPromptSuggestions";

export default function AiAssistantDrawer() {
  const {
    isOpen,
    closeAssistant,
    messages,
    loading,
    aiStatus,
    sendMessage,
    clearConversation,
  } = useAiAssistant();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={closeAssistant}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        id="ai-copilot-drawer"
        className="fixed inset-y-0 right-0 w-full sm:w-[460px] md:w-[500px] bg-[#F4F5F7] z-50 shadow-2xl flex flex-col border-l border-[#DFE1E6] select-none transform transition-transform duration-250 ease-out"
        role="dialog"
        aria-label="Staffify AI Copilot Assistant"
      >
        {/* Drawer Header */}
        <div className="h-14 px-4 bg-white border-b border-[#DFE1E6] flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <StaffifyLogo size="xs" showText={false} />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-[#172B4D] text-sm tracking-tight">
                  Staffify AI Copilot
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF] uppercase">
                  Enterprise
                </span>
                {aiStatus?.aiModelEnabled ? (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1] flex items-center gap-1"
                    title={`Google Gemini (${aiStatus.activeModel || "gemini-3.1-flash-lite"}) is active`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#36B37E] inline-block animate-pulse"></span>
                    Gemini Active
                  </span>
                ) : (
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#F4F5F7] text-[#5E6C84] border border-[#DFE1E6]"
                    title="Operating on built-in Deterministic Semantic Query Engine"
                  >
                    DSQE Engine
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#6B778C]">
                <Database size={10} className="text-[#0052CC]" />
                <span>Verified Database Grounding • Zero Hallucination</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Open Full Workspace */}
            <button
              type="button"
              onClick={() => {
                closeAssistant();
                navigate("/copilot");
              }}
              className="p-1.5 text-[#6B778C] hover:text-[#0052CC] hover:bg-[#DEEBFF]/50 rounded transition cursor-pointer"
              title="Open Fullscreen Workspace"
            >
              <ArrowUpRight size={16} />
            </button>

            {/* Clear / New Chat */}
            <button
              type="button"
              onClick={clearConversation}
              className="p-1.5 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded transition cursor-pointer"
              title="Start New Session"
            >
              <RefreshCw size={15} />
            </button>

            {/* Close Drawer */}
            <button
              type="button"
              onClick={closeAssistant}
              className="p-1.5 text-[#6B778C] hover:text-[#DE350B] hover:bg-[#FFEBE6] rounded transition cursor-pointer"
              title="Close Copilot (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Drawer Message Thread Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.map((msg) => (
            <AiMessageItem key={msg.id} message={msg} />
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="my-3 w-fit bg-white border border-[#DFE1E6] rounded-lg p-2.5 shadow-2xs">
              <StaffifyLoader size="sm" mode="card" text="Analyzing database & synthesizing insights..." showText={false} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Drawer Footer with Input & Context Prompts */}
        <div className="p-3 bg-white border-t border-[#DFE1E6] shrink-0">
          <AiPromptSuggestions />

          <form onSubmit={handleSubmit} className="mt-1 relative">
            <div className="flex items-end bg-[#FAFBFC] focus-within:bg-white border border-[#DFE1E6] focus-within:border-[#0052CC] rounded-lg p-2 transition shadow-2xs">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about employees, leaves, payroll, attendance, or tell me an action..."
                className="w-full bg-transparent outline-none text-xs text-[#172B4D] placeholder-[#6B778C] resize-none pr-8"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-1.5 rounded-md bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-30 disabled:cursor-not-allowed text-white transition shrink-0 cursor-pointer shadow-xs ml-1"
                title="Send query"
              >
                <Send size={14} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-[#6B778C]">
              <span>Press Enter to send • Shift+Enter for new line</span>
              <span className="font-mono bg-[#EBECF0] px-1 py-0.5 rounded border border-[#DFE1E6]">
                Ctrl + J
              </span>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}
