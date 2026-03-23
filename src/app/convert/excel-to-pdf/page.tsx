"use client";

import ConversionPage from "@/components/ConversionPage";
import { DatabaseIcon } from "lucide-react";

export default function ExcelToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Activating Spreadsheet-to-PDF Ultra-Stab Engine v2.5...");
    
    const ExcelJS = await import("exceljs");
    const { jsPDF } = await import("jspdf");
    
    addLog("Parsing Workbook Binary...");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.getWorksheet(1); 
    if (!worksheet) throw new Error("No active worksheet found in the document.");

    addLog("Synchronizing Rendering Environment...");
    if (typeof document !== 'undefined' && (document as any).fonts) {
        await (document as any).fonts.ready;
    }

    addLog("Reconstructing Geometric Matrix...");
    setProgress("Mapping Cells", 40);
    
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.fontSize = '8.5pt';
    table.style.fontFamily = 'sans-serif';
    table.style.color = '#1f2937';

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (!row) return;
      
      const tr = document.createElement('tr');
      if (rowNumber === 1) {
         tr.style.backgroundColor = '#f3f4f6';
         tr.style.fontWeight = '700';
      }
      
      row.eachCell({ includeEmpty: true }, (cell) => {
        const td = document.createElement('td');
        td.style.border = '1px solid #d1d5db';
        td.style.padding = '6px';
        
        let cellValue = "";
        try {
          if (cell && cell.value !== undefined && cell.value !== null) {
            const v = cell.value;
            
            // TOTAL DEFENSE EXTRACTION
            if (typeof v === 'object') {
                if ('result' in v && v.result !== null && v.result !== undefined) {
                    cellValue = String(v.result);
                } else if ('richText' in v && Array.isArray((v as any).richText)) {
                    cellValue = (v as any).richText.map((rt: any) => rt?.text || "").join('');
                } else if ('text' in v) {
                    cellValue = String((v as any).text || "");
                } else if ('error' in v) {
                    cellValue = String((v as any).error || "#ERR");
                } else if (v instanceof Date) {
                    cellValue = v.toLocaleDateString();
                } else {
                    cellValue = String(v);
                }
            } else {
                cellValue = String(v);
            }
          }
        } catch (e) {
          cellValue = "[Err]";
        }
        
        td.innerText = cellValue || " "; // Ensure non-empty for layout
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    const container = document.createElement('div');
    container.id = "excel-to-pdf-shadow-render";
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

    addLog("Synthesizing PDF Visualization...");
    setProgress("Rasterizing Frames", 75);

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
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
            addLog("Spreadsheet Conversion Finalized.");
            resolve({
              url: URL.createObjectURL(blob),
              name: `${file.name.replace(/\.[^/.]+$/, "")}.pdf`
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
      subtitle="Ultra-Stab v2.5 Engine. Advanced cell semantic recovery and high-fidelity spreadsheet visualization."
      targetFormat="PDF Document"
      accentColor="emerald"
      icon={DatabaseIcon}
      accept=".xlsx,.xlsm"
      onConvert={processFile}
    />
  );
}
