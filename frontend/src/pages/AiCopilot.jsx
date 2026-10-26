import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import StaffifyLogo from "../components/StaffifyLogo";
import StaffifyLoader from "../components/StaffifyLoader";
import AiMessageItem from "../components/ai/AiMessageItem";
import AiPromptSuggestions from "../components/ai/AiPromptSuggestions";
import { useAiAssistant } from "../context/AiAssistantContext";
import aiService from "../services/ai.service";
import toast from "react-hot-toast";
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
  History,
  BookOpen,
  Download,
  Search,
  ThumbsUp,
  ThumbsDown,
  Tag,
  Filter,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  FileText,
  ChevronRight,
} from "lucide-react";
import AiDocumentModal from "../components/ai/AiDocumentModal";

export default function AiCopilot() {
  const {
    messages,
    loading,
    sendMessage,
    clearConversation,
    capabilities,
    aiStatus,
  } = useAiAssistant();

  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "logs" | "knowledge" | "watchdog"
  const [input, setInput] = useState("");
  const [showDocModal, setShowDocModal] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Watchdog state
  const [watchdogDigest, setWatchdogDigest] = useState(null);
  const [watchdogAlerts, setWatchdogAlerts] = useState([]);
  const [watchdogLoading, setWatchdogLoading] = useState(false);
  const [selectedAlertCategory, setSelectedAlertCategory] = useState("");

  // Query logs state
  const [logs, setLogs] = useState([]);
  const [logsStats, setLogsStats] = useState({ totalQueries: 0, positiveFeedback: 0, negativeFeedback: 0 });
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState("");
  const [selectedIntent, setSelectedIntent] = useState("");

  // Knowledge base state
  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [knowledgeSearch, setKnowledgeSearch] = useState("");

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, activeTab]);

  // Load logs or watchdog when switching tabs
  useEffect(() => {
    if (activeTab === "logs") {
      loadLogs();
    } else if (activeTab === "knowledge") {
      loadKnowledge();
    } else if (activeTab === "watchdog") {
      loadWatchdog();
    }
  }, [activeTab, selectedAlertCategory]);

  const loadWatchdog = async () => {
    setWatchdogLoading(true);
    try {
      const [digest, alerts] = await Promise.all([
        aiService.getWatchdogDigest(),
        aiService.getWatchdogAlerts({ category: selectedAlertCategory || undefined }),
      ]);
      setWatchdogDigest(digest);
      setWatchdogAlerts(alerts || []);
    } catch (err) {
      toast.error("Failed to load Watchdog digest: " + err.message);
    } finally {
      setWatchdogLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await aiService.resolveAnomalyAlert(alertId, "Acknowledged and resolved by HR administrator");
      toast.success("Anomaly alert marked as resolved");
      loadWatchdog();
    } catch (err) {
      toast.error("Failed to resolve alert: " + err.message);
    }
  };

  const handleInvestigateAlert = (alert) => {
    setActiveTab("chat");
    const query = `Investigate anomaly in ${alert.category}: ${alert.title}. ${alert.description}`;
    sendMessage(query);
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await aiService.getLogs({
        search: logsSearch,
        intentType: selectedIntent || undefined,
        limit: 50,
      });
      if (res.success) {
        setLogs(res.data || []);
        if (res.stats) setLogsStats(res.stats);
      }
    } catch (err) {
      toast.error("Failed to fetch query logs: " + err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadKnowledge = async () => {
    setKnowledgeLoading(true);
    try {
      const data = await aiService.getKnowledgeBase({
        category: selectedCategory || undefined,
        search: knowledgeSearch || undefined,
      });
      setKnowledgeArticles(data || []);
    } catch (err) {
      toast.error("Failed to fetch knowledge base: " + err.message);
    } finally {
      setKnowledgeLoading(false);
    }
  };

  const handleExportTrainingDataset = async () => {
    try {
      await aiService.downloadTrainingDataset();
      toast.success("AI Training Dataset (.jsonl) downloaded successfully");
    } catch (err) {
      toast.error("Failed to download training dataset: " + err.message);
    }
  };

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

  const handlePromptFromKnowledge = (question) => {
    setActiveTab("chat");
    sendMessage(question);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-3">
        {/* Top Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-2 border-b border-[#DFE1E6] dark:border-[#202E5C]">
          <div>
            <div className="flex items-center gap-2">
              <StaffifyLogo size="sm" showText={false} />
              <h1 className="text-xl font-bold text-[#172B4D] dark:text-neutral-100 flex items-center gap-2 flex-wrap">
                <span>Staffify AI Copilot Workspace</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DEEBFF] dark:bg-[#16224A] text-[#0747A6] dark:text-[#4C9AFF] border border-[#B3D4FF] dark:border-[#202E5C] uppercase">
                  Universal Analytics & Open Knowledge
                </span>
                {aiStatus?.aiModelEnabled ? (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#006644] dark:text-emerald-400 border border-[#ABF5D1] dark:border-emerald-800 flex items-center gap-1.5"
                    title={`Google Gemini (${aiStatus.activeModel || "gemini-3.1-flash-lite"}) is active`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#36B37E] inline-block animate-pulse"></span>
                    <span>Gemini Active</span>
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F4F5F7] dark:bg-[#16224A] text-[#5E6C84] dark:text-neutral-400 border border-[#DFE1E6] dark:border-[#202E5C]"
                    title="Operating on built-in Deterministic Semantic Query Engine"
                  >
                    DSQE Engine
                  </span>
                )}
              </h1>
            </div>
            <p className="text-xs text-[#6B778C] dark:text-neutral-400 mt-0.5 flex items-center gap-1.5">
              <Database size={12} className="text-[#0052CC] dark:text-[#4C9AFF]" />
              <span>Grounded on live MongoDB operational collections and statutory open-source HR knowledge.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 shrink-0 max-w-full">
            {/* Tab Switcher */}
            <div className="flex items-center bg-[#EBECF0] dark:bg-[#16224A] p-0.5 rounded-md border border-[#DFE1E6] dark:border-[#202E5C] shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === "chat"
                    ? "bg-white dark:bg-[#111C3D] text-[#0052CC] dark:text-[#4C9AFF] shadow-xs"
                    : "text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white"
                }`}
              >
                <MessageSquare size={13} />
                <span>Interactive Copilot</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === "logs"
                    ? "bg-white dark:bg-[#111C3D] text-[#0052CC] dark:text-[#4C9AFF] shadow-xs"
                    : "text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white"
                }`}
              >
                <History size={13} />
                <span>Input Logs & Training</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("knowledge")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === "knowledge"
                    ? "bg-white dark:bg-[#111C3D] text-[#0052CC] dark:text-[#4C9AFF] shadow-xs"
                    : "text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white"
                }`}
              >
                <BookOpen size={13} />
                <span>HR Knowledge Base</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("watchdog")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === "watchdog"
                    ? "bg-white dark:bg-[#111C3D] text-[#DE350B] dark:text-rose-400 shadow-xs font-bold"
                    : "text-[#42526E] dark:text-neutral-300 hover:text-[#172B4D] dark:hover:text-white"
                }`}
              >
                <ShieldAlert size={13} className="text-[#DE350B] dark:text-rose-400" />
                <span>Workforce Watchdog</span>
                {watchdogDigest?.criticalCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE350B] inline-block animate-ping ml-1" />
                )}
              </button>
            </div>

            {/* Document Studio Trigger */}
            <button
              type="button"
              onClick={() => setShowDocModal(true)}
              className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
            >
              <FileText size={13} />
              <span>HR Document Studio</span>
            </button>

            {activeTab === "chat" && (
              <button
                type="button"
                onClick={clearConversation}
                className="px-3 py-1.5 bg-white dark:bg-[#16224A] hover:bg-[#F4F5F7] dark:hover:bg-[#202E5C] border border-[#DFE1E6] dark:border-[#202E5C] text-[#172B4D] dark:text-neutral-100 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
              >
                <RefreshCw size={13} />
                <span>New Session</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: INTERACTIVE COPILOT CHAT */}
        {activeTab === "chat" && (
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Left Panel: Capabilities Directory */}
            <div className="hidden lg:flex w-72 flex-col bg-white dark:bg-[#111C3D] border border-[#DFE1E6] dark:border-[#202E5C] rounded-lg p-3 overflow-y-auto shrink-0 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#172B4D] dark:text-neutral-100 pb-2 border-b border-[#DFE1E6] dark:border-[#202E5C]">
                <Layers size={14} className="text-[#0052CC] dark:text-[#4C9AFF]" />
                <span>Grounded Data Domains</span>
              </div>

              <div className="divide-y divide-[#DFE1E6] dark:divide-[#202E5C] mt-2 space-y-1">
                {capabilities.map((cap) => (
                  <div key={cap.id} className="pt-2 text-[11px]">
                    <p className="font-semibold text-[#172B4D] dark:text-neutral-100">{cap.displayName}</p>
                    <p className="text-[#6B778C] dark:text-neutral-400 text-[10px] line-clamp-2 mt-0.5 leading-tight">
                      {cap.description}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {cap.samplePrompts?.slice(0, 1).map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => sendMessage(prompt)}
                          className="text-[9px] text-[#0747A6] dark:text-[#4C9AFF] bg-[#DEEBFF]/40 dark:bg-[#16224A] hover:bg-[#DEEBFF] dark:hover:bg-[#202E5C] px-1.5 py-0.5 rounded text-left truncate max-w-full cursor-pointer transition flex items-center gap-1 border border-transparent dark:border-[#202E5C]"
                          title={prompt}
                        >
                          <ArrowRight size={10} className="shrink-0 text-[#0052CC] dark:text-[#4C9AFF]" />
                          <span className="truncate">{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Conversation Canvas */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#111C3D] border border-[#DFE1E6] dark:border-[#202E5C] rounded-lg overflow-hidden shadow-2xs">
              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => (
                  <AiMessageItem key={msg.id} message={msg} />
                ))}

                {loading && (
                  <div className="my-3 w-fit bg-[#FAFBFC] dark:bg-[#0B132B] border border-[#DFE1E6] dark:border-[#202E5C] rounded-lg p-3 shadow-2xs">
                    <StaffifyLoader size="sm" mode="card" text="Staffify Copilot is synthesizing verified database insights..." showText={false} />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Canvas Input */}
              <div className="p-3 bg-[#FAFBFC] dark:bg-[#0B132B] border-t border-[#DFE1E6] dark:border-[#202E5C] shrink-0">
                <AiPromptSuggestions />

                <form onSubmit={handleSubmit} className="mt-1">
                  <div className="flex items-end bg-white dark:bg-[#111C3D] border border-[#DFE1E6] dark:border-[#202E5C] focus-within:border-[#0052CC] rounded-lg p-2.5 shadow-xs transition">
                    <textarea
                      ref={inputRef}
                      rows={2}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Say hello, ask about payroll, request leave, or ask about statutory HR policies..."
                      className="w-full bg-transparent outline-none text-xs text-[#172B4D] dark:text-neutral-100 placeholder-[#6B778C] dark:placeholder-neutral-500 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="p-2 rounded-md bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-30 disabled:cursor-not-allowed text-white transition shrink-0 cursor-pointer shadow-xs ml-2"
                      title="Send query"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER INPUT LOGS & TRAINING DATASET */}
        {activeTab === "logs" && (
          <div className="flex-1 flex flex-col bg-white border border-[#DFE1E6] rounded-lg p-4 overflow-hidden shadow-2xs space-y-3">
            {/* Top KPI Summary & Export Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DFE1E6]">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-md bg-[#FAFBFC] border border-[#DFE1E6]">
                  <p className="text-[10px] text-[#6B778C] font-semibold uppercase">Total Queries Logged</p>
                  <p className="text-base font-bold text-[#172B4D]">{logsStats.totalQueries}</p>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-[#FAFBFC] border border-[#DFE1E6]">
                  <p className="text-[10px] text-[#6B778C] font-semibold uppercase">Positive Feedback</p>
                  <p className="text-base font-bold text-[#00875A]">{logsStats.positiveFeedback}</p>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-[#FAFBFC] border border-[#DFE1E6]">
                  <p className="text-[10px] text-[#6B778C] font-semibold uppercase">Negative Feedback</p>
                  <p className="text-base font-bold text-[#DE350B]">{logsStats.negativeFeedback}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadLogs}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#F4F5F7] border border-[#DFE1E6] text-[#172B4D] rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Refresh logs"
                >
                  <RefreshCw size={12} className={logsLoading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportTrainingDataset}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  title="Export training samples for model fine-tuning"
                >
                  <Download size={13} />
                  <span>Export Training Dataset (JSONL)</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search size={12} className="absolute left-2.5 top-2.5 text-[#6B778C]" />
                <input
                  type="text"
                  value={logsSearch}
                  onChange={(e) => setLogsSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadLogs()}
                  placeholder="Search user inputs or summaries..."
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#FAFBFC] border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedIntent}
                  onChange={(e) => {
                    setSelectedIntent(e.target.value);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none"
                >
                  <option value="">All Intent Types</option>
                  <option value="QUERY">Database Query</option>
                  <option value="CONVERSATIONAL">Conversational / Greetings</option>
                  <option value="KNOWLEDGE_BASE">Statutory Policy</option>
                  <option value="ACTION_DRAFT">Action Draft</option>
                </select>
                <button
                  type="button"
                  onClick={loadLogs}
                  className="px-3 py-1.5 bg-[#F4F5F7] hover:bg-[#EBECF0] border border-[#DFE1E6] text-xs font-medium rounded cursor-pointer"
                >
                  Apply Filter
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="flex-1 overflow-x-auto border border-[#DFE1E6] rounded-md">
              <table className="w-full text-left text-[11px] text-[#172B4D]">
                <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6] text-[10px] font-bold text-[#6B778C] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Input Query</th>
                    <th className="px-3 py-2">Intent</th>
                    <th className="px-3 py-2">Module</th>
                    <th className="px-3 py-2">Engine / Model</th>
                    <th className="px-3 py-2">Response Summary</th>
                    <th className="px-3 py-2">Latency</th>
                    <th className="px-3 py-2">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6]">
                  {logsLoading ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-10 text-center">
                        <StaffifyLoader size="sm" mode="card" text="Retrieving audit logs & training records..." showText={false} />
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-6 text-center text-xs text-[#6B778C]">
                        No query logs found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id || log.logId} className="hover:bg-[#F4F5F7] transition">
                        <td className="px-3 py-2 whitespace-nowrap text-[#6B778C]">
                          {new Date(log.timestamp).toLocaleString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="font-semibold text-[#172B4D]">{log.userName}</span>
                          <span className="ml-1 text-[9px] text-[#6B778C]">({log.userRole})</span>
                        </td>
                        <td className="px-3 py-2 font-medium text-[#0052CC] max-w-[200px] truncate" title={log.queryText}>
                          {log.queryText}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#DEEBFF] text-[#0747A6]">
                            {log.intentType}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-[#42526E]">
                          {log.resolvedModule}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#EAE6FF] text-[#403294] border border-[#D3CAFC]">
                            {log.modelUsed && log.modelUsed.includes("gemini") ? "Google Gemini" : "DSQE"}
                          </span>
                        </td>
                        <td className="px-3 py-2 max-w-[240px] truncate text-[#172B4D]" title={log.responseSummary}>
                          {log.responseSummary || "—"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-[#6B778C]">
                          {log.executionTimeMs} ms
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {log.feedback === "up" ? (
                            <span className="inline-flex items-center gap-1 text-[#00875A] font-semibold text-[10px]">
                              <ThumbsUp size={11} /> Helpful
                            </span>
                          ) : log.feedback === "down" ? (
                            <span className="inline-flex items-center gap-1 text-[#DE350B] font-semibold text-[10px]">
                              <ThumbsDown size={11} /> Poor
                            </span>
                          ) : (
                            <span className="text-[#A5ADBA]">None</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: OPEN-SOURCE HR KNOWLEDGE BASE */}
        {activeTab === "knowledge" && (
          <div className="flex-1 flex flex-col bg-white border border-[#DFE1E6] rounded-lg p-4 overflow-hidden shadow-2xs space-y-3">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DFE1E6]">
              <div>
                <h2 className="text-sm font-bold text-[#172B4D] flex items-center gap-1.5">
                  <BookOpen size={15} className="text-[#0052CC]" />
                  <span>Open-Source Statutory Labor & Policy Knowledge Base</span>
                </h2>
                <p className="text-[11px] text-[#6B778C] mt-0.5">
                  Authoritative statutory labor laws, EPF/ESIC guidelines, sandwich leave policies, and HR standards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-2.5 text-[#6B778C]" />
                  <input
                    type="text"
                    value={knowledgeSearch}
                    onChange={(e) => setKnowledgeSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadKnowledge()}
                    placeholder="Search policy topics..."
                    className="pl-7 pr-3 py-1.5 text-xs bg-[#FAFBFC] border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Labor Law & Statutory">Labor Law & Statutory</option>
                  <option value="Leave & Attendance Policy">Leave & Attendance Policy</option>
                  <option value="Compensation & Benefits">Compensation & Benefits</option>
                  <option value="Workplace Governance & POSH">Workplace Governance & POSH</option>
                  <option value="Exit & Separation">Exit & Separation</option>
                  <option value="General HR Operations">General HR Operations</option>
                </select>
                <button
                  type="button"
                  onClick={loadKnowledge}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold cursor-pointer transition"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 pr-1">
              {knowledgeLoading ? (
                <div className="col-span-2 py-12 text-center text-xs text-[#6B778C]">
                  Loading knowledge base articles...
                </div>
              ) : knowledgeArticles.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-xs text-[#6B778C]">
                  No knowledge base articles found.
                </div>
              ) : (
                knowledgeArticles.map((art) => (
                  <div
                    key={art.docId}
                    className="p-3.5 rounded-lg border border-[#DFE1E6] bg-[#FAFBFC] hover:bg-white hover:border-[#0052CC] transition space-y-2 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF] uppercase">
                          {art.category}
                        </span>
                        <span className="text-[9px] text-[#6B778C] font-mono">{art.docId}</span>
                      </div>
                      <h3 className="font-bold text-xs text-[#172B4D] mt-1.5">{art.title}</h3>
                      <p className="text-[11px] text-[#42526E] mt-1 leading-relaxed">{art.summary}</p>
                    </div>

                    <div className="pt-2 border-t border-[#EBECF0]">
                      <p className="text-[10px] font-semibold text-[#6B778C] mb-1">Frequently Asked Questions:</p>
                      <div className="flex flex-wrap gap-1">
                        {art.sampleQuestions?.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => handlePromptFromKnowledge(q)}
                            className="px-2 py-0.5 rounded bg-white hover:bg-[#DEEBFF] hover:border-[#0052CC] border border-[#DFE1E6] text-[10px] text-[#0747A6] font-medium transition cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles size={9} className="text-[#0052CC]" />
                            <span>{q}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUTONOMOUS WORKFORCE WATCHDOG */}
        {activeTab === "watchdog" && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            {/* Executive Digest KPI Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-[#DFE1E6] rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#6B778C]">Workforce Health Score</p>
                  <h3 className="text-2xl font-bold text-[#172B4D] mt-0.5">
                    {watchdogDigest?.healthScore || 92}
                    <span className="text-xs font-normal text-[#6B778C]"> / 100</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00875A]">
                    {watchdogDigest?.status || "HEALTHY"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#E3FCEF] flex items-center justify-center text-[#00875A]">
                  <Activity size={20} />
                </div>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#6B778C]">Critical Anomalies</p>
                  <h3 className="text-2xl font-bold text-[#DE350B] mt-0.5">
                    {watchdogDigest?.criticalCount || 0}
                  </h3>
                  <span className="text-[10px] text-[#6B778C]">Immediate attention required</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FFEBE6] flex items-center justify-center text-[#DE350B]">
                  <AlertTriangle size={20} />
                </div>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#6B778C]">High Severity Alerts</p>
                  <h3 className="text-2xl font-bold text-[#FF8B00] mt-0.5">
                    {watchdogDigest?.highCount || 0}
                  </h3>
                  <span className="text-[10px] text-[#6B778C]">Threshold breach review</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FFF0B3] flex items-center justify-center text-[#FF8B00]">
                  <ShieldAlert size={20} />
                </div>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#6B778C]">Total Active Alerts</p>
                  <h3 className="text-2xl font-bold text-[#0052CC] mt-0.5">
                    {watchdogDigest?.totalActiveAnomalies || watchdogAlerts.length}
                  </h3>
                  <span className="text-[10px] text-[#6B778C]">Across 5 HR pillars</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#DEEBFF] flex items-center justify-center text-[#0052CC]">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-[#DFE1E6]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#172B4D] flex items-center gap-1">
                  <Filter size={12} className="text-[#0052CC]" />
                  <span>Category Filter:</span>
                </span>
                {["", "ATTENDANCE", "LEAVES", "PAYROLL", "RECRUITMENT", "HELPDESK"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedAlertCategory(cat);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                      selectedAlertCategory === cat
                        ? "bg-[#0052CC] text-white font-semibold"
                        : "bg-[#FAFBFC] text-[#42526E] hover:bg-[#EBECF0]"
                    }`}
                  >
                    {cat || "All Domains"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={loadWatchdog}
                className="px-2.5 py-1 text-xs rounded bg-[#FAFBFC] hover:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} className={watchdogLoading ? "animate-spin" : ""} />
                <span>Refresh Watchdog</span>
              </button>
            </div>

            {/* Alerts Stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {watchdogLoading ? (
                <div className="py-12 text-center text-xs text-[#6B778C]">
                  Scanning workforce data for operational anomalies...
                </div>
              ) : watchdogAlerts.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-lg border border-[#DFE1E6]">
                  <CheckCircle2 size={36} className="mx-auto text-[#00875A] mb-2" />
                  <h4 className="text-sm font-bold text-[#172B4D]">Workforce Metrics Nominal</h4>
                  <p className="text-xs text-[#6B778C] mt-1">
                    No active anomalies detected across attendance, leaves, payroll, recruitment, or support tickets.
                  </p>
                </div>
              ) : (
                watchdogAlerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    className="p-3.5 bg-white rounded-lg border border-[#DFE1E6] hover:border-[#0052CC] transition shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            alert.severity === "CRITICAL"
                              ? "bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD]"
                              : alert.severity === "HIGH"
                              ? "bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380]"
                              : "bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-[#172B4D]">{alert.title}</span>
                        <span className="text-[10px] text-[#6B778C] px-1.5 py-0.2 rounded bg-[#F4F5F7]">
                          {alert.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#A5ADBA] font-mono">
                        {new Date(alert.detectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-xs text-[#42526E] leading-relaxed">{alert.description}</p>

                    {alert.metricVariance && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] p-2 bg-[#FAFBFC] rounded border border-[#EBECF0]">
                        <span className="text-[#6B778C]">
                          Baseline Metric: <strong className="text-[#172B4D]">{alert.metricVariance.baseline}</strong>
                        </span>
                        <span className="text-[#6B778C]">
                          Observed Metric: <strong className="text-[#DE350B]">{alert.metricVariance.observed}</strong>
                        </span>
                        {alert.metricVariance.variancePercent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FFEBE6] text-[#DE350B]">
                            {alert.metricVariance.variancePercent > 0 ? "+" : ""}
                            {alert.metricVariance.variancePercent}%
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#EBECF0]">
                      <div className="flex items-center gap-2 text-xs text-[#6B778C]">
                        <span>Suggested Remedy:</span>
                        <span className="font-medium text-[#172B4D]">{alert.suggestedAction}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleInvestigateAlert(alert)}
                          className="px-2.5 py-1 bg-[#DEEBFF] hover:bg-[#B3D4FF] text-[#0052CC] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                        >
                          <Sparkles size={11} />
                          <span>Investigate with Copilot</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveAlert(alert.alertId)}
                          className="px-2.5 py-1 bg-white hover:bg-[#F4F5F7] border border-[#DFE1E6] text-[#42526E] hover:text-[#172B4D] rounded text-xs font-semibold cursor-pointer transition"
                        >
                          Resolve Alert
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* HR Document Studio Modal */}
      <AiDocumentModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
      />
    </DashboardLayout>
  );
}

