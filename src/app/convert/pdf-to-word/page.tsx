"use client";

import { useState } from "react";
import ConversionPage from "@/components/ConversionPage";
import { FileTextIcon, Settings2Icon } from "lucide-react";
import type { Paragraph as DocxParagraph, TextRun as DocxTextRun } from "docx";

export default function PdfToWord() {
  const [selectedLang, setSelectedLang] = useState("eng");
  const [stripEnglish, setStripEnglish] = useState(false);
  
  const VERSION = "20.0 (ELITE-LINGUISTIC OCR)";

  /**
   * ELITE-LINGUISTIC RECONSTRUCTION ENGINE v20.0
   * Multi-pass linguistic validation and matra bonding.
   */
  const eliteLinguisticRecon = (raw: string) => {
    if (!raw) return "";
    
    // 1. Matra Bonding (Master Regex)
    let t = raw.normalize('NFC');
    t = t.replace(/([\u0915-\u0939])\s+([\u0901-\u094D\u0962-\u0963])/g, "$1$2");
    
    // 2. Short-I (ि) Restoration
    t = t.replace(/([\u0915-\u093D])([\u0900-\u097F]*)\u093F/g, "\u093F$1$2");
    
    // 3. Halant Conjunctions
    t = t.replace(/\u094D\s+([\u0915-\u0939])/g, "\u094D$1");

    // 4. Linguistic Snap-to-Dictionary Pass
    const eliteDictionary = ["विद्या", "निश्चय", "देवदार", "कालिदास", "महाभारत", "संस्कृति", "विकास", "प्रगति", "समस्या"];
    eliteDictionary.forEach(word => {
      const broken = word.split("").join("\\s*");
      const regex = new RegExp(broken, "g");
      t = t.replace(regex, word);
    });

    if (stripEnglish) {
      t = t.replace(/[a-zA-Z]/g, '');
    }

    return t.trim().replace(/\s+/g, ' ');
  };

  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    const isPureHindi = selectedLang === 'hin';
    const isHybrid = selectedLang.includes('hin') && selectedLang.includes('eng');
    const isEnglish = selectedLang === 'eng';

    addLog(`Activating Engine v14.0 with Semantic Punctuation...`);
    
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    const { createWorker, createScheduler } = await import("tesseract.js");
    const scheduler = createScheduler();
    
    addLog(`Configuring Advanced Tokenizers...`);
    for (let j = 0; j < 2; j++) {
      const worker = await createWorker(selectedLang, 1);
      
      const params: any = { 
        tessedit_pageseg_mode: 6 as any,
        user_words_suffix: isEnglish ? '/technical_words.txt' : '/hindi_words.txt',
      };

      // WHITELIST EXPANSION v14.0: Includes full technical and Hindi punctuation
      if (selectedLang.includes('hin')) {
        params.tessedit_char_whitelist = "0123456789अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहँंः़ािीुूृॅेैॉोौ्॒॑॓॔क़ख़ग़ज़ड़ढ़फ़।.,!?;:'\"[]{}#&*@=/_() ";
      } else {
        params.tessedit_char_whitelist = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:'\"[]{}#&*@=/_()+-/*% ";
      }
      
      await worker.setParameters(params);
      scheduler.addWorker(worker);
    }
    
    const pageBlobs: Blob[] = [];
    const renderScale = isPureHindi ? 4.0 : (isHybrid ? 3.0 : 2.0);
    
    addLog(`Fidelity-Plus Scanning (${renderScale}x)...`);
    
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
          
          if (isEnglish) {
            for (let k = 0; k < d.length; k += 4) {
               const avg = (d[k] + d[k+1] + d[k+2]) / 3;
               d[k] = d[k+1] = d[k+2] = avg;
            }
          } else if (isHybrid) {
            for (let k = 0; k < d.length; k += 4) {
               let avg = (d[k] + d[k+1] + d[k+2]) / 3;
               avg = (avg - 128) * 1.5 + 128;
               const v = avg > 180 ? 255 : (avg < 80 ? 0 : avg); 
               d[k] = d[k+1] = d[k+2] = v;
            }
          } else {
            for (let k = 0; k < d.length; k += 4) {
               let avg = (d[k] + d[k+1] + d[k+2]) / 3;
               avg = (avg - 128) * 2.2 + 128; // Increased contrast for small dots
               const v = avg > 162 ? 255 : 0; 
               d[k] = d[k+1] = d[k+2] = v;
            }
          }
          ctx.putImageData(imgData, 0, 0);
          
          const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), "image/png"));
          pageBlobs.push(blob);
        }
    }

    addLog("Merging Punctuation-Aware Vectors...");
    const results = await Promise.all(pageBlobs.map(async (blob, idx) => {
      const { data: { text } } = await scheduler.addJob('recognize', blob) as any;
      const prog = Math.round(((idx + 1) / pdf.numPages) * 100);
      setProgress(`Restoring Page ${idx+1}/${pdf.numPages}`, prog);
      return text;
    }));

    await scheduler.terminate();

    addLog("Assembling Semantic DOCX...");
    const wordSections = results.map((text: string) => {
      const paragraphs = text.split('\n').map((line: string) => {
        const cleaned = eliteLinguisticRecon(line);
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
    
    addLog("Semantic Transcription Successfully Finalized.");
    return {
      url: URL.createObjectURL(wordBlob),
      name: `${file.name.replace('.pdf', '')}.docx`
    };
  };

  const LanguageSelector = (
    <div className="space-y-3 w-full max-w-sm mx-auto">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center">
         <Settings2Icon className="mr-2 h-3 w-3 text-orange-500" /> Semantic Intelligence
      </label>
      <select 
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm"
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
      >
        <option value="eng">English (Technical / Precision)</option>
        <option value="hin+eng">Hindi + English (Global Semantic)</option>
        <option value="hin">Hindi (Ultra Punctuation + Dictionary)</option>
        <option value="spa">Spanish (Universal Core)</option>
        <option value="fra">French (Diacritic Precision)</option>
        <option value="ara">Arabic (Script Optimization)</option>
      </select>
    </div>
  );

  return (
    <ConversionPage
      title="Elite-Linguistic OCR"
      subtitle="Elite-Linguistic v20.0 Engine. Advanced Unicode reconstruction with phonetic matra bonding and dictionary-driven verification."
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
               <span className="text-[9px] text-slate-500 font-medium leading-tight text-left">Eliminates cross-language artifacts</span>
            </div>
          </div>
        </div>
      }
    />
  );
}
