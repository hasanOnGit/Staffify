import { useState, useEffect } from "react";
import {
  MapPin,
  Crosshair,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Navigation,
  Check,
  Layers,
} from "lucide-react";
import {
  getGeofenceZones,
  createGeofenceZone,
  deleteGeofenceZone,
} from "../services/geofence";

function GeofenceModal({ isOpen, onClose }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(12.9352);
  const [longitude, setLongitude] = useState(77.6946);
  const [radiusMeters, setRadiusMeters] = useState(300);
  const [targetScope, setTargetScope] = useState("All Employees");
  const [targetDepartment, setTargetDepartment] = useState("All");
  const [isStrict, setIsStrict] = useState(true);
  const [capturingGps, setCapturingGps] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadZones = async () => {
    setLoading(true);
    try {
      const res = await getGeofenceZones();
      if (res.success) setZones(res.data || []);
    } catch (err) {
      console.error("Failed to load geofence zones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadZones();
      setShowAddForm(false);
      setMsg(null);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Capture Admin's current GPS
  const handleCaptureCurrentGps = () => {
    if (!navigator.geolocation) {
      setMsg({ type: "error", text: "Geolocation is not supported by your browser." });
      return;
    }
    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setCapturingGps(false);
        setMsg({ type: "success", text: "Captured live GPS coordinates from your device." });
      },
      (err) => {
        setCapturingGps(false);
        setMsg({ type: "error", text: `GPS error: ${err.message}. Please enable location permissions.` });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createGeofenceZone({
        name: name.trim(),
        address: address.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        radiusMeters: Number(radiusMeters),
        targetScope,
        targetDepartment: targetScope === "Department" ? targetDepartment : "All",
        isStrict,
      });
      setMsg({ type: "success", text: "Office geofence created successfully." });
      setShowAddForm(false);
      setName("");
      setAddress("");
      await loadZones();
    } catch (err) {
      console.error("Error creating geofence:", err);
      setMsg({ type: "error", text: "Failed to create geofence zone." });
    }
  };

  const handleDelete = async (zoneId) => {
    if (!window.confirm("Are you sure you want to remove this geofence perimeter?")) return;
    try {
      await deleteGeofenceZone(zoneId);
      setMsg({ type: "success", text: "Geofence perimeter removed." });
      await loadZones();
    } catch (err) {
      console.error("Failed to delete zone:", err);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center">
              <MapPin size={14} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm">
                Office Geofencing & Location Policies
              </h3>
              <p className="text-[11px] text-[#6B778C]">
                Configure authorized workplace coordinates and swipe distance boundaries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {msg && (
            <div
              className={`p-2.5 rounded border text-xs font-medium flex items-center justify-between ${
                msg.type === "success"
                  ? "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]"
                  : "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]"
              }`}
            >
              <span>{msg.text}</span>
              <button onClick={() => setMsg(null)} className="p-0.5 cursor-pointer">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#172B4D] uppercase tracking-wider text-[10px]">
              Active Office Geofences ({zones.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              {showAddForm ? "Cancel" : "Add Geofence Zone"}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateSubmit}
              className="p-4 bg-[#FAFBFC] border border-[#0052CC] rounded-md space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#172B4D] text-xs">Define New Office Perimeter</h4>
                <button
                  type="button"
                  onClick={handleCaptureCurrentGps}
                  disabled={capturingGps}
                  className="px-2.5 py-1 bg-white border border-[#DFE1E6] hover:bg-[#EBECF0] text-[#0052CC] font-semibold rounded text-[11px] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Crosshair size={12} />
                  {capturingGps ? "Capturing GPS..." : "Use Current Location"}
                </button>
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Office / Campus Name <span className="text-[#DE350B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore Headquarters - Tech Park"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Cessna Business Park, Kadubeesanahalli, Outer Ring Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Allowed Radius</label>
                  <select
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-semibold"
                  >
                    <option value={100}>100 meters (Single Floor)</option>
                    <option value={200}>200 meters (Small Campus)</option>
                    <option value={300}>300 meters (Standard)</option>
                    <option value={500}>500 meters (Large Tech Park)</option>
                    <option value={1000}>1,000 meters (1 km)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-[#172B4D] block mb-1">Applicable Scope</label>
                  <select
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
                  >
                    <option value="All Employees">All Employees (Entire Organization)</option>
                    <option value="Department">Specific Department</option>
                  </select>
                </div>

                {targetScope === "Department" && (
                  <div>
                    <label className="font-semibold text-[#172B4D] block mb-1">Select Department</label>
                    <select
                      value={targetDepartment}
                      onChange={(e) => setTargetDepartment(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Operations">Operations</option>
                      <option value="Product">Product</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-white border border-[#DFE1E6] rounded flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#172B4D] block">
                    Strict Geofence Enforcement
                  </span>
                  <span className="text-[11px] text-[#6B778C]">
                    When enabled, the Web Swipe button is strictly locked if outside the radius
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isStrict}
                  onChange={(e) => setIsStrict(e.target.checked)}
                  className="rounded border-[#DFE1E6] text-[#0052CC] focus:ring-[#0052CC] h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EBECF0]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E] rounded text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition shadow-sm cursor-pointer"
                >
                  Save Geofence
                </button>
              </div>
            </form>
          )}

          {/* Zones List */}
          <div className="space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.zoneId}
                className="p-3.5 bg-white border border-[#DFE1E6] rounded-md shadow-2xs space-y-2 hover:border-[#0052CC] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172B4D] text-xs">{zone.name}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#DEEBFF] text-[#0747A6]">
                      {zone.zoneId}
                    </span>
                    {zone.isStrict ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD]">
                        Strict Lock
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                        Log Only
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(zone.zoneId)}
                    className="p-1 rounded text-[#6B778C] hover:text-[#DE350B] hover:bg-[#FFEBE6] transition cursor-pointer"
                    title="Remove Geofence"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {zone.address && <p className="text-[11px] text-[#5E6C84]">{zone.address}</p>}

                <div className="pt-2 border-t border-[#EBECF0] flex items-center justify-between text-[11px] text-[#6B778C] flex-wrap gap-2">
                  <span className="font-mono">
                    Lat: {zone.latitude.toFixed(4)}, Lon: {zone.longitude.toFixed(4)}
                  </span>
                  <span>
                    Radius: <strong>{zone.radiusMeters}m</strong>
                  </span>
                  <span>
                    Scope: <strong>{zone.targetScope}</strong>{" "}
                    {zone.targetScope === "Department" ? `(${zone.targetDepartment})` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeofenceModal;
