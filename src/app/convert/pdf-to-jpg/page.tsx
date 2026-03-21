"use client";

import { useState, useRef } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, UploadCloudIcon, DownloadIcon, Loader2, ImagesIcon } from "lucide-react";

export default function PdfToJpg() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("images.zip");
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
      setProgress({ status: "Loading PDF...", value: 10 });

      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const zip = new JSZip();
      
      for (let i = 1; i <= totalPages; i++) {
        setProgress({ status: `Extracting page ${i}/${totalPages}...`, value: 10 + Math.round((i/totalPages) * 70) });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality extraction
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({ canvasContext: context as any, viewport: viewport, canvasFactory: undefined } as any).promise;
          const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/jpeg", 0.9));
          zip.file(`page-${i}.jpg`, blob);
        }
      }

      setProgress({ status: "Zipping images...", value: 90 });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      setProcessedUrl(URL.createObjectURL(zipBlob));
      setDownloadName(`extracted-${files[0].name.replace('.pdf', '')}.zip`);
      addHistoryItem({ action: `Extracted ${totalPages} images from PDF`, filename: files[0].name, module: "convert" });
      toast.success("Extraction complete!");
    } catch (error) {
       console.error(error);
       toast.error("Failed to extract images from PDF.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          PDF to <span className="text-rose-500">JPG</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Extract all pages from your PDF into high-quality JPEG images automatically.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl">
        <CardContent>
          {files.length === 0 ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-rose-500/30 hover:bg-rose-500/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
                <ImagesIcon className="h-10 w-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload PDF</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-rose-500 shrink-0" />
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
                        <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${progress.value}%` }} />
                      </div>
                    </div>
                  )}
                  <Button size="lg" className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={processFile} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} Convert to JPG
                  </Button>
                </>
              ) : (
                 <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                    const a = document.createElement("a");
                    a.href = processedUrl; a.download = downloadName; a.click();
                 }}>
                   <DownloadIcon className="mr-2 h-5 w-5" /> Download Images ZIP
                 </Button>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
        </CardContent>
      </Card>
    </div>
  );
}
