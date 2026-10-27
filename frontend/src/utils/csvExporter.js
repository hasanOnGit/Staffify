import toast from "react-hot-toast";

/**
 * Universal CSV Exporter for Staffify Enterprise
 * Formats structured records into standard RFC-4180 CSV with UTF-8 BOM.
 */
export const exportToCsv = ({ filename = "staffify_export.csv", headers = [], data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    toast.error("No records available to export.");
    return;
  }

  // Header row
  const headerLabels = headers.map((h) => `"${(h.label || h.key).replace(/"/g, '""')}"`).join(",");

  // Data rows
  const rows = data.map((item) => {
    return headers
      .map((h) => {
        let val = typeof h.accessor === "function" ? h.accessor(item) : item[h.key];
        if (val === null || val === undefined) val = "";
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(",");
  });

  const csvContent = "\uFEFF" + [headerLabels, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`Exported ${data.length} records to CSV`);
};
