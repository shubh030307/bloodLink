import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

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
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      
      const reportsDir = path.join(__dirname, '../../uploads/reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const fileName = `${data.reportNumber}.pdf`;
      const filePath = path.join(reportsDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('BLOODLINK', { align: 'center' });
      doc.fontSize(14).text('BLOOD BANK LABORATORY REPORT', { align: 'center' });
      doc.moveDown(2);

      // Meta Information
      doc.fontSize(12).font('Helvetica');
      doc.text(`Report ID: ${data.reportNumber}`);
      doc.text(`Blood Unit ID: ${data.bloodUnitId}`);
      doc.text(`Sticker ID: ${data.stickerId}`);
      doc.text(`Center: ${data.centerName}`);
      doc.text(`Technician: ${data.technicianName}`);
      doc.text(`Date Generated: ${new Date().toLocaleString()}`);
      doc.moveDown(2);

      // Results Table Header
      doc.font('Helvetica-Bold');
      doc.text('Test Results:', { underline: true });
      doc.moveDown(0.5);

      // Results
      data.results.forEach((r, index) => {
        doc.font('Helvetica-Bold').text(`${index + 1}. ${r.test?.testName || r.testId}`);
        doc.font('Helvetica').text(`   Result: ${r.resultValue}`);
        doc.text(`   Status: ${r.resultStatus}`);
        if (r.remarks) {
          doc.text(`   Remarks: ${r.remarks}`);
        }
        doc.moveDown(0.5);
      });

      doc.moveDown();

      // Final Decision
      doc.font('Helvetica-Bold').fontSize(14).fillColor(data.decision === 'APPROVED' ? 'green' : (data.decision === 'REJECTED' ? 'red' : 'black'));
      doc.text(`FINAL DECISION: ${data.decision}`);

      if (data.verifiedAt) {
        doc.fontSize(10).font('Helvetica').fillColor('black');
        doc.text(`Verified At: ${new Date(data.verifiedAt).toLocaleString()}`);
      }

      doc.end();

      writeStream.on('finish', () => {
        // Return relative path to be stored in DB
        resolve(`/uploads/reports/${fileName}`);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};
