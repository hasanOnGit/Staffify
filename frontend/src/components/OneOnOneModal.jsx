import { useState, useEffect } from "react";
import { MessageSquare, Calendar, CheckSquare, Plus, Trash2, X, User } from "lucide-react";

function OneOnOneModal({ isOpen, onClose, onSave, currentUser, initialData }) {
  const [meetingDate, setMeetingDate] = useState("");
  const [feedbackType, setFeedbackType] = useState("Growth & Career Check-in");
  const [talkingPoints, setTalkingPoints] = useState("");
  const [actionItems, setActionItems] = useState([
    { text: "Follow up on Sprint milestones", isCompleted: false },
  ]);
  const [newActionItemText, setNewActionItemText] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [designation, setDesignation] = useState("");

  useEffect(() => {
    if (initialData) {
      setMeetingDate(initialData.meetingDate || new Date().toISOString().split("T")[0]);
      setFeedbackType(initialData.feedbackType || "Growth & Career Check-in");
      setTalkingPoints(initialData.talkingPoints || "");
      setActionItems(initialData.actionItems || []);
      setEmployeeId(initialData.employeeId || currentUser?.employeeId || "");
      setEmployeeName(initialData.employeeName || currentUser?.name || "");
      setDesignation(initialData.designation || currentUser?.designation || "");
    } else {
      setMeetingDate(new Date().toISOString().split("T")[0]);
      setFeedbackType("Growth & Career Check-in");
      setTalkingPoints("");
      setActionItems([]);
      setEmployeeId(currentUser?.employeeId || "");
      setEmployeeName(currentUser?.name || "");
      setDesignation(currentUser?.designation || "Software Engineer");
    }
  }, [initialData, currentUser, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddActionItem = () => {
    if (!newActionItemText.trim()) return;
    setActionItems([...actionItems, { text: newActionItemText.trim(), isCompleted: false }]);
    setNewActionItemText("");
  };

  const handleRemoveActionItem = (index) => {
    setActionItems(actionItems.filter((_, idx) => idx !== index));
  };

  const handleToggleActionItem = (index) => {
    const updated = [...actionItems];
    updated[index].isCompleted = !updated[index].isCompleted;
    setActionItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!meetingDate) return;

    onSave({
      employeeId,
      employeeName,
      managerId: currentUser?.employeeId || currentUser?.userId || "",
      managerName: currentUser?.name || "Manager",
      meetingDate,
      talkingPoints,
      actionItems,
      feedbackType,
      status: "Completed",
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#6554C0] text-white flex items-center justify-center">
              <MessageSquare size={14} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm">
                1-on-1 Continuous Feedback & Check-in
              </h3>
              <p className="text-[11px] text-[#6B778C]">
                Structured career synchronization and actionable next steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Employee & Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">Employee</label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F5F7] border border-[#DFE1E6] rounded text-[#172B4D]">
                <User size={13} className="text-[#6B778C]" />
                <span className="font-medium truncate">{employeeName || "Self"}</span>
                <span className="text-[10px] text-[#6B778C] ml-auto">({employeeId || "EMP"})</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Meeting Date <span className="text-[#DE350B]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Feedback Type */}
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">
              Feedback Discussion Type
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
            >
              <option value="Growth & Career Check-in">Growth & Career Check-in</option>
              <option value="Quarterly Goal Alignment">Quarterly Goal Alignment</option>
              <option value="Recognition & Praise">Recognition & Praise</option>
              <option value="Performance Guidance">Performance Guidance</option>
            </select>
          </div>

          {/* Talking Points */}
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1">
              Discussion Notes & Key Takeaways
            </label>
            <textarea
              rows={4}
              value={talkingPoints}
              onChange={(e) => setTalkingPoints(e.target.value)}
              placeholder="Record notes on sprint performance, challenges, or architectural goals discussed..."
              className="w-full px-3 py-2 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] placeholder:text-[#A5ADBA] leading-relaxed resize-none"
            />
          </div>

          {/* Action Items Checklist */}
          <div>
            <label className="font-semibold text-[#172B4D] block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckSquare size={13} className="text-[#0052CC]" />
                Action Items & Commitments ({actionItems.length})
              </span>
            </label>

            {/* Input to add new item */}
            <div className="flex items-center gap-2 mb-2.5">
              <input
                type="text"
                value={newActionItemText}
                onChange={(e) => setNewActionItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddActionItem();
                  }
                }}
                placeholder="Add actionable follow-up task and press Enter..."
                className="flex-1 px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-xs placeholder:text-[#A5ADBA]"
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3 py-1.5 bg-[#EBECF0] hover:bg-[#DFE1E6] text-[#172B4D] font-semibold rounded text-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                Add
              </button>
            </div>

            {/* Action items list */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {actionItems.length === 0 ? (
                <p className="text-[11px] text-[#8993A4] italic py-1">
                  No action items added yet. Add commitments above.
                </p>
              ) : (
                actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded bg-[#FAFBFC] border border-[#EBECF0] hover:border-[#DFE1E6] transition"
                  >
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => handleToggleActionItem(idx)}
                        className="rounded border-[#DFE1E6] text-[#0052CC] focus:ring-[#0052CC] cursor-pointer"
                      />
                      <span
                        className={`text-xs ${
                          item.isCompleted
                            ? "line-through text-[#6B778C]"
                            : "text-[#172B4D] font-medium"
                        }`}
                      >
                        {item.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(idx)}
                      className="text-[#6B778C] hover:text-[#DE350B] p-1 rounded transition cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sticky Form Action Footer */}
          <div className="pt-3 border-t border-[#DFE1E6] flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#42526E] font-medium rounded text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition shadow-sm cursor-pointer"
            >
              Save Check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OneOnOneModal;
