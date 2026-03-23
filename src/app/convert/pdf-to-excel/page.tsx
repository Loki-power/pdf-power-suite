"use client";

import ConversionPage from "@/components/ConversionPage";
import { DatabaseIcon } from "lucide-react";

export default function PdfToExcel() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing High-Fidelity Spreadsheet Engine...");
    
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Converted Data");
    
    addLog("Reading PDF Bitstream...");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    addLog(`Analyzing ${pdf.numPages} pages for tabular structures...`);
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const prog = Math.round((i / pdf.numPages) * 100);
        setProgress(`Extracting Table Data ${i}/${pdf.numPages}`, prog);
        addLog(`Mapping coordinates for page ${i}...`);
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Group items by Y coordinate to identify rows
        const items = textContent.items as any[];
        const rows: any = {};
        
        items.forEach(item => {
            const y = Math.round(item.transform[5]);
            if (!rows[y]) rows[y] = [];
            rows[y].push(item);
        });
        
        // Sort rows by Y (descending for top-to-bottom)
        const sortedY = Object.keys(rows).sort((a, b) => Number(b) - Number(a));
        
        sortedY.forEach(y => {
            // Sort items in row by X coordinate
            const rowItems = rows[y].sort((a: any, b: any) => a.transform[4] - b.transform[4]);
            const rowData = rowItems.map((item: any) => item.str);
            sheet.addRow(rowData);
        });
        
        addLog(`Synchronized ${sortedY.length} data rows from page ${i}.`);
    }
    
    addLog("Optimizing Excel Binary Layout...");
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
    return {
      url: URL.createObjectURL(blob),
      name: `${file.name.replace('.pdf', '')}.xlsx`
    };
  };

  return (
    <ConversionPage
      title="PDF to Excel"
      subtitle="Extract tabular data from PDFs directly into professional spreadsheets. Maintains row alignment and structural integrity."
      targetFormat="Excel XLSX"
      accentColor="cyan"
      icon={DatabaseIcon}
      accept=".pdf"
      onConvert={processFile}
    />
  );
}
