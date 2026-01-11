/* eslint-disable prefer-const */
import { jsPDF } from "jspdf";

function saveTextAsPdf(filename: string, content: string) {
  const doc = new jsPDF({ unit: "mm", format: "legal" });

  // List of all headings
  const sectionHeadings = [
    "WEBSHIELD SECURITY SCAN REPORT",
    "Scan Information",
    "AI Security Analysis",
    "Raw Scan Results",
    "END OF REPORT"
  ];
  const forceStartOnNewPage = new Set([
    "AI Security Analysis",
    "Raw Scan Results",
    "END OF REPORT"
  ]);

  const fontSize = 12;
  const headingSize = 15;
  const leftMargin = 20;
  const topMargin = 20;
  const pageWidth = doc.internal.pageSize.getWidth() - leftMargin * 2;
  const lineHeight = fontSize * 1.0;

  let cursorY = topMargin;
  let firstPage = true;

  function drawSeparator() {
    doc.setDrawColor(60);
    doc.setLineWidth(0.6);
    doc.line(leftMargin, cursorY, leftMargin + pageWidth, cursorY);
    cursorY += lineHeight * 0.4;
  }

  const rawLines = content.replace(/\n{3,}/g, '\n\n').trim().split("\n");

  for (let origLine of rawLines) {
    const trimmedLine = origLine.trim();
    const isHeading = sectionHeadings.includes(trimmedLine);
    const isSep = /^=+$/.test(trimmedLine);

    if (isSep) {
      drawSeparator();
      continue;
    }

    if (isHeading && forceStartOnNewPage.has(trimmedLine)) {
      if (!firstPage) { 
        doc.addPage();
        cursorY = topMargin;
      }
    }
    if (isHeading) {
      if (cursorY !== topMargin) cursorY += lineHeight * 0.8;
      doc.setFont("courier", "bold");
      doc.setFontSize(headingSize);
      if (firstPage) firstPage = false;
    } else {
      doc.setFont("courier", "normal");
      doc.setFontSize(fontSize);
    }
    const wrappedLines = doc.splitTextToSize(origLine, pageWidth);

    for (let wline of wrappedLines) {
      if (cursorY + lineHeight > doc.internal.pageSize.getHeight() - topMargin) {
        doc.addPage();
        cursorY = topMargin;
      }
      doc.text(wline, leftMargin, cursorY);
      cursorY += isHeading ? headingSize * 1.2 : lineHeight;
      if (isHeading) {
        doc.setFont("courier", "normal");
        doc.setFontSize(fontSize);
      }
    }
  }

  doc.save(filename.endsWith('.pdf') ? filename : filename + ".pdf");
}

export default saveTextAsPdf;