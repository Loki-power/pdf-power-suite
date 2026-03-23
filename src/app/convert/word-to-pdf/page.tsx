"use client";

import ConversionPage from "@/components/ConversionPage";
import { FileTextIcon } from "lucide-react";

export default function WordToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing Word-to-PDF Conversion Core...");
    
    const mammoth = await import("mammoth");
    const { jsPDF } = await import("jspdf");
    
    addLog("Decoding Word document structure...");
    const arrayBuffer = await file.arrayBuffer();
    
    setProgress("Mapping HTML Layout", 30);
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value; 
    
    addLog("Rendering Document Matrix...");
    setProgress("Generating PDF Binary", 60);
    
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });

    const container = document.createElement('div');
    container.style.width = '794px'; 
    container.style.padding = '50px';
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.fontFamily = 'serif';
    container.innerHTML = html;
    document.body.appendChild(container);

    return new Promise<{ url: string; name: string }>((resolve, reject) => {
      addLog("Re-weaving document vectors...");
      doc.html(container, {
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        margin: [40, 40, 40, 40],
        autoPaging: 'text',
        x: 0,
        y: 0,
        width: 515,
        windowWidth: 794,
        callback: function (doc) {
          const pdfBytes = doc.output('arraybuffer');
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          
          document.body.removeChild(container);
          addLog("Binary Synchronization Complete.");
          
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
      subtitle="Convert Word documents into professional PDFs with high-fidelity layout preservation. 100% private and secure."
      targetFormat="PDF Document"
      accentColor="emerald"
      icon={FileTextIcon}
      accept=".doc,.docx"
      onConvert={processFile}
    />
  );
}
