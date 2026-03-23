"use client";

import ConversionPage from "@/components/ConversionPage";
import { FileTextIcon } from "lucide-react";

export default function WordToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing Stealth-Render Word-to-PDF Core v2.1...");
    
    const mammoth = await import("mammoth");
    const { jsPDF } = await import("jspdf");
    
    addLog("Extracting Document Semantics...");
    const arrayBuffer = await file.arrayBuffer();
    
    setProgress("Analyzing OpenXML", 30);
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value; 

    if (!html) {
        throw new Error("The Word document appears to be empty or corrupted.");
    }
    
    addLog("Constructing High-Fidelity Shadow DOM...");
    setProgress("Synchronizing Fonts", 50);
    
    // Wait for system fonts to be ready for capture
    if (typeof document !== 'undefined' && (document as any).fonts) {
        await (document as any).fonts.ready;
    }

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });

    // STEALTH-RENDER CONTAINER (v2.1)
    // Avoids -10000px which causes blank captures in some browsers.
    // Uses absolute positioning and zero opacity instead.
    const container = document.createElement('div');
    container.id = "word-to-pdf-capture-zone";
    container.style.width = '595pt'; 
    container.style.padding = '72pt'; 
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.zIndex = '-9999';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.fontFamily = "'Times New Roman', serif";
    container.style.lineHeight = "1.6";
    container.innerHTML = html;
    document.body.appendChild(container);

    const styles = document.createElement('style');
    styles.innerHTML = `
      #word-to-pdf-capture-zone h1 { font-size: 26pt; font-weight: bold; margin-bottom: 24pt; text-align: center; }
      #word-to-pdf-capture-zone h2 { font-size: 20pt; font-weight: bold; margin-bottom: 18pt; border-bottom: 1pt solid #eee; }
      #word-to-pdf-capture-zone p { font-size: 12pt; margin-bottom: 12pt; text-align: justify; }
      #word-to-pdf-capture-zone table { width: 100%; border-collapse: collapse; margin-bottom: 24pt; }
      #word-to-pdf-capture-zone td, #word-to-pdf-capture-zone th { border: 1pt solid #ddd; padding: 8pt; vertical-align: top; }
      #word-to-pdf-capture-zone img { max-width: 100%; height: auto; display: block; margin: 20pt auto; }
    `;
    container.appendChild(styles);

    addLog("Capturing Document Vectors...");
    setProgress("Generating PDF Binary", 80);

    return new Promise<{ url: string; name: string }>((resolve, reject) => {
      doc.html(container, {
        html2canvas: {
          scale: 1, 
          useCORS: true,
          logging: false,
          letterRendering: true,
          scrollX: 0,
          scrollY: 0
        },
        margin: [0, 0, 0, 0],
        autoPaging: 'text',
        x: 0,
        y: 0,
        width: 595,
        windowWidth: 595,
        callback: function (doc) {
          try {
            const pdfBytes = doc.output('arraybuffer');
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            
            document.body.removeChild(container);
            addLog("Conversion Successfully Completed.");
            
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
      title="Word to PDF"
      subtitle="Stealth-Render v2.1 Engine. High-fidelity rendering with automatic overflow and image synchronization."
      targetFormat="PDF Document"
      accentColor="emerald"
      icon={FileTextIcon}
      accept=".doc,.docx"
      onConvert={processFile}
    />
  );
}
