import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { uploadBufferToSupabase } from './supabaseClient';

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

const drawBorders = (page: any, width: number, height: number, outerColor: any) => {
  // Outer Border
  page.drawRectangle({
    x: 30, y: 30,
    width: width - 60, height: height - 60,
    borderColor: outerColor,
    borderWidth: 3
  });
     
  // Inner Border
  page.drawRectangle({
    x: 40, y: 40,
    width: width - 80, height: height - 80,
    borderColor: rgb(0.06, 0.09, 0.15), // #111827
    borderWidth: 1
  });
};

const drawWatermark = async (pdfDoc: PDFDocument, page: any, width: number, height: number, font: any) => {
  page.drawText('BLOODLINK', {
    x: width / 2 - 250,
    y: height / 2,
    size: 80,
    font,
    color: rgb(0.8, 0.8, 0.8),
    opacity: 0.2,
    rotate: degrees(45)
  });
};

export const generateStandardCertificatePdf = async (data: StandardCertificateData): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // Landscape A4 (841.89 x 595.28 points)
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  
  const drawCenterText = (text: string, size: number, font: any, y: number, color = rgb(0,0,0)) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
  };

  drawBorders(page, width, height, rgb(0.78, 0.06, 0.18)); // #C8102E
  await drawWatermark(pdfDoc, page, width, height, timesBoldFont);

  let currentY = height - 100;
  
  drawCenterText('CERTIFICATE OF APPRECIATION', 36, timesBoldFont, currentY, rgb(0.78, 0.06, 0.18));
  currentY -= 50;
  
  drawCenterText('This certificate is proudly presented to', 16, timesObliqueFont, currentY, rgb(0.06, 0.09, 0.15));
  currentY -= 60;
  
  drawCenterText(data.donorName.toUpperCase(), 32, timesBoldFont, currentY, rgb(0.06, 0.09, 0.15));
  currentY -= 50;

  drawCenterText(`In grateful recognition of your life-saving gift of Blood (Group: ${data.bloodGroup}).`, 16, timesRomanFont, currentY);
  currentY -= 30;
  
  drawCenterText('Your generosity and commitment to helping others in their time of need is deeply appreciated.', 14, timesRomanFont, currentY);
  currentY -= 100;

  // Signatures
  page.drawText(new Date(data.date).toLocaleDateString(), { x: 100, y: currentY, size: 12, font: timesRomanFont, color: rgb(0.06, 0.09, 0.15) });
  page.drawText('___________________', { x: 100, y: currentY - 20, size: 12, font: timesRomanFont });
  page.drawText('Date', { x: 130, y: currentY - 40, size: 12, font: timesRomanFont });

  page.drawText('BloodLink Organization', { x: width - 250, y: currentY, size: 12, font: timesRomanFont });
  page.drawText('___________________', { x: width - 250, y: currentY - 20, size: 12, font: timesRomanFont });
  page.drawText('Authorized Signature', { x: width - 230, y: currentY - 40, size: 12, font: timesRomanFont });

  // Cert Number
  page.drawText(`Certificate No: ${data.certificateNumber}`, { x: 40, y: 40, size: 10, font: timesRomanFont, color: rgb(0.42, 0.45, 0.5) });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  
  const uniqueSuffix = globalThis.crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  const fileName = `${data.certificateNumber}-${uniqueSuffix}.pdf`;
  
  return await uploadBufferToSupabase('reports', `certificates/${fileName}`, pdfBuffer, 'application/pdf');
};

export const generateMilestoneCertificatePdf = async (data: MilestoneCertificateData): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  
  const drawCenterText = (text: string, size: number, font: any, y: number, color = rgb(0,0,0)) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
  };

  drawBorders(page, width, height, rgb(0.96, 0.62, 0.04)); // #F59E0B
  
  // Extra gold border
  page.drawRectangle({
    x: 35, y: 35,
    width: width - 70, height: height - 70,
    borderColor: rgb(0.96, 0.62, 0.04),
    borderWidth: 1
  });

  await drawWatermark(pdfDoc, page, width, height, timesBoldFont);

  let currentY = height - 100;
  
  drawCenterText('MILESTONE ACHIEVEMENT', 36, timesBoldFont, currentY, rgb(0.96, 0.62, 0.04));
  currentY -= 50;
  
  drawCenterText('This honors', 16, timesObliqueFont, currentY, rgb(0.06, 0.09, 0.15));
  currentY -= 60;
  
  drawCenterText(data.donorName.toUpperCase(), 32, timesBoldFont, currentY, rgb(0.06, 0.09, 0.15));
  currentY -= 50;

  drawCenterText(`Award: ${data.milestoneName}`, 16, timesBoldFont, currentY, rgb(0.78, 0.06, 0.18));
  currentY -= 30;
  
  drawCenterText(`For completing an incredible ${data.donationCount} life-saving donations.`, 14, timesRomanFont, currentY, rgb(0.06, 0.09, 0.15));
  currentY -= 20;
  drawCenterText('Your extraordinary dedication to the community sets a standard of excellence for us all.', 14, timesRomanFont, currentY, rgb(0.06, 0.09, 0.15));
  currentY -= 80;

  // Signatures
  page.drawText(new Date(data.date).toLocaleDateString(), { x: 100, y: currentY, size: 12, font: timesRomanFont, color: rgb(0.06, 0.09, 0.15) });
  page.drawText('___________________', { x: 100, y: currentY - 20, size: 12, font: timesRomanFont });
  page.drawText('Date', { x: 130, y: currentY - 40, size: 12, font: timesRomanFont });

  page.drawText('BloodLink Directorship', { x: width - 250, y: currentY, size: 12, font: timesRomanFont });
  page.drawText('___________________', { x: width - 250, y: currentY - 20, size: 12, font: timesRomanFont });
  page.drawText('Authorized Signature', { x: width - 240, y: currentY - 40, size: 12, font: timesRomanFont });

  // Cert Number
  page.drawText(`Certificate No: ${data.certificateNumber}`, { x: 40, y: 40, size: 10, font: timesRomanFont, color: rgb(0.42, 0.45, 0.5) });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  
  const uniqueSuffix = globalThis.crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  const fileName = `${data.certificateNumber}-${uniqueSuffix}.pdf`;
  
  return await uploadBufferToSupabase('reports', `certificates/${fileName}`, pdfBuffer, 'application/pdf');
};
