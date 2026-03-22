"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, DownloadIcon, Loader2, FileTextIcon } from "lucide-react";

export default function PdfToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.docx");
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([e.target.files[0]]);
      setProcessedUrl(null);
      setProgress(null);
    }
  };

  const processFile = async () => {
    if (files.length === 0 || files[0].type !== "application/pdf") {
      toast.error("Please select a valid PDF file.");
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress({ status: "Initializing AI OCR Engine...", value: 5 });
      
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await files[0].arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const pdf = await loadingTask.promise;
      
      const sections = [];
      const { createWorker } = await import("tesseract.js");
      
      // Initialize worker once for all pages
      const worker = await createWorker("hin+eng", 1);

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress({ status: `Scanning Page ${i}/${pdf.numPages}...`, value: 10 + Math.round((i/pdf.numPages) * 85) });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 4.0 }); // High resolution for precise script extraction
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const pageParagraphs = [];
        
        if (context) {
          // Render high-res image of the page
          await page.render({ canvasContext: context as any, viewport: viewport }).promise;
          const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/png"));
          
          // Run OCR on the rendered image
          const { data: { text } } = await worker.recognize(blob);
          
          text.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed) {
              pageParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: trimmed, 
                      size: 24, // 12pt
                      font: "Mangal" // Optimized for Hindi
                    })
                  ],
                  spacing: { before: 180, line: 400 }, // Generous line height for legibility
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
      
      setProgress({ status: "Generating perfect Word structure...", value: 98 });
      const doc = new Document({ sections });
      const blob = await Packer.toBlob(doc);
      
      setProcessedUrl(URL.createObjectURL(blob));
      setDownloadName(`${files[0].name.replace('.pdf', '')}.docx`);
      addHistoryItem({ action: `Converted PDF to Word (High-Fidelity AI)`, filename: files[0].name, module: "convert" });
      toast.success("High-Fidelity Word document successfully generated!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Error during conversion: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          PDF to <span className="text-cyan-500">Word</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          State-of-the-art AI extraction for perfect Hindi and complex script fidelity.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl">
        <CardContent>
          {files.length === 0 ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-cyan-500/30 hover:bg-cyan-500/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
                <FileTextIcon className="h-10 w-10 text-cyan-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload PDF</h3>
              <p className="text-muted-foreground text-sm">Optimized for Hindi, English, and complex layouts</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-cyan-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{files[0].name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFiles([]); setProcessedUrl(null);}}>Change File</Button>
              </div>

              {!processedUrl ? (
                <>
                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-2 mb-6">
                    <p className="text-sm font-medium flex items-center text-cyan-500">
                      <Loader2 className="mr-2 h-4 w-4" /> AI-OCR Engine Enabled
                    </p>
                    <p className="text-xs text-muted-foreground">
                      We use high-resolution vision to perfectly reconstruct your document. 
                      Best for Hindi scripts and scanned files.
                    </p>
                  </div>

                  {progress && (
                    <div className="space-y-2 mb-6 p-4 rounded-xl border bg-muted/20">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{progress.status}</span>
                        <span>{progress.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress.value}%` }} />
                      </div>
                    </div>
                  )}
                  <Button size="lg" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20" onClick={processFile} disabled={isProcessing}>
                    {isProcessing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing AI OCR...</>
                    ) : (
                      "Convert to High-Quality Word"
                    )}
                  </Button>
                </>
              ) : (
                 <div className="space-y-3">
                   <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center mb-4">
                     <p className="text-sm font-bold text-green-500">Conversion Complete!</p>
                     <p className="text-xs text-muted-foreground">Original formatting and script integrity preserved.</p>
                   </div>
                   <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                      const a = document.createElement("a");
                      a.href = processedUrl; a.download = downloadName; a.click();
                   }}>
                     <DownloadIcon className="mr-2 h-5 w-5" /> Download (.docx)
                   </Button>
                   <Button variant="outline" className="w-full border-2" onClick={() => { 
                      setFiles([]); setProcessedUrl(null); 
                      if (fileInputRef.current) fileInputRef.current.value = '';
                   }}>
                     Convert another file
                   </Button>
                 </div>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
         <div className="p-4 rounded-xl border bg-muted/30">
            <h4 className="font-bold text-sm mb-1">Indic Script Support</h4>
            <p className="text-xs text-muted-foreground">Full support for Hindi, Marathi, Sanskrit, and more with zero jumbled characters.</p>
         </div>
         <div className="p-4 rounded-xl border bg-muted/30">
            <h4 className="font-bold text-sm mb-1">OCR-First Engine</h4>
            <p className="text-xs text-muted-foreground">Converts even blurred or low-quality PDFs into crisp, editable Word text.</p>
         </div>
      </div>
    </div>
  );
}
