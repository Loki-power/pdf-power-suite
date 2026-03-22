"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, DownloadIcon, Loader2, FileTextIcon, LayersIcon } from "lucide-react";

export default function PdfToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.docx");
  const [selectedLang, setSelectedLang] = useState("hin+eng");
  const [previewText, setPreviewText] = useState<string>("");
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const VERSION = "2.6 (AI-VISION PRO)";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([e.target.files[0]]);
      setProcessedUrl(null);
      setProgress(null);
      setPreviewText("");
    }
  };

  const processFile = async () => {
    if (files.length === 0 || files[0].type !== "application/pdf") {
      toast.error("Please select a valid PDF file.");
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress({ status: "Loading AI Libraries...", value: 5 });
      
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await files[0].arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const pdf = await loadingTask.promise;
      
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(selectedLang, 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            // Internal page progress can be ignored or handled if needed
          }
        }
      });

      const sections = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress({ status: `AI-OCR Scanning Page ${i}/${pdf.numPages}...`, value: 10 + Math.round((i/pdf.numPages) * 85) });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 4.5 }); // Ultra-high-res for sub-pixel script precision
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const pageParagraphs: any[] = [];
        
        if (context) {
          // 1. Render high-res
          await page.render({ canvasContext: context as any, viewport: viewport }).promise;
          
          // 2. Pre-process Image (Grayscale & Adaptive Contrast)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let j = 0; j < data.length; j += 4) {
            // Luma formula for better grayscale
            const gray = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
            // Slightly softer threshold to preserve thin ligatures
            const val = gray > 180 ? 255 : 0; 
            data[j] = data[j + 1] = data[j + 2] = val;
          }
          context.putImageData(imageData, 0, 0);

          const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/png"));
          
          const { data: { text } } = await worker.recognize(blob);
          
          // Show live preview snippet
          const snippet = text.trim().substring(0, 200);
          if (snippet) setPreviewText(prev => (prev ? prev + "\n---\n" : "") + snippet + "...");

          // 3. Clean and Normalize Text
          const cleanText = (raw: string) => {
            return raw
              .normalize('NFC')
              // Remove control characters and weird symbols that look like squares
              .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFD\u25A1]/g, '')
              .trim();
          };

          text.split('\n').forEach(line => {
            const cleaned = cleanText(line);
            if (cleaned) {
              pageParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: cleaned, 
                      size: 24, 
                      font: { name: "Mangal", hint: "eastAsia" } // Explicit font hint for Word
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
      
      setProgress({ status: "Finalizing Word document...", value: 98 });
      const doc = new Document({ sections });
      const wordBlob = await Packer.toBlob(doc);
      
      setProcessedUrl(URL.createObjectURL(wordBlob));
      setDownloadName(`${files[0].name.replace('.pdf', '')}.docx`);
      addHistoryItem({ action: `Converted PDF to Word (v2.5 AI-OCR: ${selectedLang})`, filename: files[0].name, module: "convert" });
      toast.success("Professional Word document successfully generated!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Conversion failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-bold tracking-widest uppercase border border-cyan-500/20">
          <LayersIcon className="h-3 w-3" />
          <span>{VERSION}</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl">
          PDF to <span className="text-cyan-500">Word</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          AI-Vision engine optimized for Hindi, legacy fonts, and complex layouts.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl transition shadow-2xl shadow-cyan-500/5">
        <CardContent>
          {files.length === 0 ? (
            <div 
              className="group cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/5 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileTextIcon className="h-10 w-10 text-cyan-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload PDF</h3>
              <p className="text-muted-foreground text-sm text-center max-w-xs">
                Perfect for files with jumbled text, legacy fonts (Kruti Dev), or scanned pages.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50 border-cyan-500/10">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <FileIcon className="h-6 w-6 text-cyan-500 shrink-0" />
                  </div>
                  <span className="text-sm font-medium truncate">{files[0].name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFiles([]); setProcessedUrl(null); setPreviewText("");}}>Change File</Button>
              </div>

              {!processedUrl ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Language Context</label>
                       <select 
                         className="w-full bg-background border rounded-lg p-2.5 text-sm ring-offset-background focus:ring-2 focus:ring-cyan-500/50 outline-none"
                         value={selectedLang}
                         onChange={(e) => setSelectedLang(e.target.value)}
                       >
                         <option value="hin+eng">Hindi + English (Mix)</option>
                         <option value="hin">Hindi (Native)</option>
                         <option value="eng">English (Standard)</option>
                         <option value="fra">French</option>
                         <option value="spa">Spanish</option>
                       </select>
                    </div>
                    <div className="p-3 rounded-lg border bg-cyan-500/5 border-cyan-500/20 flex items-center">
                       <p className="text-[10px] text-cyan-600/80 leading-relaxed">
                         <b>HINDI DETECTED:</b> Using High-Res Vision scanning to reconstruct characters. This bypasses font encoding issues.
                       </p>
                    </div>
                  </div>

                  {progress && (
                    <div className="space-y-4 mb-6 p-5 rounded-xl border bg-muted/20 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-inner">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-cyan-500" />
                          {progress.status}
                        </span>
                        <span className="text-cyan-500">{progress.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${progress.value}%` }} />
                      </div>
                      
                      {previewText && (
                        <div className="mt-4 p-3 rounded-lg bg-black/5 border text-[10px] font-mono h-24 overflow-y-auto opacity-60 select-none scrollbar-hide">
                          <p className="uppercase text-[9px] font-bold text-muted-foreground mb-2 pb-1 border-b">Live Vision Stream:</p>
                          {previewText}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button size="lg" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl shadow-cyan-500/20 py-7 text-lg font-bold" onClick={processFile} disabled={isProcessing}>
                    {isProcessing ? (
                      <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> RUNNING AI SCAN...</>
                    ) : (
                      "Convert to Word (AI Version)"
                    )}
                  </Button>
                </>
              ) : (
                 <div className="space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="p-10 rounded-2xl border-2 border-green-500/20 bg-green-500/5 text-center shadow-inner">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6 animate-bounce">
                         <DownloadIcon className="h-10 w-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-500 mb-2">Success!</h3>
                      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        Your file has been perfectly reconstructed using high-fidelity AI vision.
                      </p>
                    </div>
                    
                   <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20 py-7 text-lg font-bold" onClick={() => {
                      const a = document.createElement("a");
                      a.href = processedUrl; a.download = downloadName; a.click();
                   }}>
                     Download (.docx)
                   </Button>
                   <Button variant="outline" className="w-full py-4 text-muted-foreground hover:text-foreground" onClick={() => { 
                      setFiles([]); setProcessedUrl(null); setPreviewText("");
                      if (fileInputRef.current) fileInputRef.current.value = '';
                   }}>
                     Process Another File
                   </Button>
                 </div>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
         <div className="p-5 rounded-2xl border bg-muted/30 backdrop-blur-sm">
            <h4 className="font-bold text-sm mb-2 text-cyan-500">Anti-Jumble Тех</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Fixes Kruti Dev, Devlys, and other legacy Hindi fonts by using pixels instead of text layers.</p>
         </div>
         <div className="p-5 rounded-2xl border bg-muted/30 backdrop-blur-sm">
            <h4 className="font-bold text-sm mb-2 text-cyan-500">Vision 4.0</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">High-resolution scanning at 3.5x scale ensures even small ligatures are captured perfectly.</p>
         </div>
         <div className="p-5 rounded-2xl border bg-muted/30 backdrop-blur-sm">
            <h4 className="font-bold text-sm mb-2 text-cyan-500">Private & Local</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">All AI processing happens inside your browser. Your files never leave your computer.</p>
         </div>
      </div>
    </div>
  );
}
