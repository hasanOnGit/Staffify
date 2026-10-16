import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getTickets,
  createTicket,
  updateTicket,
  addTicketComment,
  getAssets,
  createAsset,
  allocateAsset,
  returnAsset,
} from "../services/helpdesk";
import { getEmployees } from "../services/employee";
import TicketModal from "../components/TicketModal";
import AssetModal from "../components/AssetModal";
import {
  LifeBuoy,
  Laptop,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  UserPlus,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  User,
  X,
  Layers,
  Cpu,
  Monitor,
  Key,
} from "lucide-react";

function Helpdesk() {
  const { user, isAdmin, isManager } = useAuth();
  const canManage = isAdmin || isManager;

  const [activeTab, setActiveTab] = useState("tickets"); // "tickets" | "assets" | "myAssets"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketCategory, setTicketCategory] = useState("All");
  const [ticketStatus, setTicketStatus] = useState("All");
  const [ticketPriority, setTicketPriority] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketModalMode, setTicketModalMode] = useState("create");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Assets state
  const [assets, setAssets] = useState([]);
  const [assetSearch, setAssetSearch] = useState("");
  const [assetCategory, setAssetCategory] = useState("All");
  const [assetStatus, setAssetStatus] = useState("All");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetModalMode, setAssetModalMode] = useState("create");
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // Employees for allocation
  const [employees, setEmployees] = useState([]);

  // Load Tickets
  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (!canManage) {
        params.employeeId = user?.employeeId || user?.userId;
      }
      const res = await getTickets(params);
      if (res.success) setTickets(res.data || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
      setMessage({ type: "error", text: "Failed to load support tickets." });
    } finally {
      setLoading(false);
    }
  };

  // Load Assets
  const loadAssets = async () => {
    try {
      const res = await getAssets();
      if (res.success) setAssets(res.data || []);
    } catch (err) {
      console.error("Failed to load assets:", err);
    }
  };

  // Load Employees
  const loadEmployeesList = async () => {
    try {
      const res = await getEmployees();
      if (res.success) setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  useEffect(() => {
    loadEmployeesList();
  }, []);

  useEffect(() => {
    if (activeTab === "tickets") {
      loadTickets();
    } else if (activeTab === "assets" || activeTab === "myAssets") {
      loadAssets();
    }
  }, [activeTab]);

  // Ticket Handlers
  const handleCreateTicket = async (ticketData) => {
    try {
      const res = await createTicket(ticketData);
      setMessage({ type: "success", text: res.message || "Ticket submitted successfully." });
      setIsTicketModalOpen(false);
      await loadTickets();
    } catch (err) {
      console.error("Error creating ticket:", err);
      setMessage({ type: "error", text: "Failed to submit ticket." });
    }
  };

  const handleUpdateTicketStatus = async (ticketId, updateData) => {
    try {
      await updateTicket(ticketId, updateData);
      setMessage({ type: "success", text: "Ticket status updated." });
      setIsTicketModalOpen(false);
      setSelectedTicket(null);
      await loadTickets();
    } catch (err) {
      console.error("Error updating ticket status:", err);
      setMessage({ type: "error", text: "Failed to update ticket status." });
    }
  };

  const handleAddTicketComment = async (ticketId, commentData) => {
    try {
      const res = await addTicketComment(ticketId, commentData);
      if (res.success) {
        setSelectedTicket(res.data);
        setTickets((prev) =>
          prev.map((t) => (t.ticketId === ticketId ? res.data : t))
        );
      }
    } catch (err) {
      console.error("Error adding ticket comment:", err);
    }
  };

  // Asset Handlers
  const handleCreateAsset = async (assetData) => {
    try {
      const res = await createAsset(assetData);
      setMessage({ type: "success", text: res.message || "Asset registered successfully." });
      setIsAssetModalOpen(false);
      await loadAssets();
    } catch (err) {
      console.error("Error creating asset:", err);
      setMessage({ type: "error", text: "Failed to register asset." });
    }
  };

  const handleAllocateAsset = async (payload) => {
    try {
      const res = await allocateAsset(payload);
      setMessage({ type: "success", text: res.message || "Asset allocated successfully." });
      setIsAssetModalOpen(false);
      setSelectedAsset(null);
      await loadAssets();
    } catch (err) {
      console.error("Error allocating asset:", err);
      setMessage({ type: "error", text: "Failed to allocate asset." });
    }
  };

  const handleReturnAsset = async (payload) => {
    try {
      const res = await returnAsset(payload);
      setMessage({ type: "success", text: res.message || "Asset marked as returned." });
      setIsAssetModalOpen(false);
      setSelectedAsset(null);
      await loadAssets();
    } catch (err) {
      console.error("Error returning asset:", err);
      setMessage({ type: "error", text: "Failed to process asset return." });
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !ticketSearch ||
      t.ticketId.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.title.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.requesterName.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesCategory = ticketCategory === "All" || t.category === ticketCategory;
    const matchesStatus = ticketStatus === "All" || t.status === ticketStatus;
    const matchesPriority = ticketPriority === "All" || t.priority === ticketPriority;
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  // Filtered assets
  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      !assetSearch ||
      a.assetTag.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.allocatedToName.toLowerCase().includes(assetSearch.toLowerCase());
    const matchesCategory = assetCategory === "All" || a.category === assetCategory;
    const matchesStatus = assetStatus === "All" || a.status === assetStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // My issued equipment
  const myAssets = assets.filter((a) => a.allocatedToId === (user?.employeeId || user?.userId));

  // Stats
  const openTicketsCount = tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;
  const criticalTicketsCount = tickets.filter((t) => t.priority === "Critical" && t.status !== "Closed").length;
  const allocatedAssetsCount = assets.filter((a) => a.status === "Allocated").length;
  const availableAssetsCount = assets.filter((a) => a.status === "Available").length;
  const totalAssetValue = assets.reduce((acc, a) => acc + (a.purchaseValue || 0), 0);

  const getPriorityBadge = (p) => {
    switch (p) {
      case "Critical":
        return "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]";
      case "High":
        return "bg-[#FFF0B3] text-[#974F0C] border-[#FFE380]";
      case "Medium":
        return "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]";
      case "Low":
      default:
        return "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]";
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case "Open":
        return "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]";
      case "In Progress":
        return "bg-[#FFF0B3] text-[#974F0C] border-[#FFE380]";
      case "Resolved":
        return "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]";
      case "Closed":
      default:
        return "bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6]";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#DFE1E6]">
          <div>
            <h1 className="text-xl font-bold text-[#172B4D] flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#0052CC] text-white flex items-center justify-center">
                <LifeBuoy size={16} />
              </div>
              <span>Helpdesk & Internal Asset Management</span>
            </h1>
            <p className="text-xs text-[#6B778C] mt-0.5">
              Jira Service Desk Operations • Support Tickets, Incident Queues, and IT Asset Allocation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setTicketModalMode("create");
                setSelectedTicket(null);
                setIsTicketModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              Raise Ticket
            </button>
            {canManage && (
              <button
                onClick={() => {
                  setAssetModalMode("create");
                  setSelectedAsset(null);
                  setIsAssetModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-medium rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Laptop size={14} className="text-[#0052CC]" />
                Register Asset
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {message && (
          <div
            className={`p-3 rounded border text-xs font-medium flex items-center justify-between ${
              message.type === "success"
                ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-[#6B778C] hover:text-[#172B4D] p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-[#DFE1E6] gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "tickets"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <LifeBuoy size={14} />
            Support Tickets & Requests
            <span className="ml-1 px-1.5 py-0.2 bg-[#F4F5F7] text-[#42526E] rounded-full text-[10px]">
              {tickets.length}
            </span>
          </button>

          {canManage && (
            <button
              onClick={() => setActiveTab("assets")}
              className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
                activeTab === "assets"
                  ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                  : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
            >
              <Laptop size={14} />
              Asset Inventory & Handover
              <span className="ml-1 px-1.5 py-0.2 bg-[#F4F5F7] text-[#42526E] rounded-full text-[10px]">
                {assets.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("myAssets")}
            className={`pb-2.5 flex items-center gap-1.5 cursor-pointer transition relative ${
              activeTab === "myAssets"
                ? "text-[#0052CC] font-bold border-b-2 border-[#0052CC]"
                : "text-[#6B778C] hover:text-[#172B4D]"
            }`}
          >
            <Cpu size={14} />
            My Issued Equipment
            <span className="ml-1 px-1.5 py-0.2 bg-[#EAE6FF] text-[#403294] font-bold rounded-full text-[10px]">
              {myAssets.length}
            </span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: SUPPORT TICKETS & INCIDENTS
            ======================================================== */}
        {activeTab === "tickets" && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#0052CC]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Total Tickets
                </span>
                <span className="text-xl font-bold text-[#172B4D] mt-1 block">
                  {tickets.length}
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#FFAB00]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Open & In Progress
                </span>
                <span className="text-xl font-bold text-[#FF8B00] mt-1 block">
                  {openTicketsCount}
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#00875A]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Resolved / Closed
                </span>
                <span className="text-xl font-bold text-[#00875A] mt-1 block">
                  {tickets.length - openTicketsCount}
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#DE350B]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Critical Escalations
                </span>
                <span className="text-xl font-bold text-[#DE350B] mt-1 block">
                  {criticalTicketsCount}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#DFE1E6] rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#6B778C]" />
                <input
                  type="text"
                  placeholder="Filter by title / ID / requester..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] outline-none focus:ring-1 focus:ring-[#0052CC]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <Filter size={13} className="text-[#6B778C]" />
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="IT Hardware & Software">IT Hardware & Software</option>
                  <option value="HR Operations">HR Operations</option>
                  <option value="Payroll & Taxes">Payroll & Taxes</option>
                  <option value="Facilities & Workplace">Facilities & Workplace</option>
                </select>

                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F4F5F7] border-b border-[#DFE1E6] text-[#42526E]">
                      <th className="py-2.5 px-3 text-left font-bold w-28">Ticket Key</th>
                      <th className="py-2.5 px-3 text-left font-bold">Summary</th>
                      <th className="py-2.5 px-3 text-left font-bold w-40">Category</th>
                      <th className="py-2.5 px-3 text-center font-bold w-24">Priority</th>
                      <th className="py-2.5 px-3 text-left font-bold w-36">Requester</th>
                      <th className="py-2.5 px-3 text-center font-bold w-28">Status</th>
                      <th className="py-2.5 px-3 text-center font-bold w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6]">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-xs text-[#6B778C]">
                          No support tickets found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((t) => (
                        <tr key={t.ticketId} className="hover:bg-[#FAFBFC] transition">
                          <td className="py-2.5 px-3 font-bold text-[#0052CC]">{t.ticketId}</td>
                          <td className="py-2.5 px-3 font-medium text-[#172B4D] max-w-xs truncate">
                            {t.title}
                          </td>
                          <td className="py-2.5 px-3 text-[#5E6C84]">{t.category}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(
                                t.priority
                              )}`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[#172B4D]">{t.requesterName}</div>
                            <div className="text-[10px] text-[#6B778C]">{t.department}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                                t.status
                              )}`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedTicket(t);
                                setTicketModalMode("view");
                                setIsTicketModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-medium rounded text-[11px] transition cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: HARDWARE & ASSET INVENTORY (ADMIN/MANAGER)
            ======================================================== */}
        {activeTab === "assets" && canManage && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#0052CC]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Total Inventory
                </span>
                <span className="text-xl font-bold text-[#172B4D] mt-1 block">
                  {assets.length} Units
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#00875A]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Currently Allocated
                </span>
                <span className="text-xl font-bold text-[#00875A] mt-1 block">
                  {allocatedAssetsCount} Units
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#6554C0]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Available in Stock
                </span>
                <span className="text-xl font-bold text-[#403294] mt-1 block">
                  {availableAssetsCount} Units
                </span>
              </div>

              <div className="bg-white border border-[#DFE1E6] rounded p-3 shadow-2xs border-t-2 border-t-[#FFAB00]">
                <span className="text-[10px] font-semibold text-[#6B778C] uppercase tracking-wider block">
                  Total Asset Book Value
                </span>
                <span className="text-xl font-bold text-[#172B4D] mt-1 block">
                  ₹{totalAssetValue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#DFE1E6] rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#6B778C]" />
                <input
                  type="text"
                  placeholder="Search asset tag / model / assignee..."
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] outline-none focus:ring-1 focus:ring-[#0052CC]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <Filter size={13} className="text-[#6B778C]" />
                <select
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Laptop">Laptops</option>
                  <option value="Monitor">Monitors</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Mobile Device">Mobile Devices</option>
                  <option value="Access Badge">Access Badges</option>
                </select>

                <select
                  value={assetStatus}
                  onChange={(e) => setAssetStatus(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#DFE1E6] rounded font-medium text-[#172B4D] bg-white cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available (In Locker)</option>
                  <option value="Allocated">Allocated to Staff</option>
                  <option value="In Repair">In Repair</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            {/* Assets Table */}
            <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F4F5F7] border-b border-[#DFE1E6] text-[#42526E]">
                      <th className="py-2.5 px-3 text-left font-bold w-28">Asset Tag</th>
                      <th className="py-2.5 px-3 text-left font-bold">Equipment Description</th>
                      <th className="py-2.5 px-3 text-left font-bold w-28">Category</th>
                      <th className="py-2.5 px-3 text-left font-bold w-36">Serial No.</th>
                      <th className="py-2.5 px-3 text-center font-bold w-24">Condition</th>
                      <th className="py-2.5 px-3 text-left font-bold w-40">Allocated To</th>
                      <th className="py-2.5 px-3 text-center font-bold w-24">Status</th>
                      <th className="py-2.5 px-3 text-center font-bold w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6]">
                    {filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-xs text-[#6B778C]">
                          No asset inventory found.
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((a) => (
                        <tr key={a.assetTag} className="hover:bg-[#FAFBFC] transition">
                          <td className="py-2.5 px-3 font-bold text-[#172B4D]">{a.assetTag}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-[#172B4D]">{a.name}</div>
                            <div className="text-[10px] text-[#6B778C]">{a.model || a.specification}</div>
                          </td>
                          <td className="py-2.5 px-3 text-[#5E6C84]">{a.category}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#6B778C]">
                            {a.serialNumber || "N/A"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F5F7] text-[#42526E]">
                              {a.condition}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {a.status === "Allocated" ? (
                              <div>
                                <span className="font-semibold text-[#172B4D] block truncate">
                                  {a.allocatedToName}
                                </span>
                                <span className="text-[10px] text-[#6B778C]">{a.allocatedToId}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#8993A4] italic">Unassigned</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                a.status === "Allocated"
                                  ? "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]"
                                  : a.status === "Available"
                                  ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                                  : "bg-[#FFF0B3] text-[#974F0C] border-[#FFE380]"
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {a.status === "Available" ? (
                              <button
                                onClick={() => {
                                  setSelectedAsset(a);
                                  setAssetModalMode("allocate");
                                  setIsAssetModalOpen(true);
                                }}
                                className="px-2 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-[10px] transition cursor-pointer"
                              >
                                Allocate
                              </button>
                            ) : a.status === "Allocated" ? (
                              <button
                                onClick={() => {
                                  setSelectedAsset(a);
                                  setAssetModalMode("return");
                                  setIsAssetModalOpen(true);
                                }}
                                className="px-2 py-1 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E] font-medium rounded text-[10px] transition cursor-pointer"
                              >
                                Return
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: MY ISSUED EQUIPMENT (ESS)
            ======================================================== */}
        {activeTab === "myAssets" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#DFE1E6] rounded p-4 shadow-2xs">
              <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
                <Cpu size={16} className="text-[#0052CC]" />
                Issued Hardware & IT Equipment Custody
              </h3>
              <p className="text-xs text-[#6B778C] mt-1">
                Official company assets entrusted to your custody for employment and workstation operations
              </p>
            </div>

            {myAssets.length === 0 ? (
              <div className="bg-white border border-[#DFE1E6] rounded p-12 text-center">
                <Laptop size={32} className="mx-auto text-[#A5ADBA] mb-2" />
                <h3 className="font-bold text-sm text-[#172B4D]">No Company Assets Currently Issued</h3>
                <p className="text-xs text-[#6B778C] mt-1 mb-4">
                  If you require a laptop, monitor, or access credentials, submit an IT support request.
                </p>
                <button
                  onClick={() => {
                    setTicketModalMode("create");
                    setSelectedTicket(null);
                    setIsTicketModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  Request Equipment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {myAssets.map((asset) => (
                  <div
                    key={asset.assetTag}
                    className="bg-white border border-[#DFE1E6] rounded-md p-4 shadow-2xs hover:shadow-xs transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]">
                        {asset.assetTag}
                      </span>
                      <span className="text-[11px] font-semibold text-[#00875A] bg-[#E3FCEF] px-2 py-0.5 rounded border border-[#ABF5D1]">
                        Active Custody
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#172B4D]">{asset.name}</h4>
                      <p className="text-xs text-[#5E6C84] mt-1">
                        {asset.specification || asset.model}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#EBECF0] space-y-1 text-xs text-[#172B4D]">
                      <div className="flex justify-between">
                        <span className="text-[#6B778C]">Category:</span>
                        <span className="font-semibold">{asset.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B778C]">Serial Number:</span>
                        <span className="font-mono text-[11px]">{asset.serialNumber || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B778C]">Issued On:</span>
                        <span>
                          {asset.allocatedAt
                            ? new Date(asset.allocatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Onboarding"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EBECF0] flex justify-end">
                      <button
                        onClick={() => {
                          setTicketModalMode("create");
                          setSelectedTicket(null);
                          setIsTicketModalOpen(true);
                        }}
                        className="text-xs text-[#0052CC] hover:underline font-semibold cursor-pointer"
                      >
                        Report Hardware Issue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <TicketModal
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setSelectedTicket(null);
          }}
          onSave={handleCreateTicket}
          onAddComment={handleAddTicketComment}
          onUpdateStatus={handleUpdateTicketStatus}
          currentUser={user}
          ticket={selectedTicket}
          mode={ticketModalMode}
          canManage={canManage}
        />

        <AssetModal
          isOpen={isAssetModalOpen}
          onClose={() => {
            setIsAssetModalOpen(false);
            setSelectedAsset(null);
          }}
          onSaveAsset={handleCreateAsset}
          onAllocate={handleAllocateAsset}
          onReturn={handleReturnAsset}
          employees={employees}
          asset={selectedAsset}
          mode={assetModalMode}
        />
      </div>
    </DashboardLayout>
  );
}

export default Helpdesk;
