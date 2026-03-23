"use client";

import ConversionPage from "@/components/ConversionPage";
import { DatabaseIcon } from "lucide-react";

export default function ExcelToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing Spreadsheet-to-PDF Stealth Engine v2.1...");
    
    const ExcelJS = await import("exceljs");
    const { jsPDF } = await import("jspdf");
    
    addLog("Parsing Spreadsheet Binary...");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.getWorksheet(1); 
    if (!worksheet) throw new Error("No worksheet identified in the uploaded Excel file.");

    addLog("Synchronizing System Fonts...");
    if (typeof document !== 'undefined' && (document as any).fonts) {
        await (document as any).fonts.ready;
    }

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
        
        let cellValue = "";
        try {
          const val = cell.value;
          if (val !== null && val !== undefined) {
            if (typeof val === 'object') {
              cellValue = (val as any).result?.toString() ?? 
                          (val as any).richText?.map((rt: any) => rt.text).join('') ?? 
                          (val as any).text?.toString() ?? 
                          String(val);
            } else {
              cellValue = String(val);
            }
          }
        } catch (e) {
          cellValue = "[Error]";
        }
        
        td.innerText = cellValue;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    // STEALTH-RENDER CONTAINER (v2.1)
    // Absolute positioning + zero opacity ensures zero-layout-skip capture
    const container = document.createElement('div');
    container.id = "excel-to-pdf-stealth-zone";
    container.style.width = '800px'; 
    container.style.padding = '40px';
    container.style.backgroundColor = 'white';
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.zIndex = '-9999';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.appendChild(table);
    document.body.appendChild(container);

    addLog("Capturing High-Fidelity PDF Layer...");
    setProgress("Visual Synthesis", 70);

    return new Promise<{ url: string; name: string }>((resolve, reject) => {
      doc.html(container, {
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0
        },
        margin: [30, 30, 30, 30],
        autoPaging: 'text',
        x: 0,
        y: 0,
        width: 535,
        windowWidth: 800,
        callback: function (doc) {
          try {
            const pdfBytes = doc.output('arraybuffer');
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            document.body.removeChild(container);
            addLog("Spreadsheet Visualization Complete.");
            resolve({
              url: URL.createObjectURL(blob),
              name: `${file.name.split('.')[0]}.pdf`
            });
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  };

  return (
    <ConversionPage
      title="Excel to PDF"
      subtitle="Stealth-Render v2.1 Engine. Professional Grade PDF extraction for spreadsheets and macro-enabled workbooks."
      targetFormat="PDF Document"
      accentColor="emerald"
      icon={DatabaseIcon}
      accept=".xlsx,.xlsm"
      onConvert={processFile}
    />
  );
}
