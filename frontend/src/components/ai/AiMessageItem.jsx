import { Bot, User, Database, ShieldCheck, AlertCircle } from "lucide-react";
import AiKpiCards from "./AiKpiCards";
import AiDataTable from "./AiDataTable";
import AiActionCard from "./AiActionCard";

export default function AiMessageItem({ message }) {
  const isUser = message.role === "user";
  const isError = Boolean(message.error);

  return (
    <div
      className={`flex gap-2.5 my-3 text-xs leading-relaxed ${
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
        className={`max-w-[85%] rounded-lg p-3 ${
          isUser
            ? "bg-[#0052CC] text-white rounded-tr-none shadow-xs"
            : isError
            ? "bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD] rounded-tl-none"
            : "bg-white text-[#172B4D] border border-[#DFE1E6] rounded-tl-none shadow-2xs"
        }`}
      >
        {/* Message Text with Simple Markdown Bold / Paragraph support */}
        <div className="whitespace-pre-wrap space-y-1">
          {message.content.split("\n").map((line, lIdx) => {
            // Replace **bold** with <strong>
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={lIdx}>
                {parts.map((part, pIdx) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={pIdx} className="font-bold">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>

        {/* Source Citation & Data Freshness Indicator */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-[#DFE1E6] flex items-center gap-1.5 text-[10px] text-[#6B778C]">
            <Database size={11} className="text-[#0052CC]" />
            <span>
              {message.citations.map((c) => `${c.source} (${c.recordCount || 0} records)`).join(" • ")}
            </span>
            <ShieldCheck size={11} className="text-[#00875A] ml-auto" title="Verified Database Grounding" />
          </div>
        )}

        {/* KPI Metric Summary Cards */}
        {!isUser && message.kpis && message.kpis.length > 0 && (
          <AiKpiCards kpis={message.kpis} />
        )}

        {/* Data Table */}
        {!isUser && message.records && message.records.length > 0 && (
          <AiDataTable
            records={message.records}
            columns={message.columns || []}
            title={message.context?.module ? `${message.context.module.toUpperCase()} Records` : "Query Results"}
          />
        )}

        {/* Action Draft Confirmation Card */}
        {!isUser && message.actionDraft && (
          <AiActionCard draft={message.actionDraft} />
        )}

        {/* Timestamp */}
        <div
          className={`text-[9px] mt-1 text-right ${
            isUser ? "text-blue-100" : "text-[#6B778C]"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
