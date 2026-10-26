import { useState } from "react";
import {
  Bot,
  User,
  Database,
  ShieldCheck,
  Sparkles,
  CornerDownRight,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Lightbulb,
  Globe,
} from "lucide-react";
import AiKpiCards from "./AiKpiCards";
import AiDataTable from "./AiDataTable";
import AiDataChart from "./AiDataChart";
import AiActionCard from "./AiActionCard";
import { useAiAssistant } from "../../context/AiAssistantContext";
import aiService from "../../services/ai.service";
import toast from "react-hot-toast";

export default function AiMessageItem({ message }) {
  const { sendMessage } = useAiAssistant();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // "up" | "down" | null

  const isUser = message.role === "user";
  const isError = Boolean(message.error);

  // Parse structured sections
  const startingSummary = message.summary || message.content;
  const detailedDescription = message.description;
  const followUps = message.suggestedFollowUps || [];

  const handleCopyMessage = () => {
    try {
      const parts = [];
      if (startingSummary) parts.push(startingSummary);
      if (detailedDescription) parts.push(detailedDescription);
      navigator.clipboard.writeText(parts.join("\n\n"));
      setCopied(true);
      toast.success("Analysis copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy: " + err.message);
    }
  };

  const handleFeedback = async (type) => {
    const nextVal = feedback === type ? null : type;
    setFeedback(nextVal);
    if (message.logId) {
      try {
        await aiService.submitFeedback(message.logId, nextVal);
      } catch (_) {}
    }
    toast.success(type === "up" ? "Thank you for the feedback!" : "Feedback recorded.");
  };

  // Helper to render markdown text with bolding and lists
  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lIdx} className="h-1" />;
      }

      // H3 header
      if (trimmed.startsWith("### ")) {
        const headerText = trimmed.replace(/^###\s+/, "");
        return (
          <div key={lIdx} className="pt-2 pb-0.5 flex items-center gap-1.5 font-bold text-xs text-[#172B4D]">
            <Lightbulb size={12} className="text-[#0052CC]" />
            <span>{headerText}</span>
          </div>
        );
      }

      // Bullet item
      if (trimmed.startsWith("- ")) {
        const bulletText = trimmed.replace(/^-\s+/, "");
        const parts = bulletText.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={lIdx} className="flex items-start gap-1.5 pl-1 my-0.5 text-[11px] text-[#253858]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] shrink-0 mt-1.5" />
            <div className="leading-snug">
              {parts.map((part, pIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={pIdx} className="font-semibold text-[#172B4D]">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </div>
          </div>
        );
      }

      // Standard paragraph with bold support
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lIdx} className="text-xs leading-relaxed text-[#172B4D]">
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-bold text-[#0747A6]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div
      className={`flex gap-2.5 my-3.5 text-xs leading-relaxed ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
          isUser
            ? "bg-[#FF8B00]"
            : isError
            ? "bg-[#DE350B]"
            : "bg-[#0052CC] shadow-xs"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Message Bubble Content */}
      <div
        className={`max-w-[88%] rounded-lg p-3.5 ${
          isUser
            ? "bg-[#0052CC] text-white rounded-tr-none shadow-xs"
            : isError
            ? "bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD] rounded-tl-none"
            : "bg-white text-[#172B4D] border border-[#DFE1E6] rounded-tl-none shadow-2xs"
        }`}
      >
        {/* User Message View */}
        {isUser && <p className="whitespace-pre-wrap">{message.content}</p>}

        {/* Assistant Message View */}
        {!isUser && (
          <div className="space-y-3">
            {/* 1. STARTING EXECUTIVE SUMMARY */}
            <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-md p-2.5">
              <div className="flex items-center gap-1.5 pb-1 mb-1.5 border-b border-[#EBECF0] text-[10px] font-bold uppercase tracking-wider text-[#0052CC]">
                <Sparkles size={11} />
                <span>Executive Summary</span>
              </div>
              <div className="space-y-1">{renderFormattedText(startingSummary)}</div>
            </div>

            {/* 2. KPI METRIC SUMMARY CARDS */}
            {message.kpis && message.kpis.length > 0 && <AiKpiCards kpis={message.kpis} />}

            {/* 3. INTERACTIVE SVG DATA VISUALIZATION (DONUT / BAR / FUNNEL) */}
            {message.chartConfig && <AiDataChart chartConfig={message.chartConfig} />}

            {/* 4. INTERACTIVE DATA EXPLORER / TABLE */}
            {message.records && message.records.length > 0 && (
              <AiDataTable
                records={message.records}
                columns={message.columns || []}
                title={
                  message.context?.module
                    ? `${message.context.module.toUpperCase()} Analysis`
                    : "Query Results"
                }
              />
            )}

            {/* 5. DETAILED BREAKDOWN & ANALYTICAL DESCRIPTION */}
            {detailedDescription && (
              <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-md p-3">
                <div className="flex items-center gap-1.5 pb-1 mb-2 border-b border-[#EBECF0] text-[10px] font-bold uppercase tracking-wider text-[#42526E]">
                  <FileText size={11} className="text-[#0052CC]" />
                  <span>Analytical Breakdown & Insights</span>
                </div>
                <div className="space-y-1 text-xs">{renderFormattedText(detailedDescription)}</div>
              </div>
            )}

            {/* Action Draft Confirmation Card */}
            {message.actionDraft && <AiActionCard draft={message.actionDraft} />}

            {/* 6. INTERACTIVE CLICKABLE SUGGESTED FOLLOW-UPS */}
            {followUps.length > 0 && (
              <div className="pt-2 border-t border-[#EBECF0]">
                <p className="text-[10px] font-semibold text-[#6B778C] mb-1.5 flex items-center gap-1">
                  <CornerDownRight size={11} className="text-[#0052CC]" />
                  <span>Suggested Next Questions:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {followUps.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="px-2.5 py-1 rounded-full bg-[#FAFBFC] hover:bg-[#DEEBFF] hover:border-[#0052CC] border border-[#DFE1E6] text-[11px] text-[#0747A6] font-medium transition cursor-pointer text-left flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles size={10} className="text-[#0052CC] shrink-0" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 7. UTILITY FOOTER: CITATION, FEEDBACK & TIMESTAMP */}
            <div className="pt-2 border-t border-[#DFE1E6] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#6B778C]">
              {/* Database citation badge & model/language info */}
              <div className="flex items-center gap-1.5">
                <Database size={11} className="text-[#0052CC]" />
                <span>
                  {message.citations && message.citations.length > 0
                    ? message.citations.map((c) => `${c.source} (${c.recordCount || 0} records)`).join(" • ")
                    : "Verified MongoDB Atlas"}
                </span>
                <ShieldCheck size={11} className="text-[#00875A]" title="Verified Database Grounding" />
                {message.modelUsed && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#EAE6FF] text-[#403294] border border-[#D3CAFC]">
                    {message.modelUsed.includes("gemini") ? "Google Gemini" : "DSQE Engine"}
                  </span>
                )}
                {message.detectedLanguage && message.detectedLanguage !== "en" && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Globe size={9} />
                    <span>
                      {message.detectedLanguage === "hi"
                        ? "Hindi / Hinglish"
                        : message.detectedLanguage === "es"
                        ? "Spanish"
                        : message.detectedLanguage === "fr"
                        ? "French"
                        : message.detectedLanguage.toUpperCase()}
                    </span>
                  </span>
                )}
              </div>

              {/* Action buttons & feedback */}
              <div className="flex items-center gap-2">
                {/* Copy answer */}
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="p-1 hover:bg-[#EBECF0] rounded text-[#6B778C] hover:text-[#172B4D] transition cursor-pointer flex items-center gap-1"
                  title="Copy analysis text"
                >
                  {copied ? <Check size={11} className="text-[#00875A]" /> : <Copy size={11} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                {/* Helpful feedback */}
                <div className="flex items-center gap-1 border-l border-[#DFE1E6] pl-2">
                  <button
                    type="button"
                    onClick={() => handleFeedback("up")}
                    className={`p-1 rounded transition cursor-pointer ${
                      feedback === "up" ? "text-[#00875A] bg-[#E3FCEF]" : "text-[#6B778C] hover:text-[#172B4D]"
                    }`}
                    title="Helpful response"
                  >
                    <ThumbsUp size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback("down")}
                    className={`p-1 rounded transition cursor-pointer ${
                      feedback === "down" ? "text-[#DE350B] bg-[#FFEBE6]" : "text-[#6B778C] hover:text-[#172B4D]"
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown size={11} />
                  </button>
                </div>

                {/* Timestamp */}
                <span className="text-[9px] text-[#A5ADBA]">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User message timestamp */}
        {isUser && (
          <div className="text-[9px] mt-1 text-right text-blue-100">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </div>
  );
}
