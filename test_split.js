const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function testSplit() {
  try {
    // 1. Create a dummy PDF with content
    const pdfDoc = await PDFDocument.create();
    const page1 = pdfDoc.addPage([600, 400]);
    page1.drawText('Page 1 Content', { x: 50, y: 350, size: 30, color: rgb(0, 0, 1) });
    const page2 = pdfDoc.addPage([600, 400]);
    page2.drawText('Page 2 Content', { x: 50, y: 350, size: 30, color: rgb(1, 0, 0) });
    
    const sourceBytes = await pdfDoc.save();
    
    // 2. Try to split it using the same logic as in the app
    const originalPdf = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(originalPdf, [0]); // Copy only page 1
    newPdf.addPage(copiedPages[0]);
    
    const splitBytes = await newPdf.save();
    fs.writeFileSync('split_test.pdf', splitBytes);
    console.log('Split completed. Check split_test.pdf for content.');
    
    // 3. Verify page content (minimal check)
    const checkPdf = await PDFDocument.load(splitBytes);
    console.log('Page count:', checkPdf.getPageCount());
  } catch (err) {
    console.error('Error:', err);
  }
}

testSplit();
