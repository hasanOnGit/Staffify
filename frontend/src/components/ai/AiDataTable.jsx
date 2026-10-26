import { useState, useMemo } from "react";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Table,
  LayoutGrid,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  X,
} from "lucide-react";
import aiService from "../../services/ai.service";
import toast from "react-hot-toast";

export default function AiDataTable({ records = [], columns = [], title = "Query Results" }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [viewMode, setViewMode] = useState("table");
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageSize = 5;

  if (!records || !records.length) return null;

  // Infer columns if not provided
  const cols = useMemo(() => {
    return columns.length
      ? columns
      : Object.keys(records[0] || {})
          .filter((k) => !["_id", "__v", "createdAt", "updatedAt"].includes(k))
          .map((k) => ({
            key: k,
            label: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
          }));
  }, [columns, records]);

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((row) =>
      cols.some((col) => {
        const val = row[col.key];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
      })
    );
  }, [records, cols, searchTerm]);

  // Sort records based on sortKey and sortDirection
  const sortedRecords = useMemo(() => {
    if (!sortKey) return filteredRecords;
    return [...filteredRecords].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      const numA = Number(String(valA).replace(/[^0-9.-]+/g, ""));
      const numB = Number(String(valB).replace(/[^0-9.-]+/g, ""));
      if (!isNaN(numA) && !isNaN(numB) && String(valA).match(/\d/) && String(valB).match(/\d/)) {
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }

      const comp = String(valA).localeCompare(String(valB));
      return sortDirection === "asc" ? comp : -comp;
    });
  }, [filteredRecords, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRecords = showAll ? sortedRecords : sortedRecords.slice(startIndex, startIndex + pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      await aiService.exportData(title.toLowerCase().replace(/\s+/g, "_"), records, cols);
      toast.success("CSV report downloaded successfully");
    } catch (err) {
      toast.error("Failed to export report: " + err.message);
    }
  };

  const handleCopyData = () => {
    try {
      const headerLine = cols.map((c) => c.label).join("\t");
      const dataLines = sortedRecords.map((r) =>
        cols.map((c) => (r[c.key] !== undefined && r[c.key] !== null ? String(r[c.key]) : "")).join("\t")
      );
      const clipboardText = [headerLine, ...dataLines].join("\n");
      navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      toast.success("Table data copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Unable to copy to clipboard: " + err.message);
    }
  };

  return (
    <div className="my-3 border border-[#DFE1E6] rounded-md overflow-hidden bg-white shadow-2xs">
      {/* Table Header Bar */}
      <div className="px-3 py-2 bg-[#F4F5F7] border-b border-[#DFE1E6] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#172B4D]">
          <Table size={13} className="text-[#0052CC]" />
          <span>{title}</span>
          <span className="text-[10px] text-[#6B778C] font-normal">
            ({filteredRecords.length} of {records.length} records)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Mode Toggle: Table vs Cards */}
          <div className="flex items-center border border-[#DFE1E6] rounded bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1 rounded cursor-pointer transition ${
                viewMode === "table" ? "bg-[#DEEBFF] text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
              title="Table View"
            >
              <Table size={12} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1 rounded cursor-pointer transition ${
                viewMode === "cards" ? "bg-[#DEEBFF] text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]"
              }`}
              title="Cards View"
            >
              <LayoutGrid size={12} />
            </button>
          </div>

          {/* Copy Data to Clipboard */}
          <button
            type="button"
            onClick={handleCopyData}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-[#DEEBFF]/30 border border-[#DFE1E6] text-[#42526E] rounded text-[11px] font-medium transition cursor-pointer"
            title="Copy data to clipboard"
          >
            {copied ? <Check size={11} className="text-[#00875A]" /> : <Copy size={11} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Export to CSV */}
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
      </div>

      {/* Quick Search Bar */}
      <div className="px-3 py-1.5 bg-[#FAFBFC] border-b border-[#DFE1E6] flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-2.5 top-2 text-[#6B778C]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filter records..."
            className="w-full pl-7 pr-6 py-1 text-[11px] bg-white border border-[#DFE1E6] rounded text-[#172B4D] placeholder-[#6B778C] focus:outline-none focus:border-[#0052CC]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-2 text-[#6B778C] hover:text-[#172B4D] cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="text-[10px] text-[#0052CC] hover:underline cursor-pointer font-medium"
        >
          {showAll ? "Show Pages" : "Show All"}
        </button>
      </div>

      {/* Main Content: Table or Cards View */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-[11px] text-[#172B4D]">
            <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6] text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">
              <tr>
                {cols.map((col, idx) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={idx}
                      onClick={() => handleSort(col.key)}
                      className="px-3 py-2 whitespace-nowrap cursor-pointer hover:bg-[#EBECF0]/60 transition select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ArrowUp size={11} className="text-[#0052CC]" />
                          ) : (
                            <ArrowDown size={11} className="text-[#0052CC]" />
                          )
                        ) : (
                          <ArrowUpDown size={10} className="text-[#A5ADBA] opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E6]">
              {visibleRecords.length === 0 ? (
                <tr>
                  <td colSpan={cols.length} className="px-3 py-6 text-center text-[11px] text-[#6B778C]">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                visibleRecords.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#F4F5F7] transition">
                    {cols.map((col, cIdx) => {
                      const val = row[col.key];
                      const isStatus =
                        col.key.toLowerCase().includes("status") && typeof val === "string";
                      return (
                        <td key={cIdx} className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate">
                          {isStatus ? (
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                val === "Active" || val === "Present" || val === "Approved" || val === "Hired"
                                  ? "bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]"
                                  : val === "Pending" || val === "Late" || val === "In Progress"
                                  ? "bg-[#FFFAE6] text-[#FF8B00] border border-[#FFE380]"
                                  : "bg-[#F4F5F7] text-[#42526E] border border-[#DFE1E6]"
                              }`}
                            >
                              {val}
                            </span>
                          ) : val !== undefined && val !== null ? (
                            String(val)
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
          {visibleRecords.map((row, rIdx) => (
            <div
              key={rIdx}
              className="p-2.5 rounded border border-[#DFE1E6] bg-[#FAFBFC] hover:bg-white hover:border-[#0052CC] transition text-[11px] space-y-1 shadow-2xs"
            >
              {cols.slice(0, 4).map((col, cIdx) => {
                const val = row[col.key];
                return (
                  <div key={cIdx} className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6B778C] text-[10px] font-medium">{col.label}:</span>
                    <span className="font-semibold text-[#172B4D] truncate max-w-[140px]">
                      {val !== undefined && val !== null ? String(val) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!showAll && totalPages > 1 && (
        <div className="px-3 py-1.5 bg-[#FAFBFC] border-t border-[#DFE1E6] flex items-center justify-between text-[11px] text-[#6B778C]">
          <span>
            Page {currentPage} of {totalPages} ({sortedRecords.length} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-[#EBECF0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-[#EBECF0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next page"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
