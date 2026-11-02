import React, { useState } from "react";
import {
  X,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  Banknote,
  Info,
} from "lucide-react";
import { executeLeaveRollover } from "../services/leave";
import toast from "react-hot-toast";

export default function LeaveYearEndModal({ isOpen, onClose, onRolloverSuccess }) {
  const currentYear = new Date().getFullYear();
  const [targetYear, setTargetYear] = useState(currentYear + 1);
  const [maxElCarryForward, setMaxElCarryForward] = useState(30);
  const [encashOverLimit, setEncashOverLimit] = useState(true);
  const [compOffPolicy, setCompOffPolicy] = useState("preserve");
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    try {
      setLoading(true);
      const res = await executeLeaveRollover({
        targetYear: Number(targetYear),
        dryRun: true,
        encashOverLimit,
        maxCarryForwardOverride: Number(maxElCarryForward),
        compOffPolicy,
        executedBy: "HR Admin",
      });

      if (res?.success) {
        setSimulationResult(res);
        toast.success(res.message || "Simulation generated successfully");
      } else {
        toast.error(res?.error || "Failed to run simulation");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Simulation error");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteLive = async () => {
    if (!window.confirm(`Are you sure you want to execute Annual Leave Rollover into FY ${targetYear}? This will update leave balances for all active employees.`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await executeLeaveRollover({
        targetYear: Number(targetYear),
        dryRun: false,
        encashOverLimit,
        maxCarryForwardOverride: Number(maxElCarryForward),
        compOffPolicy,
        executedBy: "HR Admin",
      });

      if (res?.success) {
        setExecutionResult(res);
        toast.success(res.message || "Year-end rollover successfully completed!");
        if (onRolloverSuccess) onRolloverSuccess();
      } else {
        toast.error(res?.error || "Execution failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Execution error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#172B4D] dark:text-[#F1F5F9]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between bg-[#FAFBFC] dark:bg-[#151B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#DEEBFF] dark:bg-[#0052CC]/20 text-[#0052CC] dark:text-[#579DFF]">
              <RotateCcw size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Leave Year-End Processing & Encashment Engine
              </h2>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8]">
                Batch simulate and execute carry-forward, encashment, and lapsing into FY {targetYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B778C] hover:text-[#172B4D] dark:hover:text-white p-1.5 rounded transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Policy Information Lozenge */}
          <div className="p-3 bg-[#DEEBFF]/40 dark:bg-[#0052CC]/10 border border-[#B3D4FF] dark:border-[#0052CC]/30 rounded flex items-start gap-3">
            <Info size={16} className="text-[#0052CC] dark:text-[#579DFF] shrink-0 mt-0.5" />
            <div className="text-xs text-[#0747A6] dark:text-[#579DFF] space-y-0.5">
              <p className="font-semibold">Statutory Leave Rollover Rules (Factories Act / Shops & Establishment)</p>
              <p className="text-[#172B4D] dark:text-[#94A3B8]">
                Casual Leaves (CL) strictly lapse at year-end. Sick Leaves (SL) carry forward up to 10 days. Earned Leaves (EL) carry forward up to statutory ceiling (typically 30 days) or qualify for encashment.
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1">Target Financial Year</label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
              >
                {[currentYear, currentYear + 1, currentYear + 2].map((y) => (
                  <option key={y} value={y}>
                    FY {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Earned Leave Max Carry-Forward</label>
              <input
                type="number"
                min="0"
                max="60"
                value={maxElCarryForward}
                onChange={(e) => setMaxElCarryForward(Number(e.target.value))}
                className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Comp-Off Rollover Policy</label>
              <select
                value={compOffPolicy}
                onChange={(e) => setCompOffPolicy(e.target.value)}
                className="w-full border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#151B26] rounded p-2 text-xs outline-none focus:border-[#0052CC]"
              >
                <option value="preserve">Preserve Active Unexpired Grants</option>
                <option value="lapse">Lapse All Comp-Offs at Year-End</option>
              </select>
            </div>
          </div>

          {/* Encashment Checkbox */}
          <div className="flex items-center gap-2 p-3 border border-[#DFE1E6] dark:border-[#263042] rounded-lg bg-[#FAFBFC] dark:bg-[#151B26]">
            <input
              type="checkbox"
              id="encashCheck"
              checked={encashOverLimit}
              onChange={(e) => setEncashOverLimit(e.target.checked)}
              className="rounded text-[#0052CC] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="encashCheck" className="text-xs cursor-pointer select-none">
              <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">Auto-Encash Surplus Earned Leaves</span>
              <span className="text-[#6B778C] dark:text-[#94A3B8] block text-[11px]">
                Encashes any unutilized EL beyond the {maxElCarryForward}-day ceiling into taxable encashment allowance. If unchecked, surplus leaves lapse.
              </span>
            </label>
          </div>

          {/* Action Buttons to Run Simulation or Execute */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#6B778C] dark:text-[#94A3B8]">
              {simulationResult ? "Simulation ready. Review impact below." : "Run a simulation to audit impact before executing."}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={loading}
                className="px-3.5 py-1.5 border border-[#0052CC] text-[#0052CC] dark:text-[#579DFF] hover:bg-[#DEEBFF]/30 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
              >
                {loading && !executionResult ? <Loader2 size={13} className="animate-spin" /> : <Layers size={13} />}
                Run Dry-Run Simulation
              </button>
              <button
                type="button"
                onClick={handleExecuteLive}
                disabled={loading}
                className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
              >
                {loading && executionResult ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                Execute Rollover for FY {targetYear}
              </button>
            </div>
          </div>

          {/* Simulation / Execution Results Summary */}
          {simulationResult && (
            <div className="space-y-3 pt-2 border-t border-[#DFE1E6] dark:border-[#263042]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold flex items-center gap-1.5 text-[#0052CC] dark:text-[#579DFF]">
                  <CheckCircle2 size={14} />
                  Simulation Summary (FY {simulationResult.targetYear})
                </h4>
                <span className="text-[10px] uppercase font-bold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded border border-[#ABF5D1]">
                  Dry-Run Validated
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 border border-[#DFE1E6] dark:border-[#263042] rounded bg-[#FAFBFC] dark:bg-[#151B26]">
                  <span className="text-[10px] text-[#6B778C] block">Eligible Staff</span>
                  <span className="font-bold">{simulationResult.summary.totalEmployees}</span>
                </div>
                <div className="p-2.5 border border-[#DFE1E6] dark:border-[#263042] rounded bg-[#FAFBFC] dark:bg-[#151B26]">
                  <span className="text-[10px] text-[#6B778C] block">Total EL Carried Over</span>
                  <span className="font-bold text-[#00875A]">{simulationResult.summary.totalCarriedOverEL} Days</span>
                </div>
                <div className="p-2.5 border border-[#DFE1E6] dark:border-[#263042] rounded bg-[#FAFBFC] dark:bg-[#151B26]">
                  <span className="text-[10px] text-[#6B778C] block">Total EL Encashed</span>
                  <span className="font-bold text-[#0052CC] dark:text-[#579DFF]">{simulationResult.summary.totalEncashedEL} Days</span>
                </div>
                <div className="p-2.5 border border-[#DFE1E6] dark:border-[#263042] rounded bg-[#FAFBFC] dark:bg-[#151B26]">
                  <span className="text-[10px] text-[#6B778C] block">Estimated Encashment</span>
                  <span className="font-bold text-[#00875A]">₹{(simulationResult.summary.totalEncashmentPayout || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Detailed Table */}
              <div className="border border-[#DFE1E6] dark:border-[#263042] rounded overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAFBFC] dark:bg-[#151B26] border-b border-[#DFE1E6] dark:border-[#263042] text-[#6B778C]">
                    <tr>
                      <th className="p-2">Employee</th>
                      <th className="p-2">Dept</th>
                      <th className="p-2">EL Remaining</th>
                      <th className="p-2">Carry-Forward</th>
                      <th className="p-2">Encashment</th>
                      <th className="p-2">New FY Allocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6] dark:divide-[#263042]">
                    {(simulationResult.details || []).map((d, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFBFC] dark:hover:bg-[#151B26]">
                        <td className="p-2 font-semibold">
                          {d.employeeName}
                          <span className="block text-[10px] text-[#6B778C] font-mono">{d.employeeId}</span>
                        </td>
                        <td className="p-2 text-[#6B778C]">{d.department}</td>
                        <td className="p-2 font-semibold">{d.elRemaining}</td>
                        <td className="p-2 text-[#00875A] font-semibold">+{d.carriedOverEl}</td>
                        <td className="p-2 font-semibold text-[#0052CC] dark:text-[#579DFF]">
                          {d.encashedEl > 0 ? `${d.encashedEl} days (₹${(d.encashmentAmount || 0).toLocaleString("en-IN")})` : "-"}
                        </td>
                        <td className="p-2 font-bold">{d.newElAllocated} EL</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Success Banner if Executed */}
          {executionResult && (
            <div className="p-3 bg-[#E3FCEF] dark:bg-[#00875A]/20 border border-[#ABF5D1] dark:border-[#00875A]/40 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-[#00875A]" />
                <span className="text-xs font-bold text-[#006644] dark:text-[#ABF5D1]">
                  {executionResult.message}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 bg-[#00875A] text-white text-xs font-bold rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
