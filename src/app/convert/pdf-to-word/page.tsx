"use client";

import { useState } from "react";
import ConversionPage from "@/components/ConversionPage";
import { FileTextIcon, Settings2Icon } from "lucide-react";
import type { Paragraph as DocxParagraph, TextRun as DocxTextRun } from "docx";

export default function PdfToWord() {
  const [selectedLang, setSelectedLang] = useState("eng");
  const [stripEnglish, setStripEnglish] = useState(false);
  
  const VERSION = "10.0 (ADAPTIVE-CORE)";

  /**
   * SCRIPT-RECON v10.0 (ADAPTIVE-CORE)
   * Intelligently preserves word boundaries while restoring script fragments.
   */
  const sanitizeAndRecon = (raw: string) => {
    // 1. Level 1: Basic XML/PUA Sanitation
    let t = raw.replace(/[\u0000-\u001F\uD800-\uDFFF\uFFFE\uFFFF\uE000-\uF8FF\u25CC\u25A1]/g, "");
    
    // 2. Adaptive Logic
    if (selectedLang.includes('hin')) {
      t = t.normalize('NFKD');

      // CONSERVATIVE JOINING: Only join if the next character is a Matra, Halant, or Modifier
      // We no longer join two consonants across a space to prevent "Sanskrit-ification"
      t = t.replace(/([\u0900-\u097F])\s+([\u093A-\u094F\u0900-\u0903\u093C])/g, "$1$2");
      
      // Fix Short-I (Separated)
      t = t.replace(/([\u093F])\s*([\u0900-\u097F])/g, '$2$1');
      
      // Recompose
      t = t.normalize('NFC');

      if (stripEnglish) {
        t = t.replace(/[a-zA-Z]/g, '');
      }
    } else {
      // Standard English/Latin Cleaning: Just normalize and trim
      t = t.normalize('NFC');
    }
    
    // Normalize spaces: prevent multiple spaces but PRESERVE word boundaries
    return t.trim().replace(/\s+/g, ' ');
  };

  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    const isHindi = selectedLang.includes('hin');
    addLog(`Activating Adaptive OCR Core v10.0 (${isHindi ? 'High Fidelity' : 'Balanced'})...`);
    
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    const { createWorker, createScheduler } = await import("tesseract.js");
    const scheduler = createScheduler();
    
    addLog(`Deploying ${isHindi ? 'Specialized' : 'Standard'} Workers...`);
    for (let j = 0; j < 2; j++) {
      const worker = await createWorker(selectedLang, 1);
      // PSM 3: Auto Page Segmentation (Handles mixed layouts better than PSM 6)
      const params: any = { tessedit_pageseg_mode: 3 as any };
      if (isHindi) {
        params.tessedit_char_whitelist = "0123456789अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह़ािीुूृेैोौ्॒॑॓॔क़ख़ग़ज़ड़ढ़फ़।.-,() ";
      }
      await worker.setParameters(params);
      scheduler.addWorker(worker);
    }
    
    const pageBlobs: Blob[] = [];
    // ADAPTIVE SCALE: 2.5x for English (prevents bleeding), 4.0x for Hindi (extracts microscopic matras)
    const renderScale = isHindi ? 4.0 : 2.5;
    addLog(`Rasterizing ${pdf.numPages} pages at ${renderScale}x resolution...`);
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: renderScale }); 
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx as any, viewport: viewport }).promise;
          
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          
          // ADAPTIVE PROCESSING
          if (isHindi) {
            // High-Contrast Binarization for Hindi script reconstruction
            for (let k = 0; k < d.length; k += 4) {
               let avg = (d[k] + d[k+1] + d[k+2]) / 3;
               avg = (avg - 128) * 2.0 + 128;
               const v = avg > 170 ? 255 : 0; 
               d[k] = d[k+1] = d[k+2] = v;
            }
          } else {
            // Grayscale preservation for Latin text (keeps anti-aliasing edges)
            for (let k = 0; k < d.length; k += 4) {
               const avg = (d[k] + d[k+1] + d[k+2]) / 3;
               d[k] = d[k+1] = d[k+2] = avg;
            }
          }
          ctx.putImageData(imgData, 0, 0);
          
          const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), "image/png"));
          pageBlobs.push(blob);
        }
    }

    addLog("Analysis Phase Parallelized...");
    const results = await Promise.all(pageBlobs.map(async (blob, idx) => {
      const { data: { text } } = await scheduler.addJob('recognize', blob) as any;
      const prog = Math.round(((idx + 1) / pdf.numPages) * 100);
      setProgress(`Synthesizing Page ${idx+1}/${pdf.numPages}`, prog);
      return text;
    }));

    await scheduler.terminate();

    addLog("Packaging Unicode Integrity DOCX...");
    const wordSections = results.map((text: string) => {
      const paragraphs = text.split('\n').map((line: string) => {
        const cleaned = sanitizeAndRecon(line);
        if (cleaned) {
          const isLineHindi = selectedLang.includes('hin');
          return new Paragraph({
            children: [
              new TextRun({ 
                text: cleaned, 
                size: 24, 
                language: isLineHindi ? { value: "hi-IN" } : undefined, 
                font: isLineHindi ? { 
                  name: "Nirmala UI", 
                  cs: "Nirmala UI", 
                  hint: "cs" 
                } : {
                  name: "Arial"
                }
              })
            ],
            spacing: { before: 120, line: 360 }
          });
        }
        return null;
      }).filter(Boolean) as DocxParagraph[];

      if (paragraphs.length === 0) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: " " })] }));
      }

      return { children: paragraphs };
    });

    const doc = new Document({ sections: wordSections });
    const wordBlob = await Packer.toBlob(doc);
    
    addLog("Conversion Finalized.");
    return {
      url: URL.createObjectURL(wordBlob),
      name: `${file.name.replace('.pdf', '')}.docx`
    };
  };

  const LanguageSelector = (
    <div className="space-y-3 w-full max-w-sm mx-auto">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center">
         <Settings2Icon className="mr-2 h-3 w-3 text-orange-500" /> Adaptive Script Engine
      </label>
      <select 
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm"
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
      >
        <option value="eng">English (Premium Layout)</option>
        <option value="hin+eng">Hindi + English (Expert Hybrid)</option>
        <option value="hin">Hindi (No-Tofu Reconstruction)</option>
        <option value="spa">Spanish (Universal)</option>
        <option value="fra">French (Diacritic Optimized)</option>
        <option value="ara">Arabic (Right-to-Left Core)</option>
      </select>
    </div>
  );

  return (
    <ConversionPage
      title="PDF to Word"
      subtitle="Adaptive-Core v10.0 OCR. Intelligently switches resolution and pre-processing based on script type for hybrid accuracy."
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
               <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight">Pure Script Mode</span>
               <span className="text-[9px] text-slate-500 font-medium leading-tight text-left">Isolates primary language script</span>
            </div>
          </div>
        </div>
      }
    />
  );
}
