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
          icon: "🟢",
          duration: 3500,
        });
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
        localStorage.setItem("staffify_is_clocked_in", "false");
        localStorage.removeItem("staffify_clock_in_time");
        toast.success(`Clocked Out at ${timeStr}. Session: ${formatTimer(elapsedSeconds)}`, {
          icon: "⏹️",
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
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 shadow-xs">
      {/* Status indicator & live timer */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isClockedIn
              ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-100"
              : "bg-gray-400"
          }`}
        />
        <div className="text-xs">
          <p className="font-semibold text-gray-700 font-mono leading-none">
            {isClockedIn ? formatTimer(elapsedSeconds) : "00:00:00"}
          </p>
          <p className="text-[10px] text-gray-400 leading-none mt-0.5">
            {isClockedIn ? "Session Active" : "Work Timer"}
          </p>
        </div>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1" />

      {/* Action Button */}
      <button
        onClick={handleToggleClock}
        disabled={loading}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all shadow-xs cursor-pointer ${
          isClockedIn
            ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100"
        } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {isClockedIn ? (
          <>
            <LogOut size={13} />
            <span>{loading ? "Clocking..." : "Clock Out"}</span>
          </>
        ) : (
          <>
            <LogIn size={13} />
            <span>{loading ? "Clocking..." : "Web Clock-In"}</span>
          </>
        )}
      </button>
    </div>
  );
}

export default ClockWidget;
