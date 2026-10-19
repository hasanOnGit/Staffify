import { useState, useEffect } from "react";
import {
  X,
  Sliders,
  CalendarCheck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  Play,
} from "lucide-react";
import { getLeavePolicy, updateLeavePolicy, executeLeaveRollover } from "../services/leave";
import toast from "react-hot-toast";

function LeavePolicyModal({ isOpen, onClose, onPolicyUpdated }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rollingOver, setRollingOver] = useState(false);

  // Form states
  const [sandwichEnabled, setSandwichEnabled] = useState(true);
  const [includeWeekends, setIncludeWeekends] = useState(true);
  const [includeHolidays, setIncludeHolidays] = useState(true);
  const [maxElCarryForward, setMaxElCarryForward] = useState(30);
  const [maxSlCarryForward, setMaxSlCarryForward] = useState(10);
  const [clLapses, setClLapses] = useState(true);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const res = await getLeavePolicy();
      if (res?.data) {
        const p = res.data;
        setPolicy(p);
        setSandwichEnabled(p.sandwichPolicyEnabled !== false);
        setIncludeWeekends(p.includeWeekends !== false);
        setIncludeHolidays(p.includeStatutoryHolidays !== false);
        if (p.annualRolloverRules?.earnedLeave?.maxCarryForward !== undefined) {
          setMaxElCarryForward(p.annualRolloverRules.earnedLeave.maxCarryForward);
        }
        if (p.annualRolloverRules?.sickLeave?.maxCarryForward !== undefined) {
          setMaxSlCarryForward(p.annualRolloverRules.sickLeave.maxCarryForward);
        }
        if (p.annualRolloverRules?.casualLeave?.lapsesAtYearEnd !== undefined) {
          setClLapses(p.annualRolloverRules.casualLeave.lapsesAtYearEnd);
        }
      }
    } catch (err) {
      console.error("Failed to load leave policy:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPolicy();
    }
  }, [isOpen]);

  const handleSavePolicy = async () => {
    try {
      setSaving(true);
      const payload = {
        sandwichPolicyEnabled: sandwichEnabled,
        includeWeekends,
        includeStatutoryHolidays: includeHolidays,
        annualRolloverRules: {
          earnedLeave: { maxCarryForward: Number(maxElCarryForward), encashmentAllowed: true, annualCredit: 15 },
          casualLeave: { lapsesAtYearEnd: clLapses, annualCredit: 12 },
          sickLeave: { maxCarryForward: Number(maxSlCarryForward), annualCredit: 10 },
          halfDayQuota: { annualCredit: 6 },
        },
      };

      await updateLeavePolicy(payload);
      toast.success("Leave policy & rules updated successfully");
      if (onPolicyUpdated) onPolicyUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update policy");
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteRollover = async () => {
    const nextYear = new Date().getFullYear() + 1;
    if (
      !window.confirm(
        `Are you sure you want to run the Annual Leave Rollover into FY ${nextYear}? This will carry over unavailed Earned Leaves (up to ${maxElCarryForward} days), lapse Casual Leaves, and credit fresh yearly quotas.`
      )
    ) {
      return;
    }

    try {
      setRollingOver(true);
      const res = await executeLeaveRollover({ targetYear: nextYear });
      toast.success(res.message || `Annual rollover executed for FY ${nextYear}`);
      await loadPolicy();
      if (onPolicyUpdated) onPolicyUpdated();
    } catch (err) {
      toast.error(err.response?.data?.error || "Rollover failed");
    } finally {
      setRollingOver(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                <span>Leave Policy Rules & Annual Rollover</span>
              </h2>
              <p className="text-xs text-[#6B778C]">
                Configure Sandwich Rule enforcement and annual carry-forward quotas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B778C] hover:bg-[#EBECF0] hover:text-[#172B4D] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#172B4D]">
          {/* SECTION 1: SANDWICH POLICY */}
          <div className="p-4 bg-white border border-[#DFE1E6] rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase text-[#172B4D] tracking-wider">
                  Sandwich Leave Policy Engine
                </h3>
                <p className="text-[11px] text-[#6B778C] mt-0.5">
                  When enabled, non-working days (weekends or public holidays) falling between applied leave days are counted as leaves.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sandwichEnabled}
                  onChange={(e) => setSandwichEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#DFE1E6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0052CC]"></div>
              </label>
            </div>

            {sandwichEnabled && (
              <div className="pt-3 border-t border-[#F4F5F7] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inclWeekends"
                    checked={includeWeekends}
                    onChange={(e) => setIncludeWeekends(e.target.checked)}
                    className="rounded text-[#0052CC]"
                  />
                  <label htmlFor="inclWeekends" className="font-medium">
                    Include intervening Saturdays & Sundays (e.g., Friday + Monday = 4 days leave)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inclHolidays"
                    checked={includeHolidays}
                    onChange={(e) => setIncludeHolidays(e.target.checked)}
                    className="rounded text-[#0052CC]"
                  />
                  <label htmlFor="inclHolidays" className="font-medium">
                    Include intervening National & Statutory Public Holidays
                  </label>
                </div>

                <div className="p-2.5 bg-[#FFF0B3]/50 border border-[#FFE380] rounded text-[11px] text-[#172B4D] flex items-start gap-2 mt-2">
                  <Info size={14} className="text-[#FF991F] shrink-0 mt-0.5" />
                  <span>
                    <strong>Policy in effect:</strong> If an employee applies for leave on Friday and following Monday, the system will calculate 4 total leave days deducted from their balance.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: ANNUAL CARRY-FORWARD LIMITS */}
          <div className="p-4 bg-white border border-[#DFE1E6] rounded-md space-y-3">
            <div>
              <h3 className="font-bold text-xs uppercase text-[#172B4D] tracking-wider">
                Annual Carry-Forward & Rollover Rules
              </h3>
              <p className="text-[11px] text-[#6B778C] mt-0.5">
                Indian statutory norms govern leave lapse and carry-over limits at the end of each calendar/financial year.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="font-semibold block mb-1">Earned Leave (EL) Max Carry-Forward</label>
                <input
                  type="number"
                  value={maxElCarryForward}
                  onChange={(e) => setMaxElCarryForward(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded p-1.5 text-xs outline-none focus:border-[#0052CC]"
                />
                <p className="text-[10px] text-[#6B778C] mt-0.5">Standard Indian statutory limit: 30 days max</p>
              </div>

              <div>
                <label className="font-semibold block mb-1">Sick Leave (SL) Max Carry-Forward</label>
                <input
                  type="number"
                  value={maxSlCarryForward}
                  onChange={(e) => setMaxSlCarryForward(e.target.value)}
                  className="w-full border border-[#DFE1E6] rounded p-1.5 text-xs outline-none focus:border-[#0052CC]"
                />
                <p className="text-[10px] text-[#6B778C] mt-0.5">Company policy limit (typically 10 days)</p>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-2.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded">
                <div>
                  <span className="font-semibold block">Casual Leave (CL) Lapse Policy</span>
                  <span className="text-[10px] text-[#6B778C]">Casual Leave lapses at year end with no carry-over or encashment</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                  Statutory Lapse (Enabled)
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: EXECUTE ANNUAL ROLLOVER */}
          <div className="p-4 bg-[#FAFBFC] border border-[#DFE1E6] rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#172B4D]">Batch Annual Rollover Engine</h3>
                <p className="text-[11px] text-[#6B778C]">
                  Executes the year-end batch rollover across all employee accounts.
                </p>
              </div>
              <button
                disabled={rollingOver}
                onClick={handleExecuteRollover}
                className="px-3.5 py-1.5 bg-[#403294] hover:bg-[#35297A] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw size={13} className={rollingOver ? "animate-spin" : ""} />
                <span>{rollingOver ? "Rolling Over..." : "Execute FY Rollover"}</span>
              </button>
            </div>
            {policy?.lastRolloverExecutedAt && (
              <p className="text-[10px] text-[#6B778C] pt-1 border-t border-[#DFE1E6]">
                Last executed on: {new Date(policy.lastRolloverExecutedAt).toLocaleDateString("en-IN")} by {policy.lastRolloverExecutedBy || "HR Admin"}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#6B778C] flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#00875A]" />
            <span>Industrial Employment (Standing Orders) & Factories Act compliant</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-[#DFE1E6] hover:bg-[#EBECF0] rounded text-xs font-semibold text-[#172B4D] cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={handleSavePolicy}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Save size={13} />
              <span>{saving ? "Saving..." : "Save Policy"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeavePolicyModal;
