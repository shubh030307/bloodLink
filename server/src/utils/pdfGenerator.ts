import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { uploadBufferToSupabase } from './supabaseClient';

interface ReportData {
  reportNumber: string;
  bloodUnitId: string;
  stickerId: string;
  centerName: string;
  technicianName: string;
  results: any[];
  decision: string;
  verifiedAt?: Date;
}

export const generateLabReportPdf = async (data: ReportData): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  let currentY = height - 50;

  const drawText = (text: string, size: number, font: any, x: number, y: number, color = rgb(0,0,0)) => {
    page.drawText(text, { x, y, size, font, color });
  };

  // Header
  drawText('BLOODLINK', 20, timesBoldFont, width / 2 - 60, currentY);
  currentY -= 30;
  drawText('BLOOD BANK LABORATORY REPORT', 14, timesRomanFont, width / 2 - 120, currentY);
  currentY -= 50;

  // Meta Information
  const metaSize = 12;
  drawText(`Report ID: ${data.reportNumber}`, metaSize, timesRomanFont, 50, currentY);
  currentY -= 20;
  drawText(`Blood Unit ID: ${data.bloodUnitId}`, metaSize, timesRomanFont, 50, currentY);
  currentY -= 20;
  drawText(`Sticker ID: ${data.stickerId}`, metaSize, timesRomanFont, 50, currentY);
  currentY -= 20;
  drawText(`Center: ${data.centerName}`, metaSize, timesRomanFont, 50, currentY);
  currentY -= 20;
  drawText(`Technician: ${data.technicianName}`, metaSize, timesRomanFont, 50, currentY);
  currentY -= 20;
  drawText(`Date Generated: ${new Date().toLocaleString()}`, metaSize, timesRomanFont, 50, currentY);
  currentY -= 40;

  // Results Table Header
  drawText('Test Results:', 14, timesBoldFont, 50, currentY);
  currentY -= 30;

  // Results
  data.results.forEach((r, index) => {
    drawText(`${index + 1}. ${r.test?.testName || r.testId}`, 12, timesBoldFont, 50, currentY);
    currentY -= 20;
    drawText(`   Result: ${r.resultValue}`, 12, timesRomanFont, 50, currentY);
    currentY -= 20;
    drawText(`   Status: ${r.resultStatus}`, 12, timesRomanFont, 50, currentY);
    currentY -= 20;
    if (r.remarks) {
      drawText(`   Remarks: ${r.remarks}`, 12, timesRomanFont, 50, currentY);
      currentY -= 20;
    }
    currentY -= 10;
  });

  currentY -= 20;

  // Final Decision
  let decisionColor = rgb(0,0,0);
  if (data.decision === 'APPROVED') decisionColor = rgb(0, 0.5, 0);
  if (data.decision === 'REJECTED') decisionColor = rgb(1, 0, 0);
  
  drawText(`FINAL DECISION: ${data.decision}`, 14, timesBoldFont, 50, currentY, decisionColor);
  currentY -= 30;

  if (data.verifiedAt) {
    drawText(`Verified At: ${new Date(data.verifiedAt).toLocaleString()}`, 10, timesRomanFont, 50, currentY);
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  
  const fileName = `${data.reportNumber}-${globalThis.crypto.randomUUID().replace(/-/g, '').substring(0, 8)}.pdf`;
  return await uploadBufferToSupabase('reports', fileName, pdfBuffer, 'application/pdf');
};
