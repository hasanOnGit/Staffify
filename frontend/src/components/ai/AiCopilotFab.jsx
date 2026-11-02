import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  ShieldAlert,
  Send,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Zap,
  ArrowRight,
  Clock,
  Layers,
  Search,
} from "lucide-react";
import { aiApi } from "../../services/api";

export default function AiCopilotFab() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'watchdog'
  const [anomalies, setAnomalies] = useState([]);
  const [stats, setStats] = useState({ critical: 0, warning: 0, info: 0, total: 0 });
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your **StaffifyGo AI Manpower Copilot**. I monitor operational workforce data, PO budgets, attendance muster rolls, statutory compliance, and bench worker allocations. How can I assist you today?",
      quickActions: [
        { label: "Audit PO Burn", query: "Audit PO budget burn rate and utilization" },
        { label: "Check Bench", query: "How many workers are ready on the bench?" },
        { label: "Verify Compliance", query: "Summarize labor compliance and EPF/ESIC returns" },
        { label: "Worker Exits", query: "Summarize worker exits and final payouts" },
      ],
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadAnomalies();
  }, []);

  useEffect(() => {
    if (chatEndRef.current && activeTab === "chat") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const loadAnomalies = async () => {
    try {
      setLoadingAnomalies(true);
      const res = await aiApi.getAnomalies();
      if (res.data?.success) {
        setAnomalies(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load anomalies:", err);
    } finally {
      setLoadingAnomalies(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim()) return;

    const userMsg = {
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsSending(true);

    try {
      const res = await aiApi.chat(text.trim());
      if (res.data?.success) {
        const assistantMsg = {
          role: "assistant",
          content: res.data.answer,
          quickActions: res.data.quickActions || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(res.data?.message || "Failed to get AI response");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I encountered a temporary connection issue. Please verify your query or refresh the connection.",
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickAction = (route) => {
    setIsOpen(false);
    navigate(route);
  };

  const renderFormattedMarkdown = (content) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-bold text-xs text-[#0052CC] dark:text-[#579DFF] mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("- ")) {
        const bulletText = line.replace("- ", "");
        // Highlight bold text
        const parts = bulletText.split(/\*\*(.*?)\*\*/g);
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-[#172B4D] dark:text-[#F1F5F9] my-0.5 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] dark:bg-[#579DFF] mt-1.5 shrink-0" />
            <span>
              {parts.map((p, pIdx) =>
                pIdx % 2 === 1 ? (
                  <strong key={pIdx} className="font-semibold text-[#172B4D] dark:text-white">
                    {p}
                  </strong>
                ) : (
                  p
                )
              )}
            </span>
          </div>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={idx} className="font-semibold text-xs text-[#172B4D] dark:text-[#F1F5F9] mt-2 mb-1">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1" />;
      }
      // General paragraph
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={idx} className="text-xs text-[#172B4D] dark:text-[#F1F5F9] my-1">
          {parts.map((p, pIdx) =>
            pIdx % 2 === 1 ? (
              <strong key={pIdx} className="font-semibold text-[#172B4D] dark:text-white">
                {p}
              </strong>
            ) : (
              p
            )
          )}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-5 right-5 z-40 print:hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          title="StaffifyGo AI Copilot & Watchdog"
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-lg shadow-blue-900/30 transition-transform hover:scale-105 active:scale-95 group focus:outline-none"
        >
          <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />

          {/* Anomaly Badge */}
          {stats.total > 0 && (
            <span
              className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-bold rounded-full text-white shadow-sm ${
                stats.critical > 0 ? "bg-[#DE350B] animate-pulse" : "bg-[#B9770E]"
              }`}
            >
              {stats.total}
            </span>
          )}
        </button>
      </div>

      {/* Slide-Over AI Copilot Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white dark:bg-[#0F131C] shadow-2xl border-l border-[#DFE1E6] dark:border-[#263042] flex flex-col print:hidden animate-in slide-in-from-right duration-200">
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0052CC] flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] uppercase tracking-wide">
                    StaffifyGo AI Copilot
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-[#00875A]" title="Online & Connected" />
                </div>
                <p className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                  Autonomous Workforce & Risk Watchdog
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={loadAnomalies}
                title="Refresh Watchdog & Data"
                className="p-1.5 rounded text-[#6B778C] hover:text-[#0052CC] dark:hover:text-[#579DFF] hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAnomalies ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded text-[#6B778C] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] px-3">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "chat"
                  ? "border-[#0052CC] text-[#0052CC] dark:text-[#579DFF]"
                  : "border-transparent text-[#6B778C] dark:text-[#94A3B8] hover:text-[#172B4D] dark:hover:text-[#F1F5F9]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Copilot Chat</span>
            </button>

            <button
              onClick={() => setActiveTab("watchdog")}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors relative ${
                activeTab === "watchdog"
                  ? "border-[#0052CC] text-[#0052CC] dark:text-[#579DFF]"
                  : "border-transparent text-[#6B778C] dark:text-[#94A3B8] hover:text-[#172B4D] dark:hover:text-[#F1F5F9]"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Risk Watchdog</span>
              {stats.total > 0 && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full text-white ml-1 ${
                    stats.critical > 0 ? "bg-[#DE350B]" : "bg-[#B9770E]"
                  }`}
                >
                  {stats.total}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Chat View */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFBFC] dark:bg-[#090D14]">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed shadow-xs ${
                        msg.role === "user"
                          ? "bg-[#0052CC] text-white rounded-br-xs"
                          : "bg-white dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] rounded-bl-xs"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        renderFormattedMarkdown(msg.content)
                      ) : (
                        <p>{msg.content}</p>
                      )}

                      {/* Quick Action Navigation Buttons */}
                      {msg.quickActions && msg.quickActions.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[#DFE1E6]/60 dark:border-[#263042] flex flex-wrap gap-1.5">
                          {msg.quickActions.map((qa, qaIdx) => (
                            <button
                              key={qaIdx}
                              onClick={() =>
                                qa.route ? handleQuickAction(qa.route) : handleSendMessage(qa.query)
                              }
                              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.8 rounded bg-[#DEEBFF] dark:bg-[#1C2331] text-[#0052CC] dark:text-[#579DFF] hover:bg-[#B3D4FF] dark:hover:bg-[#263042] transition-colors"
                            >
                              <span>{qa.label}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-[#6B778C] dark:text-[#94A3B8] mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}

                {isSending && (
                  <div className="flex items-center gap-2 p-3 bg-white dark:bg-[#151B26] rounded-xl border border-[#DFE1E6] dark:border-[#263042] w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0052CC]" />
                    <span className="text-xs text-[#6B778C] dark:text-[#94A3B8]">
                      Consulting workforce database...
                    </span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white dark:bg-[#0F131C] border-t border-[#DFE1E6] dark:border-[#263042]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about POs, workers, compliance, wages..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#151B26] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-none focus:border-[#0052CC]"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isSending}
                    className="p-2 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 2: Watchdog Risk Feed */}
          {activeTab === "watchdog" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFC] dark:bg-[#090D14]">
              {/* Summary Bar */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-center">
                  <div className="text-[10px] text-[#DE350B] font-bold uppercase">Critical</div>
                  <div className="text-base font-bold text-[#DE350B] mt-0.5">{stats.critical}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-center">
                  <div className="text-[10px] text-[#B9770E] font-bold uppercase">Warnings</div>
                  <div className="text-base font-bold text-[#B9770E] mt-0.5">{stats.warning}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-center">
                  <div className="text-[10px] text-[#0052CC] font-bold uppercase">Info / Action</div>
                  <div className="text-base font-bold text-[#0052CC] mt-0.5">{stats.info}</div>
                </div>
              </div>

              {anomalies.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#151B26] rounded-xl border border-[#DFE1E6] dark:border-[#263042]">
                  <CheckCircle2 className="w-8 h-8 text-[#00875A] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                    No Operational Risks Detected
                  </p>
                  <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mt-1">
                    PO budgets, KYC compliance, attendance, and worker exits are all within normal thresholds.
                  </p>
                </div>
              ) : (
                anomalies.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-[#151B26] rounded-xl border border-[#DFE1E6] dark:border-[#263042] shadow-xs space-y-2 hover:border-[#0052CC]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            item.severity === "CRITICAL"
                              ? "bg-[#FFEBE6] text-[#DE350B]"
                              : item.severity === "WARNING"
                              ? "bg-[#FFF0B3] text-[#B9770E]"
                              : "bg-[#DEEBFF] text-[#0052CC]"
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B778C]">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] leading-relaxed">
                      {item.description}
                    </p>

                    <div className="p-2 rounded bg-[#FAFBFC] dark:bg-[#101520] border border-[#DFE1E6]/60 dark:border-[#263042] text-[10px] text-[#172B4D] dark:text-[#F1F5F9]">
                      <span className="font-semibold text-[#0052CC] dark:text-[#579DFF]">
                        Recommended Action:{" "}
                      </span>
                      {item.recommendedAction}
                    </div>

                    {item.actionRoute && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleQuickAction(item.actionRoute)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0052CC] dark:text-[#579DFF] hover:underline"
                        >
                          <span>Resolve Issue</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
