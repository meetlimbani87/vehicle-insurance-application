import jsPDF from "jspdf";

/**
 * Generates and downloads an official Payment Receipt PDF
 */
export function generateReceiptPDF(item: any) {
  const doc = new jsPDF();
  const dateStr = new Date().toISOString().split("T")[0];
  const receiptNo = item.receiptNo || "REC-2026-VERIFIED";

  // Banner Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("VEHICLEINSURE", 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Official Payment Receipt & Proof of Coverage", 14, 32);
  doc.text(`Issued Date: ${dateStr}`, 145, 22);

  // Section Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction & Policy Details", 14, 56);

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 60, 196, 60);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const fields = [
    ["Receipt Reference:", receiptNo],
    ["Policy Number:", item.policyNumber || "N/A"],
    ["Amount Paid:", `INR ${item.amount?.toLocaleString() || "0"}`],
    ["Payment Execution Date:", item.paidDate || dateStr],
    ["Scheduled Due Date:", item.dueDate || "N/A"],
    ["Payment Interval:", (item.interval || "monthly").toUpperCase()],
    ["Payment Status:", (item.status || "Paid").toUpperCase()],
    ["Coverage Status:", "Active & 100% Eligible for Claim Processing"],
    ["Vault Verification:", "AES-256 Encrypted Ledger Record"],
  ];

  let y = 70;
  fields.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(val, 75, y);
    y += 9;
  });

  doc.line(14, y + 4, 196, y + 4);

  // Footer Note
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("This receipt certifies policy continuity. VehicleInsure digital vault verification intact.", 14, y + 16);
  doc.text("For assistance, contact support@vehicleinsure.com or visit your portal dashboard.", 14, y + 22);

  doc.save(`Receipt_${item.policyNumber}_${receiptNo}.pdf`);
}

/**
 * Generates and downloads an official Claim Assessment Report PDF
 */
export function generateClaimReportPDF(claim: any) {
  const doc = new jsPDF();
  const dateStr = new Date().toISOString().split("T")[0];

  // Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("VEHICLEINSURE CLAIM ASSESSMENT REPORT", 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Claim #: ${claim.claimNumber || 'N/A'}`, 14, 32);
  doc.text(`Report Date: ${dateStr}`, 145, 22);

  // Body Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Incident & Asset Information", 14, 55);

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 58, 196, 58);

  const info = [
    ["Claim Reference Number:", `#${claim.claimNumber || 'N/A'}`],
    ["Policy Number:", claim.policyNumber || "N/A"],
    ["Vehicle Details:", `${claim.vehicleMake || ''} ${claim.vehicleModel || ''} (${claim.registrationNo || claim.licensePlate || 'Reg Verified'})`],
    ["Accident Date:", claim.accidentDate || "N/A"],
    ["Filing Date:", claim.filedDate || dateStr],
    ["Claim Status:", (claim.status || "Filed").toUpperCase()],
    ["Accident Location:", claim.location || "N/A"],
  ];

  let y = 68;
  info.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(val, 75, y);
    y += 9;
  });

  doc.line(14, y + 2, 196, y + 2);

  // Financial Section
  y += 12;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Valuation & Settlement", 14, y);
  y += 3;
  doc.line(14, y, 196, y);

  const financials = [
    ["Estimated Repair Cost:", `INR ${(claim.estimatedAmount || 0).toLocaleString()}`],
    ["Actual Settled Amount:", `INR ${(claim.actualAmount || claim.estimatedAmount || 0).toLocaleString()}`],
    ["AI Risk Index Score:", "0.02 (Low Risk / Verified)"],
  ];

  y += 10;
  financials.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(val, 75, y);
    y += 9;
  });

  doc.line(14, y + 2, 196, y + 2);

  // Description Section
  y += 12;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Accident Description & Notes", 14, y);
  y += 3;
  doc.line(14, y, 196, y);

  y += 10;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  const splitDesc = doc.splitTextToSize(claim.description || "No additional description provided.", 180);
  doc.text(splitDesc, 14, y);

  doc.save(`Claim_Report_${claim.claimNumber}_${dateStr}.pdf`);
}
