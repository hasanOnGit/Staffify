import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { punchAttendance, getTodayAttendance } from "../services/attendance";

function ClockWidget() {
  const { user } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

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
      // Fallback to local storage if offline or during setup
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

  // Format HH:MM:SS
  const formatTimer = (totalSecs) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleToggleClock = async () => {
    if (!user?.userId) {
      toast.error("Please sign in to clock in/out.");
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
      });

      if (punchType === "IN") {
        setIsClockedIn(true);
        setClockInTime(now.toISOString());
        localStorage.setItem("staffify_is_clocked_in", "true");
        localStorage.setItem("staffify_clock_in_time", now.toISOString());
        toast.success(`Web Clock-In successful at ${timeStr}`, {
          duration: 3500,
        });
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
        localStorage.setItem("staffify_is_clocked_in", "false");
        localStorage.removeItem("staffify_clock_in_time");
        toast.success(`Clocked Out at ${timeStr}. Session: ${formatTimer(elapsedSeconds)}`, {
          duration: 4000,
        });
      }

      window.dispatchEvent(new Event("staffify_punch_updated"));
    } catch {
      // Local fallback if API network error occurs
      if (punchType === "IN") {
        setIsClockedIn(true);
        setClockInTime(now.toISOString());
        localStorage.setItem("staffify_is_clocked_in", "true");
        localStorage.setItem("staffify_clock_in_time", now.toISOString());
        toast.success(`Clocked In locally at ${timeStr}`);
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
        localStorage.setItem("staffify_is_clocked_in", "false");
        toast.success(`Clocked Out locally at ${timeStr}`);
      }
      window.dispatchEvent(new Event("staffify_punch_updated"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-[#F4F5F7] border border-[#DFE1E6] rounded px-2.5 py-1">
      {/* Status indicator & live timer */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isClockedIn
              ? "bg-[#00875A] ring-2 ring-[#ABF5D1]"
              : "bg-[#7A869A]"
          }`}
        />
        <div className="text-xs">
          <p className="font-semibold text-[#172B4D] font-mono leading-none">
            {isClockedIn ? formatTimer(elapsedSeconds) : "00:00:00"}
          </p>
          <p className="text-[10px] text-[#6B778C] leading-none mt-0.5">
            {isClockedIn ? "Session Active" : "Work Timer"}
          </p>
        </div>
      </div>

      <div className="h-5 w-px bg-[#DFE1E6] mx-0.5" />

      {/* Action Button */}
      <button
        onClick={handleToggleClock}
        disabled={loading}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded transition-colors cursor-pointer ${
          isClockedIn
            ? "bg-[#FFEBE6] text-[#DE350B] hover:bg-[#FFD2CC] border border-[#FFBDAD]"
            : "bg-[#0052CC] text-white hover:bg-[#0747A6]"
        } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {isClockedIn ? (
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
