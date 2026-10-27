import { useEffect, useState, useCallback, useRef } from "react";
import { LogIn, LogOut, MapPin, AlertCircle, ShieldAlert, Crosshair, RefreshCw, Wifi, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { punchAttendance, getTodayAttendance } from "../services/attendance";
import { verifyEmployeeGeofence } from "../services/geofence";
import { playPunchInSound, playPunchOutSound } from "../utils/soundFx";

// Preset test coordinates for development & testing
const SIMULATED_COORDS = {
  OFFICE: { latitude: 12.9352, longitude: 77.6946, label: "Simulate: In Office (Bangalore HQ)" },
  OUTSIDE: { latitude: 13.0827, longitude: 77.5877, label: "Simulate: Outside (19 km away)" },
};

function ClockWidget() {
  const { user } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  // Geofence states
  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [gpsSimMode, setGpsSimMode] = useState("auto"); // "auto" | "office" | "outside"
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const menuRef = useRef(null);

  // Sync today's attendance state from backend or local storage
  const syncAttendanceStatus = async () => {
    if (!user?.userId) return;

    try {
      const data = await getTodayAttendance(user.userId);
      if (data?.isClockedIn && data?.record?.firstIn) {
        setIsClockedIn(true);
        setClockInTime(data.record.firstIn);
        const elapsed = Math.floor((Date.now() - new Date(data.record.firstIn).getTime()) / 1000);
        setElapsedSeconds(elapsed > 0 ? elapsed : 0);
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
        setElapsedSeconds(0);
      }
    } catch {
      const savedStatus = localStorage.getItem("staffify_is_clocked_in") === "true";
      const savedTime = localStorage.getItem("staffify_clock_in_time");
      if (savedStatus && savedTime) {
        setIsClockedIn(true);
        setClockInTime(savedTime);
        const elapsed = Math.floor((Date.now() - new Date(savedTime).getTime()) / 1000);
        setElapsedSeconds(elapsed > 0 ? elapsed : 0);
      }
    }
  };

  useEffect(() => {
    syncAttendanceStatus();
  }, [user?.userId]);

  // Timer tick while clocked in
  useEffect(() => {
    let interval = null;
    if (isClockedIn && clockInTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(clockInTime).getTime()) / 1000);
        setElapsedSeconds(elapsed > 0 ? elapsed : 0);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockedIn, clockInTime]);

  // Click outside to close location menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowLocationMenu(false);
      }
    };
    if (showLocationMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLocationMenu]);

  // Format HH:MM:SS
  const formatTimer = (totalSecs) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Acquire GPS and verify against backend Geofence
  const refreshLocation = useCallback(async (mode = gpsSimMode) => {
    if (!user?.userId) return;
    setGeoLoading(true);

    let activeCoords = null;

    if (mode === "office") {
      activeCoords = { latitude: SIMULATED_COORDS.OFFICE.latitude, longitude: SIMULATED_COORDS.OFFICE.longitude };
      setCoords(activeCoords);
    } else if (mode === "outside") {
      activeCoords = { latitude: SIMULATED_COORDS.OUTSIDE.latitude, longitude: SIMULATED_COORDS.OUTSIDE.longitude };
      setCoords(activeCoords);
    } else {
      // Auto / Real browser GPS
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
            });
          });
          activeCoords = {
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
          };
          setCoords(activeCoords);
        } catch {
          // Fallback to office coordinates if browser location denied
          activeCoords = { latitude: SIMULATED_COORDS.OFFICE.latitude, longitude: SIMULATED_COORDS.OFFICE.longitude };
          setCoords(activeCoords);
        }
      } else {
        activeCoords = { latitude: SIMULATED_COORDS.OFFICE.latitude, longitude: SIMULATED_COORDS.OFFICE.longitude };
        setCoords(activeCoords);
      }
    }

    try {
      const res = await verifyEmployeeGeofence({
        employeeId: user.userId,
        latitude: activeCoords.latitude,
        longitude: activeCoords.longitude,
      });

      if (res?.success && res?.data) {
        setGeoStatus(res.data);
      }
    } catch (err) {
      console.warn("Geofence verification error:", err);
    } finally {
      setGeoLoading(false);
    }
  }, [user?.userId, gpsSimMode]);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  // Listen to geofence update events
  useEffect(() => {
    const handleGeofenceUpdate = () => {
      refreshLocation();
    };
    window.addEventListener("staffify_geofence_updated", handleGeofenceUpdate);
    return () => window.removeEventListener("staffify_geofence_updated", handleGeofenceUpdate);
  }, [refreshLocation]);

  // Swipe Action
  const handleToggleClock = async () => {
    if (!user?.userId) {
      toast.error("Please sign in to clock in/out.");
      return;
    }

    // Check strict geofence lock
    if (geoStatus?.isStrict && !geoStatus?.isWithinGeofence) {
      const distKm = geoStatus.distanceMeters ? (geoStatus.distanceMeters / 1000).toFixed(1) : "?";
      toast.error(
        `Swipe Locked: You are ${distKm} km away from ${geoStatus.zoneName || "office"}. Swiping is restricted to assigned office perimeter.`,
        { duration: 4500 }
      );
      return;
    }

    setLoading(true);
    const punchType = isClockedIn ? "OUT" : "IN";
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      await punchAttendance({
        employeeId: user.userId,
        employeeName: user.name || "Employee",
        type: punchType,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });

      if (punchType === "IN") {
        setIsClockedIn(true);
        setClockInTime(now.toISOString());
        localStorage.setItem("staffify_is_clocked_in", "true");
        localStorage.setItem("staffify_clock_in_time", now.toISOString());
        playPunchInSound();
        toast.success(`Web Clock-In verified at ${timeStr} (${geoStatus?.zoneName || "Office"})`, {
          duration: 3500,
        });
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
        localStorage.setItem("staffify_is_clocked_in", "false");
        localStorage.removeItem("staffify_clock_in_time");
        playPunchOutSound();
        toast.success(`Clocked Out at ${timeStr}. Session: ${formatTimer(elapsedSeconds)}`, {
          duration: 4000,
        });
      }

      window.dispatchEvent(new Event("staffify_punch_updated"));
    } catch (err) {
      const serverErr = err?.response?.data?.error;
      if (serverErr) {
        toast.error(serverErr, { duration: 5000 });
      } else {
        toast.error("Punch synchronization failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isSwipeLocked = geoStatus?.isStrict && !geoStatus?.isWithinGeofence;

  return (
    <div className="flex items-center gap-2 bg-[#F4F5F7] dark:bg-[#090D14] border border-[#DFE1E6] dark:border-[#263042] rounded px-2.5 py-1 relative">
      {/* Status indicator & live timer */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isClockedIn
              ? "bg-[#00875A] ring-2 ring-[#ABF5D1]"
              : "bg-[#7A869A]"
          }`}
        />
        <div className="text-xs min-w-[72px]">
          <div className="flex items-center justify-between gap-1">
            <p className="font-semibold text-[#172B4D] dark:text-neutral-100 font-mono leading-none">
              {isClockedIn ? formatTimer(elapsedSeconds) : "00:00:00"}
            </p>
            {isClockedIn && (
              <span className="text-[9px] font-bold text-[#0052CC] dark:text-[#38BDF8] font-mono">
                {Math.min(100, Math.round((elapsedSeconds / (8 * 3600)) * 100))}%
              </span>
            )}
          </div>
          {isClockedIn ? (
            <div className="w-full bg-[#DFE1E6] dark:bg-[#263042] h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-[#00875A] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((elapsedSeconds / (8 * 3600)) * 100))}%` }}
              />
            </div>
          ) : (
            <p className="text-[10px] text-[#6B778C] dark:text-neutral-400 leading-none mt-0.5">
              Work Timer
            </p>
          )}
        </div>
      </div>

      <div className="h-5 w-px bg-[#DFE1E6] dark:bg-[#263042] mx-0.5" />

      {/* Geofence Status Pill & Popover Trigger */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowLocationMenu(!showLocationMenu)}
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition cursor-pointer border ${
            geoLoading
              ? "bg-[#EBECF0] text-[#6B778C] border-[#DFE1E6]"
              : isSwipeLocked
              ? "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD] hover:bg-[#FFD2CC]"
              : "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1] hover:bg-[#ABF5D1]/40"
          }`}
          title="Click to check Geofence status & GPS simulation settings"
        >
          {geoLoading ? (
            <RefreshCw size={11} className="animate-spin text-[#6B778C]" />
          ) : isSwipeLocked ? (
            <AlertCircle size={11} className="text-[#DE350B]" />
          ) : (
            <MapPin size={11} className="text-[#00875A]" />
          )}

          <span className="max-w-[110px] truncate">
            {geoLoading
              ? "Locating..."
              : isSwipeLocked
              ? "Outside Radius"
              : geoStatus?.zoneName || "In Office"}
          </span>
        </button>

        {/* Location Dropdown Modal */}
        {showLocationMenu && (
          <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-[#151B26] rounded shadow-lg border border-[#DFE1E6] dark:border-[#263042] p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE1E6] dark:border-[#263042] mb-2">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#0052CC]" />
                <span className="text-xs font-semibold text-[#172B4D] dark:text-neutral-100">GPS Geofence Status</span>
              </div>
              <button
                type="button"
                onClick={() => refreshLocation()}
                className="text-[#6B778C] dark:text-neutral-400 hover:text-[#172B4D] dark:hover:text-white p-1 rounded hover:bg-[#F4F5F7] dark:hover:bg-[#1C2331] cursor-pointer"
                title="Refresh GPS"
              >
                <RefreshCw size={11} className={geoLoading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[#6B778C] dark:text-neutral-400">
                <span>Assigned Zone:</span>
                <span className="font-semibold text-[#172B4D] dark:text-neutral-100 truncate max-w-[130px]">
                  {geoStatus?.zoneName || "Default HQ"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#6B778C] dark:text-neutral-400">
                <span>Distance to Office:</span>
                <span className="font-mono font-medium text-[#172B4D] dark:text-neutral-100">
                  {geoStatus?.distanceMeters !== undefined
                    ? geoStatus.distanceMeters < 1000
                      ? `${geoStatus.distanceMeters} m`
                      : `${(geoStatus.distanceMeters / 1000).toFixed(2)} km`
                    : "--"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#6B778C] dark:text-neutral-400">
                <span>Allowed Radius:</span>
                <span className="font-mono text-[#172B4D] dark:text-neutral-100">
                  {geoStatus?.radiusMeters ? `${geoStatus.radiusMeters} m` : "300 m"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#6B778C] dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <Wifi size={11} className="text-[#0052CC]" />
                  <span>Network IP:</span>
                </span>
                <span className="font-mono text-[10px] font-semibold text-[#172B4D] dark:text-neutral-100 bg-[#F4F5F7] dark:bg-[#1C2331] px-1 py-0.5 rounded border border-[#DFE1E6] dark:border-[#263042]">
                  {geoStatus?.clientIp || "127.0.0.1"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#6B778C] dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} className="text-[#00875A]" />
                  <span>IP Security:</span>
                </span>
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                    geoStatus?.ipRestricted
                      ? geoStatus?.isIpAllowed
                        ? "bg-[#E3FCEF] text-[#006644]"
                        : "bg-[#FFEBE6] text-[#DE350B]"
                      : "bg-[#DEEBFF] text-[#0052CC]"
                  }`}
                >
                  {geoStatus?.ipRestricted
                    ? geoStatus?.isIpAllowed
                      ? "Whitelisted"
                      : "Restricted"
                    : "Verified Gateway"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#6B778C] dark:text-neutral-400">
                <span>Swipe Status:</span>
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                    isSwipeLocked
                      ? "bg-[#FFEBE6] text-[#DE350B]"
                      : "bg-[#E3FCEF] text-[#006644]"
                  }`}
                >
                  {isSwipeLocked ? "Swipe Locked" : "Swipe Authorized"}
                </span>
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="mt-3 pt-2.5 border-t border-[#DFE1E6] dark:border-[#263042]">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6B778C] dark:text-neutral-400 mb-1.5">
                <Crosshair size={11} />
                <span>GPS Simulation Mode</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setGpsSimMode("auto");
                    refreshLocation("auto");
                  }}
                  className={`py-1 px-1 rounded text-center font-medium transition cursor-pointer border ${
                    gpsSimMode === "auto"
                      ? "bg-[#0052CC] text-white border-[#0052CC]"
                      : "bg-[#F4F5F7] dark:bg-[#1C2331] text-[#172B4D] dark:text-neutral-200 border-[#DFE1E6] dark:border-[#263042] hover:bg-[#EBECF0] dark:hover:bg-[#263042]"
                  }`}
                >
                  Device GPS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGpsSimMode("office");
                    refreshLocation("office");
                  }}
                  className={`py-1 px-1 rounded text-center font-medium transition cursor-pointer border ${
                    gpsSimMode === "office"
                      ? "bg-[#00875A] text-white border-[#00875A]"
                      : "bg-[#F4F5F7] dark:bg-[#1C2331] text-[#172B4D] dark:text-neutral-200 border-[#DFE1E6] dark:border-[#263042] hover:bg-[#EBECF0] dark:hover:bg-[#263042]"
                  }`}
                >
                  In Office
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGpsSimMode("outside");
                    refreshLocation("outside");
                  }}
                  className={`py-1 px-1 rounded text-center font-medium transition cursor-pointer border ${
                    gpsSimMode === "outside"
                      ? "bg-[#DE350B] text-white border-[#DE350B]"
                      : "bg-[#F4F5F7] dark:bg-[#1C2331] text-[#172B4D] dark:text-neutral-200 border-[#DFE1E6] dark:border-[#263042] hover:bg-[#EBECF0] dark:hover:bg-[#263042]"
                  }`}
                >
                  Outside
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button: Disabled if Swipe Locked by Geofence */}
      <button
        type="button"
        onClick={handleToggleClock}
        disabled={loading || isSwipeLocked}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded transition-colors ${
          isSwipeLocked
            ? "bg-[#EBECF0] text-[#A5ADBA] border border-[#DFE1E6] cursor-not-allowed"
            : isClockedIn
            ? "bg-[#FFEBE6] text-[#DE350B] hover:bg-[#FFD2CC] border border-[#FFBDAD] cursor-pointer"
            : "bg-[#0052CC] text-white hover:bg-[#0747A6] cursor-pointer"
        } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        title={
          isSwipeLocked
            ? `Swipe locked: You are outside the authorized office perimeter (${geoStatus?.zoneName || "HQ"})`
            : isClockedIn
            ? "Click to Clock Out"
            : "Click to Clock In"
        }
      >
        {isSwipeLocked ? (
          <>
            <ShieldAlert size={12} className="text-[#DE350B]" />
            <span>Locked</span>
          </>
        ) : isClockedIn ? (
          <>
            <LogOut size={12} />
            <span>{loading ? "Clocking..." : "Clock Out"}</span>
          </>
        ) : (
          <>
            <LogIn size={12} />
            <span>{loading ? "Clocking..." : "Clock In"}</span>
          </>
        )}
      </button>
    </div>
  );
}

export default ClockWidget;
