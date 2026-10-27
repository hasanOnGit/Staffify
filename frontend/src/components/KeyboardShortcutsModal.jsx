import { useEffect } from "react";
import { Keyboard, X, Navigation, Sliders, Zap } from "lucide-react";

function KeyboardShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: "Global Controls",
      icon: Sliders,
      items: [
        { keys: ["Ctrl / ⌘", "K"], description: "Open Command Palette" },
        { keys: ["?"], description: "Show Keyboard Shortcuts Cheat Sheet" },
        { keys: ["D"], description: "Toggle Dark / Light Obsidian Mode" },
        { keys: ["Esc"], description: "Close Active Modal, Drawer, or Palette" },
      ],
    },
    {
      title: "Quick Navigation (Press 'G' then Key)",
      icon: Navigation,
      items: [
        { keys: ["G", "D"], description: "Navigate to Dashboard" },
        { keys: ["G", "E"], description: "Navigate to Employee Directory" },
        { keys: ["G", "A"], description: "Navigate to Attendance Ledger" },
        { keys: ["G", "L"], description: "Navigate to Leave Management" },
        { keys: ["G", "P"], description: "Navigate to Payroll & Compensation" },
        { keys: ["G", "T"], description: "Navigate to Squads & Teams" },
        { keys: ["G", "W"], description: "Navigate to Webhook Bridge" },
        { keys: ["G", "U"], description: "Navigate to Audit Governance Log" },
      ],
    },
    {
      title: "Tactile Shortcuts",
      icon: Zap,
      items: [
        { keys: ["Alt", "P"], description: "Quick Clock-In / Clock-Out" },
        { keys: ["Alt", "L"], description: "Open Leave Application Form" },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#101520]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DEEBFF] dark:bg-[#0747A6]/30 text-[#0052CC] dark:text-[#38BDF8] flex items-center justify-center">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Keyboard Shortcuts & Quick Navigation
              </h2>
              <p className="text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
                Enterprise power navigation hotkeys for Staffify
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#6B778C] hover:text-[#172B4D] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] hover:bg-[#EBECF0] dark:hover:bg-[#1E293B] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {shortcutGroups.map((group, gIdx) => {
            const GroupIcon = group.icon;
            return (
              <div key={gIdx} className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B778C] dark:text-[#94A3B8] uppercase tracking-wider">
                  <GroupIcon size={13} className="text-[#0052CC] dark:text-[#38BDF8]" />
                  <span>{group.title}</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 bg-[#F4F5F7] dark:bg-[#0D121B] p-2 rounded-lg border border-[#EBECF0] dark:border-[#1E293B]">
                  {group.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-white dark:hover:bg-[#151B26] transition-colors"
                    >
                      <span className="text-[#172B4D] dark:text-[#E2E8F0] font-medium">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-0.5 text-[11px] font-mono font-semibold text-[#172B4D] dark:text-[#F1F5F9] bg-white dark:bg-[#1E293B] border border-[#DFE1E6] dark:border-[#334155] rounded shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#DFE1E6] dark:border-[#263042] bg-[#FAFBFC] dark:bg-[#101520] flex items-center justify-between text-[11px] text-[#6B778C] dark:text-[#94A3B8]">
          <span>Tip: Press <kbd className="font-mono font-bold text-[#172B4D] dark:text-white">?</kbd> anywhere outside text inputs to toggle this cheatsheet</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white dark:bg-[#1E293B] border border-[#DFE1E6] dark:border-[#334155] rounded font-semibold text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#F4F5F7] dark:hover:bg-[#334155] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;
