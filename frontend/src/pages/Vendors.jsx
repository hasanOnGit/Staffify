import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import StatusLozenge from "../components/StatusLozenge";
import OnboardVendorModal from "../components/vendors/OnboardVendorModal";
import VendorDrawer from "../components/vendors/VendorDrawer";
import { vendorsApi } from "../services/api";
import toast from "react-hot-toast";

const categories = ["All", "Security", "IT", "Facilities", "General"];

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, blacklisted: 0, totalActiveWorkers: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  useEffect(() => {
    loadVendors();
  }, [selectedCategory, selectedStatus]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await vendorsApi.getAll({
        search,
        category: selectedCategory,
        status: selectedStatus,
      });
      setVendors(res.data.data);
      setStats(res.data.stats);
    } catch (err) {
      toast.error("Failed to load vendors: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVendors();
  };

  const handleOpenDossier = (vendorId) => {
    setSelectedVendorId(vendorId);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
            Staffing Agencies & Vendors Directory
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-neutral-400">
            Manage agency Master Service Agreements, statutory compliances, and contracted headcount
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadVendors}
            className="p-2 text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] rounded border border-[#DFE1E6] dark:border-[#263042] transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Onboard Agency</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B778C] dark:text-neutral-400">
              Total Agencies
            </span>
            <Building2 size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
          </div>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-2">
            {stats.total}
          </p>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Enrolled in system
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B778C] dark:text-neutral-400">
              Active Partners
            </span>
            <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">
            {stats.active}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            In good compliance standing
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B778C] dark:text-neutral-400">
              Deployed Workforce
            </span>
            <Users size={16} className="text-[#0052CC] dark:text-[#579DFF]" />
          </div>
          <p className="text-2xl font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-2">
            {stats.totalActiveWorkers}
          </p>
          <span className="text-[11px] text-[#0052CC] dark:text-[#579DFF]">
            Contracted personnel on site
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B778C] dark:text-neutral-400">
              Blacklisted / Locked
            </span>
            <ShieldAlert size={16} className="text-[#DE350B]" />
          </div>
          <p className="text-2xl font-bold text-[#DE350B] mt-2">
            {stats.blacklisted}
          </p>
          <span className="text-[11px] text-rose-500">
            Blocked from new deployments
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-lg bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? "bg-[#0052CC] text-white font-semibold"
                  : "text-[#42526E] dark:text-neutral-300 hover:bg-[#EBECF0] dark:hover:bg-[#1C2331]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Status Controls */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search agency, GSTIN, SPOC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
            />
          </form>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blacklisted">Blacklisted</option>
          </select>
        </div>
      </div>

      {/* Vendors Data Table */}
      <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#172B4D] dark:text-[#F1F5F9]">
            <thead className="bg-[#FAFBFC] dark:bg-[#0F131C] border-b border-[#DFE1E6] dark:border-[#263042] text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400 tracking-wider">
              <tr>
                <th className="px-4 py-3">Vendor ID</th>
                <th className="px-4 py-3">Agency Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">SPOC Contact</th>
                <th className="px-4 py-3">GSTIN / Tax ID</th>
                <th className="px-4 py-3 text-center">Active Contracts</th>
                <th className="px-4 py-3 text-center">Deployed Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-[#6B778C]">
                    Loading staffing agencies...
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-[#6B778C]">
                    No vendors match your search filters.
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr
                    key={v._id}
                    onClick={() => handleOpenDossier(v.vendorId)}
                    className="hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#0052CC] dark:text-[#579DFF]">
                      {v.vendorId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#172B4D] dark:text-white">
                      <div>{v.legalName}</div>
                      <div className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                        {v.billingAddress?.city || "India"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0052CC] dark:bg-[#1C2331] dark:text-[#579DFF]">
                        {v.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#172B4D] dark:text-neutral-200">
                        {v.spocName}
                      </div>
                      <div className="text-[10px] text-[#6B778C] dark:text-neutral-400 font-mono">
                        {v.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#42526E] dark:text-neutral-300">
                      {v.gstin}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#172B4D] dark:text-white">
                        <FileCheck2 size={13} className="text-[#0052CC]" />
                        <span>{v.activeContractsCount || 0}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Users size={13} />
                        <span>{v.activeWorkersCount || 0}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusLozenge status={v.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDossier(v.vendorId);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-[#0052CC] dark:text-[#579DFF] hover:bg-[#DEEBFF] dark:hover:bg-[#1C2331] rounded transition"
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Vendor Modal */}
      <OnboardVendorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadVendors}
      />

      {/* Vendor Detail Slide-out Drawer */}
      <VendorDrawer
        vendorId={selectedVendorId}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

export default Vendors;
