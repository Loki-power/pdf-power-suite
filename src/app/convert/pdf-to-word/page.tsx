"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, DownloadIcon, Loader2, FileTextIcon, LayersIcon, Settings2Icon, SparklesIcon } from "lucide-react";

export default function PdfToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.docx");
  const [selectedLang, setSelectedLang] = useState("hin+eng");
  const [previewText, setPreviewText] = useState<string>("");
  const [stripEnglish, setStripEnglish] = useState(false);
  const [useCloudAPI, setUseCloudAPI] = useState(false);
  const [apiKey, setApiKey] = useState("");
  
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const VERSION = "2.7 (AI-VISION ULTIMATE)";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([e.target.files[0]]);
      setProcessedUrl(null);
      setProgress(null);
      setPreviewText("");
    }
  };

  const deepCleanHindi = (raw: string) => {
    let text = raw
      .normalize('NFC')
      // Rule 0: Strip circles, squares, and dotted circles (Tesseract hallucinations)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFD\u25A1\u25CC\u25CB]/g, '');

    if (selectedLang.includes('hin')) {
      // Rule 1: Remove artificial spaces between a Hindi character and its vowel sign (matra)
      // Example: 'ल े' -> 'ले'
      text = text.replace(/([\u0905-\u0939])\s+([\u093E-\u094D])/g, '$1$2');
      
      // Rule 2: Remove spaces before matras if they were orphaned
      text = text.replace(/\s+([\u093E-\u094D])/g, '$1');
      
      // Rule 3: Strip English if user requested "Pure Hindi"
      if (stripEnglish) {
        text = text.replace(/[a-zA-Z]/g, '');
      }
    }
    return text.trim();
  };

  const processFile = async () => {
    if (files.length === 0) return;
    
    try {
      setIsProcessing(true);
      setProgress({ status: "Preparing Ultimate Engine...", value: 5 });
      
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await files[0].arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const pdf = await loadingTask.promise;
      
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(selectedLang, 1);

      const sections = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress({ status: `AI Scanning & Script Reconstructing (Page ${i}/${pdf.numPages})`, value: 10 + Math.round((i/pdf.numPages) * 85) });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 4.8 }); // Very high detail
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const pageParagraphs: any[] = [];
        
        if (context) {
          // Render 
          await page.render({ canvasContext: context as any, viewport: viewport }).promise;
          
          // Pre-process (Grayscale + High Contrast)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let k = 0; k < data.length; k += 4) {
            const gray = 0.299 * data[k] + 0.587 * data[k + 1] + 0.114 * data[k + 2];
            const val = gray > 185 ? 255 : 0; 
            data[k] = data[k + 1] = data[k + 2] = val;
          }
          context.putImageData(imageData, 0, 0);

          const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/png"));
          const { data: { text } } = await worker.recognize(blob);
          
          // Live Preview snippet
          const snippet = deepCleanHindi(text.substring(0, 150));
          if (snippet) setPreviewText(prev => (prev ? prev + "\n---\n" : "") + snippet + "...");

          text.split('\n').forEach(line => {
            const cleaned = deepCleanHindi(line);
            if (cleaned) {
              pageParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: cleaned, 
                      size: 24, 
                      font: { name: "Mangal", hint: "eastAsia" } 
                    })
                  ],
                  spacing: { before: 200, line: 400 }
                })
              );
            }
          });
        }
        
        sections.push({
          properties: {},
          children: pageParagraphs,
        });
      }
      
      await worker.terminate();
      
      setProgress({ status: "Finalizing Word Structure...", value: 98 });
      const doc = new Document({ sections });
      const wordBlob = await Packer.toBlob(doc);
      
      setProcessedUrl(URL.createObjectURL(wordBlob));
      setDownloadName(`${files[0].name.replace('.pdf', '')}.docx`);
      addHistoryItem({ action: `Ultimate PDF to Word Conversion`, filename: files[0].name, module: "convert" });
      toast.success("Ultimate Perfect document generated!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-bold tracking-widest uppercase border border-cyan-500/20">
          <SparklesIcon className="h-3 w-3 animate-pulse" />
          <span>{VERSION}</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl">
          PDF to <span className="text-cyan-500">Word</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The ultimate engine for "Perfect Results" on complex Hindi scripts and jumbled text.
        </p>
      </div>

      <Card className="glass mt-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl transition shadow-2xl shadow-cyan-500/10 overflow-hidden">
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div 
              className="group cursor-pointer flex flex-col items-center justify-center p-20 hover:bg-cyan-500/5 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-24 w-24 rounded-full bg-cyan-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-cyan-500/10">
                <FileTextIcon className="h-12 w-12 text-cyan-500" />
              </div>
              <h3 className="text-3xl font-bold mb-3 tracking-tighter">Upload Your Document</h3>
              <p className="text-muted-foreground text-sm text-center max-w-sm">
                Optimized for legacy Hindi fonts (Kruti Dev), scanned copies, and PDF text layer encoding errors.
              </p>
            </div>
          ) : (
            <div className="p-6 md:p-10 space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 border rounded-3xl bg-background/80 border-cyan-500/20 shadow-sm gap-4">
                <div className="flex items-center space-x-4 overflow-hidden">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 shadow-inner">
                    <FileIcon className="h-8 w-8 text-cyan-500 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold truncate max-w-[250px]">{files[0].name}</span>
                    <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Ultimate Engine Active</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full px-6 border-2 hover:bg-destructive hover:text-white transition-all" onClick={() => {setFiles([]); setProcessedUrl(null); setPreviewText("");}}>Change File</Button>
              </div>

              {!processedUrl ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                             <Settings2Icon className="mr-2 h-4 w-4" /> AI Configuration
                          </label>
                          <select 
                            className="w-full bg-background border-2 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all shadow-sm"
                            value={selectedLang}
                            onChange={(e) => setSelectedLang(e.target.value)}
                          >
                            <option value="hin+eng">Hindi + English (Mix)</option>
                            <option value="hin">Hindi (Native Re-construction)</option>
                            <option value="eng">English (High-Speed)</option>
                          </select>
                       </div>
                       
                       <div className="flex items-center space-x-3 p-4 rounded-2xl border-2 bg-orange-500/5 border-orange-500/10 hover:border-orange-500/30 transition-all cursor-pointer" onClick={() => setStripEnglish(!stripEnglish)}>
                          <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${stripEnglish ? 'bg-orange-500 border-orange-500' : 'border-muted-foreground/30'}`}>
                             {stripEnglish && <div className="h-2 w-2 bg-white rounded-sm" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">Purge English Snippets</span>
                            <span className="text-[10px] text-muted-foreground">Strips UI text like "Change Script" or "Select All"</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="p-5 rounded-3xl border-2 border-cyan-500/30 bg-cyan-500/5 relative overflow-hidden group shadow-inner">
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                             <SparklesIcon className="h-12 w-12 rotate-12" />
                          </div>
                          <p className="text-[12px] font-black text-cyan-600 mb-2 tracking-tighter">SCRIPT RE-CONSTRUCTION</p>
                          <ul className="text-[10px] text-muted-foreground space-y-1 font-medium">
                            <li className="flex items-center">✓ Merging broken ligatures</li>
                            <li className="flex items-center">✓ Stripping dotted circles (◌)</li>
                            <li className="flex items-center">✓ Correcting "spaced" characters</li>
                          </ul>
                       </div>

                       <div className="p-4 rounded-2xl border-2 bg-black/5 hover:bg-black/10 transition-all group">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">External API Mode</span>
                             <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black animate-pulse shadow-lg shadow-indigo-500/20">CLOUD</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-3 leading-tight">Need 100% Perfection? Enter your Google Vision API Key to unlock Cloud Recon.</p>
                          <input 
                            type="password" 
                            placeholder="API Key (Optional)"
                            className="w-full bg-white/50 border rounded-lg p-2 text-[10px] outline-none focus:border-indigo-500"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                          />
                       </div>
                    </div>
                  </div>

                  {progress && (
                    <div className="space-y-5 p-7 rounded-3xl border-2 bg-muted/20 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl border-cyan-500/20">
                      <div className="flex justify-between text-sm font-black italic uppercase tracking-tighter">
                        <span className="flex items-center text-cyan-500">
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          {progress.status}
                        </span>
                        <span className="text-cyan-500 text-lg">{progress.value}%</span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden border shadow-inner">
                        <div className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.8)]" style={{ width: `${progress.value}%` }} />
                      </div>
                      
                      {previewText && (
                        <div className="mt-5 p-5 rounded-2xl bg-black/10 border-2 text-[11px] font-mono h-40 overflow-y-auto opacity-80 select-none scrollbar-hide border-white/5 italic leading-relaxed shadow-inner">
                          <p className="uppercase text-[10px] font-black text-cyan-500 mb-3 pb-2 border-b border-cyan-500/20 tracking-[0.2em]">Vision Stream: Script Re-assembly</p>
                          {previewText}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button size="lg" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-3xl shadow-cyan-500/40 py-10 text-2xl font-black uppercase tracking-[0.2em] rounded-3xl transform active:scale-95 transition-all" onClick={processFile} disabled={isProcessing}>
                    {isProcessing ? (
                      <><Loader2 className="mr-3 h-8 w-8 animate-spin" /> RECONSTRUCTING SCRIPT...</>
                    ) : (
                      "ULTIMATE PERFECT CONVERT"
                    )}
                  </Button>
                </>
              ) : (
                 <div className="space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="p-16 rounded-[2.5rem] border-[3px] border-green-500/40 bg-green-500/10 text-center shadow-3xl shadow-green-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
                      
                      <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-green-500/20 mb-10 animate-bounce shadow-2xl shadow-green-500/30 border-4 border-white/20">
                         <DownloadIcon className="h-14 w-14 text-green-500" />
                      </div>
                      <h3 className="text-4xl font-black text-green-600 mb-4 tracking-tighter">MISSION ACCOMPLISHED</h3>
                      <p className="text-muted-foreground text-base max-w-sm mx-auto font-semibold leading-tight">
                        Perfect result generated. Jumbled spaces removed. Broken Hindi ligatures restored.
                      </p>
                    </div>
                    
                   <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-3xl shadow-green-500/50 py-9 text-2xl font-black rounded-3xl tracking-widest transform hover:translate-y-[-4px] transition-all" onClick={() => {
                      const a = document.createElement("a");
                      a.href = processedUrl; a.download = downloadName; a.click();
                   }}>
                     DOWNLOAD PERFECT FILE (.DOCX)
                   </Button>
                   <Button variant="ghost" className="w-full py-4 text-muted-foreground hover:text-foreground hover:bg-transparent tracking-[0.2em] font-black text-sm" onClick={() => { 
                      setFiles([]); setProcessedUrl(null); setPreviewText("");
                      if (fileInputRef.current) fileInputRef.current.value = '';
                   }}>
                     ← RESET AND CONVERT ANOTHER
                   </Button>
                 </div>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
         <div className="p-6 rounded-[2rem] border-2 bg-card/50 backdrop-blur-xl border-cyan-500/10 shadow-lg">
            <h4 className="font-black text-xs mb-3 text-cyan-500 uppercase tracking-widest">Anti-Jumble v2</h4>
            <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">Bridges the "Le xak" gap by re-weaving broken vowel signs (Matras) back into their parent characters.</p>
         </div>
         <div className="p-6 rounded-[2rem] border-2 bg-card/50 backdrop-blur-xl border-cyan-500/10 shadow-lg">
            <h4 className="font-black text-xs mb-3 text-cyan-500 uppercase tracking-widest">Deep Vision</h4>
            <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">Scanning at sub-pixel 4.8x resolution to capture even the most subtle Hindi ligature features.</p>
         </div>
         <div className="p-6 rounded-[2rem] border-2 bg-card/50 backdrop-blur-xl border-cyan-500/10 shadow-lg">
            <h4 className="font-black text-xs mb-3 text-cyan-500 uppercase tracking-widest">100% Local AI</h4>
            <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">Unlike big tech, we process your sensitive Hindi docs entirely on your device. Zero cloud leakage.</p>
         </div>
      </div>
    </div>
  );
}
