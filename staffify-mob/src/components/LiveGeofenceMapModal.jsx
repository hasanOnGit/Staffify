import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Crosshair,
  ShieldCheck,
  ShieldAlert,
  Navigation,
  RotateCcw,
  Building2,
  X,
  Compass,
  Radio,
  Sparkles,
  Sliders
} from "lucide-react";
import { hapticLight, hapticSuccess, hapticWarning } from "../utils/haptics";

const OFFICE_COORDS = {
  lat: 12.93524,
  lng: 77.69462,
  radiusMeters: 500,
  name: "HQ Tech Park Campus",
};

// Calculate distance in meters using Haversine formula
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function LiveGeofenceMapModal({ isOpen, onClose, currentDistance = 42, onLocationUpdate }) {
  const [userLocation, setUserLocation] = useState({
    lat: 12.9354,
    lng: 77.6948,
    accuracy: 6.5,
    altitude: 914,
    distance: currentDistance,
    isInside: currentDistance <= OFFICE_COORDS.radiusMeters,
  });

  const [detecting, setDetecting] = useState(false);
  const [gpsMode, setGpsMode] = useState("live"); // 'live' | 'simulated'
  const [selectedSim, setSelectedSim] = useState("inside");
  const watchIdRef = useRef(null);

  // Start live GPS tracking when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDetecting(false);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 8);
          const alt = Math.round(pos.coords.altitude || 912);
          const dist = getDistanceMeters(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
          const inside = dist <= OFFICE_COORDS.radiusMeters;

          setUserLocation({
            lat,
            lng,
            accuracy: acc,
            altitude: alt,
            distance: dist,
            isInside: inside,
          });
          if (onLocationUpdate) onLocationUpdate({ lat, lng, distance: dist, isInside: inside, accuracy: acc });
        },
        (err) => {
          console.warn("Geolocation fallback active:", err.message);
          setDetecting(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );

      // Continuous watch
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 6);
          const dist = getDistanceMeters(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
          const inside = dist <= OFFICE_COORDS.radiusMeters;

          setUserLocation((prev) => ({
            ...prev,
            lat,
            lng,
            accuracy: acc,
            distance: dist,
            isInside: inside,
          }));
          if (onLocationUpdate) onLocationUpdate({ lat, lng, distance: dist, isInside: inside, accuracy: acc });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 4000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRecalibrate = () => {
    hapticLight();
    setDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDetecting(false);
          hapticSuccess();
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 5);
          const dist = getDistanceMeters(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
          const inside = dist <= OFFICE_COORDS.radiusMeters;
          setUserLocation({
            lat,
            lng,
            accuracy: acc,
            altitude: Math.round(pos.coords.altitude || 912),
            distance: dist,
            isInside: inside,
          });
          if (onLocationUpdate) onLocationUpdate({ lat, lng, distance: dist, isInside: inside, accuracy: acc });
        },
        () => {
          setDetecting(false);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      setTimeout(() => setDetecting(false), 500);
    }
  };

  const handleSimulate = (preset) => {
    hapticLight();
    setSelectedSim(preset);
    setGpsMode("simulated");
    let dist = 42;
    let latOffset = 0.0003;
    let lngOffset = 0.0002;

    if (preset === "inside") {
      dist = 38;
      latOffset = 0.0002;
      lngOffset = 0.0003;
      hapticSuccess();
    } else if (preset === "boundary") {
      dist = 485;
      latOffset = 0.0038;
      lngOffset = 0.0025;
      hapticWarning();
    } else if (preset === "outside") {
      dist = 1240;
      latOffset = 0.0095;
      lngOffset = 0.0078;
      hapticWarning();
    }

    const newLat = OFFICE_COORDS.lat + latOffset;
    const newLng = OFFICE_COORDS.lng + lngOffset;
    const inside = dist <= OFFICE_COORDS.radiusMeters;

    setUserLocation({
      lat: newLat,
      lng: newLng,
      accuracy: preset === "outside" ? 22 : 6,
      altitude: 914,
      distance: dist,
      isInside: inside,
    });
    if (onLocationUpdate) onLocationUpdate({ lat: newLat, lng: newLng, distance: dist, isInside: inside, accuracy: 6 });
  };

  // Convert distance to canvas relative offset for SVG visualization
  // Max radar range visually is 800m
  const scale = 110 / 800; // 110px radius corresponds to 800m
  const visualRadiusPx = Math.min(110, OFFICE_COORDS.radiusMeters * scale); // 500m -> ~68.7px
  const visualUserDistancePx = Math.min(125, userLocation.distance * scale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Tap Backdrop to Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Geofence Map Card Container */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white dark:bg-[#0F131C] rounded-3xl border border-[#DFE1E6] dark:border-[#263042] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Top Header with Prominent Cross ('X') Close Button */}
        <div className="p-4 border-b border-[#DFE1E6] dark:border-[#263042] flex items-center justify-between shrink-0 bg-white/95 dark:bg-[#0F131C]/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#DEEBFF] dark:bg-blue-950/60 text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center border border-[#0052CC]/20 shadow-xs">
              <Crosshair className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#172B4D] dark:text-white">
                  Live Geofence Radar
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    userLocation.isInside
                      ? "bg-[#E3FCEF] text-[#00875A] dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-[#FFEBE6] text-[#DE350B] dark:bg-rose-950/50 dark:text-rose-300"
                  }`}
                >
                  {userLocation.isInside ? "Inside Perimeter" : "Perimeter Breach"}
                </span>
              </div>
              <p className="text-[10px] text-[#6B778C] dark:text-slate-400">
                Authorized radius: 500m • {OFFICE_COORDS.name}
              </p>
            </div>
          </div>

          {/* Prominent Cross Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#EBECF0] dark:bg-[#151B26] hover:bg-[#DFE1E6] dark:hover:bg-[#263042] text-[#172B4D] dark:text-slate-200 active:scale-90 transition-all border border-[#DFE1E6] dark:border-[#263042] shadow-xs"
            title="Close Map"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Visual Tactical Radar Map View */}
        <div className="relative bg-[#090D14] h-60 sm:h-64 flex items-center justify-center overflow-hidden border-b border-[#263042] select-none">
          {/* Subtle Grid Background Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#579DFF_1px,transparent_1px),linear-gradient(to_bottom,#579DFF_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Radar Scanning Sweep Beam Animation */}
          <div
            className="absolute inset-0 pointer-events-none origin-center animate-spin"
            style={{
              animationDuration: "4s",
              animationTimingFunction: "linear",
              background:
                "conic-gradient(from 0deg, transparent 0deg, transparent 315deg, rgba(0, 82, 204, 0.28) 360deg)",
            }}
          />

          {/* SVG Tactical Coordinate Canvas */}
          <svg className="w-full h-full" viewBox="-140 -140 280 280">
            {/* Range Rings */}
            <circle cx="0" cy="0" r="35" fill="none" stroke="#263042" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="70" fill="none" stroke="#263042" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="110" fill="none" stroke="#263042" strokeWidth="1" strokeDasharray="4 4" />

            {/* Range Distance Labels */}
            <text x="38" y="-4" fill="#6B778C" fontSize="7" fontWeight="bold">250m</text>
            <text x="73" y="-4" fill="#6B778C" fontSize="7" fontWeight="bold">500m</text>
            <text x="113" y="-4" fill="#6B778C" fontSize="7" fontWeight="bold">800m</text>

            {/* Cardinal Axes */}
            <line x1="-130" y1="0" x2="130" y2="0" stroke="#263042" strokeWidth="0.8" opacity="0.6" />
            <line x1="0" y1="-130" x2="0" y2="130" stroke="#263042" strokeWidth="0.8" opacity="0.6" />
            <text x="0" y="-120" textAnchor="middle" fill="#579DFF" fontSize="9" fontWeight="bold">N</text>
            <text x="0" y="128" textAnchor="middle" fill="#6B778C" fontSize="9" fontWeight="bold">S</text>
            <text x="124" y="3" textAnchor="middle" fill="#6B778C" fontSize="9" fontWeight="bold">E</text>
            <text x="-124" y="3" textAnchor="middle" fill="#6B778C" fontSize="9" fontWeight="bold">W</text>

            {/* Authorized Geofence Perimeter Circle (500m) */}
            <circle
              cx="0"
              cy="0"
              r={visualRadiusPx}
              fill="rgba(0, 82, 204, 0.08)"
              stroke={userLocation.isInside ? "#00875A" : "#DE350B"}
              strokeWidth="2"
              strokeDasharray={userLocation.isInside ? "none" : "5 3"}
            />

            {/* Center Office Beacon */}
            <circle cx="0" cy="0" r="7" fill="#0052CC" />
            <circle cx="0" cy="0" r="14" fill="none" stroke="#0052CC" strokeWidth="1" opacity="0.4" />
            <text x="0" y="19" textAnchor="middle" fill="#DEEBFF" fontSize="7" fontWeight="bold">
              HQ Office
            </text>

            {/* Distance Vector Line between Office & User */}
            <line
              x1="0"
              y1="0"
              x2={visualUserDistancePx * 0.7}
              y2={visualUserDistancePx * -0.7}
              stroke={userLocation.isInside ? "#00875A" : "#DE350B"}
              strokeWidth="1.5"
              strokeDasharray="3 2"
              opacity="0.8"
            />

            {/* User Live GPS Marker */}
            <g transform={`translate(${visualUserDistancePx * 0.7}, ${visualUserDistancePx * -0.7})`}>
              {/* GPS Accuracy Halo */}
              <circle
                cx="0"
                cy="0"
                r={Math.max(12, userLocation.accuracy * scale * 2)}
                fill={userLocation.isInside ? "rgba(0, 135, 90, 0.2)" : "rgba(222, 53, 11, 0.2)"}
                stroke={userLocation.isInside ? "#00875A" : "#DE350B"}
                strokeWidth="1"
                className="animate-ping"
                style={{ animationDuration: "2.5s" }}
              />

              {/* Pin Center */}
              <circle
                cx="0"
                cy="0"
                r="6"
                fill={userLocation.isInside ? "#00875A" : "#DE350B"}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text x="0" y="-9" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="black">
                YOU
              </text>
            </g>
          </svg>

          {/* Floating Distance Badge on Radar */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
            <div className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-md">
              <Navigation className="w-3.5 h-3.5 text-[#579DFF]" />
              <span>{userLocation.distance}m from HQ</span>
            </div>

            <div className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-md">
              <Radio className="w-3.5 h-3.5 text-[#36B37E]" />
              <span>±{userLocation.accuracy}m Accuracy</span>
            </div>
          </div>
        </div>

        {/* Live GPS Telemetry Dashboard Grid */}
        <div className="p-4 space-y-3 bg-[#F4F5F7]/60 dark:bg-[#0F131C]">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-2xl bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] space-y-0.5">
              <span className="text-[10px] font-bold text-[#6B778C] dark:text-slate-400 uppercase tracking-wider">
                Latitude / Longitude
              </span>
              <p className="font-mono font-bold text-[#172B4D] dark:text-white tabular-nums truncate text-[11px]">
                {userLocation.lat.toFixed(5)}°, {userLocation.lng.toFixed(5)}°
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] space-y-0.5">
              <span className="text-[10px] font-bold text-[#6B778C] dark:text-slate-400 uppercase tracking-wider">
                Precision & Fix
              </span>
              <p className="font-bold text-[#00875A] dark:text-emerald-400 truncate text-[11px]">
                ±{userLocation.accuracy}m • {userLocation.accuracy < 10 ? "High Precision" : "Standard Fix"}
              </p>
            </div>
          </div>

          {/* Quick Simulation Toggles for Easy Indoor Testing */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#6B778C] dark:text-slate-400 uppercase tracking-wider">
              <span>Testing Simulation Mode</span>
              <span className="text-[#0052CC] dark:text-[#579DFF]">{gpsMode === "live" ? "Live Sensor Active" : "Simulated Offset"}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleSimulate("inside")}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                  gpsMode === "simulated" && selectedSim === "inside"
                    ? "bg-[#E3FCEF] text-[#00875A] border-[#00875A]"
                    : "bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-slate-300 border-[#DFE1E6] dark:border-[#263042]"
                }`}
              >
                Inside (38m)
              </button>
              <button
                type="button"
                onClick={() => handleSimulate("boundary")}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                  gpsMode === "simulated" && selectedSim === "boundary"
                    ? "bg-[#FFF0B3] text-[#B9770E] border-[#B9770E]"
                    : "bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-slate-300 border-[#DFE1E6] dark:border-[#263042]"
                }`}
              >
                Border (485m)
              </button>
              <button
                type="button"
                onClick={() => handleSimulate("outside")}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                  gpsMode === "simulated" && selectedSim === "outside"
                    ? "bg-[#FFEBE6] text-[#DE350B] border-[#DE350B]"
                    : "bg-white dark:bg-[#151B26] text-[#6B778C] dark:text-slate-300 border-[#DFE1E6] dark:border-[#263042]"
                }`}
              >
                Outside (1.2km)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3 sm:p-4 border-t border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] flex items-center gap-2">
          <button
            type="button"
            onClick={handleRecalibrate}
            disabled={detecting}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${detecting ? "animate-spin" : ""}`} />
            <span>{detecting ? "Acquiring Satellites..." : "Recalibrate GPS"}</span>
          </button>

          {/* Close Button in Bottom Bar */}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-2xl bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-slate-200 text-xs font-bold active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
