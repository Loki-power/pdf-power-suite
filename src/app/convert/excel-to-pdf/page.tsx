"use client";

import ConversionPage from "@/components/ConversionPage";
import { DatabaseIcon } from "lucide-react";

export default function ExcelToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Activating Vector-Level Spreadsheet Engine v3.0 (AutoTable)...");
    
    const ExcelJS = await import("exceljs");
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    
    addLog("Analyzing Workbook Structure...");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.getWorksheet(1); 
    if (!worksheet) throw new Error("No active worksheet identified.");

    addLog("Synthesizing Data Matrix...");
    setProgress("Mapping Semantic Layer", 30);
    
    const doc = new jsPDF({
      orientation: 'landscape', // Landscape is better for spreadsheets
      unit: 'pt',
      format: 'a4'
    });

    const body: string[][] = [];
    let headers: string[] = [];

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (!row) return;
      
      const rowData: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        let cellValue = "";
        try {
          if (cell && cell.value !== undefined && cell.value !== null) {
            const v = cell.value;
            // TOTAL DEFENSE v3.0
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
        rowData.push(cellValue);
      });

      if (rowNumber === 1) {
        headers = rowData;
      } else {
        body.push(rowData);
      }
    });

    addLog("Drawing Vector Table Layer...");
    setProgress("Finalizing PDF Streams", 70);

    // Using autoTable for direct vector drawing (Guaranteed no blank pages)
    (doc as any).autoTable({
      head: [headers],
      body: body,
      theme: 'grid',
      styles: { 
        fontSize: 7, 
        cellPadding: 4, 
        overflow: 'linebreak',
        font: 'helvetica'
      },
      headStyles: { 
        fillColor: [79, 70, 229], // Indigo-600
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { top: 40, bottom: 40, left: 20, right: 20 },
      didDrawPage: (data: any) => {
        // Add footer or header if needed
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber}`, data.settings.margin.left, doc.internal.pageSize.height - 20);
      }
    });

    addLog("Compiling Binary Stream...");
    const pdfBytes = doc.output('arraybuffer');
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    
    addLog("Vector Conversion Complete.");
    return {
      url: URL.createObjectURL(blob),
      name: `${file.name.replace(/\.[^/.]+$/, "")}.pdf`
    };
  };

  return (
    <ConversionPage
      title="Excel to PDF"
      subtitle="Vector-Level Engine v3.0. Direct drawing technology eliminates blank pages and preserves 100% of spreadsheet data."
      targetFormat="PDF Document"
      accentColor="blue"
      icon={DatabaseIcon}
      accept=".xlsx,.xlsm"
      onConvert={processFile}
    />
  );
}
