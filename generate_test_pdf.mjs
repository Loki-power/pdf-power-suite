import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

async function createDoc() {
  const pdfDoc = await PDFDocument.create();
  
  for(let i=1; i<=3; i++) {
    const page = pdfDoc.addPage([500, 500]);
    page.drawText(`Page ${i}`, { x: 50, y: 250, size: 50, color: rgb(0, 0.5, 0) });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test.pdf', pdfBytes);
  console.log('Created test.pdf');
}

createDoc();
