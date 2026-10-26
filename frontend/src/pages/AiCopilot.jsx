import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import StaffifyLogo from "../components/StaffifyLogo";
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
} from "lucide-react";

export default function AiCopilot() {
  const {
    messages,
    loading,
    sendMessage,
    clearConversation,
    capabilities,
  } = useAiAssistant();

  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "logs" | "knowledge"
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  // Load logs when switching to logs tab
  useEffect(() => {
    if (activeTab === "logs") {
      loadLogs();
    } else if (activeTab === "knowledge") {
      loadKnowledge();
    }
  }, [activeTab]);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DFE1E6]">
          <div>
            <div className="flex items-center gap-2">
              <StaffifyLogo size="sm" showText={false} />
              <h1 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
                <span>Staffify AI Copilot Workspace</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF] uppercase">
                  Universal Analytics & Open Knowledge
                </span>
              </h1>
            </div>
            <p className="text-xs text-[#6B778C] mt-0.5 flex items-center gap-1.5">
              <Database size={12} className="text-[#0052CC]" />
              <span>Grounded on live MongoDB operational collections and statutory open-source HR knowledge.</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center bg-[#EBECF0] p-0.5 rounded-md border border-[#DFE1E6]">
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  activeTab === "chat"
                    ? "bg-white text-[#0052CC] shadow-xs"
                    : "text-[#42526E] hover:text-[#172B4D]"
                }`}
              >
                <MessageSquare size={13} />
                <span>Interactive Copilot</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-white text-[#0052CC] shadow-xs"
                    : "text-[#42526E] hover:text-[#172B4D]"
                }`}
              >
                <History size={13} />
                <span>Input Logs & Training</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("knowledge")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  activeTab === "knowledge"
                    ? "bg-white text-[#0052CC] shadow-xs"
                    : "text-[#42526E] hover:text-[#172B4D]"
                }`}
              >
                <BookOpen size={13} />
                <span>HR Knowledge Base</span>
              </button>
            </div>

            {activeTab === "chat" && (
              <button
                type="button"
                onClick={clearConversation}
                className="px-3 py-1.5 bg-white hover:bg-[#F4F5F7] border border-[#DFE1E6] text-[#172B4D] rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
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
                          className="text-[9px] text-[#0747A6] bg-[#DEEBFF]/40 hover:bg-[#DEEBFF] px-1.5 py-0.5 rounded text-left truncate max-w-full cursor-pointer transition flex items-center gap-1"
                          title={prompt}
                        >
                          <ArrowRight size={10} className="shrink-0 text-[#0052CC]" />
                          <span className="truncate">{prompt}</span>
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
                      placeholder="Say hello, ask about payroll, request leave, or ask about statutory HR policies..."
                      className="w-full bg-transparent outline-none text-xs text-[#172B4D] placeholder-[#6B778C] resize-none"
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
                      <td colSpan={9} className="px-3 py-6 text-center text-xs text-[#6B778C]">
                        Loading query logs...
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
      </div>
    </DashboardLayout>
  );
}

