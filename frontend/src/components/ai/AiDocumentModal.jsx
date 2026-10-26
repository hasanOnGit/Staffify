import React, { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Copy,
  Check,
  Sparkles,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import aiService from "../../services/ai.service";
import toast from "react-hot-toast";

/**
 * Staffify Corporate HR Document Synthesis Modal
 * Generates and previews legally compliant corporate letters with 1-click print and export
 */
export default function AiDocumentModal({ isOpen, onClose, initialEmployeeId = "" }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("APPOINTMENT");
  const [employeeId, setEmployeeId] = useState(initialEmployeeId || "EMP001");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      aiService
        .getDocumentTemplates()
        .then((tmpl) => {
          if (tmpl && tmpl.length > 0) {
            setTemplates(tmpl);
            if (!selectedTemplate) setSelectedTemplate(tmpl[0].type);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      toast.error("Please provide an Employee ID");
      return;
    }
    setLoading(true);
    try {
      const doc = await aiService.generateDocument({
        templateType: selectedTemplate,
        employeeId: employeeId.trim(),
        effectiveDate,
      });
      setGeneratedDoc(doc);
      toast.success("HR document synthesized successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate document");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!generatedDoc?.htmlContent) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${generatedDoc.title} - ${generatedDoc.documentNumber}</title>
          <style>
            @media print {
              body { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          ${generatedDoc.htmlContent}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyText = () => {
    if (!generatedDoc?.textContent) return;
    navigator.clipboard.writeText(generatedDoc.textContent);
    setCopied(true);
    toast.success("Document text copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-surface w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-neutral-200 dark:border-dark-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-dark-border flex items-center justify-between bg-neutral-50 dark:bg-dark-surface">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>AI HR Document Synthesis</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Statutory Compliant
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Generate appointment, increment, relieving, and bonafide letters grounded on verified database records.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-dark-border transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar */}
          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-neutral-50 dark:bg-dark-bg p-4 rounded-xl border border-neutral-200 dark:border-dark-border">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Document Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full text-xs rounded-lg border border-neutral-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="APPOINTMENT">Appointment Letter</option>
                <option value="INCREMENT">Salary Increment Letter</option>
                <option value="BONAFIDE">Bonafide Work Certificate</option>
                <option value="RELIEVING">Relieving & Experience Letter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Employee Identifier
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. EMP001"
                  className="w-full text-xs rounded-lg border border-neutral-300 dark:border-dark-border bg-white dark:bg-dark-surface pl-9 pr-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Effective Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-300 dark:border-dark-border bg-white dark:bg-dark-surface pl-9 pr-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? "Synthesizing..." : "Generate Letter"}</span>
              </button>
            </div>
          </form>

          {/* Document Preview Pane */}
          {generatedDoc ? (
            <div className="space-y-4">
              {/* Document Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Reference: <strong className="font-mono">{generatedDoc.documentNumber}</strong>
                  </span>
                  <span>•</span>
                  <span>Recipient: <strong>{generatedDoc.recipientName}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyText}
                    type="button"
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    type="button"
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Letter</span>
                  </button>
                </div>
              </div>

              {/* Printable HTML Container */}
              <div className="border border-neutral-200 dark:border-dark-border rounded-xl p-6 bg-white shadow-inner max-h-[480px] overflow-y-auto">
                <div
                  dangerouslySetInnerHTML={{ __html: generatedDoc.htmlContent }}
                  className="prose prose-sm max-w-none text-neutral-800"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-dark-border rounded-xl">
              <Building2 className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No Document Generated Yet
              </h4>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Select a template above and specify an employee ID to synthesize an official corporate document grounded in live HR data.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-dark-border flex items-center justify-between bg-neutral-50 dark:bg-dark-surface text-xs text-neutral-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Staffify Indian Labor Code Statutory Standard Grounding</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-neutral-200 dark:border-dark-border hover:bg-neutral-100 dark:hover:bg-dark-border text-neutral-700 dark:text-neutral-300 font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
