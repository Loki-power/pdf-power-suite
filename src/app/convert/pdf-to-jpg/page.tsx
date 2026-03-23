"use client";

import ConversionPage from "@/components/ConversionPage";
import { ImagesIcon } from "lucide-react";
import JSZip from "jszip";

export default function PdfToJpg() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing High-Resolution Image Engine...");
    
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    const zip = new JSZip();
    addLog(`Preparing to extract ${pdf.numPages} high-fidelity surfaces...`);
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const prog = Math.round((i / pdf.numPages) * 100);
        setProgress(`Capturing Page ${i}/${pdf.numPages}`, prog);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 }); // High quality extraction
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (ctx) {
          addLog(`Rendering page ${i} to 2.5x buffer...`);
          await page.render({ canvasContext: ctx as any, viewport: viewport }).promise;
          const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/jpeg", 0.95));
          zip.file(`page-${i}.jpg`, blob);
        }
    }
    
    addLog("Splicing Image Archive...");
    const zipBlob = await zip.generateAsync({ type: "blob" });
    
    return {
      url: URL.createObjectURL(zipBlob),
      name: `${file.name.replace('.pdf', '')}-extracted.zip`
    };
  };

  return (
    <ConversionPage
      title="PDF to JPG"
      subtitle="Extract every page of your PDF as high-quality JPEG images. Perfect for presentations and social sharing."
      targetFormat="Images ZIP"
      accentColor="rose"
      icon={ImagesIcon}
      accept=".pdf"
      onConvert={processFile}
    />
  );
}
