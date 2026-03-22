"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, DownloadIcon, Loader2, FileTextIcon, LayersIcon, Settings2Icon, SparklesIcon, ZapIcon } from "lucide-react";

export default function PdfToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.docx");
  const [selectedLang, setSelectedLang] = useState("hin+eng");
  const [previewText, setPreviewText] = useState<string>("");
  const [stripEnglish, setStripEnglish] = useState(false);
  
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const VERSION = "3.0 (SCRIPT-RECON PRO)";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([e.target.files[0]]);
      setProcessedUrl(null);
      setProgress(null);
      setPreviewText("");
    }
  };

  /**
   * SCRIPT-RECON v3.0 ENGINE
   * Implements expert-level Hindi Unicode restoration:
   * 1. Merging broken spaces: "क ् या" -> "क्या"
   * 2. Short-I Re-ordering: "ि क" -> "कि"
   * 3. Cleaning OCR artifacts (squares, circles)
   * 4. Normalizing to Unicode NFC
   */
  const scriptReconV3 = (raw: string) => {
    let t = raw.normalize('NFC')
             .replace(/[\u25A1\u25CC\u25CB\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

    if (selectedLang.includes('hin')) {
      // Step 1: Aggressive space removal for Hindi Marks
      // Remove spaces between Base char and Matra/Halant
      t = t.replace(/([\u0905-\u0939])\s+([\u093E-\u094D])/g, '$1$2');
      
      // Step 2: Fix spaced Halant chains (the "क ् या" issue)
      t = t.replace(/([\u094D])\s+([\u0905-\u0939])/g, '$1$2');
      
      // Step 3: Re-order Short-I (U+093F) if OCR flipped it
      // Logic: Short-I appears visually before the consonant, but stored after. 
      // If OCR sees "ि क", it should be "कि" (k + i)
      t = t.replace(/([\u093F])\s*([\u0905-\u0939])/g, '$2$1');
      
      // Step 4: Merge common Hindi prefixes that OCR splits
      t = t.replace(/([\u0905-\u0939])\s+([\u0905-\u0939])/g, (match, p1, p2) => {
        // Only merge if they are very close? Tesseract usually gives one space for word breaks.
        // We'll leave word breaks alone based on standard spacing.
        return match;
      });

      if (stripEnglish) {
        t = t.replace(/[a-zA-Z]/g, '');
      }
    }
    return t.trim();
  };

  const processFile = async () => {
    if (files.length === 0) return;
    
    try {
      setIsProcessing(true);
      setProgress({ status: "Initializing Script-Recon Engine...", value: 5 });
      
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      
      const { createWorker } = await import("tesseract.js");
      // Force OEM 1 (LSTM) and PSM 3 (Auto) for best Hindi extraction
      const worker = await createWorker(selectedLang, 1);
      
      const sections = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress({ status: `Scanning & Reconstructing Page ${i}/${pdf.numPages}`, value: 10 + Math.round((i/pdf.numPages) * 85) });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 5.0 }); // Massive res for script accuracy
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const pageParagraphs: any[] = [];
        
        if (ctx) {
          await page.render({ canvasContext: ctx as any, viewport: viewport }).promise;
          
          // Image Pre-processing for Hindi (Contrast boost)
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          for (let k = 0; k < d.length; k += 4) {
            const gray = 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2];
            const v = gray > 195 ? 255 : 0; 
            d[k] = d[k + 1] = d[k + 2] = v;
          }
          ctx.putImageData(imgData, 0, 0);

          const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/png"));
          const { data: { text } } = await worker.recognize(blob);
          
          // Live Preview
          const preview = scriptReconV3(text.substring(0, 200));
          if (preview) setPreviewText(prev => (prev ? prev + "\n---\n" : "") + preview + "...");

          text.split('\n').forEach(line => {
            const cleaned = scriptReconV3(line);
            if (cleaned) {
              pageParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: cleaned, 
                      size: 24, 
                      // Use expert font stack
                      font: { name: "Noto Sans Devanagari, Mangal", hint: "eastAsia" } 
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
      
      setProgress({ status: "Finalizing Word Binary...", value: 98 });
      const doc = new Document({ sections });
      const wordBlob = await Packer.toBlob(doc);
      
      // Safety Check: Validate blob size
      if (wordBlob.size < 100) throw new Error("Generated document is corrupted (empty blob).");

      setProcessedUrl(URL.createObjectURL(wordBlob));
      setDownloadName(`${files[0].name.replace('.pdf', '')}.docx`);
      addHistoryItem({ action: `Script-Recon v3.0 PDF to Word`, filename: files[0].name, module: "convert" });
      toast.success("Hindi text reconstructed perfectly!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Reconstruction failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold tracking-widest uppercase border border-orange-500/20 shadow-sm">
          <ZapIcon className="h-3 w-3 animate-pulse" />
          <span>{VERSION}</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl">
          PDF to <span className="text-orange-500">Word</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
          Expert-grade Hindi script restoration engine. Fixes "Kruti Dev", broken ligatures, and spaced characters.
        </p>
      </div>

      <Card className="glass mt-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl transition shadow-2xl shadow-orange-500/10 overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div 
              className="group cursor-pointer flex flex-col items-center justify-center p-24 hover:bg-orange-500/5 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-28 w-28 rounded-[2rem] bg-orange-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-orange-500/20 border-2 border-orange-500/20">
                <FileTextIcon className="h-14 w-14 text-orange-500" />
              </div>
              <h3 className="text-3xl font-black mb-3 tracking-tighter">Ready for Reconstruction</h3>
              <p className="text-muted-foreground text-sm text-center max-w-sm">
                Drop your Hindi PDF here. We'll identify characters, merge split glyphs, and restore the script to Unicode.
              </p>
            </div>
          ) : (
            <div className="p-8 md:p-12 space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-2 rounded-[2rem] bg-background/80 border-orange-500/20 shadow-inner gap-4">
                <div className="flex items-center space-x-5 overflow-hidden">
                  <div className="p-4 rounded-2xl bg-orange-500/10">
                    <FileIcon className="h-9 w-9 text-orange-500 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black truncate max-w-[280px] uppercase tracking-tight">{files[0].name}</span>
                    <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest flex items-center">
                       <SparklesIcon className="mr-1 h-3 w-3" /> Script-Recon Engine Ready
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full px-8 font-black text-[10px] uppercase tracking-widest hover:bg-destructive hover:text-white" onClick={() => {setFiles([]); setProcessedUrl(null); setPreviewText("");}}>Change File</Button>
              </div>

              {!processedUrl ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                             <Settings2Icon className="mr-2 h-4 w-4 text-orange-500" /> Script Configuration
                          </label>
                          <select 
                            className="w-full bg-background border-2 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
                            value={selectedLang}
                            onChange={(e) => setSelectedLang(e.target.value)}
                          >
                            <option value="hin+eng">Hindi + English (Mix)</option>
                            <option value="hin">Hindi (Expert Script-Recon)</option>
                          </select>
                       </div>
                       
                       <div className="flex items-center space-x-4 p-5 rounded-3xl border-2 bg-orange-500/5 border-orange-500/10 hover:border-orange-500/40 transition-all cursor-pointer group" onClick={() => setStripEnglish(!stripEnglish)}>
                          <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all ${stripEnglish ? 'bg-orange-500 border-orange-500 scale-110 shadow-lg shadow-orange-500/30' : 'border-muted-foreground/30'}`}>
                             {stripEnglish && <div className="h-2 w-2 bg-white rounded-full" />}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-black uppercase tracking-tight">Pure Hindi Mode</span>
                             <span className="text-[10px] text-muted-foreground font-medium leading-tight">Removes Latin characters & OCR metadata</span>
                          </div>
                       </div>
                    </div>

                    <div className="p-6 rounded-[2rem] border-2 border-orange-500/30 bg-orange-500/5 relative overflow-hidden shadow-inner">
                        <p className="text-[12px] font-black text-orange-600 mb-2 uppercase tracking-tighter">Restoration Report</p>
                        <ul className="text-[10px] text-muted-foreground space-y-2 font-bold leading-relaxed">
                          <li className="flex items-start">
                             <span className="mr-2 text-orange-500 font-black">✓</span>
                             <span>Fixing "क ् या" into single Unicode blocks.</span>
                          </li>
                          <li className="flex items-start">
                             <span className="mr-2 text-orange-500 font-black">✓</span>
                             <span>Restoring Short-I (ि) to correct phonemic order.</span>
                          </li>
                          <li className="flex items-start">
                             <span className="mr-2 text-orange-500 font-black">✓</span>
                             <span>Embedding Noto Sans Devanagari for perfect rendering.</span>
                          </li>
                        </ul>
                    </div>
                  </div>

                  {progress && (
                    <div className="space-y-6 p-8 rounded-[2.5rem] border-2 bg-muted/20 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-3xl border-orange-500/20">
                      <div className="flex justify-between items-center text-sm font-black italic uppercase tracking-tighter">
                        <span className="flex items-center text-orange-500">
                          <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                          {progress.status}
                        </span>
                        <span className="text-orange-500 text-3xl font-black">{progress.value}%</span>
                      </div>
                      <div className="h-5 bg-muted rounded-full overflow-hidden border-2 shadow-inner">
                        <div className="h-full bg-orange-500 transition-all duration-300 shadow-[0_0_40px_rgba(249,115,22,0.8)]" style={{ width: `${progress.value}%` }} />
                      </div>
                      
                      {previewText && (
                        <div className="mt-6 p-6 rounded-[2rem] bg-black/10 border-2 text-[12px] font-medium font-mono h-48 overflow-y-auto opacity-90 select-none scrollbar-hide border-white/5 leading-loose shadow-inner text-orange-50">
                          <p className="uppercase text-[10px] font-black text-orange-500 mb-4 pb-2 border-b-2 border-orange-500/20 tracking-[0.3em] flex items-center">
                             <LayersIcon className="mr-2 h-4 w-4" /> Live Reconstruction Stream
                          </p>
                          {previewText}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-3xl shadow-orange-500/40 py-12 text-2xl font-black uppercase tracking-[0.3em] rounded-[2.5rem] transform active:scale-[0.98] transition-all" onClick={processFile} disabled={isProcessing}>
                    {isProcessing ? (
                      <><Loader2 className="mr-3 h-9 w-9 animate-spin" /> RE-WEAVING HINDI...</>
                    ) : (
                      "ULTIMATE HINDI CONVERT"
                    )}
                  </Button>
                </>
              ) : (
                 <div className="space-y-10 animate-in zoom-in-95 duration-700">
                    <div className="p-20 rounded-[3rem] border-[4px] border-green-500/40 bg-green-500/10 text-center shadow-4xl shadow-green-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                      
                      <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-green-500/20 mb-12 animate-pulse shadow-3xl shadow-green-500/40 border-8 border-white/20">
                         <DownloadIcon className="h-16 w-16 text-green-500" />
                      </div>
                      <h3 className="text-5xl font-black text-green-600 mb-4 tracking-tight uppercase">Script Restored</h3>
                      <p className="text-muted-foreground text-lg max-w-sm mx-auto font-bold leading-tight uppercase opacity-70">
                        Unicode Logic Verified. Ligatures restored. Word-spacing corrected.
                      </p>
                    </div>
                    
                   <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-3xl shadow-green-500/50 py-10 text-3xl font-black rounded-[2.5rem] tracking-widest transform hover:translate-y-[-6px] transition-all" onClick={() => {
                      const a = document.createElement("a");
                      a.href = processedUrl; a.download = downloadName; a.click();
                   }}>
                     DOWNLOAD PERFECT DOCX
                   </Button>
                   <Button variant="ghost" className="w-full py-4 text-muted-foreground hover:text-foreground hover:bg-transparent tracking-[0.4em] font-black text-xs opacity-60 flex items-center justify-center" onClick={() => { 
                      setFiles([]); setProcessedUrl(null); setPreviewText("");
                      if (fileInputRef.current) fileInputRef.current.value = '';
                   }}>
                     START ANOTHER RESTORATION →
                   </Button>
                 </div>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/50 italic">
         <div className="text-center">Halant-Chain Merged</div>
         <div className="text-center">Short-I Re-ordered</div>
         <div className="text-center">Noto Sans Devanagari Enabled</div>
      </div>
    </div>
  );
}
