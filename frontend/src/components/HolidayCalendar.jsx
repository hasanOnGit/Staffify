import { useEffect, useState } from "react";
import { getHolidays } from "../services/holiday";
import { Calendar, Sparkles, AlertCircle } from "lucide-react";

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

  return (
    <div className="space-y-6">
      {/* Upcoming Holiday Banner */}
      {upcoming && (
        <div className="bg-gradient-to-r from-purple-700 to-indigo-600 rounded-xl p-5 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-bold text-lg">
              {new Date(upcoming.date).getDate()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-purple-200">
                  Next Holiday
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                  {upcoming.type}
                </span>
              </div>
              <h3 className="text-lg font-bold mt-0.5">{upcoming.name}</h3>
              <p className="text-xs text-purple-200">
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
            <span className="text-xs block text-purple-200">Days to go</span>
          </div>
        </div>
      )}

      {/* Holidays List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-purple-600" />
            <h3 className="font-semibold text-gray-800 text-sm">
              Official Holiday Calendar — {new Date().getFullYear()}
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {holidays.length} Annual Holidays
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            Loading holiday schedule...
          </div>
        ) : holidays.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No holidays scheduled for this calendar year.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {holidays.map((h) => {
              const dateObj = new Date(h.date);
              const isPast = h.date < todayStr;

              return (
                <div
                  key={h._id || h.date}
                  className={`p-4 flex items-center justify-between hover:bg-gray-50/80 transition ${
                    isPast ? "opacity-60 bg-gray-50/40" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex flex-col items-center justify-center font-bold leading-none">
                      <span className="text-[10px] uppercase font-semibold text-purple-400">
                        {dateObj.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-base font-bold mt-0.5">
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
