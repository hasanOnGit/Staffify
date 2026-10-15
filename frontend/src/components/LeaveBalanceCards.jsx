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
          badge: "bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]",
        };
      case "purple":
        return {
          border: "border-l-[#403294]",
          bar: "bg-[#403294]",
          badge: "bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2]",
        };
      case "rose":
        return {
          border: "border-l-[#DE350B]",
          bar: "bg-[#DE350B]",
          badge: "bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD]",
        };
      case "amber":
        return {
          border: "border-l-[#FF991F]",
          bar: "bg-[#FF991F]",
          badge: "bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380]",
        };
      default:
        return {
          border: "border-l-[#7A869A]",
          bar: "bg-[#7A869A]",
          badge: "bg-[#F4F5F7] text-[#172B4D] border border-[#DFE1E6]",
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
            className={`bg-white border border-[#DFE1E6] border-l-4 ${theme.border} rounded p-3.5`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${theme.badge}`}>
                {card.title.split(" ")[0]}
              </span>
              <span className="text-[11px] text-[#6B778C] font-mono">{year}</span>
            </div>

            <h3 className="text-xs font-semibold text-[#172B4D] mt-1">{card.title}</h3>
            <p className="text-[11px] text-[#6B778C] mb-2.5">{card.subtitle}</p>

            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xl font-bold text-[#172B4D]">{available}</span>
                <span className="text-[11px] text-[#6B778C] font-medium ml-1">Available</span>
              </div>
              <span className="text-[11px] font-medium text-[#6B778C]">
                {used} / {card.key === "lop" ? "-" : total} Used
              </span>
            </div>

            {/* Consumption Progress Bar */}
            {card.key !== "lop" && (
              <div className="w-full bg-[#F4F5F7] rounded-full h-1 overflow-hidden border border-[#DFE1E6]/50">
                <div
                  className={`h-1 rounded-full ${theme.bar} transition-all duration-300`}
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
