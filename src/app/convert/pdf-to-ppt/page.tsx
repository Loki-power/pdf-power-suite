"use client";

import ConversionPage from "@/components/ConversionPage";
import { PresentationIcon } from "lucide-react";

export default function PdfToPpt() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing Presentation Matrix...");
    
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    
    const pptxgen = (await import("pptxgenjs")).default;
    const pptx = new pptxgen();
    
    addLog("Reading PDF Bitstream...");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    addLog(`Translating ${pdf.numPages} pages into presentation slides...`);
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const prog = Math.round((i / pdf.numPages) * 100);
        setProgress(`Sychronizing Slide ${i}/${pdf.numPages}`, prog);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (ctx) {
          addLog(`Capturing visual layer for slide ${i}...`);
          await page.render({ canvasContext: ctx as any, viewport: viewport }).promise;
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          
          const slide = pptx.addSlide();
          slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
        }
    }
    
    addLog("Compiling PPTX Binary...");
    const pptxBlob = await pptx.write({ outputType: 'blob' }) as Blob;
    
    return {
      url: URL.createObjectURL(pptxBlob),
      name: `${file.name.replace('.pdf', '')}.pptx`
    };
  };

  return (
    <ConversionPage
      title="PDF to PowerPoint"
      subtitle="Convert your PDF pages into high-impact presentation slides. Each page is perfectly preserved as a full-bleed slide."
      targetFormat="PowerPoint PPTX"
      accentColor="orange"
      icon={PresentationIcon}
      accept=".pdf"
      onConvert={processFile}
    />
  );
}
