import React, { useState, useEffect } from "react";
import {
  MapPin,
  Crosshair,
  ShieldCheck,
  ShieldAlert,
  Navigation,
  RotateCcw,
  Sliders,
  Radio,
  CheckCircle2,
  Building,
  Compass
} from "lucide-react";

export default function GeofenceRadarMap({
  latitude = 12.9352,
  longitude = 77.6946,
  radiusMeters = 300,
  zoneName = "Headquarters - Tech Park Campus",
  interactive = false,
  onRadiusChange,
  showSimulateControls = true
}) {
  const [currentRadius, setCurrentRadius] = useState(radiusMeters);
  const [userDistance, setUserDistance] = useState(48); // default demo distance in meters
  const [userBearing, setUserBearing] = useState(45); // angle in degrees
  const [isInside, setIsInside] = useState(true);
  const [isScanning, setIsScanning] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);

  useEffect(() => {
    setCurrentRadius(radiusMeters);
  }, [radiusMeters]);

  useEffect(() => {
    setIsInside(userDistance <= currentRadius);
  }, [userDistance, currentRadius]);

  const handleSliderChange = (newVal) => {
    setCurrentRadius(newVal);
    if (onRadiusChange) onRadiusChange(newVal);
  };

  const simulateLocation = (type) => {
    if (type === "inside") {
      setUserDistance(Math.round(currentRadius * 0.35));
      setUserBearing(65);
    } else if (type === "border") {
      setUserDistance(Math.round(currentRadius * 0.95));
      setUserBearing(180);
    } else {
      setUserDistance(Math.round(currentRadius * 1.45));
      setUserBearing(290);
    }
  };

  const detectLiveLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        // Calculate approximate distance from zone center
        const R = 6371e3;
        const dLat = ((pos.coords.latitude - latitude) * Math.PI) / 180;
        const dLon = ((pos.coords.longitude - longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((latitude * Math.PI) / 180) *
            Math.cos((pos.coords.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = Math.round(R * c);
        setUserDistance(dist);
      },
      () => {
        setDetectingGps(false);
      },
      { timeout: 8000 }
    );
  };

  // Radar SVG dimensions: viewbox 0 0 400 400, center at (200, 200)
  const maxRangeMeters = Math.max(currentRadius * 1.6, 600);
  const scale = 160 / maxRangeMeters; // 160px max radius circle inside 400x400
  const zoneCircleRadius = Math.min(180, Math.max(20, currentRadius * scale));

  // User marker coordinates
  const rad = (userBearing * Math.PI) / 180;
  const userMarkerDistPx = Math.min(185, userDistance * scale);
  const userX = 200 + userMarkerDistPx * Math.cos(rad);
  const userY = 200 - userMarkerDistPx * Math.sin(rad);

  return (
    <div className="bg-white dark:bg-[#0F131C] rounded-2xl border border-[#DFE1E6] dark:border-[#263042] overflow-hidden shadow-xs">
      {/* Top Banner / Zone Metadata */}
      <div className="p-4 border-b border-[#DFE1E6] dark:border-[#263042] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFBFC] dark:bg-[#151B26]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DEEBFF] dark:bg-blue-950/60 text-[#0052CC] dark:text-[#579DFF] flex items-center justify-center shrink-0 shadow-xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#172B4D] dark:text-white uppercase tracking-wider">
                {zoneName}
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isInside
                    ? "bg-[#E3FCEF] text-[#00875A] border border-[#00875A]/20"
                    : "bg-[#FFEBE6] text-[#DE350B] border border-[#DE350B]/20"
                }`}
              >
                {isInside ? "In Perimeter" : "Perimeter Breach"}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#6B778C] dark:text-slate-400">
              GPS: {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E • Radius: {currentRadius}m
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={detectLiveLocation}
            disabled={detectingGps}
            className="px-2.5 py-1.5 rounded-lg border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-[#172B4D] dark:text-white hover:bg-[#F4F5F7] dark:hover:bg-[#263042] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Calibrate against live device GPS"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#0052CC] ${detectingGps ? "animate-spin" : ""}`} />
            <span>Calibrate GPS</span>
          </button>
        </div>
      </div>

      {/* Main Radar Display */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Radar Widget */}
        <div className="md:col-span-7 flex justify-center">
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] bg-[#090D14] rounded-2xl overflow-hidden border border-[#263042] shadow-inner select-none">
            {/* Grid background texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #579DFF 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                {/* Radar beam gradient */}
                <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0052CC" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#579DFF" stopOpacity="0" />
                </linearGradient>

                {/* Zone glow */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Range Rings */}
              {[40, 80, 120, 160].map((r, i) => (
                <circle
                  key={r}
                  cx="200"
                  cy="200"
                  r={r}
                  fill="none"
                  stroke="#263042"
                  strokeWidth="1"
                  strokeDasharray={i === 3 ? "none" : "3,3"}
                />
              ))}

              {/* Crosshairs */}
              <line x1="200" y1="20" x2="200" y2="380" stroke="#1F2937" strokeWidth="1" />
              <line x1="20" y1="200" x2="380" y2="200" stroke="#1F2937" strokeWidth="1" />

              {/* Cardinal directions */}
              <text x="200" y="32" textAnchor="middle" fill="#6B778C" fontSize="10" fontWeight="bold">N</text>
              <text x="375" y="204" textAnchor="middle" fill="#6B778C" fontSize="10" fontWeight="bold">E</text>
              <text x="200" y="375" textAnchor="middle" fill="#6B778C" fontSize="10" fontWeight="bold">S</text>
              <text x="25" y="204" textAnchor="middle" fill="#6B778C" fontSize="10" fontWeight="bold">W</text>

              {/* Animated Radar Scanning Sweep */}
              {isScanning && (
                <g className="origin-center animate-[spin_6s_linear_infinite]" style={{ transformOrigin: "200px 200px" }}>
                  <path
                    d="M 200 200 L 200 40 A 160 160 0 0 1 313 87 Z"
                    fill="url(#radarSweep)"
                  />
                  <line x1="200" y1="200" x2="200" y2="40" stroke="#579DFF" strokeWidth="1.5" opacity="0.8" />
                </g>
              )}

              {/* Authorized Geofence Zone Boundary */}
              <circle
                cx="200"
                cy="200"
                r={zoneCircleRadius}
                fill="#0052CC"
                fillOpacity="0.18"
                stroke="#0052CC"
                strokeWidth="2"
                filter="url(#glow)"
              />
              <circle
                cx="200"
                cy="200"
                r={zoneCircleRadius}
                fill="none"
                stroke="#579DFF"
                strokeWidth="1"
                strokeDasharray="4,4"
              />

              {/* Center Office Beacon */}
              <circle cx="200" cy="200" r="10" fill="#0052CC" />
              <circle cx="200" cy="200" r="4" fill="#FFFFFF" />
              <circle cx="200" cy="200" r="16" fill="none" stroke="#579DFF" strokeWidth="1" opacity="0.6" className="animate-ping" />

              {/* User Position Vector & Marker */}
              <line
                x1="200"
                y1="200"
                x2={userX}
                y2={userY}
                stroke={isInside ? "#00875A" : "#DE350B"}
                strokeWidth="1.5"
                strokeDasharray="3,3"
                opacity="0.7"
              />

              {/* User Beacon Marker */}
              <circle
                cx={userX}
                cy={userY}
                r="7"
                fill={isInside ? "#00875A" : "#DE350B"}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <circle
                cx={userX}
                cy={userY}
                r="14"
                fill="none"
                stroke={isInside ? "#00875A" : "#DE350B"}
                strokeWidth="1.5"
                opacity="0.75"
                className="animate-ping"
              />
            </svg>

            {/* Radar Legend Pill */}
            <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-xs border border-white/10 flex items-center justify-between text-[10px] text-white font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0052CC] inline-block" /> HQ Center
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full inline-block ${isInside ? "bg-[#00875A]" : "bg-[#DE350B]"}`} />
                User: {userDistance}m
              </span>
            </div>
          </div>
        </div>

        {/* Radar Telemetry & Controls */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F4F5F7] dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B778C] dark:text-slate-400">Current Position</span>
              <span className="font-bold text-[#172B4D] dark:text-white">
                {userDistance} meters from HQ
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B778C] dark:text-slate-400">Enforcement Boundary</span>
              <span className="font-bold text-[#0052CC] dark:text-[#579DFF]">
                {currentRadius} meters radius
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#DFE1E6] dark:border-[#263042]">
              <span className="text-[#6B778C] dark:text-slate-400">Punch Authorization</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  isInside ? "text-[#00875A]" : "text-[#DE350B]"
                }`}
              >
                {isInside ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Allowed
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" /> Blocked
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Radius Adjustment Slider (if interactive) */}
          {interactive && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#172B4D] dark:text-white">
                <span>Perimeter Radius</span>
                <span className="font-mono text-[#0052CC] dark:text-[#579DFF]">{currentRadius}m</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={currentRadius}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full accent-[#0052CC] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6B778C] dark:text-slate-400">
                <span>50m (Strict)</span>
                <span>300m (Standard)</span>
                <span>1000m (Campus)</span>
              </div>
            </div>
          )}

          {/* Quick Simulation Buttons */}
          {showSimulateControls && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B778C] dark:text-slate-400">
                Simulate Swiper Position
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => simulateLocation("inside")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                    isInside && userDistance < currentRadius * 0.8
                      ? "bg-[#E3FCEF] border-[#00875A] text-[#00875A]"
                      : "bg-white dark:bg-[#0F131C] border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-white hover:bg-[#F4F5F7]"
                  }`}
                >
                  Inside (HQ)
                </button>
                <button
                  type="button"
                  onClick={() => simulateLocation("border")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                    isInside && userDistance >= currentRadius * 0.8
                      ? "bg-[#FFF0B3] border-[#B9770E] text-[#B9770E]"
                      : "bg-white dark:bg-[#0F131C] border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-white hover:bg-[#F4F5F7]"
                  }`}
                >
                  Boundary
                </button>
                <button
                  type="button"
                  onClick={() => simulateLocation("outside")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                    !isInside
                      ? "bg-[#FFEBE6] border-[#DE350B] text-[#DE350B]"
                      : "bg-white dark:bg-[#0F131C] border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-white hover:bg-[#F4F5F7]"
                  }`}
                >
                  Outside
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
