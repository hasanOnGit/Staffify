import React, { useEffect, useState } from "react";
import {
  Receipt,
  Plus,
  Search,
  RefreshCw,
  CreditCard,
  Building2,
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  Percent,
} from "lucide-react";
import StatusLozenge from "../components/StatusLozenge";
import KpiMetricCard from "../components/KpiMetricCard";
import GenerateInvoiceModal from "../components/invoices/GenerateInvoiceModal";
import InvoicePrintPreviewModal from "../components/invoices/InvoicePrintPreviewModal";
import { invoicesApi } from "../services/api";
import toast from "react-hot-toast";

function VendorInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalInvoiced: 0,
    totalGst: 0,
    paidAmount: 0,
    pendingPayout: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoicesApi.getAll({
        search,
        status: statusFilter,
      });
      setInvoices(res.data.data);
      setStats(res.data.stats);
    } catch (err) {
      toast.error("Failed to load invoices: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadInvoices();
  };

  const handleOpenPreview = (invoiceNumber) => {
    setSelectedInvoiceId(invoiceNumber);
    setPreviewModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
            Vendor Invoicing & Payout Settlements
          </h2>
          <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] mt-0.5">
            Generate monthly vendor bills from deployed timesheets, reconcile 18% GST, and deduct client PO balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadInvoices}
            className="bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setGenerateModalOpen(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Generate Monthly Invoice</span>
          </button>
        </div>
      </div>

      {/* Staffify KpiMetricCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Total Invoiced Volume"
          value={`₹${(stats.totalInvoiced || 0).toLocaleString("en-IN")}`}
          context={`${stats.totalInvoices} generated invoices`}
          badgeText="Total Ledger"
          accentColor="#0052CC"
          icon={Receipt}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />

        <KpiMetricCard
          title="Statutory GST (18%)"
          value={`₹${(stats.totalGst || 0).toLocaleString("en-IN")}`}
          context="Input tax credit pass-through"
          badgeText="Statutory Tax"
          accentColor="#579DFF"
          icon={Percent}
          iconBg="bg-[#DEEBFF] dark:bg-[#1C2331]"
          iconColor="text-[#0052CC] dark:text-[#579DFF]"
        />

        <KpiMetricCard
          title="Disbursed / Settled"
          value={`₹${(stats.paidAmount || 0).toLocaleString("en-IN")}`}
          context="Settled with agencies"
          badgeText="Paid Out"
          accentColor="#00875A"
          icon={CheckCircle2}
          iconBg="bg-[#E3FCEF] dark:bg-emerald-950/40"
          iconColor="text-[#00875A] dark:text-emerald-400"
        />

        <KpiMetricCard
          title="Pending Vendor Payout"
          value={`₹${(stats.pendingPayout || 0).toLocaleString("en-IN")}`}
          context="Draft, Submitted, or Approved"
          badgeText="Pending Run"
          accentColor="#B9770E"
          icon={CreditCard}
          iconBg="bg-[#FFF0B3] dark:bg-amber-950/40"
          iconColor="text-[#B9770E] dark:text-amber-400"
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
            placeholder="Search invoice #, agency, client, PO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] text-[#172B4D] dark:text-white"
        >
          <option value="All">All Invoice Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Staffify Atlassian Table */}
      <div className="bg-white dark:bg-[#151B26] rounded border border-[#DFE1E6] dark:border-[#263042] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F5F7] dark:bg-[#1C2331] text-[#6B778C] dark:text-[#94A3B8] border-b border-[#DFE1E6] dark:border-[#263042] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Staffing Agency</th>
                <th className="px-4 py-3">Client Entity</th>
                <th className="px-4 py-3">Billing PO</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-center">Contractors</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Grand Total (incl GST)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                    Loading vendor invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-xs text-[#6B778C] dark:text-[#94A3B8]">
                    No invoices found. Click "Generate Monthly Invoice" to run billing.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    onClick={() => handleOpenPreview(inv.invoiceNumber)}
                    className="hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331]/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-[#0747A6] dark:text-[#579DFF] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] px-1.5 py-0.5 rounded border border-[#B3D4FF] dark:border-[#263042]">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#172B4D] dark:text-white">
                      <div>{inv.vendorName}</div>
                      <div className="font-mono text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                        {inv.vendorId}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#172B4D] dark:text-neutral-200">
                      <div>{inv.clientName}</div>
                      <div className="text-[10px] text-[#6B778C] dark:text-[#94A3B8]">
                        {inv.clientId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-[#0747A6] dark:text-[#579DFF] font-semibold bg-[#DEEBFF] dark:bg-[#1C2331] px-1.5 py-0.5 rounded border border-[#B3D4FF] dark:border-[#263042]">
                        {inv.poNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {inv.billingPeriod?.month} {inv.billingPeriod?.year}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-semibold">
                      {inv.lineItems?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#6B778C] dark:text-[#94A3B8]">
                      ₹{inv.subtotal.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[#172B4D] dark:text-white">
                      ₹{inv.grandTotal.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusLozenge status={inv.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPreview(inv.invoiceNumber);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0052CC] dark:text-[#579DFF] hover:bg-[#DEEBFF] dark:hover:bg-[#1C2331] rounded transition"
                      >
                        {inv.status === "Paid" ? "Inspect" : "Review & Pay"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <GenerateInvoiceModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onSuccess={loadInvoices}
      />

      <InvoicePrintPreviewModal
        invoiceId={selectedInvoiceId}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onSuccess={loadInvoices}
      />
    </div>
  );
}

export default VendorInvoices;
