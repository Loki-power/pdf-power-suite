"use client";

import { useState } from "react";
import ConversionPage from "@/components/ConversionPage";
import { FileTextIcon, Settings2Icon } from "lucide-react";

export default function PdfToWord() {
  const [selectedLang, setSelectedLang] = useState("eng");
  const [stripEnglish, setStripEnglish] = useState(false);
  
  const VERSION = "6.0 (SPLICED-RECON)";

  /**
   * SPLICED-RECON v6.0 ENGINE
   * Multi-language OCR and script restoration.
   */
  const scriptReconV6 = (raw: string) => {
    let t = raw.normalize('NFC')
             .replace(/[\u25A1\u25CC\u25CB\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

    // Hindi-specific restoration logic
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
    addLog(`Activating ${selectedLang.toUpperCase()} OCR Matrix...`);
    
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    const { createWorker } = await import("tesseract.js");
    addLog(`Initializing Global Language Hub...`);
    const worker = await createWorker(selectedLang, 1);
    
    const sections = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const prog = Math.round((i / pdf.numPages) * 100);
        setProgress(`Splicing Page ${i}/${pdf.numPages}`, prog);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 4.0 });
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const pageParagraphs: any[] = [];
        
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

          const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/png"));
          
          await worker.setParameters({ tessedit_pageseg_mode: 6 as any });
          const { data: { text } } = await worker.recognize(blob);
          
          text.split('\n').forEach((line: string) => {
            const cleaned = scriptReconV6(line);
            if (cleaned) {
              pageParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: cleaned, 
                      size: 24, 
                      font: { name: selectedLang.includes('hin') ? "Noto Sans Devanagari" : "Inter", hint: "default" } 
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
    const doc = new Document({ sections });
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
      subtitle="Next-gen multi-language OCR engine. Specialized script restoration for Hindi, English, and complex global scripts with pixel-perfect accuracy."
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
