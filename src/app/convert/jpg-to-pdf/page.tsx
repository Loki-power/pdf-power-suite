"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, UploadCloudIcon, DownloadIcon, Loader2, ImagePlusIcon } from "lucide-react";

export default function JpgToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("images-to.pdf");
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setProcessedUrl(null);
      setProgress(null);
    }
  };

  const processFile = async () => {
    if (files.length === 0) return;
    try {
      setIsProcessing(true);
      setProgress({ status: "Creating PDF...", value: 10 });
      
      const pdfDoc = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.error(`Skipping non-image file: ${file.name}`);
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        let pdfImage;
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === "image/png") {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          toast.error(`Unsupported image format for PDF embedding: ${file.type}`);
          continue;
        }

        const { width, height } = pdfImage.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(pdfImage, { x: 0, y: 0, width, height });
        setProgress({ status: `Processing ${i+1}/${files.length}...`, value: 10 + Math.round(((i+1)/files.length) * 70) });
      }

      setProgress({ status: "Finalizing...", value: 90 });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      setDownloadName("images-to.pdf");
      
      addHistoryItem({ action: `Converted ${files.length} images to PDF`, filename: "images-to.pdf", module: "convert" });
      toast.success("PDF created successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to convert images to PDF.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          JPG to <span className="text-emerald-500">PDF</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Combine uploaded JPEG/PNG images into a single PDF document offline.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl">
        <CardContent>
          {files.length === 0 ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-emerald-500/30 hover:bg-emerald-500/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <ImagePlusIcon className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload Images</h3>
              <p className="text-muted-foreground">Select multiple JPG or PNG files.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium truncate">
                     {files.length === 1 ? files[0].name : `${files.length} images selected`}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFiles([]); setProcessedUrl(null);}}>Change Files</Button>
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
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress.value}%` }} />
                      </div>
                    </div>
                  )}
                  <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={processFile} disabled={isProcessing}>
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
          <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} />
        </CardContent>
      </Card>
    </div>
  );
}
