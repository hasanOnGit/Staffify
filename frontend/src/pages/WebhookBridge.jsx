import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getWebhookConfigs,
  createWebhookConfig,
  updateWebhookConfig,
  deleteWebhookConfig,
  testDispatchWebhook,
  getWebhookLogs,
  submitInteractiveAction,
  triggerMissedPunchNudge,
  getWebhookMetrics,
} from "../services/webhook";
import toast from "react-hot-toast";
import {
  Webhook,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  Plus,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Code,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Zap,
  Filter,
  Search,
  CheckCheck,
  Eye,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

function WebhookBridge() {
  const { user, isAdmin, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState("channels"); // "channels" | "simulator" | "nudge" | "logs"
  const [configs, setConfigs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search states for Logs
  const [logPlatformFilter, setLogPlatformFilter] = useState("All");
  const [logEventFilter, setLogEventFilter] = useState("All");
  const [logStatusFilter, setLogStatusFilter] = useState("All");
  const [logSearchQuery, setLogSearchQuery] = useState("");

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedLogPayload, setSelectedLogPayload] = useState(null);

  // New Config Form
  const [newConfig, setNewConfig] = useState({
    name: "",
    platform: "Slack",
    webhookUrl: "",
    channelName: "#hr-approvals",
    environment: "Production",
    description: "",
    subscribedEvents: ["LEAVE_REQUEST", "EXPENSE_CLAIM", "ATTENDANCE_REGULARIZATION", "MISSED_PUNCH_NUDGE"],
  });

  // Simulator State
  const [simulatorEvent, setSimulatorEvent] = useState("LEAVE_REQUEST");
  const [simulatorPlatform, setSimulatorPlatform] = useState("Slack");
  const [simulatorFormat, setSimulatorFormat] = useState("card"); // "card" | "json"
  const [simulatorStatus, setSimulatorStatus] = useState("pending"); // "pending" | "approved" | "rejected"
  const [activeSimulationLog, setActiveSimulationLog] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [configsRes, logsRes, metricsRes] = await Promise.all([
        getWebhookConfigs(),
        getWebhookLogs(),
        getWebhookMetrics(),
      ]);
      setConfigs(configsRes.data || []);
      setLogs(logsRes.data || []);
      setMetrics(metricsRes.data || null);

      if (logsRes.data && logsRes.data.length > 0 && !activeSimulationLog) {
        setActiveSimulationLog(logsRes.data[0]);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load webhook bridge data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Connect Webhook
  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    if (!newConfig.name.trim() || !newConfig.webhookUrl.trim()) {
      toast.error("Please provide a name and webhook URL");
      return;
    }
    try {
      await createWebhookConfig(newConfig);
      toast.success("Webhook channel connected successfully!");
      setIsConnectModalOpen(false);
      setNewConfig({
        name: "",
        platform: "Slack",
        webhookUrl: "",
        channelName: "#hr-approvals",
        environment: "Production",
        description: "",
        subscribedEvents: ["LEAVE_REQUEST", "EXPENSE_CLAIM", "ATTENDANCE_REGULARIZATION", "MISSED_PUNCH_NUDGE"],
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error connecting webhook");
    }
  };

  // Toggle Webhook active
  const handleToggleActive = async (config) => {
    try {
      await updateWebhookConfig(config.configId, { isActive: !config.isActive });
      toast.success(`Webhook ${!config.isActive ? "enabled" : "disabled"}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update webhook status");
    }
  };

  // Delete Webhook
  const handleDeleteWebhook = async (configId) => {
    if (!window.confirm("Are you sure you want to delete this webhook integration?")) return;
    try {
      await deleteWebhookConfig(configId);
      toast.success("Webhook integration deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete webhook");
    }
  };

  // Dispatch Test Card
  const handleDispatchTest = async (configId = null, eventType = null) => {
    try {
      setIsDispatching(true);
      const res = await testDispatchWebhook({
        configId: configId || (configs[0]?.configId ?? ""),
        eventType: eventType || simulatorEvent,
      });
      toast.success(res.message || "Interactive card dispatched!");
      setActiveSimulationLog(res.data.log);
      setSimulatorStatus("pending");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to dispatch test card");
    } finally {
      setIsDispatching(false);
    }
  };

  // 1-Click Interactive Action Handler (Approve / Reject)
  const handleInteractiveAction = async (actionType) => {
    const logId = activeSimulationLog?.logId;
    if (!logId) {
      toast.error("No active card session to action");
      return;
    }
    try {
      setIsActing(true);
      const res = await submitInteractiveAction({
        logId,
        action: actionType,
        actorName: `${user?.name || "Manager User"} (${user?.role || "Manager"})`,
        actorEmail: user?.email || "manager@staffify.hr",
        actorChannel: `${simulatorPlatform} Interactive Button`,
        comment: `Processed via ${simulatorPlatform} 1-Click Action. Audit verified.`,
      });
      toast.success(res.message);
      setSimulatorStatus(actionType.toLowerCase() === "approve" ? "approved" : "rejected");
      if (res.data?.log) {
        setActiveSimulationLog(res.data.log);
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit interactive action");
    } finally {
      setIsActing(false);
    }
  };

  // Trigger automated late swipe nudge
  const handleTriggerMissedPunch = async () => {
    try {
      const res = await triggerMissedPunchNudge();
      toast.success(res.message || "Missed punch nudge dispatched!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error dispatching nudge");
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = (jsonObj) => {
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setCopiedCode(true);
    toast.success("JSON payload copied to clipboard");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchPlatform = logPlatformFilter === "All" || log.platform === logPlatformFilter;
      const matchEvent = logEventFilter === "All" || log.eventType === logEventFilter;
      const matchStatus =
        logStatusFilter === "All" ||
        (logStatusFilter === "Resolved" && log.actionResolved?.isResolved) ||
        (logStatusFilter === "Pending" && !log.actionResolved?.isResolved);
      const matchSearch =
        !logSearchQuery.trim() ||
        log.logId.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.employeeName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.targetEntityTitle.toLowerCase().includes(logSearchQuery.toLowerCase());

      return matchPlatform && matchEvent && matchStatus && matchSearch;
    });
  }, [logs, logPlatformFilter, logEventFilter, logStatusFilter, logSearchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DFE1E6] pb-4 bg-white -mx-6 -mt-6 p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#DEEBFF] text-[#0052CC] rounded">
                <Webhook size={20} />
              </span>
              <h1 className="text-xl font-bold text-[#172B4D]">Multi-Channel Interactive Approval Bridge</h1>
              <span className="text-[11px] font-semibold text-[#0747A6] bg-[#DEEBFF] px-2 py-0.5 rounded border border-[#B3D4FF]">
                Slack & MS Teams
              </span>
            </div>
            <p className="text-xs text-[#6B778C] mt-1">
              Dispatch real-time interactive Slack Block Kit cards and Microsoft Teams Adaptive Cards with 1-click approvals & automated attendance nudges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDispatchTest()}
              disabled={isDispatching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] rounded text-xs font-semibold shadow-xs transition"
            >
              <Send size={13} className="text-[#0052CC]" />
              {isDispatching ? "Dispatching..." : "Simulate Live Dispatch"}
            </button>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold shadow-xs transition"
            >
              <Plus size={14} />
              Connect Webhook
            </button>
          </div>
        </div>

        {/* Executive KPI Cockpit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#DFE1E6] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B778C]">Active Integrations</span>
              <span className="p-1.5 bg-[#EAE6FF] text-[#403294] rounded">
                <Radio size={15} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#172B4D]">
                {metrics?.activeConfigs ?? configs.filter((c) => c.isActive).length}
              </span>
              <span className="text-xs text-[#6B778C]">/ {configs.length} configured</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 size={12} />
              <span>Slack & Teams bridges online</span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B778C]">Total Cards Dispatched</span>
              <span className="p-1.5 bg-[#DEEBFF] text-[#0052CC] rounded">
                <Send size={15} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#172B4D]">{metrics?.totalDispatched ?? logs.length}</span>
              <span className="text-xs text-[#6B778C]">notifications</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-[#0052CC] font-medium">
              <TrendingUp size={12} />
              <span>100% delivery success rate</span>
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B778C]">1-Click Action Rate</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                <CheckCheck size={15} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">{metrics?.resolutionRate ?? 67}%</span>
              <span className="text-xs text-[#6B778C]">via chat clients</span>
            </div>
            <div className="mt-1 text-[11px] text-[#6B778C]">
              Zero login required for managers
            </div>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B778C]">Avg Approval Latency</span>
              <span className="p-1.5 bg-amber-50 text-amber-700 rounded border border-amber-200">
                <Clock size={15} />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#172B4D]">
                {metrics?.avgResolutionMinutes ?? 14} <span className="text-sm font-normal text-[#6B778C]">mins</span>
              </span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 font-medium">
              <span>98% faster than web portal (48h)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#DFE1E6] bg-white px-3 rounded-t-lg">
          <button
            onClick={() => setActiveTab("channels")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === "channels"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Radio size={14} />
            <span>Configured Channels ({configs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === "simulator"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Interactive Card Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab("nudge")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === "nudge"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Zap size={14} />
            <span>Automated 30-Min Late Nudge</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === "logs"
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Clock size={14} />
            <span>Audit Radar & Logs ({logs.length})</span>
          </button>
        </div>

        {/* =========================================================
            TAB 1: Configured Channels & Bots
           ========================================================= */}
        {activeTab === "channels" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.map((cfg) => (
                <div
                  key={cfg.configId}
                  className="bg-white border border-[#DFE1E6] rounded-lg p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1.5 rounded ${
                            cfg.platform === "Slack"
                              ? "bg-[#4A154B]/10 text-[#4A154B]"
                              : "bg-[#464EB8]/10 text-[#464EB8]"
                          }`}
                        >
                          <Webhook size={16} />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-[#172B4D]">{cfg.name}</h3>
                          <p className="text-[11px] text-[#6B778C] font-mono">{cfg.channelName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            cfg.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-[#F4F5F7] text-[#6B778C] border-[#DFE1E6]"
                          }`}
                        >
                          {cfg.isActive ? "ACTIVE" : "DISABLED"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F4F5F7] text-[#42526E] border border-[#DFE1E6]">
                          {cfg.environment}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-[#42526E]">
                      {cfg.description || "Interactive approval webhook connected to Staffify notification pipeline."}
                    </div>

                    <div className="mt-3">
                      <span className="text-[11px] font-semibold text-[#6B778C] block mb-1">
                        Subscribed Operational Events:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cfg.subscribedEvents.map((evt) => (
                          <span
                            key={evt}
                            className="text-[10px] bg-[#F4F5F7] text-[#172B4D] border border-[#DFE1E6] px-2 py-0.5 rounded font-mono"
                          >
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#DFE1E6] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#6B778C]">
                      Dispatches: <strong className="text-[#172B4D]">{cfg.totalDispatched || 0}</strong> cards
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDispatchTest(cfg.configId)}
                        className="px-2.5 py-1 bg-[#DEEBFF] text-[#0052CC] hover:bg-[#B3D4FF] rounded text-[11px] font-semibold transition"
                      >
                        Test Ping
                      </button>
                      <button
                        onClick={() => handleToggleActive(cfg)}
                        className="px-2.5 py-1 bg-white border border-[#DFE1E6] text-[#42526E] hover:bg-[#F4F5F7] rounded text-[11px] font-medium transition"
                      >
                        {cfg.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(cfg.configId)}
                        className="p-1 text-[#6B778C] hover:text-[#DE350B] rounded transition"
                        title="Delete Webhook"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {configs.length === 0 && !loading && (
              <div className="bg-white border border-dashed border-[#DFE1E6] rounded-lg p-8 text-center">
                <Webhook size={28} className="text-[#6B778C] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#172B4D]">No Webhook Channels Configured</h3>
                <p className="text-xs text-[#6B778C] max-w-md mx-auto mt-1 mb-4">
                  Connect your team's Slack or Microsoft Teams incoming webhook to dispatch interactive 1-click approvals for leaves, claims, and attendance.
                </p>
                <button
                  onClick={() => setIsConnectModalOpen(true)}
                  className="px-4 py-2 bg-[#0052CC] text-white rounded text-xs font-semibold"
                >
                  Connect First Channel
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: Interactive Card Simulator & Live Preview
           ========================================================= */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-[#DFE1E6] rounded-lg p-4 shadow-xs">
                <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-3">
                  Simulation Parameters
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      Event Type
                    </label>
                    <select
                      value={simulatorEvent}
                      onChange={(e) => {
                        setSimulatorEvent(e.target.value);
                        setSimulatorStatus("pending");
                      }}
                      className="w-full text-xs border border-[#DFE1E6] rounded px-2.5 py-1.5 focus:border-[#0052CC] focus:outline-hidden"
                    >
                      <option value="LEAVE_REQUEST">Leave Approval Request</option>
                      <option value="EXPENSE_CLAIM">Expense Reimbursement Claim</option>
                      <option value="ATTENDANCE_REGULARIZATION">Attendance Regularization</option>
                      <option value="MISSED_PUNCH_NUDGE">Missed Swipe Reminder</option>
                      <option value="OFFBOARDING_CLEARANCE">Exit Clearance Sign-off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      Target Chat Platform
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSimulatorPlatform("Slack")}
                        className={`py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                          simulatorPlatform === "Slack"
                            ? "bg-[#4A154B]/10 border-[#4A154B] text-[#4A154B]"
                            : "bg-white border-[#DFE1E6] text-[#42526E] hover:bg-[#F4F5F7]"
                        }`}
                      >
                        <Webhook size={14} />
                        Slack Block Kit
                      </button>

                      <button
                        type="button"
                        onClick={() => setSimulatorPlatform("Teams")}
                        className={`py-2 px-3 rounded text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                          simulatorPlatform === "Teams"
                            ? "bg-[#464EB8]/10 border-[#464EB8] text-[#464EB8]"
                            : "bg-white border-[#DFE1E6] text-[#42526E] hover:bg-[#F4F5F7]"
                        }`}
                      >
                        <Building2 size={14} />
                        MS Teams Card
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      Preview Format
                    </label>
                    <div className="flex border border-[#DFE1E6] rounded overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setSimulatorFormat("card")}
                        className={`flex-1 py-1.5 text-xs font-semibold ${
                          simulatorFormat === "card"
                            ? "bg-[#0052CC] text-white"
                            : "bg-white text-[#42526E] hover:bg-[#F4F5F7]"
                        }`}
                      >
                        Visual UI Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatorFormat("json")}
                        className={`flex-1 py-1.5 text-xs font-semibold flex items-center justify-center gap-1 ${
                          simulatorFormat === "json"
                            ? "bg-[#0052CC] text-white"
                            : "bg-white text-[#42526E] hover:bg-[#F4F5F7]"
                        }`}
                      >
                        <Code size={12} />
                        Raw JSON Schema
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleDispatchTest(null, simulatorEvent)}
                      disabled={isDispatching}
                      className="w-full py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Send size={13} />
                      {isDispatching ? "Dispatching New Card..." : "Generate & Dispatch New Card"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Explanatory Callout */}
              <div className="bg-[#DEEBFF]/50 border border-[#B3D4FF] rounded-lg p-3 text-xs text-[#0747A6]">
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  <ShieldCheck size={14} />
                  <span>Real 1-Click Callback Bridge</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Clicking <strong>Approve</strong> or <strong>Reject</strong> directly on the simulated Slack or Teams card executes real-time database transitions, updates the employee record, and posts the audit resolution stamp.
                </p>
              </div>
            </div>

            {/* Right Interactive Preview Canvas */}
            <div className="lg:col-span-8">
              {simulatorFormat === "card" ? (
                <div>
                  {simulatorPlatform === "Slack" ? (
                    /* Authentically Styled Slack Desktop Message */
                    <div className="bg-[#1A1D21] p-6 rounded-lg text-white shadow-md">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-700/60 mb-4 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                          <span className="font-bold text-gray-200">#hr-approvals-feed</span>
                          <span className="text-[11px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                            Channel ID: C08492KQL
                          </span>
                        </div>
                        <span className="text-[11px]">Desktop Slack App Preview</span>
                      </div>

                      {/* Slack Message Body */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded bg-[#0052CC] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          ST
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">Staffify HR Bot</span>
                            <span className="bg-gray-700 text-gray-300 text-[9px] font-bold px-1 rounded uppercase">
                              APP
                            </span>
                            <span className="text-gray-400 text-[11px]">Today at 10:14 AM</span>
                          </div>

                          {/* Block Kit Card Container */}
                          <div className="mt-3 bg-[#222529] border-l-4 border-[#0052CC] rounded-r p-4 space-y-3">
                            <div className="text-base font-bold text-white">
                              {simulatorEvent === "EXPENSE_CLAIM"
                                ? "Expense Reimbursement Claim"
                                : simulatorEvent === "ATTENDANCE_REGULARIZATION"
                                ? "Attendance Regularization Request"
                                : simulatorEvent === "MISSED_PUNCH_NUDGE"
                                ? "Automated Missed Punch Reminder"
                                : "Leave Approval Request"}
                            </div>

                            <p className="text-xs text-gray-300">
                              <strong>Employee User</strong> (EMP-DEV-03) has submitted a request requiring manager sign-off.
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-gray-700/50">
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Department</span>
                                <span className="text-gray-200 font-semibold">Engineering</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Period / Date</span>
                                <span className="text-gray-200 font-semibold">Oct 24, 2026 - Oct 27, 2026</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Scope / Metric</span>
                                <span className="text-gray-200 font-semibold">
                                  {simulatorEvent === "EXPENSE_CLAIM" ? "$3,850.00" : "3 Days (Paid Leave)"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Policy Check</span>
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Balance Available
                                </span>
                              </div>
                            </div>

                            <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-700/50 font-mono">
                              Staffify Webhook Bridge | Log: {activeSimulationLog?.logId || "LOG-WH-0004"}
                            </div>

                            {/* Interactive Action Bar */}
                            <div className="pt-2">
                              {simulatorStatus === "pending" && !activeSimulationLog?.actionResolved?.isResolved ? (
                                <div className="flex items-center gap-2.5">
                                  <button
                                    onClick={() => handleInteractiveAction("Approve")}
                                    disabled={isActing}
                                    className="px-4 py-1.5 bg-[#007A5A] hover:bg-[#148567] text-white text-xs font-bold rounded shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Check size={13} />
                                    {isActing ? "Processing..." : "Approve Request"}
                                  </button>
                                  <button
                                    onClick={() => handleInteractiveAction("Reject")}
                                    disabled={isActing}
                                    className="px-4 py-1.5 bg-[#E01E5A] hover:bg-[#C91A4F] text-white text-xs font-bold rounded shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                  >
                                    <XCircle size={13} />
                                    Reject Request
                                  </button>
                                </div>
                              ) : (
                                <div
                                  className={`p-2.5 rounded border text-xs font-medium flex items-center justify-between ${
                                    simulatorStatus === "approved" ||
                                    activeSimulationLog?.actionResolved?.actionTaken === "Approved"
                                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                                      : "bg-red-950/40 border-red-500/50 text-red-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} />
                                    <span>
                                      Request <strong>{activeSimulationLog?.actionResolved?.actionTaken || "Approved"}</strong> by {user?.name || "Manager"} (via Slack)
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => setSimulatorStatus("pending")}
                                    className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
                                  >
                                    Reset Simulator
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Authentically Styled Microsoft Teams Adaptive Card */
                    <div className="bg-[#F5F5F5] p-6 rounded-lg shadow-md border border-[#DFE1E6]">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-300 mb-4 text-xs text-[#6B778C]">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-[#464EB8]" />
                          <span className="font-bold text-[#172B4D]">Finance & Operations Desk</span>
                        </div>
                        <span className="text-[11px]">Microsoft Teams Adaptive Card 1.4</span>
                      </div>

                      <div className="max-w-xl mx-auto bg-white rounded border border-[#DFE1E6] shadow-sm overflow-hidden">
                        <div className="h-1.5 bg-[#464EB8]"></div>
                        <div className="p-5 space-y-4">
                          <div>
                            <span className="text-xs font-semibold text-[#464EB8] uppercase tracking-wider block">
                              Staffify Automated Dispatch
                            </span>
                            <h2 className="text-lg font-bold text-[#172B4D] mt-0.5">
                              {simulatorEvent === "EXPENSE_CLAIM"
                                ? "Expense Reimbursement Claim"
                                : "Leave Approval Request"}
                            </h2>
                            <p className="text-xs text-[#6B778C] mt-1">
                              Submitted by <strong>Employee User</strong> (Engineering Squad)
                            </p>
                          </div>

                          <table className="w-full text-xs text-[#172B4D] border-t border-b border-[#DFE1E6] py-2">
                            <tbody>
                              <tr className="border-b border-[#F4F5F7]">
                                <td className="py-1.5 text-[#6B778C] font-medium w-1/3">Target Item:</td>
                                <td className="py-1.5 font-semibold">Annual Privilege Leave</td>
                              </tr>
                              <tr className="border-b border-[#F4F5F7]">
                                <td className="py-1.5 text-[#6B778C] font-medium">Quantity:</td>
                                <td className="py-1.5 font-semibold">3 Working Days</td>
                              </tr>
                              <tr>
                                <td className="py-1.5 text-[#6B778C] font-medium">Date Range:</td>
                                <td className="py-1.5 font-semibold">Oct 24, 2026 - Oct 27, 2026</td>
                              </tr>
                            </tbody>
                          </table>

                          <div className="text-[11px] text-[#6B778C] font-mono">
                            Payload Token: {activeSimulationLog?.logId || "LOG-WH-0004"}
                          </div>

                          {/* Action.Submit Buttons */}
                          <div>
                            {simulatorStatus === "pending" && !activeSimulationLog?.actionResolved?.isResolved ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleInteractiveAction("Approve")}
                                  disabled={isActing}
                                  className="flex-1 py-2 bg-[#464EB8] hover:bg-[#3B429F] text-white rounded text-xs font-bold shadow-xs transition"
                                >
                                  {isActing ? "Submitting..." : "Approve (Action.Submit)"}
                                </button>
                                <button
                                  onClick={() => handleInteractiveAction("Reject")}
                                  disabled={isActing}
                                  className="flex-1 py-2 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#DE350B] rounded text-xs font-bold shadow-xs transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center justify-between">
                                <span className="font-semibold">
                                  Action Confirmed: {activeSimulationLog?.actionResolved?.actionTaken || "Approved"} by {user?.name || "Manager"}
                                </span>
                                <button
                                  onClick={() => setSimulatorStatus("pending")}
                                  className="text-[11px] text-[#0052CC] underline"
                                >
                                  Reset
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Raw JSON Schema Inspector */
                <div className="bg-[#172B4D] rounded-lg p-4 text-white font-mono text-xs shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-700 mb-3">
                    <span className="text-gray-300 font-bold">
                      {simulatorPlatform === "Slack" ? "Slack Block Kit Payload JSON" : "MS Teams Adaptive Card 1.4 JSON"}
                    </span>
                    <button
                      onClick={() =>
                        handleCopyJson(
                          activeSimulationLog?.payloadPreview || {
                            info: "Simulated Webhook Payload Schema",
                          }
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] transition"
                    >
                      {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                      {copiedCode ? "Copied" : "Copy Payload"}
                    </button>
                  </div>
                  <pre className="overflow-x-auto max-h-[460px] p-2 text-emerald-300 leading-relaxed">
                    {JSON.stringify(
                      activeSimulationLog?.payloadPreview || {
                        message: "Select an event and click 'Generate & Dispatch New Card' to view live Block Kit / Adaptive Card JSON.",
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: Automated 30-Min Late Swipe Nudge Engine
           ========================================================= */}
        {activeTab === "nudge" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#DFE1E6] rounded-lg p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-50 text-amber-700 rounded border border-amber-200">
                      <Zap size={16} />
                    </span>
                    <h2 className="text-base font-bold text-[#172B4D]">
                      Automated 30-Minute Missed Clock-In Nudge Scanner
                    </h2>
                  </div>
                  <p className="text-xs text-[#6B778C] mt-1 max-w-2xl">
                    Automatically scans the workforce roster daily at 09:30 AM (30 minutes past shift start). For any employee without a biometric punch or web swipe, an interactive nudge card is automatically delivered via Slack or MS Teams with a 1-tap regularization link.
                  </p>
                </div>

                <button
                  onClick={handleTriggerMissedPunch}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold shadow-xs flex items-center gap-2 transition shrink-0"
                >
                  <Play size={13} />
                  Run Late Swipe Scanner Now
                </button>
              </div>

              {/* Workflow Step Diagram */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#DFE1E6]">
                <div className="p-3 bg-[#F4F5F7] rounded border border-[#DFE1E6]">
                  <span className="text-[10px] font-bold text-[#0052CC] uppercase tracking-wider block mb-1">
                    Step 1: Telemetry Detection
                  </span>
                  <p className="text-xs text-[#172B4D] font-semibold">
                    Shift Roster Cross-Match
                  </p>
                  <p className="text-[11px] text-[#6B778C] mt-1">
                    Identifies employees scheduled for 09:00 AM shift with 0 swipes by 09:30 AM grace cutoff.
                  </p>
                </div>

                <div className="p-3 bg-[#F4F5F7] rounded border border-[#DFE1E6]">
                  <span className="text-[10px] font-bold text-[#0052CC] uppercase tracking-wider block mb-1">
                    Step 2: Interactive Webhook
                  </span>
                  <p className="text-xs text-[#172B4D] font-semibold">
                    Targeted Direct Nudge
                  </p>
                  <p className="text-[11px] text-[#6B778C] mt-1">
                    Dispatches a gentle Slack bot DM with two interactive buttons: "I am Working Remotely" or "Apply Leave Today".
                  </p>
                </div>

                <div className="p-3 bg-[#F4F5F7] rounded border border-[#DFE1E6]">
                  <span className="text-[10px] font-bold text-[#0052CC] uppercase tracking-wider block mb-1">
                    Step 3: Instant Sync
                  </span>
                  <p className="text-xs text-[#172B4D] font-semibold">
                    Auto-Regularization
                  </p>
                  <p className="text-[11px] text-[#6B778C] mt-1">
                    Employee response updates attendance status in real-time, eliminating end-of-month payroll swipe disputes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: Audit Radar & Dispatch Logs
           ========================================================= */}
        {activeTab === "logs" && (
          <div className="bg-white border border-[#DFE1E6] rounded-lg shadow-xs overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-[#DFE1E6] bg-[#FAFBFC] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search size={14} className="text-[#6B778C]" />
                <input
                  type="text"
                  placeholder="Search by Log ID, Employee, or Request Title..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full text-xs bg-white border border-[#DFE1E6] rounded px-2.5 py-1.5 focus:border-[#0052CC] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={logPlatformFilter}
                  onChange={(e) => setLogPlatformFilter(e.target.value)}
                  className="text-xs bg-white border border-[#DFE1E6] rounded px-2 py-1.5"
                >
                  <option value="All">All Platforms</option>
                  <option value="Slack">Slack</option>
                  <option value="Teams">MS Teams</option>
                </select>

                <select
                  value={logEventFilter}
                  onChange={(e) => setLogEventFilter(e.target.value)}
                  className="text-xs bg-white border border-[#DFE1E6] rounded px-2 py-1.5"
                >
                  <option value="All">All Event Types</option>
                  <option value="LEAVE_REQUEST">Leave Request</option>
                  <option value="EXPENSE_CLAIM">Expense Claim</option>
                  <option value="MISSED_PUNCH_NUDGE">Missed Punch</option>
                </select>

                <select
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                  className="text-xs bg-white border border-[#DFE1E6] rounded px-2 py-1.5"
                >
                  <option value="All">All Action States</option>
                  <option value="Resolved">Resolved (1-Click)</option>
                  <option value="Pending">Pending Action</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F5F7] border-b border-[#DFE1E6] text-[#6B778C] font-semibold">
                    <th className="py-2.5 px-4">Log ID</th>
                    <th className="py-2.5 px-4">Platform</th>
                    <th className="py-2.5 px-4">Event Type</th>
                    <th className="py-2.5 px-4">Employee / Target</th>
                    <th className="py-2.5 px-4">Delivery Status</th>
                    <th className="py-2.5 px-4">1-Click Resolution</th>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6]">
                  {filteredLogs.map((log) => (
                    <tr key={log.logId} className="hover:bg-[#FAFBFC] transition">
                      <td className="py-2.5 px-4 font-mono font-semibold text-[#0052CC]">
                        {log.logId}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            log.platform === "Slack"
                              ? "bg-[#4A154B]/10 text-[#4A154B] border-[#4A154B]/30"
                              : "bg-[#464EB8]/10 text-[#464EB8] border-[#464EB8]/30"
                          }`}
                        >
                          {log.platform}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#172B4D] font-medium font-mono text-[11px]">
                        {log.eventType}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-[#172B4D]">{log.employeeName}</div>
                        <div className="text-[11px] text-[#6B778C] truncate max-w-xs">
                          {log.targetEntityTitle || log.targetEntityId}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            log.deliveryStatus === "Delivered"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {log.deliveryStatus === "Delivered" ? (
                            <CheckCircle2 size={11} />
                          ) : (
                            <XCircle size={11} />
                          )}
                          {log.deliveryStatus} (HTTP {log.httpStatusCode})
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {log.actionResolved?.isResolved ? (
                          <div className="space-y-0.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                log.actionResolved.actionTaken === "Approved"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {log.actionResolved.actionTaken}
                            </span>
                            <div className="text-[10px] text-[#6B778C]">
                              by {log.actionResolved.actorName || "Manager"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Action
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-[#6B778C]">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLogPayload(log)}
                          className="px-2 py-1 bg-[#F4F5F7] hover:bg-[#EBECF0] text-[#172B4D] rounded text-[11px] font-medium border border-[#DFE1E6] transition inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          Payload
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[#6B778C]">
                        No dispatch logs matching selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL: Connect New Webhook
           ========================================================= */}
        {isConnectModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl border border-[#DFE1E6] w-full max-w-lg max-h-[92vh] flex flex-col">
              <div className="p-4 border-b border-[#DFE1E6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook size={18} className="text-[#0052CC]" />
                  <h3 className="text-sm font-bold text-[#172B4D]">Connect New Webhook Integration</h3>
                </div>
                <button
                  onClick={() => setIsConnectModalOpen(false)}
                  className="text-[#6B778C] hover:text-[#172B4D] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] p-1 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateWebhook} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">Integration Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leadership Approvals (Slack)"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded px-3 py-1.5 focus:border-[#0052CC] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#172B4D] mb-1">Platform *</label>
                    <select
                      value={newConfig.platform}
                      onChange={(e) => setNewConfig({ ...newConfig, platform: e.target.value })}
                      className="w-full border border-[#DFE1E6] rounded px-2.5 py-1.5"
                    >
                      <option value="Slack">Slack Block Kit</option>
                      <option value="Teams">Microsoft Teams</option>
                      <option value="CustomWebhook">Generic Webhook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#172B4D] mb-1">Environment</label>
                    <select
                      value={newConfig.environment}
                      onChange={(e) => setNewConfig({ ...newConfig, environment: e.target.value })}
                      className="w-full border border-[#DFE1E6] rounded px-2.5 py-1.5"
                    >
                      <option value="Production">Production</option>
                      <option value="Staging">Staging</option>
                      <option value="Sandbox">Sandbox / Test</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">Target Channel Name</label>
                  <input
                    type="text"
                    placeholder="#hr-approvals or Finance Desk"
                    value={newConfig.channelName}
                    onChange={(e) => setNewConfig({ ...newConfig, channelName: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded px-3 py-1.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">Incoming Webhook URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://chat-bridge.internal.staffify.hr/... or https://company.webhook.office.com/..."
                    value={newConfig.webhookUrl}
                    onChange={(e) => setNewConfig({ ...newConfig, webhookUrl: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded px-3 py-1.5 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#172B4D] mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Purpose of this channel bridge..."
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                    className="w-full border border-[#DFE1E6] rounded px-3 py-1.5"
                  />
                </div>

                <div className="pt-2 border-t border-[#DFE1E6] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                    className="px-3 py-1.5 bg-white border border-[#DFE1E6] text-[#42526E] rounded font-semibold hover:bg-[#F4F5F7]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0052CC] text-white rounded font-semibold hover:bg-[#0747A6]"
                  >
                    Save & Activate Channel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL: Inspect Payload Drawer
           ========================================================= */}
        {selectedLogPayload && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl border border-[#DFE1E6] w-full max-w-2xl max-h-[92vh] flex flex-col">
              <div className="p-4 border-b border-[#DFE1E6] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#172B4D]">
                    Dispatch Telemetry & Payload Inspector: {selectedLogPayload.logId}
                  </h3>
                  <span className="text-[11px] text-[#6B778C]">
                    Platform: {selectedLogPayload.platform} | HTTP Status: {selectedLogPayload.httpStatusCode}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLogPayload(null)}
                  className="text-[#6B778C] hover:text-[#172B4D] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] p-1 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs flex-1">
                <div className="bg-[#172B4D] p-3 rounded text-white overflow-x-auto">
                  <pre className="text-emerald-300">
                    {JSON.stringify(selectedLogPayload.payloadPreview, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="p-3 border-t border-[#DFE1E6] flex items-center justify-between text-xs bg-[#F4F5F7]">
                <span className="text-[#6B778C]">Response: {selectedLogPayload.responseBody}</span>
                <button
                  onClick={() => handleCopyJson(selectedLogPayload.payloadPreview)}
                  className="px-3 py-1 bg-white border border-[#DFE1E6] rounded text-[#172B4D] font-semibold hover:bg-[#EBECF0]"
                >
                  Copy Payload JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default WebhookBridge;
