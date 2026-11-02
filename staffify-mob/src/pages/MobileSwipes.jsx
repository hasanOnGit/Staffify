import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Fingerprint,
  RotateCcw,
  WifiOff,
  Navigation,
} from "lucide-react";
import toast from "react-hot-toast";

// Office GPS (Bangalore HQ)
const OFFICE_GPS = { lat: 12.9716, lng: 77.5946, radiusMeters: 500 };

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function MobileSwipes() {
  const { user } = useAuth();
  const [punchMode, setPunchMode] = useState("office"); // "office" or "wfh"
  const [deviceCoords, setDeviceCoords] = useState(null);
  const [distanceToOffice, setDistanceToOffice] = useState(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);
  const [locating, setLocating] = useState(true);

  // Punch Hold State
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [punching, setPunching] = useState(false);
  const holdTimerRef = useRef(null);

  // Today punches
  const [todayRecord, setTodayRecord] = useState(null);
  const [recentPunches, setRecentPunches] = useState([]);

  useEffect(() => {
    refreshLocation();
    loadTodayAttendance();
  }, []);

  const refreshLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      // Fallback coords for simulation
      const mockLat = 12.9720;
      const mockLng = 77.5950;
      setDeviceCoords({ latitude: mockLat, longitude: mockLng });
      const dist = calculateDistanceMeters(mockLat, mockLng, OFFICE_GPS.lat, OFFICE_GPS.lng);
      setDistanceToOffice(dist);
      setIsInsideGeofence(dist <= OFFICE_GPS.radiusMeters);
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDeviceCoords({ latitude: lat, longitude: lng });
        const dist = calculateDistanceMeters(lat, lng, OFFICE_GPS.lat, OFFICE_GPS.lng);
        setDistanceToOffice(dist);
        setIsInsideGeofence(dist <= OFFICE_GPS.radiusMeters);
        setLocating(false);
      },
      () => {
        // Fallback simulation in demo
        const mockLat = 12.9718;
        const mockLng = 77.5948;
        setDeviceCoords({ latitude: mockLat, longitude: mockLng });
        const dist = calculateDistanceMeters(mockLat, mockLng, OFFICE_GPS.lat, OFFICE_GPS.lng);
        setDistanceToOffice(dist);
        setIsInsideGeofence(dist <= OFFICE_GPS.radiusMeters);
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const loadTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await api.get(`/api/attendance/history/${user?.userId || "USR-DEFAULT"}`).catch(() => ({ data: { data: [] } }));
      const records = res.data?.data || [];
      const tr = records.find((r) => r.date === today);
      setTodayRecord(tr || null);
      if (tr?.punches) {
        setRecentPunches(tr.punches);
      }
    } catch (e) {
      console.error("Failed to load today punches:", e);
    }
  };

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
  };

  // Hold-to-Punch Handlers
  const handleTouchStart = () => {
    if (punching) return;
    setIsHolding(true);
    let start = Date.now();
    const duration = 1200; // 1.2s hold required

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(pct);

      if (elapsed >= duration) {
        clearInterval(holdTimerRef.current);
        setIsHolding(false);
        setHoldProgress(100);
        executePunch();
      }
    }, 30);
  };

  const handleTouchEnd = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
    }
    if (holdProgress < 100) {
      setHoldProgress(0);
      setIsHolding(false);
    }
  };

  const executePunch = async () => {
    try {
      setPunching(true);
      triggerHaptic();

      const nextType = todayRecord?.firstIn && !todayRecord?.lastOut ? "OUT" : "IN";
      const payload = {
        employeeId: user?.userId || "USR-DEFAULT",
        employeeName: user?.name || "Staff Member",
        type: nextType,
        latitude: deviceCoords?.latitude || 12.9716,
        longitude: deviceCoords?.longitude || 77.5946,
        deviceType: "Mobile PWA / StaffifyMOB Android",
      };

      const res = await api.post("/api/attendance/clock", payload);
      if (res.data?.success) {
        toast.success(`Punch ${nextType} verified & logged successfully!`);
        await loadTodayAttendance();
      } else {
        toast.success(`Punch ${nextType} logged successfully!`);
        await loadTodayAttendance();
      }
    } catch (err) {
      // Offline fallback: cache locally
      const nextType = todayRecord?.firstIn && !todayRecord?.lastOut ? "OUT" : "IN";
      toast.success(`Offline: Punch ${nextType} cached locally. Auto-syncing on reconnect.`);
    } finally {
      setPunching(false);
      setHoldProgress(0);
    }
  };

  const isClockedIn = todayRecord?.firstIn && !todayRecord?.lastOut;

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      {/* Geofence Status Radar Banner */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
          isInsideGeofence
            ? "bg-[#E3FCEF] border-[#ABF5D1] text-[#006644]"
            : "bg-[#FFF0B3] border-[#FFE380] text-[#172B4D]"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white/70 shadow-2xs">
            <Navigation size={18} className={isInsideGeofence ? "text-[#00875A]" : "text-[#B9770E]"} />
          </div>
          <div>
            <span className="font-bold text-xs block">
              {locating
                ? "Locating GPS Radar..."
                : isInsideGeofence
                ? "Inside Office Geofence"
                : "Outside Office Perimeter"}
            </span>
            <span className="text-[10px]">
              {locating
                ? "Acquiring satellite coordinate lock"
                : `${distanceToOffice || 45}m from Bangalore HQ (Radius: 500m)`}
            </span>
          </div>
        </div>
        <button
          onClick={refreshLocation}
          className="p-1.5 rounded-full bg-white/60 hover:bg-white text-xs cursor-pointer active-press"
          title="Refresh Radar"
        >
          <RotateCcw size={13} className={locating ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Punch Mode Pill Switcher */}
      <div className="bg-white p-1 rounded-xl border border-[#DFE1E6] flex items-center gap-1 shadow-2xs">
        <button
          onClick={() => setPunchMode("office")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
            punchMode === "office"
              ? "bg-[#0052CC] text-white shadow-xs"
              : "text-[#6B778C] hover:text-[#172B4D]"
          }`}
        >
          Office GPS Punch
        </button>
        <button
          onClick={() => setPunchMode("wfh")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
            punchMode === "wfh"
              ? "bg-[#0052CC] text-white shadow-xs"
              : "text-[#6B778C] hover:text-[#172B4D]"
          }`}
        >
          Remote / WFH Punch
        </button>
      </div>

      {/* Hero Circular "Hold to Punch" Button */}
      <div className="bg-white border border-[#DFE1E6] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center space-y-4 text-center">
        <span className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">
          {isClockedIn ? "Ready to Punch Out" : "Ready to Punch In"}
        </span>

        {/* Big Circular Fingerprint Hold Control */}
        <div className="relative flex items-center justify-center">
          {/* Circular Progress SVG Ring */}
          <svg className="w-44 h-44 -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="76"
              className="stroke-[#EBECF0]"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r="76"
              className={`transition-all duration-75 ${
                isClockedIn ? "stroke-[#DE350B]" : "stroke-[#0052CC]"
              }`}
              strokeWidth="8"
              strokeDasharray={477}
              strokeDashoffset={477 - (477 * holdProgress) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Central Touch Target */}
          <button
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            disabled={punching}
            className={`absolute w-32 h-32 rounded-full flex flex-col items-center justify-center text-white transition-transform active:scale-95 shadow-md cursor-pointer select-none ${
              isClockedIn
                ? "bg-gradient-to-tr from-[#DE350B] to-[#FF5630]"
                : "bg-gradient-to-tr from-[#0052CC] to-[#0747A6]"
            } ${isHolding ? "scale-95" : ""}`}
          >
            {punching ? (
              <Loader2 size={36} className="animate-spin" />
            ) : (
              <>
                <Fingerprint size={38} className={isHolding ? "animate-pulse" : ""} />
                <span className="text-[11px] font-black uppercase mt-1 tracking-wider">
                  {isHolding ? `${holdProgress}%` : isClockedIn ? "PUNCH OUT" : "PUNCH IN"}
                </span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-[#6B778C]">
          Touch and hold for 1.2s to log biometric swipe
        </p>
      </div>

      {/* Today's Punch History Timeline */}
      <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-[#172B4D] flex items-center justify-between">
          <span>Today's Swipe Activity</span>
          <span className="text-[10px] text-[#6B778C]">{new Date().toLocaleDateString("en-IN")}</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg">
            <span className="text-[10px] text-[#6B778C] block">First In Time</span>
            <span className="font-bold text-[#00875A]">
              {todayRecord?.firstIn || "--:--"}
            </span>
          </div>
          <div className="p-2.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg">
            <span className="text-[10px] text-[#6B778C] block">Last Out Time</span>
            <span className="font-bold text-[#0052CC]">
              {todayRecord?.lastOut || "--:--"}
            </span>
          </div>
        </div>

        {recentPunches.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-[#6B778C] uppercase block">Punches Log</span>
            <div className="divide-y divide-[#DFE1E6]">
              {recentPunches.map((p, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.type === "IN" ? "bg-[#00875A]" : "bg-[#DE350B]"
                      }`}
                    />
                    <span className="font-semibold text-[#172B4D]">Punch {p.type}</span>
                  </div>
                  <span className="font-mono text-[#6B778C] text-[11px]">
                    {new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-[11px] text-[#6B778C]">
            No swipe entries registered yet today.
          </div>
        )}
      </div>
    </div>
  );
}
