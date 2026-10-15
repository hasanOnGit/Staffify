import { useState, useEffect } from "react";
import { Laptop, X, Check, RotateCcw, UserPlus } from "lucide-react";

function AssetModal({
  isOpen,
  onClose,
  onSaveAsset,
  onAllocate,
  onReturn,
  employees = [],
  asset = null,
  mode = "create", // "create" | "allocate" | "return"
}) {
  // Create mode state
  const [assetTag, setAssetTag] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Laptop");
  const [serialNumber, setSerialNumber] = useState("");
  const [model, setModel] = useState("");
  const [specification, setSpecification] = useState("");
  const [condition, setCondition] = useState("Brand New");
  const [purchaseValue, setPurchaseValue] = useState("");

  // Allocate mode state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  // Return mode state
  const [returnCondition, setReturnCondition] = useState("Good");
  const [returnNotes, setReturnNotes] = useState("");

  useEffect(() => {
    if (mode === "create") {
      const randomTag = `AST-${Math.floor(1000 + Math.random() * 9000)}`;
      setAssetTag(randomTag);
      setName("");
      setCategory("Laptop");
      setSerialNumber("");
      setModel("");
      setSpecification("");
      setCondition("Brand New");
      setPurchaseValue("");
    } else if (mode === "allocate") {
      if (employees.length > 0) {
        setSelectedEmployeeId(employees[0].employeeId);
      }
    } else if (mode === "return") {
      setReturnCondition("Good");
      setReturnNotes("");
    }
  }, [isOpen, mode, asset, employees]);

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
    if (!assetTag || !name) return;

    onSaveAsset({
      assetTag,
      name,
      category,
      serialNumber,
      model,
      specification,
      condition,
      purchaseValue: Number(purchaseValue) || 0,
    });
  };

  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    if (!asset || !selectedEmployeeId) return;

    onAllocate({
      assetTag: asset.assetTag,
      employeeId: selectedEmployeeId,
    });
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!asset) return;

    onReturn({
      assetTag: asset.assetTag,
      condition: returnCondition,
      notes: returnNotes,
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
            <div className="w-6 h-6 rounded bg-[#0052CC] text-white flex items-center justify-center">
              <Laptop size={14} />
            </div>
            <div>
              <h3 className="font-bold text-[#172B4D] text-sm">
                {mode === "create"
                  ? "Register New Hardware Asset"
                  : mode === "allocate"
                  ? `Allocate Asset: ${asset?.assetTag}`
                  : `Return Asset: ${asset?.assetTag}`}
              </h3>
              <p className="text-[11px] text-[#6B778C]">
                {mode === "create"
                  ? "Add equipment to organizational IT asset inventory"
                  : asset?.name}
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

        {/* Modal Form Body */}
        {mode === "create" && (
          <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Asset Tag <span className="text-[#DE350B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Category <span className="text-[#DE350B]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Mobile Device">Mobile Device</option>
                  <option value="Access Badge">Access Badge</option>
                  <option value="License">Software License</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Asset Name / Description <span className="text-[#DE350B]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder='e.g. MacBook Pro 16" M3 Max or Dell 27" 4K Monitor'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  placeholder="Hardware serial..."
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Make / Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apple / Dell U2723QE"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Initial Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#172B4D] block mb-1">
                  Purchase Value (INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={purchaseValue}
                  onChange={(e) => setPurchaseValue(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Technical Specifications
              </label>
              <textarea
                rows={2}
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                placeholder="RAM, Processor, Storage capacity, Port details..."
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] resize-none"
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
                Save Asset
              </button>
            </div>
          </form>
        )}

        {mode === "allocate" && (
          <form onSubmit={handleAllocateSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            <div className="p-3 bg-[#FAFBFC] border border-[#EBECF0] rounded space-y-1">
              <span className="font-bold text-[#172B4D]">{asset?.name}</span>
              <p className="text-[11px] text-[#6B778C]">
                Tag: <strong>{asset?.assetTag}</strong> • Serial: {asset?.serialNumber || "N/A"}
              </p>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Select Assignee (Employee) <span className="text-[#DE350B]">*</span>
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC] bg-white font-medium"
              >
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId} • {emp.department})
                  </option>
                ))}
              </select>
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
                className="px-4 py-1.5 bg-[#00875A] hover:bg-[#006644] text-white font-medium rounded text-xs transition shadow-sm cursor-pointer"
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        )}

        {mode === "return" && (
          <form onSubmit={handleReturnSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            <div className="p-3 bg-[#FAFBFC] border border-[#EBECF0] rounded space-y-1">
              <span className="font-bold text-[#172B4D]">{asset?.name}</span>
              <p className="text-[11px] text-[#6B778C]">
                Currently held by: <strong>{asset?.allocatedToName}</strong> ({asset?.allocatedToId})
              </p>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Handover Condition Inspection <span className="text-[#DE350B]">*</span>
              </label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] bg-white font-medium"
              >
                <option value="Good">Good (Working fine with standard wear)</option>
                <option value="Fair">Fair (Cosmetic scratches)</option>
                <option value="Needs Repair">Needs Repair (Screen cracked / Battery degraded)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#172B4D] block mb-1">
                Handover / Inspection Notes
              </label>
              <textarea
                rows={2}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Inspected power adapter, clean OS reinstall completed..."
                className="w-full px-3 py-1.5 border border-[#DFE1E6] rounded text-[#172B4D] resize-none"
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
                Complete Return
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AssetModal;
