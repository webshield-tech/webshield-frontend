/* eslint-disable prefer-const */
import { jsPDF } from "jspdf";

function saveTextAsPdf(filename: string, content: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 20;
  const topMargin = 25;
  const rightMargin = 20;
  const bottomMargin = 25;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  // Colors
  const primaryColor = [0, 255, 157]; // Cyber green
  const darkBg = [10, 10, 10]; // Almost black
  const textColor = [40, 40, 40];
  const headerColor = [20, 20, 20];
  
  // Cover Page (Dark Theme)
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Logo / Title
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(42);
  doc.text("VULN SPECTRA", pageWidth / 2, pageHeight * 0.4, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("SECURITY ASSESSMENT REPORT", pageWidth / 2, pageHeight * 0.4 + 15, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(`CONFIDENTIAL DOCUMENT`, pageWidth / 2, pageHeight * 0.4 + 30, { align: "center" });
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight * 0.4 + 40, { align: "center" });
  
  // Accent line
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(2);
  doc.line(pageWidth / 4, pageHeight * 0.4 + 20, (pageWidth / 4) * 3, pageHeight * 0.4 + 20);

  // Add Content Page
  doc.addPage();
  let cursorY = topMargin + 5; // Give extra room for top header
  
  const rawLines = content.replace(/\n{3,}/g, '\n\n').trim().split("\n");
  
  const lineHeight = 6;

  // Identify major sections
  const majorHeadings = [
    "VULN SPECTRA SECURITY SCAN REPORT",
    "Scan Overview",
    "Security Analysis & Recommendations",
    "END OF REPORT"
  ];

  for (let origLine of rawLines) {
    const trimmedLine = origLine.trim();
    if (!trimmedLine) {
      cursorY += lineHeight;
      continue;
    }

    const isMajorHeading = majorHeadings.some(h => trimmedLine.includes(h));
    const isSubHeading = trimmedLine.startsWith("###") || (trimmedLine.startsWith("**") && trimmedLine.endsWith("**"));
    
    // Clean markdown formatting for PDF rendering
    let cleanText = trimmedLine.replace(/\*/g, '').replace(/^#+\s*/, '').replace(/^-+\s*$/, '').trim();
    if (!cleanText) continue;

    // Major Headings
    if (isMajorHeading) {
      if (cursorY > pageHeight - 60) {
        doc.addPage();
        cursorY = topMargin + 5;
      } else if (cursorY > topMargin + 5) {
        cursorY += lineHeight * 2;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 150, 100); 
      doc.text(cleanText, leftMargin, cursorY);
      
      doc.setDrawColor(0, 150, 100);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, cursorY + 2, pageWidth - rightMargin, cursorY + 2);
      
      cursorY += lineHeight * 1.5;
      continue;
    }

    // Sub Headings
    if (isSubHeading) {
      cursorY += lineHeight;
      if (cursorY > pageHeight - bottomMargin - 20) {
        doc.addPage();
        cursorY = topMargin + 5;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.text(cleanText, leftMargin, cursorY);
      cursorY += lineHeight;
      continue;
    }

    // Normal text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    // Handle bullet points
    let xOffset = leftMargin;
    if (cleanText.startsWith("- ")) {
      xOffset = leftMargin + 5;
      cleanText = "• " + cleanText.substring(2);
    }

    const wrappedLines = doc.splitTextToSize(cleanText, contentWidth - (xOffset - leftMargin));

    for (let wline of wrappedLines) {
      if (cursorY + lineHeight > pageHeight - bottomMargin) {
        doc.addPage();
        cursorY = topMargin + 5;
      }
      doc.text(wline, xOffset, cursorY);
      cursorY += lineHeight;
    }
  }

  // Post-processing: Add Headers, Footers, and Watermarks to all content pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i === 1) continue; // Skip cover page
    
    // Watermark
    doc.setFont("helvetica", "bold");
    doc.setFontSize(60);
    doc.setTextColor(245, 248, 250); // Very light grey/blue
    (doc as any).text("CONFIDENTIAL", pageWidth / 2, pageHeight / 2 + 10, { align: "center", angle: 45 });

    // Top Header Banner
    doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
    doc.rect(0, 0, pageWidth, 15, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("VULN SPECTRA", leftMargin, 10);
    
    doc.setTextColor(200, 200, 200);
    doc.text("SECURITY ASSESSMENT REPORT", pageWidth - rightMargin, 10, { align: "right" });
    
    // Bottom Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, leftMargin, pageHeight - 10);
    doc.text(`Page ${i - 1} of ${pageCount - 1}`, pageWidth - rightMargin, pageHeight - 10, { align: "right" });
  }

  doc.save(filename.endsWith('.pdf') ? filename : filename + ".pdf");
}

export default saveTextAsPdf;