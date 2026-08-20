import PDFDocument from 'pdfkit';
import { uploadBufferToSupabase } from './supabaseClient';
import crypto from 'crypto';

interface StandardCertificateData {
  certificateNumber: string;
  donorName: string;
  bloodGroup: string;
  date: Date;
}

interface MilestoneCertificateData {
  certificateNumber: string;
  donorName: string;
  milestoneName: string;
  donationCount: number;
  date: Date;
}

const drawBorders = (doc: typeof PDFDocument) => {
  // Outer Border
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
     .lineWidth(3)
     .stroke('#C8102E');
     
  // Inner Border
  doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
     .lineWidth(1)
     .stroke('#111827');
};

const drawWatermark = (doc: typeof PDFDocument) => {
  doc.save();
  doc.fontSize(80)
     .fillOpacity(0.04)
     .text('BLOODLINK', 0, doc.page.height / 2 - 40, { align: 'center', width: doc.page.width });
  doc.restore();
};

export const generateStandardCertificatePdf = async (data: StandardCertificateData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        try {
          const pdfData = Buffer.concat(buffers);
          // Wait, WebCrypto in Cloudflare doesn't have crypto.randomBytes? 
          // We can use crypto.randomUUID() since we fixed it earlier.
          const uniqueSuffix = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').substring(0, 8) : (crypto as any).randomBytes(4).toString('hex');
          const fileName = `${data.certificateNumber}-${uniqueSuffix}.pdf`;
          
          const publicUrl = await uploadBufferToSupabase('reports', `certificates/${fileName}`, pdfData, 'application/pdf');
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });
      doc.on('error', reject);

      drawBorders(doc);
      drawWatermark(doc);

      doc.moveDown(2);
      doc.fontSize(36).font('Helvetica-Bold').fillColor('#C8102E').text('CERTIFICATE OF APPRECIATION', { align: 'center' });
      doc.moveDown(1);
      
      doc.fontSize(16).fillColor('#111827').font('Helvetica-Oblique').text('This certificate is proudly presented to', { align: 'center' });
      doc.moveDown(1);
      
      doc.fontSize(32).font('Helvetica-Bold').fillColor('#111827').text(data.donorName.toUpperCase(), { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(16).font('Helvetica').text(`In grateful recognition of your life-saving gift of Blood (Group: ${data.bloodGroup}).`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).text('Your generosity and commitment to helping others in their time of need is deeply appreciated.', { align: 'center' });
      doc.moveDown(3);

      // Signatures
      const signatureY = doc.y;
      doc.fontSize(12).font('Helvetica').fillColor('#111827');
      doc.text(new Date(data.date).toLocaleDateString(), 100, signatureY);
      doc.text('___________________', 100, signatureY + 20);
      doc.text('Date', 130, signatureY + 40);

      doc.text('BloodLink Organization', doc.page.width - 250, signatureY, { align: 'right' });
      doc.text('___________________', doc.page.width - 250, signatureY + 20, { align: 'right' });
      doc.text('Authorized Signature', doc.page.width - 250, signatureY + 40, { align: 'right' });

      // Cert Number
      doc.fontSize(10).fillColor('#6B7280').text(`Certificate No: ${data.certificateNumber}`, 40, doc.page.height - 30);

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

export const generateMilestoneCertificatePdf = async (data: MilestoneCertificateData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        try {
          const pdfData = Buffer.concat(buffers);
          const uniqueSuffix = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').substring(0, 8) : (crypto as any).randomBytes(4).toString('hex');
          const fileName = `${data.certificateNumber}-${uniqueSuffix}.pdf`;
          
          const publicUrl = await uploadBufferToSupabase('reports', `certificates/${fileName}`, pdfData, 'application/pdf');
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });
      doc.on('error', reject);

      drawBorders(doc);
      
      // Special Gold/Milestone Border Effect
      doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).lineWidth(1).stroke('#F59E0B');

      drawWatermark(doc);

      doc.moveDown(2);
      doc.fontSize(36).font('Helvetica-Bold').fillColor('#F59E0B').text('MILESTONE ACHIEVEMENT', { align: 'center' });
      doc.moveDown(1);
      
      doc.fontSize(16).fillColor('#111827').font('Helvetica-Oblique').text('This honors', { align: 'center' });
      doc.moveDown(1);
      
      doc.fontSize(32).font('Helvetica-Bold').fillColor('#111827').text(data.donorName.toUpperCase(), { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(16).font('Helvetica-Bold').fillColor('#C8102E').text(`Award: ${data.milestoneName}`, { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(14).font('Helvetica').fillColor('#111827').text(`For completing an incredible ${data.donationCount} life-saving donations.`, { align: 'center' });
      doc.moveDown(0.5);
      doc.text('Your extraordinary dedication to the community sets a standard of excellence for us all.', { align: 'center' });
      doc.moveDown(2);

      // Signatures
      const signatureY = doc.y;
      doc.fontSize(12).font('Helvetica').fillColor('#111827');
      doc.text(new Date(data.date).toLocaleDateString(), 100, signatureY);
      doc.text('___________________', 100, signatureY + 20);
      doc.text('Date', 130, signatureY + 40);

      doc.text('BloodLink Directorship', doc.page.width - 250, signatureY, { align: 'right' });
      doc.text('___________________', doc.page.width - 250, signatureY + 20, { align: 'right' });
      doc.text('Authorized Signature', doc.page.width - 250, signatureY + 40, { align: 'right' });

      // Cert Number
      doc.fontSize(10).fillColor('#6B7280').text(`Certificate No: ${data.certificateNumber}`, 40, doc.page.height - 30);

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};
