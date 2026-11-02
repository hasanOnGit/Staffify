/**
 * Staffify Enterprise Print & PDF Engine
 * 
 * Provides a universal, zero-popup-block printing and PDF export mechanism.
 * Uses an isolated, hidden iframe to trigger standard browser print dialogs
 * allowing users to print directly or select "Save as PDF" with 100% vector fidelity,
 * full color preservation, and standard A4 typography.
 */
import toast from "react-hot-toast";

/**
 * Standard CSS reset and styling injected into all printed documents
 */
const BASE_PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 12mm 15mm;
  }
  
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    line-height: 1.45;
    color: #172B4D;
    background: #FFFFFF !important;
    -webkit-font-smoothing: antialiased;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }

  .avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .print-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 8.5px;
    color: #6B778C;
    border-top: 1px solid #DFE1E6;
    padding-top: 4px;
    display: flex;
    justify-content: space-between;
  }
`;

/**
 * Prints HTML document using a sandboxed, hidden iframe.
 * Avoids browser popup blockers and guarantees clean execution.
 * 
 * @param {string} htmlContent - Full HTML string to print
 * @param {string} documentTitle - Window/print document title (used as default PDF filename)
 * @returns {Promise<boolean>}
 */
export const printHtmlDocument = (htmlContent, documentTitle = "Staffify Document") => {
  return new Promise((resolve) => {
    try {
      const loadingToast = toast.loading(`Preparing ${documentTitle}...`);

      // Create a hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      iframe.title = documentTitle;

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow || iframe.contentDocument;
      const targetDocument = doc.document || doc;

      // Inject standard print CSS if not already present
      let finalHtml = htmlContent;
      if (!finalHtml.includes("<style>")) {
        finalHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${documentTitle}</title>
              <style>${BASE_PRINT_CSS}</style>
            </head>
            <body>${finalHtml}</body>
          </html>
        `;
      } else if (!finalHtml.includes("-webkit-print-color-adjust")) {
        finalHtml = finalHtml.replace("<style>", `<style>${BASE_PRINT_CSS}`);
      }

      // Ensure document title is set so "Save as PDF" suggests clean filename
      if (finalHtml.includes("<title>")) {
        finalHtml = finalHtml.replace(/<title>.*?<\/title>/i, `<title>${documentTitle}</title>`);
      } else {
        finalHtml = finalHtml.replace("<head>", `<head><title>${documentTitle}</title>`);
      }

      targetDocument.open();
      targetDocument.write(finalHtml);
      targetDocument.close();

      // Give styles, web fonts, and images a moment to settle
      setTimeout(() => {
        toast.dismiss(loadingToast);
        
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          toast.success(`${documentTitle} ready to print or save as PDF!`);
          resolve(true);
        } catch (printErr) {
          console.error("Print execution error:", printErr);
          toast.error("Failed to open print dialog. Please try again.");
          resolve(false);
        } finally {
          // Clean up iframe after print dialog closes
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      }, 350);
    } catch (err) {
      console.error("Print preparation error:", err);
      toast.error("An error occurred while preparing the document.");
      resolve(false);
    }
  });
};

export default {
  printHtmlDocument,
};
