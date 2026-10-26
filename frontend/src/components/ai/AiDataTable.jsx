import { useState } from "react";
import { Download, ChevronLeft, ChevronRight, Table } from "lucide-react";
import aiService from "../../services/ai.service";
import toast from "react-hot-toast";

export default function AiDataTable({ records = [], columns = [], title = "Query Results" }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  if (!records || !records.length) return null;

  // Infer columns if not provided
  const cols = columns.length
    ? columns
    : Object.keys(records[0] || {})
        .filter((k) => !["_id", "__v", "createdAt", "updatedAt"].includes(k))
        .map((k) => ({
          key: k,
          label: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
        }));

  const totalPages = Math.ceil(records.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRecords = records.slice(startIndex, startIndex + pageSize);

  const handleExport = async () => {
    try {
      await aiService.exportData(title.toLowerCase().replace(/\s+/g, "_"), records, cols);
      toast.success("CSV report downloaded successfully");
    } catch (err) {
      toast.error("Failed to export report: " + err.message);
    }
  };

  return (
    <div className="my-3 border border-[#DFE1E6] rounded-md overflow-hidden bg-white shadow-2xs">
      {/* Table Header Bar */}
      <div className="px-3 py-2 bg-[#F4F5F7] border-b border-[#DFE1E6] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#172B4D]">
          <Table size={13} className="text-[#0052CC]" />
          <span>{title}</span>
          <span className="text-[10px] text-[#6B778C] font-normal">
            ({records.length} records)
          </span>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-[#DEEBFF]/30 border border-[#DFE1E6] text-[#0052CC] rounded text-[11px] font-medium transition cursor-pointer"
          title="Export records to CSV spreadsheet"
        >
          <Download size={11} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-left text-[11px] text-[#172B4D]">
          <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6] text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">
            <tr>
              {cols.map((col, idx) => (
                <th key={idx} className="px-3 py-2 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE1E6]">
            {visibleRecords.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[#F4F5F7] transition">
                {cols.map((col, cIdx) => {
                  const val = row[col.key];
                  return (
                    <td key={cIdx} className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate">
                      {val !== undefined && val !== null ? String(val) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-3 py-1.5 bg-[#FAFBFC] border-t border-[#DFE1E6] flex items-center justify-between text-[11px] text-[#6B778C]">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-[#EBECF0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-[#EBECF0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
