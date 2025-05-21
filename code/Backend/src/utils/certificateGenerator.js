import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a course completion certificate
 */
export const generateCertificate = async (userName, courseName, organizationName, completionDate) => {
  const templatePath = path.join(__dirname, '../templates/certificate_template.pdf');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const [page] = pdfDoc.getPages();
  const { width } = page.getSize();

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const formattedDate = completionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certificateId = generateCertificateId(userName, courseName, completionDate);

  // Helper for centered text
  const drawCentered = (text, y, size, font, color = rgb(0, 0, 0)) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  // Finalized layout based on actual template
  drawCentered(userName, 675, 50, boldFont); // Name
  drawCentered(courseName, 520, 40, boldFont);
//   drawCentered(organizationName, 315, 30, boldFont);
  page.drawText(organizationName, {
    x: width - 500,
    y: 360,
    size: 30,
    font: boldFont,
    color: rgb(0, 0, 0),
  });


  // Date (aligned to right)
  const dateText = `${formattedDate}`;
  const dateFontSize = 25;
  const dateTextWidth = regularFont.widthOfTextAtSize(dateText, dateFontSize);
  page.drawText(dateText, {
    x: width - dateTextWidth - 250,
    y: 225,
    size: dateFontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Certificate ID (bottom right)
  const idText = `Certificate ID: ${certificateId}`;
  const idFontSize = 8;
  const idTextWidth = regularFont.widthOfTextAtSize(idText, idFontSize);
  page.drawText(idText, {
    x: width - idTextWidth - 40,
    y: 50,
    size: idFontSize,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

/**
 * Generates a unique certificate ID
 */
function generateCertificateId(userName, courseName, date) {
  const timestamp = date.getTime();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `CERT-${timestamp}-${randomSuffix}`;
}
