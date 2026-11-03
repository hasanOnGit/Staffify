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
          border: "border-l-[#0052CC]",
          bar: "bg-[#0052CC]",
          badge: "bg-[#DEEBFF] dark:bg-[#1C2536] text-[#0052CC] dark:text-[#579DFF] border border-[#B3D4FF] dark:border-[#263042]",
        };
      case "purple":
        return {
          border: "border-l-[#403294]",
          bar: "bg-[#403294]",
          badge: "bg-[#EAE6FF] dark:bg-purple-950/40 text-[#403294] dark:text-purple-300 border border-[#C0B6F2] dark:border-purple-800",
        };
      case "rose":
        return {
          border: "border-l-[#DE350B]",
          bar: "bg-[#DE350B]",
          badge: "bg-[#FFEBE6] dark:bg-rose-950/40 text-[#DE350B] dark:text-rose-400 border border-[#FFBDAD] dark:border-rose-800",
        };
      case "amber":
        return {
          border: "border-l-[#FF991F]",
          bar: "bg-[#FF991F]",
          badge: "bg-[#FFF0B3] dark:bg-amber-950/40 text-[#172B4D] dark:text-amber-300 border border-[#FFE380] dark:border-amber-800",
        };
      default:
        return {
          border: "border-l-[#7A869A]",
          bar: "bg-[#7A869A]",
          badge: "bg-[#F4F5F7] dark:bg-[#1C2536] text-[#172B4D] dark:text-[#CBD5E1] border border-[#DFE1E6] dark:border-[#263042]",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card) => {
        const theme = getColorClasses(card.color);
        const { total, used, available } = card.data;
        const percentUsed = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

        return (
          <div
            key={card.key}
            className={`bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] border-l-4 ${theme.border} rounded-xl p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-smooth`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${theme.badge}`}>
                {card.title.split(" ")[0]}
              </span>
              <span className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] font-mono">{year}</span>
            </div>

            <h3 className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] mt-1.5">{card.title}</h3>
            <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] mb-2.5 truncate">{card.subtitle}</p>

            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9]">{available}</span>
                <span className="text-[11px] text-[#6B778C] dark:text-[#94A3B8] font-medium ml-1">Available</span>
              </div>
              <span className="text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8]">
                {used} / {card.key === "lop" ? "-" : total} Used ({percentUsed}%)
              </span>
            </div>

            {/* Consumption Progress Bar */}
            {card.key !== "lop" && (
              <div className="w-full bg-[#F4F5F7] dark:bg-[#1C2536] rounded-full h-1.5 overflow-hidden border border-[#DFE1E6]/50 dark:border-[#263042]/60">
                <div
                  className={`h-full rounded-full ${theme.bar} transition-all duration-500`}
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
