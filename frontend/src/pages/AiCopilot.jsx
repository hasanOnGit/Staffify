import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import StaffifyLogo from "../components/StaffifyLogo";
import AiMessageItem from "../components/ai/AiMessageItem";
import AiPromptSuggestions from "../components/ai/AiPromptSuggestions";
import { useAiAssistant } from "../context/AiAssistantContext";
import {
  Sparkles,
  Send,
  RefreshCw,
  Database,
  ShieldCheck,
  Layers,
  Clock,
  ArrowRight,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

export default function AiCopilot() {
  const {
    messages,
    loading,
    sendMessage,
    clearConversation,
    capabilities,
    conversations,
  } = useAiAssistant();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-3">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DFE1E6]">
          <div>
            <div className="flex items-center gap-2">
              <StaffifyLogo size="sm" showText={false} />
              <h1 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
                <span>Staffify AI Copilot Workspace</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF] uppercase">
                  Universal Analytics Engine
                </span>
              </h1>
            </div>
            <p className="text-xs text-[#6B778C] mt-0.5 flex items-center gap-1.5">
              <Database size={12} className="text-[#0052CC]" />
              <span>Grounded on live MongoDB Atlas operational data across 15+ business modules with deterministic calculations.</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearConversation}
              className="px-3 py-1.5 bg-white hover:bg-[#F4F5F7] border border-[#DFE1E6] text-[#172B4D] rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <RefreshCw size={13} />
              <span>New Session</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Body: Left Sidebar + Center Chat Area */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Left Panel: Capabilities Directory */}
          <div className="hidden lg:flex w-72 flex-col bg-white border border-[#DFE1E6] rounded-lg p-3 overflow-y-auto shrink-0 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#172B4D] pb-2 border-b border-[#DFE1E6]">
              <Layers size={14} className="text-[#0052CC]" />
              <span>Grounded Data Domains</span>
            </div>

            <div className="divide-y divide-[#DFE1E6] mt-2 space-y-1">
              {capabilities.map((cap) => (
                <div key={cap.id} className="pt-2 text-[11px]">
                  <p className="font-semibold text-[#172B4D]">{cap.displayName}</p>
                  <p className="text-[#6B778C] text-[10px] line-clamp-2 mt-0.5 leading-tight">
                    {cap.description}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {cap.samplePrompts?.slice(0, 1).map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => sendMessage(prompt)}
                        className="text-[9px] text-[#0747A6] bg-[#DEEBFF]/40 hover:bg-[#DEEBFF] px-1.5 py-0.5 rounded text-left truncate max-w-full cursor-pointer transition"
                        title={prompt}
                      >
                        → {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Conversation Canvas */}
          <div className="flex-1 flex flex-col bg-white border border-[#DFE1E6] rounded-lg overflow-hidden shadow-2xs">
            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg) => (
                <AiMessageItem key={msg.id} message={msg} />
              ))}

              {loading && (
                <div className="flex items-center gap-2.5 my-3 text-xs text-[#6B778C] bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg p-3 w-fit shadow-2xs">
                  <Sparkles size={14} className="text-[#0052CC] animate-spin" />
                  <span>Computing metrics and retrieving verified database records...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Canvas Input */}
            <div className="p-3 bg-[#FAFBFC] border-t border-[#DFE1E6] shrink-0">
              <AiPromptSuggestions />

              <form onSubmit={handleSubmit} className="mt-1">
                <div className="flex items-end bg-white border border-[#DFE1E6] focus-within:border-[#0052CC] rounded-lg p-2.5 shadow-xs transition">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about payroll, compare month-over-month expenses, check leave balances, or draft workflow actions..."
                    className="w-full bg-transparent outline-none text-xs text-[#172B4D] placeholder-[#6B778C] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2 rounded-md bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-30 disabled:cursor-not-allowed text-white transition shrink-0 cursor-pointer shadow-xs ml-2"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
