"use client";

import { useState } from "react";
import ConversionPage from "@/components/ConversionPage";
import { FileTextIcon, Settings2Icon } from "lucide-react";
import type { Paragraph as DocxParagraph } from "docx";

export default function PdfToWord() {
  const [selectedLang, setSelectedLang] = useState("eng");
  const [stripEnglish, setStripEnglish] = useState(false);
  
  const VERSION = "7.0 (PARALLEL-CORE)";

  /**
   * XML Sanitizer & Script-Recon v7.0
   * Strips control characters that corrupt DOCX files.
   */
  const sanitizeAndRecon = (raw: string) => {
    // 1. Strict XML Sanitization (Removes non-printable control characters)
    let t = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, "");
    t = t.normalize('NFC');

    // 2. Hindi-specific restoration logic
    if (selectedLang.includes('hin')) {
      t = t.replace(/([\u0915-\u0939])\s+([\u0901-\u094D\u0962-\u0963])/g, "$1$2");
      t = t.replace(/([\u093F])\s*([\u0905-\u0939])/g, '$2$1');
      t = t.replace(/([\u094D])\s+([\u0905-\u0939])/g, '$1$2');
      t = t.replace(/([\u0900-\u097F])\s([\u093E-\u094F\u093C\u0902\u0903\u094D])/g, '$1$2');

      if (stripEnglish) {
        t = t.replace(/[a-zA-Z]/g, '');
      }
    }
    return t.trim();
  };

  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog(`Activating Parallel OCR Core (${selectedLang.toUpperCase()})...`);
    
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    const { createWorker, createScheduler } = await import("tesseract.js");
    const scheduler = createScheduler();
    
    addLog(`Initializing Multi-Worker Cluster...`);
    // Initialize 2 parallel workers for performance
    for (let j = 0; j < 2; j++) {
      const worker = await createWorker(selectedLang, 1);
      await worker.setParameters({ tessedit_pageseg_mode: 6 as any });
      scheduler.addWorker(worker);
    }
    
    // Preparation Phase
    const pageBlobs: Blob[] = [];
    addLog(`Rasterizing ${pdf.numPages} pages...`);
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 }); // Optimized scale for speed
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (ctx) {
          await page.render({ canvasContext: ctx as any, viewport: viewport }).promise;
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          for (let k = 0; k < d.length; k += 4) {
             const gray = 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2];
             const v = gray > 190 ? 255 : 0; 
             d[k] = d[k + 1] = d[k + 2] = v;
          }
          ctx.putImageData(imgData, 0, 0);
          const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), "image/png"));
          pageBlobs.push(blob);
        }
    }

    addLog("Executing Parallel OCR Splicing...");
    const results = await Promise.all(pageBlobs.map(async (blob, idx) => {
      const { data: { text } } = await scheduler.addJob('recognize', blob) as any;
      const prog = Math.round(((idx + 1) / pdf.numPages) * 100);
      setProgress(`Analyzing Page ${idx+1}/${pdf.numPages}`, prog);
      return text;
    }));

    await scheduler.terminate();

    addLog("Constructing High-Integrity DOCX Binary...");
    const wordSections = results.map((text: string) => {
      const paragraphs = text.split('\n').map((line: string) => {
        const cleaned = sanitizeAndRecon(line);
        if (cleaned) {
          return new Paragraph({
            children: [
              new TextRun({ 
                text: cleaned, 
                size: 24, 
                font: { 
                  name: selectedLang.includes('hin') ? "Nirmala UI, Mangal, Arial Unicode MS" : "Arial", 
                  hint: "default" 
                } 
              })
            ],
            spacing: { before: 120, line: 360 }
          });
        }
        return null;
      }).filter(Boolean) as DocxParagraph[];

      // Fallback for empty pages
      if (paragraphs.length === 0) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: " " })] }));
      }

      return { children: paragraphs };
    });

    const doc = new Document({ sections: wordSections });
    const wordBlob = await Packer.toBlob(doc);
    
    return {
      url: URL.createObjectURL(wordBlob),
      name: `${file.name.replace('.pdf', '')}.docx`
    };
  };

  const LanguageSelector = (
    <div className="space-y-3 w-full max-w-sm mx-auto">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center">
         <Settings2Icon className="mr-2 h-3 w-3 text-orange-500" /> Language Engine
      </label>
      <select 
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm"
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
      >
        <option value="eng">English (High Precision)</option>
        <option value="hin+eng">Hindi + English (Hybrid)</option>
        <option value="spa">Spanish (Universal)</option>
        <option value="fra">French (Diacritic Ready)</option>
        <option value="deu">German (Structure Preserved)</option>
        <option value="ara">Arabic (Script Optimized)</option>
        <option value="hin">Pure Hindi (Experimental)</option>
      </select>
    </div>
  );

  return (
    <ConversionPage
      title="PDF to Word"
      subtitle="Parallel-Core OCR engine. Optimized for speed and structural integrity with expert-grade global script restoration."
      targetFormat="Word DOCX"
      accentColor="orange"
      icon={FileTextIcon}
      accept=".pdf"
      version={VERSION}
      onConvert={processFile}
      initialOptions={LanguageSelector}
      options={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LanguageSelector}
          
          <div 
            className="flex items-center space-x-4 p-5 rounded-2xl border border-slate-200/60 bg-white hover:bg-slate-50 transition-all cursor-pointer group shadow-sm" 
            onClick={() => setStripEnglish(!stripEnglish)}
          >
            <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${stripEnglish ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/20' : 'border-slate-300'}`}>
               {stripEnglish && <div className="h-2 w-2 bg-white rounded-full" />}
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight">Pure Unicode Rebuild</span>
               <span className="text-[9px] text-slate-500 font-medium leading-tight text-left">Removes Latin residues & noise</span>
            </div>
          </div>
        </div>
      }
    />
  );
}
