import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Users,
  FileCheck2,
  RefreshCw,
  Building,
  Edit2,
  ExternalLink,
} from "lucide-react";
import StatusLozenge from "../components/StatusLozenge";
import KpiMetricCard from "../components/KpiMetricCard";
import ClientModal from "../components/clients/ClientModal";
import ClientSitesDrawer from "../components/clients/ClientSitesDrawer";
import { clientsApi } from "../services/api";
import toast from "react-hot-toast";

function Clients() {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalSites: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  useEffect(() => {
    loadClients();
  }, [industryFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await clientsApi.getAll({
        search,
        industry: industryFilter,
      });
      setClients(res.data.data);
      setStats(res.data.stats);
    } catch (err) {
      toast.error("Failed to load clients: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadClients();
  };

  const handleOpenSites = (clientId) => {
    setSelectedClientId(clientId);
    setDrawerOpen(true);
  };

  const handleEditClient = (client, e) => {
    e.stopPropagation();
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const totalContractors = clients.reduce((acc, c) => acc + (c.activeWorkersCount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
            Enterprise Clients & Delivery Sites
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Configure client corporate entities, regional work campuses, and track site-level contingent headcount
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadClients}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Add Client & Sites</span>
          </button>
        </div>
      </div>

      {/* Staffify KpiMetricCards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiMetricCard
          title="Corporate Accounts"
          value={stats.total}
          context={`${stats.active} Active billing entities`}
          badgeText="Verified Clients"
          accentColor="#0052CC"
          icon={Briefcase}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />

        <KpiMetricCard
          title="Physical Work Sites"
          value={stats.totalSites}
          context="Regional deployment campuses"
          badgeText="Multi-Facility"
          accentColor="#00875A"
          icon={MapPin}
          iconBg="bg-[#E3FCEF] dark:bg-emerald-950/40"
          iconColor="text-[#00875A] dark:text-emerald-400"
        />

        <KpiMetricCard
          title="Deployed Contractors"
          value={totalContractors}
          context="Active personnel on site"
          badgeText="Live Staffing"
          accentColor="#579DFF"
          icon={Users}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C] dark:text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Search client, site, city, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
          />
        </form>

        <span className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] shrink-0 font-medium">
          Showing {clients.length} Corporate Accounts
        </span>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-[#6B778C]">
            Loading enterprise clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-[#6B778C]">
            No clients found. Click "Add Client & Sites" to register one.
          </div>
        ) : (
          clients.map((c) => (
            <div
              key={c._id}
              onClick={() => handleOpenSites(c.clientId)}
              className="p-4 rounded-xl bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] shadow-xs hover:border-[#0052CC] dark:hover:border-[#579DFF] transition-all cursor-pointer group flex flex-col justify-between space-y-4 card-smooth"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-[#0747A6] dark:text-[#579DFF] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] px-1.5 py-0.5 rounded border border-[#B3D4FF] dark:border-[#263042]">
                    {c.clientId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusLozenge status={c.status} size="xs" />
                    <button
                      type="button"
                      onClick={(e) => handleEditClient(c, e)}
                      className="p-1 text-[#6B778C] hover:text-[#0052CC] dark:hover:text-[#579DFF] rounded transition"
                      title="Edit client"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#172B4D] dark:text-white group-hover:text-[#0052CC] dark:group-hover:text-[#579DFF] transition-colors leading-snug">
                  {c.legalName}
                </h3>
                <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
                  {c.industry}
                </p>
                <div className="mt-2 font-mono text-[11px] text-[#42526E] dark:text-neutral-300">
                  GSTIN: {c.gstin}
                </div>
              </div>

              {/* Sites & Staff Summary */}
              <div className="pt-3 border-t border-[#DFE1E6] dark:border-[#263042] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-[#42526E] dark:text-neutral-300 font-medium">
                    <MapPin size={13} className="text-[#0052CC]" />
                    <span className="font-semibold">{c.siteCount || 0} Physical Sites</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#00875A] dark:text-emerald-400 font-semibold">
                    <Users size={13} />
                    <span>{c.activeWorkersCount || 0} Staff</span>
                  </span>
                </div>

                {/* Site tags */}
                <div className="flex flex-wrap gap-1">
                  {c.sites?.slice(0, 3).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] rounded bg-[#FAFBFC] dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] text-[#42526E] dark:text-neutral-300 truncate max-w-[140px] font-medium"
                    >
                      {s.siteName}
                    </span>
                  ))}
                  {c.sites?.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#DEEBFF] text-[#0052CC] dark:bg-[#1C2331] dark:text-[#579DFF] font-semibold">
                      +{c.sites.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                  <span>Terms: {c.paymentTermsDays || 30} Days</span>
                  <span className="text-[#0052CC] dark:text-[#579DFF] font-semibold group-hover:underline">
                    Inspect Sites →
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <ClientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadClients}
        clientToEdit={editingClient}
      />

      {/* Drawer */}
      <ClientSitesDrawer
        clientId={selectedClientId}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

export default Clients;
