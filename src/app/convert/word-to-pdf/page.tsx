"use client";

import ConversionPage from "@/components/ConversionPage";
import { FileTextIcon } from "lucide-react";

export default function WordToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing High-Stab Word-to-PDF Core v2.0...");
    
    const mammoth = await import("mammoth");
    const { jsPDF } = await import("jspdf");
    
    addLog("Extracting OpenXML Semantic Layer...");
    const arrayBuffer = await file.arrayBuffer();
    
    setProgress("Synthesizing HTML Structure", 30);
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value; 

    if (!html) {
        addLog("Warning: Document structure appears sparse.");
    }
    
    addLog("Isolating Layout Matrix...");
    setProgress("Rasterizing PDF Frames", 60);
    
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });

    // PAPER-SIM CONTAINER: Forces Word-like isolation
    const container = document.createElement('div');
    container.id = "word-to-pdf-paper-sim";
    container.className = "prose prose-sm max-w-none"; // Tailwind-like semantic defaults
    container.style.width = '595pt'; // A4 Width in PT
    container.style.padding = '72pt'; // 1 inch margins
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.fontFamily = "'Times New Roman', Times, serif";
    container.style.lineHeight = "1.5";
    container.innerHTML = html;
    document.body.appendChild(container);

    // Apply basic semantic styling to the isolated HTML
    const styles = document.createElement('style');
    styles.innerHTML = `
      #word-to-pdf-paper-sim h1 { font-size: 24pt; font-weight: bold; margin-bottom: 20pt; }
      #word-to-pdf-paper-sim h2 { font-size: 18pt; font-weight: bold; margin-bottom: 15pt; }
      #word-to-pdf-paper-sim p { font-size: 11pt; margin-bottom: 10pt; text-align: justify; }
      #word-to-pdf-paper-sim table { width: 100%; border-collapse: collapse; margin-bottom: 20pt; }
      #word-to-pdf-paper-sim td, #word-to-pdf-paper-sim th { border: 1pt solid #ccc; padding: 5pt; }
    `;
    container.appendChild(styles);

    return new Promise<{ url: string; name: string }>((resolve, reject) => {
      addLog("Executing Vector Transcription...");
      doc.html(container, {
        html2canvas: {
          scale: 1, // High-stab 1x (v2.0)
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        margin: [0, 0, 0, 0], // Margins handled by container padding
        autoPaging: 'text',
        x: 0,
        y: 0,
        width: 595,
        windowWidth: 595,
        callback: function (doc) {
          const pdfBytes = doc.output('arraybuffer');
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          
          document.body.removeChild(container);
          addLog("Transcription Finalized.");
          
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
      title="Word to PDF"
      subtitle="Enhanced v2.0 Layout Engine. High-fidelity Word document rendering with semantic preservation."
      targetFormat="PDF Document"
      accentColor="emerald"
      icon={FileTextIcon}
      accept=".doc,.docx"
      onConvert={processFile}
    />
  );
}
