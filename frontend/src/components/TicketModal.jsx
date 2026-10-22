import { useState, useEffect } from "react";
import {
  LifeBuoy,
  X,
  Send,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Tag,
  ShieldAlert,
} from "lucide-react";

function TicketModal({
  isOpen,
  onClose,
  onSave,
  onAddComment,
  onUpdateStatus,
  currentUser,
  ticket = null,
  mode = "create", // "create" | "view"
  canManage = false,
}) {
  // Create mode state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT Hardware & Software");
  const [priority, setPriority] = useState("Medium");

  // View mode state
  const [newComment, setNewComment] = useState("");
  const [status, setStatus] = useState("Open");
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    if (mode === "view" && ticket) {
      setStatus(ticket.status || "Open");
      setResolutionNote(ticket.resolutionNote || "");
      setNewComment("");
    } else {
      setTitle("");
      setDescription("");
      setCategory("IT Hardware & Software");
      setPriority("Medium");
      setNewComment("");
    }
  }, [isOpen, ticket, mode]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSave({
      title,
      description,
      category,
      priority,
      requesterId: currentUser?.employeeId,
      requesterName: currentUser?.name,
      department: currentUser?.department,
    });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !ticket) return;

    onAddComment(ticket.ticketId, {
      authorId: currentUser?.employeeId,
      authorName: currentUser?.name,
      authorRole: currentUser?.role,
      message: newComment.trim(),
    });
    setNewComment("");
  };

  const handleStatusUpdate = () => {
    if (!ticket) return;
    onUpdateStatus(ticket.ticketId, {
      status,
      resolutionNote,
      assignedToId: currentUser?.employeeId,
      assignedToName: currentUser?.name,
    });
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case "Critical":
        return "bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]";
      case "High":
        return "bg-[#FFF0B3] text-[#974F0C] border-[#FFE380]";
      case "Medium":
        return "bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]";
      case "Low":
      default:
        return "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]";
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl border border-[#DFE1E6] w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-5 py-3.5 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center">
              <LifeBuoy size={14} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm">
                {mode === "create" ? "Raise Support Ticket" : `Ticket: ${ticket?.ticketId}`}
              </h3>
              <p className="text-[11px] text-[#6B778C]">
                {mode === "create"
                  ? "Staffify Helpdesk enterprise incident & query management"
                  : ticket?.title}
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

        {/* Modal Body */}
        {mode === "create" ? (
          <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Summary / Issue Title <span className="text-[#DE350B]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Brief summary of the issue or requirement..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Service Category <span className="text-[#DE350B]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                >
                  <option value="IT Hardware & Software">IT Hardware & Software</option>
                  <option value="HR Operations">HR Operations</option>
                  <option value="Payroll & Taxes">Payroll & Taxes</option>
                  <option value="Facilities & Workplace">Facilities & Workplace</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Urgency / Priority <span className="text-[#DE350B]">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                >
                  <option value="Low">Low - Informational query</option>
                  <option value="Medium">Medium - Normal workflow</option>
                  <option value="High">High - Impeding daily work</option>
                  <option value="Critical">Critical - Production outage / Blocker</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Detailed Description <span className="text-[#DE350B]">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide complete steps to reproduce, error codes, hardware serial numbers, or tax year details..."
                className="w-full px-3 py-2 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] placeholder:text-[#A5ADBA] leading-relaxed resize-none"
              />
            </div>

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
                Submit Ticket
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* Meta summary card */}
            <div className="p-3 bg-[#FAFBFC] border border-[#EBECF0] rounded-md space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#172B4D]">{ticket?.category}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(
                      ticket?.priority
                    )}`}
                  >
                    {ticket?.priority} Priority
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#6B778C]">Status:</span>
                  {canManage ? (
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="px-2 py-1 border border-[#DFE1E6] rounded bg-white font-semibold text-[#172B4D]"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded font-bold bg-[#DEEBFF] text-[#0747A6]">
                      {ticket?.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[#172B4D] leading-relaxed pt-1">
                {ticket?.description}
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#6B778C] pt-2 border-t border-[#EBECF0]">
                <span>
                  <strong>Requester:</strong> {ticket?.requesterName} ({ticket?.requesterId})
                </span>
                <span>•</span>
                <span>
                  <strong>Assigned Agent:</strong> {ticket?.assignedToName || "Unassigned"}
                </span>
              </div>
            </div>

            {/* Manager resolution controls */}
            {canManage && (
              <div className="p-3 bg-white border border-[#DFE1E6] rounded-md space-y-2">
                <label className="font-bold text-[#172B4D] block uppercase tracking-wider text-[10px]">
                  Agent Resolution Notes
                </label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Record resolution steps or troubleshooting steps completed..."
                  className="w-full px-2.5 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] text-xs resize-none"
                />
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  className="px-3 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition cursor-pointer"
                >
                  Save Status & Resolution
                </button>
              </div>
            )}

            {/* Comments Thread */}
            <div>
              <span className="font-bold text-[#172B4D] block uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-[#0052CC]" />
                Activity Stream & Communication ({ticket?.comments?.length || 0})
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ticket?.comments?.length === 0 ? (
                  <p className="text-[#8993A4] italic text-[11px]">No activity comments recorded yet.</p>
                ) : (
                  ticket?.comments?.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-[#FAFBFC] border border-[#EBECF0] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#172B4D]">{c.authorName}</span>
                        <span className="text-[#6B778C] text-[10px]">
                          {c.createdAt ? new Date(c.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                        </span>
                      </div>
                      <p className="text-xs text-[#172B4D] leading-relaxed">{c.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment box */}
              <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a message or update on this ticket..."
                  className="flex-1 px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] text-xs"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium rounded text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Send size={12} />
                  Reply
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketModal;
