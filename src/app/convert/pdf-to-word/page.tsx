"use client";

import { useState } from "react";
import ConversionPage from "@/components/ConversionPage";
import { FileTextIcon, Settings2Icon, SparklesIcon } from "lucide-react";

export default function PdfToWord() {
  const [selectedLang, setSelectedLang] = useState("hin+eng");
  const [stripEnglish, setStripEnglish] = useState(false);
  
  const VERSION = "6.0 (SPLICED-RECON)";

  /**
   * SPLICED-RECON v6.0 ENGINE
   * Master-level reconstruction for legacy and modern Hindi scripts.
   */
  const scriptReconV6 = (raw: string) => {
    let t = raw.normalize('NFC')
             .replace(/[\u25A1\u25CC\u25CB\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

    if (selectedLang.includes('hin')) {
      // Fixes "क ् या" issues
      t = t.replace(/([\u0915-\u0939])\s+([\u0901-\u094D\u0962-\u0963])/g, "$1$2");
      // Re-order Short-I
      t = t.replace(/([\u093F])\s*([\u0905-\u0939])/g, '$2$1');
      // Join Halants
      t = t.replace(/([\u094D])\s+([\u0905-\u0939])/g, '$1$2');
      // Clean extra spaces
      t = t.replace(/([\u0900-\u097F])\s([\u093E-\u094F\u093C\u0902\u0903\u094D])/g, '$1$2');

      if (stripEnglish) {
        t = t.replace(/[a-zA-Z]/g, '');
      }
    }
    return t.trim();
  };

  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Injecting Script-Recon v6.0 Logic...");
    
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    addLog("Loading PDF Rendering Matrix...");
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    const { createWorker } = await import("tesseract.js");
    addLog(`Initializing OCR Cluster (${selectedLang})...`);
    const worker = await createWorker(selectedLang, 1);
    
    const sections = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const prog = Math.round((i / pdf.numPages) * 100);
        setProgress(`Splicing Page ${i}/${pdf.numPages}`, prog);
        addLog(`Analyzing Page ${i} structure...`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 4.0 }); // High res for character precision
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const pageParagraphs: any[] = [];
        
        if (ctx) {
          addLog(`Scanning glyphs for page ${i}...`);
          await page.render({ canvasContext: ctx as any, viewport: viewport }).promise;
          
          // Image Pre-processing for contrast
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          for (let k = 0; k < d.length; k += 4) {
            const gray = 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2];
            const v = gray > 190 ? 255 : 0; 
            d[k] = d[k + 1] = d[k + 2] = v;
          }
          ctx.putImageData(imgData, 0, 0);

          const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/png"));
          
          await worker.setParameters({ tessedit_pageseg_mode: 6 as any });
          const { data: { text } } = await worker.recognize(blob);
          
          addLog(`Reconstructing Unicode for page ${i}...`);
          
          text.split('\n').forEach((line: string) => {
            const cleaned = scriptReconV6(line);
            if (cleaned) {
              pageParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: cleaned, 
                      size: 24, 
                      font: { name: "Noto Sans Devanagari", hint: "eastAsia" } 
                    })
                  ],
                  spacing: { before: 200, line: 400 }
                })
              );
            }
          });
        }
        
        sections.push({ children: pageParagraphs });
    }
    
    await worker.terminate();
    
    addLog("Finalizing DOCX Binary Structure...");
    const doc = new Document({ sections });
    const wordBlob = await Packer.toBlob(doc);
    
    return {
      url: URL.createObjectURL(wordBlob),
      name: `${file.name.replace('.pdf', '')}.docx`
    };
  };

  return (
    <ConversionPage
      title="PDF to Word"
      subtitle="Expert-grade Hindi script restoration engine. Fixes legacy fonts, broken ligatures, and phantom spaces automatically."
      targetFormat="Word DOCX"
      accentColor="orange"
      icon={FileTextIcon}
      accept=".pdf"
      version={VERSION}
      onConvert={processFile}
      options={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
               <Settings2Icon className="mr-2 h-3 w-3 text-orange-500" /> Script Mode
            </label>
            <select 
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              <option value="hin+eng">Hindi + English (Hybrid)</option>
              <option value="hin">Pure Hindi (Experimental)</option>
            </select>
          </div>
          
          <div 
            className="flex items-center space-x-4 p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group" 
            onClick={() => setStripEnglish(!stripEnglish)}
          >
            <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${stripEnglish ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/20' : 'border-slate-700'}`}>
               {stripEnglish && <div className="h-2 w-2 bg-white rounded-full" />}
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-white tracking-tight">Pure Unicode Rebuild</span>
               <span className="text-[9px] text-slate-500 font-medium leading-tight">Removes Latin residues & noise</span>
            </div>
          </div>
        </div>
      }
    />
  );
}
