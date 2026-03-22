"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { UploadCloudIcon, DownloadIcon, Loader2, RotateCwIcon } from "lucide-react";

interface PageData {
  id: string;
  originalIndex: number;
  thumbnailUrl: string;
  rotation: number;
}

export default function RotatePages() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        toast.error("Please select a valid PDF file");
        return;
      }
      setFile(selected);
      setIsRendering(true);
      
      try {
        // @ts-ignore
        const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const arrayBuffer = await selected.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        setFileBytes(bytes);

        const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        const newPages: PageData[] = [];
        
        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (context) {
            await page.render({ canvasContext: context as any, viewport: viewport, canvasFactory: undefined } as any).promise;
            newPages.push({
              id: `page-${i-1}-${Date.now()}`,
              originalIndex: i - 1,
              thumbnailUrl: canvas.toDataURL("image/jpeg", 0.8),
              rotation: 0
            });
          }
        }
        
        setPages(newPages);
        toast.success(`Loaded ${totalPages} pages successfully`);
      } catch (error) {
        console.error("Error parsing PDF:", error);
        toast.error("Failed to read PDF.");
        setFile(null);
      } finally {
        setIsRendering(false);
      }
    }
  };

  const handleRotatePage = (id: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const rotateAllPages = () => {
    setPages(pages.map(p => ({ ...p, rotation: (p.rotation + 90) % 360 })));
  };

  const saveRotatedPdf = async () => {
    if (!fileBytes || pages.length === 0) return;

    try {
      setIsProcessing(true);
      
      const pdf = await PDFDocument.load(fileBytes);
      const originalPages = pdf.getPages();
      const { degrees } = await import('pdf-lib');
      
      pages.forEach((p, index) => {
        if (p.rotation !== 0) {
          const pageToRotate = originalPages[p.originalIndex];
          // robustly grab the base rotation if it exists
          const currentRotation = pageToRotate.getRotation()?.angle || 0;
          pageToRotate.setRotation(degrees(currentRotation + p.rotation));
        }
      });
      
      const pdfBytesModified = await pdf.save();
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `rotated-${file?.name || 'document.pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
      
      addHistoryItem({ action: `Rotated pages`, filename: file?.name || "document.pdf", module: "rotate" });
      toast.success("PDF saved completely offline!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to compile new PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Rotate <span className="text-cyan-500">PDF</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Rotate specific pages or double-check orientation before saving.
        </p>
      </div>

      {!file ? (
         <Card className="glass mt-8 p-12 border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="h-20 w-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
              <UploadCloudIcon className="h-10 w-10 text-cyan-500" />
            </div>
            <h3 className="text-2xl font-semibold">Upload PDF Document</h3>
            <p className="text-muted-foreground">Select a file to rotate its pages.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-background/50 border glass">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              {isRendering ? <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" /> : <RotateCwIcon className="h-8 w-8 text-cyan-500 shrink-0" />}
              <div>
                <p className="font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-muted-foreground">{pages.length} Pages loaded</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={rotateAllPages} disabled={isRendering || pages.length === 0} className="w-full sm:w-auto gap-2">
                <RotateCwIcon className="h-4 w-4" /> Rotate All
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setPages([]); setFileBytes(null); }} className="w-full sm:w-auto border-destructive/30 text-destructive hover:bg-destructive/10">
                Cancel
              </Button>
              <Button onClick={saveRotatedPdf} disabled={isProcessing || isRendering || pages.length === 0} className="w-full sm:w-auto gap-2 bg-cyan-600 hover:bg-cyan-700 text-white">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
                Save New PDF
              </Button>
            </div>
          </div>

          {isRendering ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
              <p>Rendering pages locally...</p>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-muted/10 border">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {pages.map((page, index) => (
                  <div key={page.id} className="relative group">
                    <Card className="overflow-hidden border-2 border-border/50 hover:border-cyan-500/50 transition-all cursor-pointer" onClick={() => handleRotatePage(page.id)}>
                      <CardContent className="p-2 relative bg-muted/20">
                        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur rounded-md px-2 py-1 text-xs font-bold border shadow-sm z-10 pointer-events-none">
                          {index + 1}
                        </div>
                        
                        <div className="absolute top-2 right-2 bg-cyan-500/90 text-white p-1.5 rounded-md shadow-sm z-10 hover:bg-cyan-600 drop-shadow-md">
                          <RotateCwIcon className="h-4 w-4" />
                        </div>
              
                        <div className="w-full flex justify-center py-4 bg-background border rounded-md pointer-events-none">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={page.thumbnailUrl} 
                            alt={`Page ${page.originalIndex + 1}`} 
                            className="h-32 sm:h-48 object-contain drop-shadow-md transition-transform duration-300 pointer-events-none"
                            style={{ transform: `rotate(${page.rotation}deg)` }}
                          />
                        </div>
                        <div className="flex items-center justify-center mt-2 text-xs text-cyan-600 font-semibold w-full py-1">
                          Tap to rotate
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="application/pdf"
        onChange={handleFileChange}
      />
    </div>
  );
}
