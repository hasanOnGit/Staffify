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
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
} from "lucide-react";
import StatusLozenge from "../components/StatusLozenge";
import KpiMetricCard from "../components/KpiMetricCard";
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
            Staffing Agencies & Vendors Directory
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Partner credential verification, statutory GSTIN compliances, and contracted workforce quotas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadVendors}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Onboard Agency</span>
          </button>
        </div>
      </div>

      {/* Replicated Staffify KpiMetricCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Total Agencies"
          value={stats.total}
          context="Enrolled staffing partners"
          badgeText="Verified MSAs"
          accentColor="#0052CC"
          icon={Building2}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />

        <KpiMetricCard
          title="Active Partners"
          value={stats.active}
          context="In full statutory standing"
          badgeText="98% Compliant"
          accentColor="#00875A"
          icon={ShieldCheck}
          iconBg="bg-[#E3FCEF] dark:bg-emerald-950/40"
          iconColor="text-[#00875A] dark:text-emerald-400"
        />

        <KpiMetricCard
          title="Deployed Workforce"
          value={stats.totalActiveWorkers}
          context="Contractors deployed on site"
          badgeText="Live Shift"
          accentColor="#579DFF"
          icon={Users}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />

        <KpiMetricCard
          title="Restricted / Blacklist"
          value={stats.blacklisted}
          context="Suspended from placements"
          badgeText="Audit Hold"
          accentColor="#DE350B"
          icon={ShieldAlert}
          iconBg="bg-[#FFEBE6] dark:bg-rose-950/40"
          iconColor="text-[#DE350B] dark:text-rose-400"
        />
      </div>

      {/* Filter Toolbar with Quick Preset Filter Pills */}
      <div className="p-3 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        {/* Rounded-full category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full transition cursor-pointer shrink-0 font-medium ${
                selectedCategory === cat
                  ? "bg-[#0052CC] text-white border border-[#0052CC] font-semibold shadow-2xs"
                  : "bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-[#94A3B8] border border-[#DFE1E6] dark:border-[#263042] hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]"
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
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-[#94A3B8]"
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

      {/* Staffify Atlassian Data Table */}
      <div className="bg-white dark:bg-[#151B26] rounded border border-[#DFE1E6] dark:border-[#263042] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F5F7] dark:bg-[#1C2331] text-[#6B778C] dark:text-[#94A3B8] border-b border-[#DFE1E6] dark:border-[#263042] font-semibold uppercase tracking-wider text-[11px]">
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
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                    Loading staffing agencies...
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                    No vendors found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr
                    key={v._id}
                    onClick={() => handleOpenDossier(v.vendorId)}
                    className="hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-[#0747A6] dark:text-[#579DFF] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] px-1.5 py-0.5 rounded border border-[#B3D4FF] dark:border-[#263042]">
                        {v.vendorId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9] group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition-colors">
                        {v.legalName}
                      </div>
                      <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                        {v.billingAddress?.city || "India"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusLozenge status={v.category} size="xs" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">
                        {v.spocName}
                      </div>
                      <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8] font-mono">
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
                      <span className="inline-flex items-center gap-1 font-semibold text-[#00875A] dark:text-emerald-400">
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
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0052CC] dark:text-[#579DFF] hover:bg-[#DEEBFF] dark:hover:bg-[#1C2331] rounded transition"
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
