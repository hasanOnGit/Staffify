import { useEffect, useState } from "react";
import { getHolidays } from "../services/holiday";
import { Calendar, Sparkles, AlertCircle, Download } from "lucide-react";
import toast from "react-hot-toast";

function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const data = await getHolidays();
        setHolidays(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch holidays error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  // Find next upcoming holiday
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = holidays.find((h) => h.date >= todayStr);

  const getTypeBadge = (type) => {
    switch (type) {
      case "National":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Company":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Restricted":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const exportToIcs = () => {
    if (!holidays || holidays.length === 0) {
      toast.error("No holidays available to export");
      return;
    }
    const formatDate = (dateStr) => dateStr.replace(/-/g, "");
    const nowIso = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Staffify HRMS//Official Company Holidays//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Staffify Holidays",
      "X-WR-TIMEZONE:Asia/Kolkata",
    ];

    holidays.forEach((h) => {
      const d = formatDate(h.date);
      const nextDate = new Date(h.date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextD = formatDate(nextDate.toISOString().slice(0, 10));

      lines.push(
        "BEGIN:VEVENT",
        `UID:holiday-${h._id || d}@staffify.internal`,
        `DTSTAMP:${nowIso}`,
        `DTSTART;VALUE=DATE:${d}`,
        `DTEND;VALUE=DATE:${nextD}`,
        `SUMMARY:${h.name} (${h.type} Holiday)`,
        `DESCRIPTION:${h.description || "Official Company Holiday - Staffify Enterprise HRMS"}`,
        "STATUS:CONFIRMED",
        "TRANSP:TRANSPARENT",
        "END:VEVENT"
      );
    });

    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Staffify_Company_Holidays_${new Date().getFullYear()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Holidays exported (.ics)! Import into Outlook, Google or Apple Calendar.");
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Holiday Banner */}
      {upcoming && (
        <div className="bg-[#0052CC] rounded p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded bg-white/15 backdrop-blur-xs flex items-center justify-center font-bold text-base">
              {new Date(upcoming.date).getDate()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-200">
                  Next Holiday
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-medium">
                  {upcoming.type}
                </span>
              </div>
              <h3 className="text-base font-bold mt-0.5">{upcoming.name}</h3>
              <p className="text-xs text-blue-200">
                {new Date(upcoming.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-2xl font-bold">
              {Math.ceil((new Date(upcoming.date) - new Date()) / (1000 * 60 * 60 * 24))}
            </span>
            <span className="text-xs block text-blue-200">Days to go</span>
          </div>
        </div>
      )}

      {/* Holidays List */}
      <div className="bg-white border border-[#DFE1E6] rounded overflow-hidden">
        <div className="p-3.5 border-b border-[#DFE1E6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#0052CC]" />
            <h3 className="font-semibold text-[#172B4D] text-xs">
              Official Holiday Calendar — {new Date().getFullYear()}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B778C] font-medium hidden sm:inline">
              {holidays.length} Annual Holidays
            </span>
            <button
              onClick={exportToIcs}
              title="Download iCalendar file (.ics) to sync with Google Calendar, Outlook, or Apple Calendar"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#F4F5F7] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded transition cursor-pointer"
            >
              <Download size={13} className="text-[#0052CC]" />
              <span>Sync Calendar (.ics)</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[#6B778C] text-xs">
            Loading holiday schedule...
          </div>
        ) : holidays.length === 0 ? (
          <div className="p-10 text-center text-[#6B778C] text-xs">
            No holidays scheduled for this calendar year.
          </div>
        ) : (
          <div className="divide-y divide-[#DFE1E6]">
            {holidays.map((h) => {
              const dateObj = new Date(h.date);
              const isPast = h.date < todayStr;

              return (
                <div
                  key={h._id || h.date}
                  className={`p-3.5 flex items-center justify-between hover:bg-[#F4F5F7] transition ${
                    isPast ? "opacity-60 bg-[#F4F5F7]/40" : ""
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF] flex flex-col items-center justify-center font-bold leading-none">
                      <span className="text-[9px] uppercase font-semibold text-[#0747A6]">
                        {dateObj.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-sm font-bold mt-0.5">
                        {dateObj.getDate()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">{h.name}</h4>
                      <p className="text-xs text-gray-400">
                        {h.day || dateObj.toLocaleDateString("en-US", { weekday: "long" })} • {h.description || "General Holiday"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getTypeBadge(h.type)}`}>
                      {h.type}
                    </span>
                    {isPast && (
                      <span className="text-[10px] text-gray-400 uppercase font-semibold bg-gray-100 px-2 py-0.5 rounded">
                        Past
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HolidayCalendar;
