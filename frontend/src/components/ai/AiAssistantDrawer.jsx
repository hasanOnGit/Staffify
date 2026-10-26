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
        className="fixed inset-y-0 right-0 w-full sm:w-[460px] md:w-[500px] bg-[#F4F5F7] dark:bg-[#090D14] z-50 shadow-2xl flex flex-col border-l border-[#DFE1E6] dark:border-[#263042] select-none transform transition-transform duration-250 ease-out"
        role="dialog"
        aria-label="Staffify AI Copilot Assistant"
      >
        {/* Drawer Header */}
        <div className="h-14 px-4 bg-white dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between shrink-0 shadow-2xs transition-colors">
          <div className="flex items-center gap-2">
            <StaffifyLogo size="xs" showText={false} />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-[#172B4D] dark:text-neutral-100 text-sm tracking-tight">
                  Staffify AI Copilot
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0747A6] dark:text-[#579DFF] border border-[#B3D4FF] dark:border-[#263042] uppercase">
                  Enterprise
                </span>
                {aiStatus?.aiModelEnabled ? (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#006644] dark:text-emerald-400 border border-[#ABF5D1] dark:border-emerald-800 flex items-center gap-1"
                    title={`Google Gemini (${aiStatus.activeModel || "gemini-3.1-flash-lite"}) is active`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#36B37E] inline-block animate-pulse"></span>
                    Gemini Active
                  </span>
                ) : (
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#F4F5F7] dark:bg-[#1C2331] text-[#5E6C84] dark:text-neutral-400 border border-[#DFE1E6] dark:border-[#263042]"
                    title="Operating on built-in Deterministic Semantic Query Engine"
                  >
                    DSQE Engine
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#6B778C] dark:text-neutral-400">
                <Database size={10} className="text-[#0052CC] dark:text-[#579DFF]" />
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
              className="p-1.5 text-[#6B778C] dark:text-neutral-400 hover:text-[#0052CC] dark:hover:text-[#579DFF] hover:bg-[#DEEBFF]/50 dark:hover:bg-[#1C2331] rounded transition cursor-pointer"
              title="Open Fullscreen Workspace"
            >
              <ArrowUpRight size={16} />
            </button>

            {/* Clear / New Chat */}
            <button
              type="button"
              onClick={clearConversation}
              className="p-1.5 text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded transition cursor-pointer"
              title="Start New Session"
            >
              <RefreshCw size={15} />
            </button>

            {/* Close Drawer */}
            <button
              type="button"
              onClick={closeAssistant}
              className="p-1.5 text-[#6B778C] dark:text-neutral-400 hover:text-[#DE350B] hover:bg-[#FFEBE6] dark:hover:bg-[#DE350B]/10 rounded transition cursor-pointer"
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
            <div className="my-3 w-fit bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg p-2.5 shadow-2xs">
              <StaffifyLoader size="sm" mode="card" text="Analyzing database & synthesizing insights..." showText={false} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Drawer Footer with Input & Context Prompts */}
        <div className="p-3 bg-white dark:bg-[#151B26] border-t border-[#DFE1E6] dark:border-[#263042] shrink-0 transition-colors">
          <AiPromptSuggestions />

          <form onSubmit={handleSubmit} className="mt-1 relative">
            <div className="flex items-end bg-[#FAFBFC] dark:bg-[#090D14] focus-within:bg-white dark:focus-within:bg-[#1C2331] border border-[#DFE1E6] dark:border-[#263042] focus-within:border-[#0052CC] rounded-lg p-2 transition shadow-2xs">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about employees, leaves, payroll, attendance, or tell me an action..."
                className="w-full bg-transparent outline-none text-xs text-[#172B4D] dark:text-neutral-100 placeholder-[#6B778C] dark:placeholder-neutral-500 resize-none pr-8"
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
            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-[#6B778C] dark:text-neutral-400">
              <span>Press Enter to send • Shift+Enter for new line</span>
              <span className="font-mono bg-[#EBECF0] dark:bg-[#1C2331] px-1 py-0.5 rounded border border-[#DFE1E6] dark:border-[#263042]">
                Ctrl + J
              </span>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}
