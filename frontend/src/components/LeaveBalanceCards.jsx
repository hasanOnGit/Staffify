import { Sparkles } from "lucide-react";

function LeaveBalanceCards({ balances = {}, year = new Date().getFullYear() }) {
  const cards = [
    {
      key: "earned",
      title: "Earned Leave (EL)",
      subtitle: "Privilege annual quota",
      data: balances.earned || { total: 15, used: 0, available: 15 },
      color: "blue",
    },
    {
      key: "casual",
      title: "Casual Leave (CL)",
      subtitle: "Short personal leaves",
      data: balances.casual || { total: 12, used: 0, available: 12 },
      color: "purple",
    },
    {
      key: "sick",
      title: "Sick Leave (SL)",
      subtitle: "Medical and recovery",
      data: balances.sick || { total: 10, used: 0, available: 10 },
      color: "rose",
    },
    {
      key: "halfDay",
      title: "Half Day (HD)",
      subtitle: "First or second session",
      data: balances.halfDay || { total: 6, used: 0, available: 6 },
      color: "amber",
    },
    {
      key: "lop",
      title: "Loss of Pay (LOP)",
      subtitle: "Unpaid / Exhausted leaves",
      data: balances.lop || { total: 0, used: 0, available: 0 },
      color: "gray",
    },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case "blue":
        return {
          border: "border-l-blue-600",
          bar: "bg-blue-600",
          badge: "bg-blue-50 text-blue-700",
        };
      case "purple":
        return {
          border: "border-l-purple-600",
          bar: "bg-purple-600",
          badge: "bg-purple-50 text-purple-700",
        };
      case "rose":
        return {
          border: "border-l-rose-600",
          bar: "bg-rose-600",
          badge: "bg-rose-50 text-rose-700",
        };
      case "amber":
        return {
          border: "border-l-amber-500",
          bar: "bg-amber-500",
          badge: "bg-amber-50 text-amber-700",
        };
      default:
        return {
          border: "border-l-gray-400",
          bar: "bg-gray-500",
          badge: "bg-gray-100 text-gray-700",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => {
        const theme = getColorClasses(card.color);
        const { total, used, available } = card.data;
        const percentUsed = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

        return (
          <div
            key={card.key}
            className={`bg-white border border-gray-200 border-l-4 ${theme.border} rounded-xl p-4 shadow-2xs hover:shadow-xs transition`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${theme.badge}`}>
                {card.title.split(" ")[0]}
              </span>
              <span className="text-[11px] text-gray-400 font-mono">{year}</span>
            </div>

            <h3 className="text-xs font-semibold text-gray-800 mt-1.5">{card.title}</h3>
            <p className="text-[11px] text-gray-400 mb-3">{card.subtitle}</p>

            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-2xl font-bold text-gray-900">{available}</span>
                <span className="text-xs text-gray-400 font-medium ml-1">Available</span>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {used} / {card.key === "lop" ? "∞" : total} Used
              </span>
            </div>

            {/* Consumption Progress Bar */}
            {card.key !== "lop" && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${theme.bar} transition-all duration-300`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default LeaveBalanceCards;
