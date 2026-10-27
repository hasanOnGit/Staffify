import { useState, useEffect } from "react";
import {
  X,
  Cpu,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Fingerprint,
  ScanFace,
  CreditCard,
  Play,
  Activity,
  Layers,
} from "lucide-react";
import {
  getBiometricMachines,
  registerBiometricMachine,
  simulateBiometricPunch,
  syncBiometricLogs,
} from "../services/biometric";
import toast from "react-hot-toast";

function BiometricManagerModal({ isOpen, onClose, employees = [], onSynced }) {
  const [machines, setMachines] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // New Machine Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMachine, setNewMachine] = useState({
    machineName: "",
    brand: "eSSL",
    modelNumber: "SilkBio-101",
    serialNumber: "",
    ipAddress: "192.168.1.210",
    port: 4370,
    location: "Corporate Office",
  });

  // Simulator
  const [simEmployeeId, setSimEmployeeId] = useState(employees[0]?.employeeId || "EMP-DEV-03");
  const [simMode, setSimMode] = useState("Fingerprint");

  const loadMachines = async () => {
    try {
      setLoading(true);
      const res = await getBiometricMachines();
      if (res?.data) {
        setMachines(res.data.machines || []);
        setRecentLogs(res.data.recentLogs || []);
      }
    } catch (err) {
      console.error("Failed to load biometric machines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMachines();
    }
  }, [isOpen]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerBiometricMachine(newMachine);
      toast.success("Biometric hardware terminal registered successfully");
      setShowAddForm(false);
      await loadMachines();
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  const handleSimulatePunch = async () => {
    try {
      setSimulating(true);
      const res = await simulateBiometricPunch({
        machineId: machines[0]?.machineId || "BIO-DEV-01",
        employeeId: simEmployeeId,
        verificationMode: simMode,
      });
      toast.success(res.message || "Biometric punch simulated");
      await loadMachines();
    } catch (err) {
      toast.error(err.response?.data?.error || "Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const handleSyncLogs = async () => {
    try {
      setSyncing(true);
      const res = await syncBiometricLogs();
      toast.success(res.message || "Attendance records synchronized");
      await loadMachines();
      if (onSynced) onSynced();
    } catch (err) {
      toast.error(err.response?.data?.error || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150 my-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#DFE1E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFBFC] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center shrink-0">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#172B4D] flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>Biometric Hardware Terminals & ADMS Push Sync</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                  <Activity size={10} />
                  Bridge Active
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-[#6B778C]">
                eSSL, ZKTeco, & Matrix Biometric IP Terminals • Real-time Attendance Ingestion
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <button
              disabled={syncing}
              onClick={handleSyncLogs}
              className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
              <span>{syncing ? "Syncing..." : "Sync Hardware Logs"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#6B778C] hover:bg-[#EBECF0] hover:text-[#172B4D] transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-[#172B4D]">
          {/* Registered Terminals Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase text-[#172B4D] tracking-wider">
                Configured Biometric Devices ({machines.length})
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-2.5 py-1 bg-[#F4F5F7] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <Plus size={12} />
                <span>{showAddForm ? "Cancel" : "Add Hardware Device"}</span>
              </button>
            </div>

            {/* Add Device Form */}
            {showAddForm && (
              <form onSubmit={handleRegister} className="p-4 bg-[#FAFBFC] border border-[#DFE1E6] rounded-md mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Terminal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. North Gate Turnstile"
                      value={newMachine.machineName}
                      onChange={(e) => setNewMachine({ ...newMachine, machineName: e.target.value })}
                      className="w-full border border-[#DFE1E6] rounded p-1.5 text-xs outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Manufacturer Brand</label>
                    <select
                      value={newMachine.brand}
                      onChange={(e) => setNewMachine({ ...newMachine, brand: e.target.value })}
                      className="w-full border border-[#DFE1E6] rounded p-1.5 text-xs outline-none focus:border-[#0052CC]"
                    >
                      <option value="eSSL">eSSL (SilkBio / Identix)</option>
                      <option value="ZKTeco">ZKTeco (MB20 / SpeedFace)</option>
                      <option value="Matrix">Matrix COSEC</option>
                      <option value="Realtime">Realtime Bio</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Serial Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SN-ZK-9912"
                      value={newMachine.serialNumber}
                      onChange={(e) => setNewMachine({ ...newMachine, serialNumber: e.target.value })}
                      className="w-full border border-[#DFE1E6] rounded p-1.5 text-xs outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Device IP Address</label>
                    <input
                      type="text"
                      required
                      placeholder="192.168.1.X"
                      value={newMachine.ipAddress}
                      onChange={(e) => setNewMachine({ ...newMachine, ipAddress: e.target.value })}
                      className="w-full border border-[#DFE1E6] rounded p-1.5 text-xs outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Port</label>
                    <input
                      type="number"
                      value={newMachine.port}
                      onChange={(e) => setNewMachine({ ...newMachine, port: Number(e.target.value) })}
                      className="w-full border border-[#DFE1E6] rounded p-1.5 text-xs outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Physical Location</label>
                    <input
                      type="text"
                      value={newMachine.location}
                      onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                      className="w-full border border-[#DFE1E6] rounded p-1.5 text-xs outline-none focus:border-[#0052CC]"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Save Device
                  </button>
                </div>
              </form>
            )}

            {/* Device Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {machines.map((m) => (
                <div
                  key={m._id || m.machineId}
                  className="p-4 bg-white border border-[#DFE1E6] rounded-md shadow-2xs hover:border-[#0052CC] transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#172B4D]">{m.machineName}</h4>
                      <p className="text-[10px] text-[#6B778C]">
                        {m.brand} • {m.modelNumber} • SN: {m.serialNumber}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                      <Wifi size={10} />
                      {m.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#F4F5F7]">
                    <div>
                      <span className="text-[#6B778C] block text-[10px]">IP Endpoint:</span>
                      <code className="text-[#0052CC] font-mono text-[10px]">{m.ipAddress}:{m.port}</code>
                    </div>
                    <div>
                      <span className="text-[#6B778C] block text-[10px]">Total Logged:</span>
                      <span className="font-semibold text-[#172B4D]">{m.totalPunchesRecorded} Punches</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#6B778C] block text-[10px]">Location:</span>
                      <span className="text-[#172B4D]">{m.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biometric Punch Hardware Simulator */}
          <div className="p-4 bg-[#F4F5F7] border border-[#DFE1E6] rounded-md space-y-3">
            <div className="flex items-center gap-2">
              <Play size={14} className="text-[#0052CC]" />
              <h3 className="font-bold text-xs text-[#172B4D]">Hardware Punch Test Simulator</h3>
            </div>
            <p className="text-[11px] text-[#6B778C]">
              Simulate an employee swiping on the physical biometric terminal (Fingerprint, Face Scan, or Card) to test instant punch capture.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="font-semibold block mb-1">Employee</label>
                <select
                  value={simEmployeeId}
                  onChange={(e) => setSimEmployeeId(e.target.value)}
                  className="w-full bg-white border border-[#DFE1E6] rounded p-1.5 text-xs outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Verification Mode</label>
                <select
                  value={simMode}
                  onChange={(e) => setSimMode(e.target.value)}
                  className="w-full bg-white border border-[#DFE1E6] rounded p-1.5 text-xs outline-none"
                >
                  <option value="Fingerprint">Fingerprint Sensor</option>
                  <option value="Facial Recognition">Facial Recognition Camera</option>
                  <option value="RFID Card">RFID Smart Card</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  disabled={simulating}
                  onClick={handleSimulatePunch}
                  className="w-full px-3 py-1.5 bg-[#00875A] hover:bg-[#006644] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Fingerprint size={13} />
                  <span>{simulating ? "Processing..." : "Simulate Punch"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Hardware Logs Table */}
          <div>
            <h3 className="font-bold text-xs uppercase text-[#172B4D] tracking-wider mb-2">
              Recent Device Push Logs
            </h3>
            {recentLogs.length === 0 ? (
              <div className="p-4 bg-white border border-dashed border-[#DFE1E6] rounded text-center text-[#6B778C]">
                No punch logs received yet. Click "Simulate Punch" above to trigger a test log.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#DFE1E6] rounded">
                <table className="min-w-full text-xs divide-y divide-[#DFE1E6]">
                  <thead className="bg-[#F4F5F7] text-[#6B778C] font-semibold text-[10px]">
                    <tr>
                      <th className="px-3 py-2 text-left">Log ID</th>
                      <th className="px-3 py-2 text-left">Employee</th>
                      <th className="px-3 py-2 text-left">Verification</th>
                      <th className="px-3 py-2 text-left">Timestamp</th>
                      <th className="px-3 py-2 text-center">Sync Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE1E6] bg-white">
                    {recentLogs.map((log) => (
                      <tr key={log._id || log.logId}>
                        <td className="px-3 py-2 font-mono text-[10px] text-[#6B778C]">{log.logId}</td>
                        <td className="px-3 py-2 font-semibold text-[#172B4D]">
                          {log.employeeName} ({log.employeeId})
                        </td>
                        <td className="px-3 py-2">{log.verificationMode}</td>
                        <td className="px-3 py-2 text-[#6B778C]">
                          {new Date(log.punchTime).toLocaleTimeString("en-IN")}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.syncStatus === "Synced"
                                ? "bg-[#E3FCEF] text-[#006644]"
                                : "bg-[#FFF0B3] text-[#172B4D]"
                            }`}
                          >
                            {log.syncStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#6B778C] flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#00875A]" />
            <span>Standard eSSL/ZKTeco HTTP ADMS Push Port 4370 protocol listener</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-[#DFE1E6] hover:bg-[#EBECF0] rounded text-xs font-semibold text-[#172B4D] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BiometricManagerModal;
