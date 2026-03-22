"use client";

import { useState, useRef } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, UploadCloudIcon, DownloadIcon, Loader2, MonitorPlayIcon } from "lucide-react";

export default function PptToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.pdf");
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
    if (files.length === 0) return;
    try {
       setIsProcessing(true);
       setProgress({ status: `Unzipping PowerPoint structure...`, value: 20 });
       
       const arrayBuffer = await files[0].arrayBuffer();
       const zip = await JSZip.loadAsync(arrayBuffer);
       
       setProgress({ status: "Extracting slides...", value: 40 });
       
       // Find all slide XML files
       const slideFiles: JSZip.JSZipObject[] = [];
       zip.folder("ppt/slides")?.forEach((relativePath, file) => {
           if (relativePath.startsWith("slide") && relativePath.endsWith(".xml")) {
               slideFiles.push(file);
           }
       });
       
       if (slideFiles.length === 0) {
           throw new Error("No slides found in this PowerPoint file.");
       }
       
       const pdfDoc = await PDFDocument.create();
       const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
       
       setProgress({ status: "Rendering slides to PDF...", value: 60 });
       
       for (let i = 0; i < slideFiles.length; i++) {
           const slideXml = await slideFiles[i].async("string");
           
           // Extract text fragments
           const textRegex = /<a:t>([^<]*)<\/a:t>/g;
           let tMatch;
           const slideText: string[] = [];
           while ((tMatch = textRegex.exec(slideXml)) !== null) {
               if (tMatch[1].trim()) slideText.push(tMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
           }
           
           const page = pdfDoc.addPage([1024, 768]); // Landscape 4:3
           
           page.drawText(`Slide ${i + 1}`, { x: 50, y: 720, size: 24, font, color: rgb(0.5, 0.5, 0.5) });
           
           let yOffset = 600;
           for (const text of slideText) {
               page.drawText(text.substring(0, 100) + (text.length > 100 ? "..." : ""), { 
                   x: 100, y: yOffset, size: 20, font 
               });
               yOffset -= 30;
               if (yOffset < 50) break; // Simple overflow prevention for the crude parser
           }
       }
       
       const pdfBytes = await pdfDoc.save();
       const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
       setProcessedUrl(URL.createObjectURL(blob));
       setDownloadName(`${files[0].name.split('.')[0]}.pdf`);
       
       addHistoryItem({ action: `Converted ${slideFiles.length} PPT Slides to PDF`, filename: files[0].name, module: "convert" });
       toast.success(`Presentation successfully converted to PDF.`);
    } catch (e: any) {
       console.error(e);
       toast.error(`Engine failed: ${e.message || "Unknown error"}`);
    } finally {
       setIsProcessing(false);
       setProgress(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          PowerPoint to <span className="text-orange-500">PDF</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Convert PowerPoint files safely to PDF offline.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl">
        <CardContent>
          {files.length === 0 ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-orange-500/30 hover:bg-orange-500/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                <MonitorPlayIcon className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload PowerPoint File</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-orange-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{files[0].name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFiles([]); setProcessedUrl(null);}}>Change File</Button>
              </div>

              {!processedUrl ? (
                <>
                  {progress && (
                    <div className="space-y-2 mb-6 p-4 rounded-xl border bg-muted/20">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{progress.status}</span>
                        <span>{progress.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress.value}%` }} />
                      </div>
                    </div>
                  )}
                  <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={processFile} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} Convert to PDF
                  </Button>
                </>
              ) : (
                 <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                    const a = document.createElement("a");
                    a.href = processedUrl; a.download = downloadName; a.click();
                 }}>
                   <DownloadIcon className="mr-2 h-5 w-5" /> Download PDF
                 </Button>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept=".ppt,.pptx" onChange={handleFileChange} />
        </CardContent>
      </Card>
    </div>
  );
}
