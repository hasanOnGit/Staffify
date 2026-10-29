import React, { useEffect, useState } from "react";
import {
  FileCheck2,
  Plus,
  Search,
  RefreshCw,
  Calculator,
  Percent,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Briefcase,
  Layers,
} from "lucide-react";
import StatusLozenge from "../components/StatusLozenge";
import KpiMetricCard from "../components/KpiMetricCard";
import ContractModal from "../components/commercials/ContractModal";
import PurchaseOrderModal from "../components/commercials/PurchaseOrderModal";
import { commercialsApi } from "../services/api";
import toast from "react-hot-toast";

function Commercials() {
  const [activeTab, setActiveTab] = useState("pos"); // 'pos' or 'contracts'
  const [contracts, setContracts] = useState([]);
  const [pos, setPos] = useState([]);
  const [poStats, setPoStats] = useState({
    totalBudget: 0,
    totalUtilized: 0,
    totalRemaining: 0,
    activePOs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [expandedContractId, setExpandedContractId] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [conRes, poRes] = await Promise.all([
        commercialsApi.getContracts({ search }),
        commercialsApi.getPurchaseOrders({ search }),
      ]);
      setContracts(conRes.data.data);
      setPos(poRes.data.data);
      setPoStats(poRes.data.stats);
    } catch (err) {
      toast.error("Failed to load commercial records: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const toggleExpandContract = (id) => {
    setExpandedContractId(expandedContractId === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
            Client Contracts & Budgets
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Manage client agreements, worker billing rates, and track purchase order budget spending
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setContractModalOpen(true)}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#0052CC] dark:text-[#579DFF] border border-[#B3D4FF] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>New Contract</span>
          </button>

          <button
            type="button"
            onClick={() => setPoModalOpen(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Staffify KpiMetricCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Total Approved Budget"
          value={`₹${(poStats.totalBudget || 0).toLocaleString("en-IN")}`}
          context={`Across ${pos.length} purchase orders`}
          badgeText="Approved"
          accentColor="#0052CC"
          icon={CreditCard}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />

        <KpiMetricCard
          title="Budget Spent"
          value={`₹${(poStats.totalUtilized || 0).toLocaleString("en-IN")}`}
          context={`${poStats.averageUtilization || 0}% of budget used`}
          badgeText="Used"
          accentColor="#B9770E"
          icon={Percent}
          iconBg="bg-[#FFF0B3] dark:bg-amber-950/40"
          iconColor="text-[#B9770E] dark:text-amber-400"
        />

        <KpiMetricCard
          title="Remaining Budget"
          value={`₹${(poStats.totalRemaining || 0).toLocaleString("en-IN")}`}
          context="Available for new assignments"
          badgeText="Available"
          accentColor="#00875A"
          icon={CheckCircle2}
          iconBg="bg-[#E3FCEF] dark:bg-emerald-950/40"
          iconColor="text-[#00875A] dark:text-emerald-400"
        />

        <KpiMetricCard
          title="Active Agreements"
          value={`${contracts.length} Contracts`}
          context="Signed client agreements"
          badgeText="Active"
          accentColor="#579DFF"
          icon={FileCheck2}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="p-3 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Quick Preset Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("pos")}
            className={`text-xs px-3.5 py-1 rounded-full transition cursor-pointer font-medium ${
              activeTab === "pos"
                ? "bg-[#0052CC] text-white border border-[#0052CC] font-semibold shadow-2xs"
                : "bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-[#94A3B8] border border-[#DFE1E6] dark:border-[#263042] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]"
            }`}
          >
            <span>Purchase Orders ({pos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contracts")}
            className={`text-xs px-3.5 py-1 rounded-full transition cursor-pointer font-medium ${
              activeTab === "contracts"
                ? "bg-[#0052CC] text-white border border-[#0052CC] font-semibold shadow-2xs"
                : "bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-[#94A3B8] border border-[#DFE1E6] dark:border-[#263042] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]"
            }`}
          >
            <span>Contracts & Rates ({contracts.length})</span>
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Search PO, contract, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
          />
        </form>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === "pos" && (
        <div className="bg-white dark:bg-[#151B26] rounded border border-[#DFE1E6] dark:border-[#263042] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F5F7] dark:bg-[#1C2331] text-[#6B778C] dark:text-[#94A3B8] border-b border-[#DFE1E6] dark:border-[#263042] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Contract</th>
                  <th className="px-4 py-3">Approved Budget</th>
                  <th className="px-4 py-3 min-w-[200px]">Budget Spent & Remaining</th>
                  <th className="px-4 py-3">Validity</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : pos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                      No purchase orders issued yet.
                    </td>
                  </tr>
                ) : (
                  pos.map((p) => {
                    const percent = p.utilizationPercent || 0;
                    let progressColor = "bg-[#00875A]";
                    if (percent >= 90) progressColor = "bg-[#DE350B]";
                    else if (percent >= 70) progressColor = "bg-[#B9770E]";

                    return (
                      <tr
                        key={p._id}
                        className="hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] text-[#0747A6] dark:text-[#579DFF] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] px-1.5 py-0.5 rounded border border-[#B3D4FF] dark:border-[#263042]">
                            {p.poNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#172B4D] dark:text-white">
                          <div>{p.clientName}</div>
                          <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] font-mono">
                            {p.clientId}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#42526E] dark:text-neutral-300">
                          {p.contractNumber}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-[#172B4D] dark:text-white">
                          ₹{p.poValue.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-[#172B4D] dark:text-white font-mono">
                                ₹{(p.utilizedAmount || 0).toLocaleString("en-IN")} ({percent}%)
                              </span>
                              <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                                Rem: ₹{(p.remainingBalance || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="w-full bg-[#EBECF0] dark:bg-[#263042] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                          <div>From: {new Date(p.startDate).toLocaleDateString()}</div>
                          <div>To: {new Date(p.expiryDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusLozenge status={p.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRACTS & RATE CARDS */}
      {activeTab === "contracts" && (
        <div className="bg-white dark:bg-[#151B26] rounded border border-[#DFE1E6] dark:border-[#263042] overflow-hidden shadow-2xs">
          <div className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                Loading contracts and rate cards...
              </div>
            ) : contracts.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                No contracts registered. Click "New Contract" to create one.
              </div>
            ) : (
              contracts.map((c) => {
                const isExpanded = expandedContractId === c._id;
                return (
                  <div key={c._id} className="p-4 transition-colors hover:bg-[#FAFBFC] dark:hover:bg-[#101520]">
                    <div
                      onClick={() => toggleExpandContract(c._id)}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#0747A6] dark:text-[#579DFF] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] px-1.5 py-0.5 rounded border border-[#B3D4FF] dark:border-[#263042]">
                            {c.contractNumber}
                          </span>
                          <StatusLozenge status={c.status} size="xs" />
                          <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                            {c.rateCards?.length || 0} Rate Cards Defined
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#172B4D] dark:text-white leading-snug">
                          {c.title || `${c.vendorName} - ${c.clientName}`}
                        </h3>
                        <p className="text-xs text-[#6B778C] dark:text-[#94A3B8]">
                          Client: <span className="font-semibold text-[#172B4D] dark:text-neutral-200">{c.clientName}</span> • Staffing Agency: <span className="font-semibold text-[#172B4D] dark:text-neutral-200">{c.vendorName}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] block">
                            Contract Validity
                          </span>
                          <span className="font-semibold text-[#172B4D] dark:text-white text-[11px]">
                            {new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] block">
                            POs Linked
                          </span>
                          <span className="font-bold text-[#0052CC] dark:text-[#579DFF]">
                            {c.poCount || 0} Purchase Orders
                          </span>
                        </div>

                        <button
                          type="button"
                          className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Rate Cards Grid */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-[#DFE1E6] dark:border-[#263042] space-y-2 animate-page-enter">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B778C] dark:text-[#94A3B8] block">
                          Agreed Roles & Pay Rates:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {c.rateCards?.map((rc, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#172B4D] dark:text-white truncate">
                                  {rc.designation}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#DEEBFF] text-[#0052CC] dark:bg-[#1C2331] dark:text-[#579DFF]">
                                  {rc.billingUnit}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-[#6B778C] dark:text-[#94A3B8] text-[11px]">
                                  Worker Cost: ₹{rc.baseCost.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[11px] font-semibold text-[#00875A] dark:text-emerald-400">
                                  +{rc.markupPercent}% Markup
                                </span>
                              </div>

                              <div className="pt-1 border-t border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#6B778C] dark:text-[#94A3B8] uppercase">
                                  Client Rate
                                </span>
                                <span className="text-xs font-mono font-bold text-[#0052CC] dark:text-[#579DFF]">
                                  ₹{rc.billableRate.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ContractModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        onSuccess={loadData}
      />

      <PurchaseOrderModal
        isOpen={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

export default Commercials;
