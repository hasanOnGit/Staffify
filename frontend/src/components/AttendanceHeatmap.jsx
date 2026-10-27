import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, AlertCircle, Clock, Award } from "lucide-react";

function AttendanceHeatmap({ attendanceRecords = [], userName = "Employee" }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate trailing 30 days
  const daysData = useMemo(() => {
    const list = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Find matching attendance record
      const record = attendanceRecords.find((a) => a.date === dateStr);

      let status = isWeekend ? "Weekend" : "Absent";
      let punchIn = "--";
      let punchOut = "--";
      let hours = "--";

      if (record) {
        status = record.status || "Present";
        punchIn = record.inTime || record.firstIn || "--";
        punchOut = record.outTime || record.lastOut || "--";
        hours = record.workHours || (record.totalHours ? `${record.totalHours} hrs` : "--");
      }

      list.push({
        date: dateStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        isWeekend,
        status,
        punchIn,
        punchOut,
        hours,
      });
    }

    return list;
  }, [attendanceRecords]);

  // Consistency metrics
  const workingDays = daysData.filter((d) => !d.isWeekend);
  const presentDays = workingDays.filter((d) => d.status === "Present" || d.status === "WFH");
  const lateDays = workingDays.filter((d) => d.status === "Late");
  const consistencyScore = workingDays.length > 0
    ? Math.round(((presentDays.length + lateDays.length * 0.8) / workingDays.length) * 100)
    : 100;

  const getCellColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-[#00875A] hover:bg-[#006644] border-[#ABF5D1]";
      case "Late":
        return "bg-[#FFAB00] hover:bg-[#FF8B00] border-[#FFE380]";
      case "WFH":
        return "bg-[#0052CC] hover:bg-[#0747A6] border-[#B3D4FF]";
      case "Half Day":
        return "bg-[#6554C0] hover:bg-[#5243AA] border-[#C0B6F2]";
      case "Absent":
        return "bg-[#DE350B] hover:bg-[#BF2600] border-[#FFBDAD]";
      case "Weekend":
      default:
        return "bg-[#EBECF0] dark:bg-[#1E293B] border-transparent opacity-60";
    }
  };

  return (
    <div className="bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl p-4 shadow-xs mb-5 space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#DEEBFF] dark:bg-[#0747A6]/30 text-[#0052CC] dark:text-[#38BDF8] rounded-lg">
            <Award size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] uppercase tracking-wide">
              30-Day Attendance Consistency Heatmap
            </h3>
            <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
              Trailing month swipe regularity for {userName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-[#F4F5F7] dark:bg-[#101520] px-2.5 py-1 rounded-lg border border-[#DFE1E6] dark:border-[#263042]">
            <span className="text-[#6B778C] dark:text-[#94A3B8] font-medium text-[11px]">Score:</span>
            <span className="font-bold text-[#00875A] dark:text-[#34D399] font-mono">
              {consistencyScore}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F4F5F7] dark:bg-[#101520] px-2.5 py-1 rounded-lg border border-[#DFE1E6] dark:border-[#263042]">
            <span className="text-[#6B778C] dark:text-[#94A3B8] font-medium text-[11px]">On-Time:</span>
            <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9] font-mono">
              {presentDays.length}/{workingDays.length}d
            </span>
          </div>
        </div>
      </div>

      {/* Trailing 30 Days Grid */}
      <div className="relative">
        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5 pt-1">
          {daysData.map((day, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`h-7 rounded-md transition-all cursor-pointer border ${getCellColor(
                day.status
              )} flex items-center justify-center`}
              title={`${day.displayDate}: ${day.status}`}
            />
          ))}
        </div>

        {/* Hover Tooltip Popup */}
        {hoveredDay && (
          <div className="absolute top-9 left-1/2 -translate-x-1/2 z-20 bg-[#172B4D] dark:bg-[#090D14] text-white border border-[#263042] rounded-lg p-2.5 shadow-xl text-xs w-56 animate-fadeIn pointer-events-none">
            <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5">
              <span className="font-bold text-[11px]">{hoveredDay.displayDate} ({hoveredDay.dayName})</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-white/20">
                {hoveredDay.status}
              </span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>Punch In:</span>
                <span className="text-white font-bold">{hoveredDay.punchIn}</span>
              </div>
              <div className="flex justify-between">
                <span>Punch Out:</span>
                <span className="text-white font-bold">{hoveredDay.punchOut}</span>
              </div>
              <div className="flex justify-between">
                <span>Work Hours:</span>
                <span className="text-emerald-400 font-bold">{hoveredDay.hours}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-[#6B778C] dark:text-[#94A3B8] pt-1 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#00875A]" />
            <span>Present On-Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#FFAB00]" />
            <span>Late Arrival</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#0052CC]" />
            <span>Remote / WFH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#6554C0]" />
            <span>Half Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#DE350B]" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#EBECF0] dark:bg-[#1E293B]" />
            <span>Weekend / Holiday</span>
          </div>
        </div>

        <span className="italic text-[10px]">Hover any cell to inspect punch timestamps</span>
      </div>
    </div>
  );
}

export default AttendanceHeatmap;
