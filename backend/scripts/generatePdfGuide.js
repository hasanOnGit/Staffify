/**
 * Staffify Enterprise PDF Guide Generator
 * Converts STAFFIFY_E2E_USER_GUIDE.md into a publication-grade,
 * vector-crisp A4 PDF document with embedded high-resolution screenshots.
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const DOCS_DIR = path.resolve(__dirname, "../../docs");
const MD_PATH = path.join(DOCS_DIR, "STAFFIFY_E2E_USER_GUIDE.md");
const HTML_PATH = path.join(DOCS_DIR, "Staffify_Enterprise_E2E_Guide.html");
const PDF_PATH = path.join(DOCS_DIR, "Staffify_Enterprise_E2E_Guide.pdf");

// Helper to convert Markdown to styled HTML
function markdownToHtml(md) {
  let html = md;

  // Convert markdown tables
  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableMatch) => {
    const lines = tableMatch.trim().split("\n").map((l) => l.trim());
    if (lines.length < 2) return tableMatch;

    const parseRow = (line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
    const headerCells = parseRow(lines[0]);
    const isSeparator = lines[1].includes("---");
    const dataRows = (isSeparator ? lines.slice(2) : lines.slice(1)).map(parseRow);

    let tableHtml = `<div class="table-container"><table><thead><tr>`;
    headerCells.forEach((cell) => {
      tableHtml += `<th>${cell}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;
    dataRows.forEach((row) => {
      tableHtml += `<tr>`;
      row.forEach((cell) => {
        tableHtml += `<td>${cell}</td>`;
      });
      tableHtml += `</tr>`;
    });
    tableHtml += `</tbody></table></div>`;
    return tableHtml;
  });

  // Convert code blocks
  html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert image references to local relative image paths
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, imgPath) => {
    return `
      <figure class="screenshot-figure">
        <img src="${imgPath}" alt="${escapeHtml(alt)}" />
        <figcaption>Figure: ${escapeHtml(alt)}</figcaption>
      </figure>
    `;
  });

  // Convert Headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Convert bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Convert bullet lists
  html = html.replace(/(?:^-\s+(.+)$\n?)+/gim, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^-\s+/, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Convert horizontal rules
  html = html.replace(/^---$/gim, "<hr />");

  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert paragraphs
  html = html
    .split("\n\n")
    .map((chunk) => {
      chunk = chunk.trim();
      if (!chunk) return "";
      if (
        chunk.startsWith("<h") ||
        chunk.startsWith("<pre") ||
        chunk.startsWith("<div") ||
        chunk.startsWith("<figure") ||
        chunk.startsWith("<ul") ||
        chunk.startsWith("<hr")
      ) {
        return chunk;
      }
      return `<p>${chunk.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n\n");

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function generatePdf() {
  console.log("==================================================");
  console.log("STAFFIFY PUBLICATION-GRADE PDF GENERATOR");
  console.log("==================================================");
  console.log(`Reading: ${MD_PATH}`);

  if (!fs.existsSync(MD_PATH)) {
    console.error("Markdown guide file not found!");
    process.exit(1);
  }

  const mdContent = fs.readFileSync(MD_PATH, "utf-8");
  const bodyHtml = markdownToHtml(mdContent);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Staffify Enterprise End-to-End System Guide</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 20mm 15mm 22mm 15mm;
      }

      *, *::before, *::after {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 9.5pt;
        line-height: 1.55;
        color: #172B4D;
        background: #FFFFFF;
        margin: 0;
        padding: 0;
      }

      h1 {
        color: #0052CC;
        font-size: 20pt;
        font-weight: 800;
        border-bottom: 2.5px solid #0052CC;
        padding-bottom: 8px;
        margin-top: 24pt;
        margin-bottom: 14pt;
        page-break-after: avoid;
      }

      h2 {
        color: #0747A6;
        font-size: 14pt;
        font-weight: 700;
        border-bottom: 1px solid #DFE1E6;
        padding-bottom: 4px;
        margin-top: 20pt;
        margin-bottom: 10pt;
        page-break-after: avoid;
      }

      h3 {
        color: #172B4D;
        font-size: 11pt;
        font-weight: 700;
        margin-top: 14pt;
        margin-bottom: 6pt;
        page-break-after: avoid;
      }

      p {
        margin-top: 0;
        margin-bottom: 8pt;
      }

      ul, ol {
        margin-top: 0;
        margin-bottom: 8pt;
        padding-left: 18pt;
      }

      li {
        margin-bottom: 3pt;
      }

      hr {
        border: 0;
        border-top: 1px solid #DFE1E6;
        margin: 16pt 0;
      }

      code {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 8.5pt;
        background: #F4F5F7;
        border: 1px solid #DFE1E6;
        padding: 1px 4px;
        border-radius: 3px;
        color: #0747A6;
      }

      pre {
        background: #091E42;
        color: #F4F5F7;
        padding: 10pt 12pt;
        border-radius: 5px;
        font-size: 8.5pt;
        line-height: 1.4;
        overflow-x: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 10pt 0;
        page-break-inside: avoid;
      }

      pre code {
        background: transparent;
        border: none;
        color: #F4F5F7;
        padding: 0;
      }

      .table-container {
        margin: 10pt 0;
        page-break-inside: avoid;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 8.5pt;
      }

      th {
        background: #0052CC;
        color: #FFFFFF;
        text-align: left;
        padding: 6pt 8pt;
        font-weight: 700;
        border: 1px solid #0052CC;
      }

      td {
        padding: 5pt 8pt;
        border: 1px solid #DFE1E6;
        vertical-align: top;
      }

      tr:nth-child(even) td {
        background: #FAFBFC;
      }

      .screenshot-figure {
        margin: 14pt 0;
        text-align: center;
        page-break-inside: avoid;
      }

      .screenshot-figure img {
        width: 100%;
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        border: 1px solid #DFE1E6;
        box-shadow: 0 1px 3px rgba(9, 30, 66, 0.08);
      }

      figcaption {
        font-size: 8pt;
        font-weight: 600;
        color: #6B778C;
        margin-top: 4pt;
        text-align: center;
      }

      a {
        color: #0052CC;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`;

  fs.writeFileSync(HTML_PATH, fullHtml, "utf-8");
  console.log(`Generated HTML at: ${HTML_PATH}`);

  console.log("Launching headless browser to compile PDF document...");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--allow-file-access-from-files",
    ],
  });

  const page = await browser.newPage();
  console.log(`Loading file://${HTML_PATH}...`);
  await page.goto("file://" + HTML_PATH, { waitUntil: "load", timeout: 60000 });

  console.log(`Exporting PDF to: ${PDF_PATH}...`);
  await page.pdf({
    path: PDF_PATH,
    format: "A4",
    printBackground: true,
    margin: {
      top: "16mm",
      bottom: "18mm",
      left: "14mm",
      right: "14mm",
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 8pt; color: #6B778C; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; font-family: sans-serif;">
        <span>Staffify Enterprise E2E Operational Guide</span>
        <span>Confidential & Proprietary</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 8pt; color: #6B778C; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; font-family: sans-serif;">
        <span>Staffify HRMS v2.4.0</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });

  await browser.close();

  const stats = fs.statSync(PDF_PATH);
  console.log(`\nPDF generated successfully!`);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Location: ${PDF_PATH}\n`);
}

generatePdf().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
