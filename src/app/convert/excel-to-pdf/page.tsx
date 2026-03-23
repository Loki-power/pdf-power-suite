"use client";

import ConversionPage from "@/components/ConversionPage";
import { DatabaseIcon } from "lucide-react";

export default function ExcelToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing Spreadsheet-to-PDF Engine...");
    
    const ExcelJS = await import("exceljs");
    const { jsPDF } = await import("jspdf");
    
    addLog("loading Excel Binary...");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.getWorksheet(1); 
    if (!worksheet) throw new Error("No worksheet found in Excel file.");

    addLog("Mapping Spreadsheet Matrix...");
    setProgress("Reconstructing Table", 40);
    
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.fontSize = '9pt';
    table.style.fontFamily = 'sans-serif';
    table.style.color = '#374151';

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const tr = document.createElement('tr');
      if (rowNumber === 1) {
         tr.style.backgroundColor = '#f9fafb';
         tr.style.fontWeight = 'bold';
      }
      
      row.eachCell({ includeEmpty: true }, (cell) => {
        const td = document.createElement('td');
        td.style.border = '1px solid #e5e7eb';
        td.style.padding = '8px';
        td.innerText = cell.text || '';
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    const container = document.createElement('div');
    container.style.width = '800px'; 
    container.style.padding = '40px';
    container.style.backgroundColor = 'white';
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.appendChild(table);
    document.body.appendChild(container);

    addLog("Rendering High-Fidelity PDF Layer...");
    setProgress("Capturing Visuals", 70);

    return new Promise<{ url: string; name: string }>((resolve, reject) => {
      doc.html(container, {
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
        },
        margin: [30, 30, 30, 30],
        autoPaging: 'text',
        x: 0,
        y: 0,
        width: 535,
        windowWidth: 800,
        callback: function (doc) {
          const pdfBytes = doc.output('arraybuffer');
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          document.body.removeChild(container);
          addLog("Spreadsheet Visualization Complete.");
          resolve({
            url: URL.createObjectURL(blob),
            name: `${file.name.split('.')[0]}.pdf`
          });
        }
      });
    });
  };

  return (
    <ConversionPage
      title="Excel to PDF"
      subtitle="Convert your Excel spreadsheets into clean, professional PDFs. Perfect for reports and sharing data reliably."
      targetFormat="PDF Document"
      accentColor="emerald"
      icon={DatabaseIcon}
      accept=".xlsx"
      onConvert={processFile}
    />
  );
}
