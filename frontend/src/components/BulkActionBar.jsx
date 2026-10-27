import { CheckSquare, X } from "lucide-react";

function BulkActionBar({
  selectedCount = 0,
  onClear = () => {},
  actions = [],
  itemLabel = "items",
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[92vw] animate-page-enter">
      <div className="bg-[#172B4D] dark:bg-[#1E293B] text-white border border-[#263042] dark:border-[#334155] rounded-xl shadow-2xl px-4 py-2.5 flex items-center gap-3 sm:gap-4 flex-wrap backdrop-blur-md">
        {/* Count Badge */}
        <div className="flex items-center gap-2 border-r border-white/20 pr-3 sm:pr-4">
          <div className="w-6 h-6 rounded-md bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs">
            {selectedCount}
          </div>
          <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">
            {selectedCount} {itemLabel} selected
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            const isDanger = act.variant === "danger";
            const isSuccess = act.variant === "success";

            return (
              <button
                key={idx}
                onClick={act.onClick}
                disabled={act.disabled || act.loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                  isSuccess
                    ? "bg-[#00875A] hover:bg-[#006644] text-white shadow-xs"
                    : isDanger
                    ? "bg-[#DE350B] hover:bg-[#BF2600] text-white shadow-xs"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
                title={act.tooltip || act.label}
              >
                {Icon && <Icon size={14} className={act.loading ? "animate-spin" : ""} />}
                <span>{act.label}</span>
              </button>
            );
          })}

          {/* Deselect All */}
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-slate-300 hover:text-white text-xs px-2 py-1.5 rounded hover:bg-white/10 transition-colors ml-1"
            title="Deselect all"
          >
            <X size={14} />
            <span className="hidden sm:inline">Deselect</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkActionBar;
