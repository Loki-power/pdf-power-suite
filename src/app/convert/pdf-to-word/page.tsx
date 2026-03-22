"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, UploadCloudIcon, DownloadIcon, Loader2, FileTextIcon } from "lucide-react";

export default function PdfToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [highFidelity, setHighFidelity] = useState(false);
  const [downloadName, setDownloadName] = useState("document.doc");
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
      setProgress({ status: "Loading libraries...", value: 5 });
      
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await files[0].arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const pdf = await loadingTask.promise;
      
      setProgress({ status: "Extracting text and building document...", value: 20 });
      
      const sections = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress({ status: `Processing Page ${i}/${pdf.numPages}...`, value: 20 + Math.round((i/pdf.numPages) * 70) });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const pageParagraphs = [];
        
        if (highFidelity) {
          // --- OCR BASED EXTRACTION ---
          setProgress({ status: `Running OCR on Page ${i}/${pdf.numPages}...`, value: 20 + Math.round((i/pdf.numPages) * 70) });
          
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (context) {
            await page.render({ canvasContext: context as any, viewport: viewport }).promise;
            const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/png"));
            
            const { createWorker } = await import("tesseract.js");
            // Use Hindi and English for best results as identified in user screenshots
            const worker = await createWorker("hin+eng", 1);
            const { data: { text } } = await worker.recognize(blob);
            
            text.split('\n').forEach(line => {
              if (line.trim()) {
                pageParagraphs.push(
                  new Paragraph({
                    children: [new TextRun({ text: line, size: 24 })],
                    spacing: { before: 100 }
                  })
                );
              }
            });
            await worker.terminate();
          }
        } else {
          // --- LAYOUT AWARE EXTRACTION ---
          const textContent = await page.getTextContent();
          const items = textContent.items as any[];
          
          // 1. Group items by their Y-coordinate
          const rows: { [key: number]: any[] } = {};
          items.forEach(item => {
            const y = Math.round(item.transform[5]); 
            let foundRowY = Object.keys(rows).map(Number).find(ry => Math.abs(ry - y) < 4);
            if (foundRowY === undefined) {
              rows[y] = [];
              foundRowY = y;
            }
            rows[foundRowY].push(item);
          });
          
          // 2. Sort Y-coordinates from Top to Bottom
          const sortedY = Object.keys(rows).map(Number).sort((a, b) => b - a);
          
          for (const y of sortedY) {
            const rowItems = rows[y].sort((a, b) => a.transform[4] - b.transform[4]);
            
            let lineText = "";
            let lastX = -1;
            let lastWidth = 0;
            
            rowItems.forEach(item => {
              const currentX = item.transform[4];
              if (lastX !== -1) {
                const gap = currentX - (lastX + lastWidth);
                if (gap > 2.0) { // Even tighter merging for Hindi
                  lineText += " ";
                }
              }
              lineText += item.str;
              lastX = currentX;
              lastWidth = item.width || 0;
            });
            
            if (lineText.trim()) {
              pageParagraphs.push(
                new Paragraph({
                  children: [new TextRun({ text: lineText, size: 24 })],
                  spacing: { before: 100 }
                })
              );
            }
          }
        }
        
        sections.push({
          properties: {},
          children: pageParagraphs,
        });
      }
      
      setProgress({ status: "Packing binary data...", value: 95 });
      
      const doc = new Document({ sections });
      const blob = await Packer.toBlob(doc);
      
      setProcessedUrl(URL.createObjectURL(blob));
      setDownloadName(`${files[0].name.replace('.pdf', '')}.docx`);
      addHistoryItem({ action: `Converted PDF to Word (.docx)`, filename: files[0].name, module: "convert" });
      toast.success("Binary Word document (.docx) generated successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Failed to convert PDF to Word: ${e.message}`);
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
          Extract text intelligently into an editable MS Word format offline.
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
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between p-4 border rounded-xl bg-orange-500/5 border-orange-500/20">
                        <div className="space-y-0.5">
                          <label className="text-sm font-semibold">High Fidelity (Best for Hindi/OCR)</label>
                          <p className="text-xs text-muted-foreground italic">Uses AI to perfectly reconstruct text from images. Slower but more accurate.</p>
                        </div>
                        {/* Use standard checkbox for simplicity */}
                        <input 
                          type="checkbox" 
                          checked={highFidelity} 
                          onChange={(e) => setHighFidelity(e.target.checked)}
                          className="h-5 w-5 accent-cyan-500"
                        />
                      </div>

                      {progress && (
                        <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
                          <div className="flex justify-between text-sm font-medium">
                            <span>{progress.status}</span>
                            <span>{progress.value}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress.value}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  <Button size="lg" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={processFile} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} Convert to Word
                  </Button>
                </>
              ) : (
                 <div className="space-y-3">
                   <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                      const a = document.createElement("a");
                      a.href = processedUrl; a.download = downloadName; a.click();
                   }}>
                     <DownloadIcon className="mr-2 h-5 w-5" /> Download Document
                   </Button>
                   <Button variant="outline" className="w-full" onClick={() => { 
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
    </div>
  );
}
