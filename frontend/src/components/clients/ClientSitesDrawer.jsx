import React, { useEffect, useState } from "react";
import {
  X,
  Briefcase,
  MapPin,
  Users,
  FileCheck2,
  Calendar,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import StatusLozenge from "../StatusLozenge";
import { clientsApi } from "../../services/api";

function ClientSitesDrawer({ clientId, isOpen, onClose }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && clientId) {
      loadClient();
    }
  }, [isOpen, clientId]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const res = await clientsApi.getById(clientId);
      setClient(res.data.data);
    } catch (err) {
      console.error("Failed to load client details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white dark:bg-[#151B26] border-l border-[#DFE1E6] dark:border-[#263042] h-full shadow-2xl flex flex-col transform transition-transform duration-250 ease-out animate-page-enter">
        {/* Header */}
        <div className="h-16 px-5 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#0F131C] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DEEBFF] dark:bg-[#1C2331] flex items-center justify-center text-[#0052CC] dark:text-[#579DFF]">
              <Briefcase size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#6B778C] dark:text-neutral-400">
                  {client?.clientId || clientId}
                </span>
                {client && <StatusLozenge status={client.status} size="xs" />}
              </div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9] truncate max-w-sm">
                {client?.legalName || "Loading Client..."}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white rounded hover:bg-[#EBECF0] dark:hover:bg-[#1C2331]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-xs text-[#6B778C] dark:text-neutral-400">
            Loading Client Dossier...
          </div>
        ) : client ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* KPI Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C]">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400 block">
                  Industry
                </span>
                <span className="text-xs font-bold text-[#0052CC] dark:text-[#579DFF] truncate block">
                  {client.industry}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C]">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400 block">
                  Work Sites
                </span>
                <span className="text-xs font-bold text-[#172B4D] dark:text-white">
                  {client.sites?.length || 0} Locations
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C]">
                <span className="text-[10px] uppercase font-bold text-[#6B778C] dark:text-neutral-400 block">
                  Payment Terms
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {client.paymentTermsDays || 30} Days Net
                </span>
              </div>
            </div>

            {/* Sites Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#0052CC]" />
                <span>Operational Campuses & Branches ({client.sites?.length || 0})</span>
              </h3>

              <div className="space-y-3">
                {client.sites?.map((site) => {
                  const siteWorkers =
                    client.deployments?.filter(
                      (d) => d.siteId === site.siteId && d.status === "Active"
                    ) || [];

                  return (
                    <div
                      key={site.siteId}
                      className="p-3.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#0F131C] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-[10px] text-[#6B778C] dark:text-neutral-400 block">
                            {site.siteId}
                          </span>
                          <h4 className="text-xs font-bold text-[#172B4D] dark:text-white">
                            {site.siteName}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E3FCEF] dark:bg-emerald-950/40 text-[#006644] dark:text-emerald-400 border border-[#ABF5D1] dark:border-emerald-800">
                          {siteWorkers.length} Active Staff
                        </span>
                      </div>

                      <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                        {site.location} • {site.address || "Main Campus"}
                      </p>

                      {/* Workers deployed at this specific site */}
                      {siteWorkers.length > 0 && (
                        <div className="pt-2 border-t border-[#DFE1E6] dark:border-[#263042] space-y-1">
                          <span className="text-[10px] font-bold uppercase text-[#6B778C] dark:text-neutral-400">
                            Deployed Staff:
                          </span>
                          <div className="space-y-1">
                            {siteWorkers.map((w) => (
                              <div
                                key={w._id}
                                className="flex items-center justify-between text-[11px] p-1.5 rounded bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042]"
                              >
                                <span className="font-semibold text-[#172B4D] dark:text-white">
                                  {w.workerName} ({w.designation})
                                </span>
                                <span className="text-[10px] text-[#6B778C] dark:text-neutral-400">
                                  via {w.vendorName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Contracts Tab */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B778C] dark:text-neutral-400 flex items-center gap-1.5">
                <FileCheck2 size={14} className="text-[#0052CC]" />
                <span>Active Client Agreements ({client.contracts?.length || 0})</span>
              </h3>

              {client.contracts?.length > 0 ? (
                <div className="space-y-2">
                  {client.contracts.map((c) => (
                    <div
                      key={c._id}
                      className="p-3 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#0052CC] dark:text-[#579DFF]">
                          {c.contractNumber}
                        </span>
                        <StatusLozenge status={c.status} size="xs" />
                      </div>
                      <p className="text-xs font-semibold text-[#172B4D] dark:text-white">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-[#6B778C] dark:text-neutral-400">
                        Staffing Partner: {c.vendorName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B778C] dark:text-neutral-400 italic">
                  No contracts active for this client.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ClientSitesDrawer;
