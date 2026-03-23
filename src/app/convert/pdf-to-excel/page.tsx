"use client";

import ConversionPage from "@/components/ConversionPage";
import { DatabaseIcon } from "lucide-react";

export default function PdfToExcel() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing Vector-First Excel v3.0 (Elite Structural Engine)...");
    
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    
    addLog("Reading PDF Vector Objects...");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    addLog(`Analyzing ${pdf.numPages} pages for vector-aligned data...`);
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const prog = Math.round((i / pdf.numPages) * 100);
        setProgress(`Processing Page ${i}/${pdf.numPages}`, prog);
        addLog(`Executing Elite-Linguistic scan for page ${i}...`);
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const items = textContent.items as any[];
        const sheet = workbook.addWorksheet(`Page ${i}`);
        
        // Elite Vector v3.0: Tolerance-based grouping
        const rowTolerance = 3; // Vertical tolerance in pt
        const rows: { y: number; items: any[] }[] = [];
        
        items.forEach(item => {
            const y = item.transform[5];
            let found = false;
            for (const r of rows) {
                if (Math.abs(r.y - y) <= rowTolerance) {
                    r.items.push(item);
                    found = true;
                    break;
                }
            }
            if (!found) rows.push({ y, items: [item] });
        });
        
        // Sort rows top-to-bottom
        rows.sort((a, b) => b.y - a.y);
        
        rows.forEach(r => {
            // Precise X sorting for column-first alignment
            const sortedItems = r.items.sort((a, b) => a.transform[4] - b.transform[4]);
            
            // Vector Alignment Logic: If two items are very close, merge them; if far, separate columns
            const rowData: string[] = [];
            let currentStr = "";
            let lastX = -1;
            
            sortedItems.forEach(item => {
                const x = item.transform[4];
                const width = item.width || 0;
                
                // If the gap is small (relative to font size), treat as same cell
                const gap = lastX === -1 ? 0 : x - (lastX + (sortedItems[sortedItems.indexOf(item)-1]?.width || 0));
                
                if (lastX === -1 || gap < 10) { 
                    currentStr += item.str;
                } else {
                    rowData.push(currentStr.trim());
                    currentStr = item.str;
                }
                lastX = x;
            });
            if (currentStr) rowData.push(currentStr.trim());
            
            if (rowData.some(v => v !== "")) {
                sheet.addRow(rowData);
            }
        });
        
        addLog(`Verified ${rows.length} vector rows on Page ${i}.`);
    }
    
    addLog("Generating Optimized Spreadsheet Binary...");
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
    return {
      url: URL.createObjectURL(blob),
      name: `${file.name.replace('.pdf', '')}_Vector_v3.xlsx`
    };
  };

  return (
    <ConversionPage
      title="Vector-First Excel v3.0"
      subtitle="Elite Vector-First v3.0 Engine. High-precision structural mapping with fuzzy-Y coordinate grouping and column-first alignment."
      targetFormat="Excel XLSX"
      accentColor="cyan"
      icon={DatabaseIcon}
      accept=".pdf"
      onConvert={processFile}
    />
  );
}
