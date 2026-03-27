"use client";
import React, { useState, useRef, useEffect } from "react";
import { CropIcon, UploadCloudIcon, DownloadIcon, Loader2, MaximizeIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import ReactCrop, { Crop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function CropPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState<PercentCrop | null>({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setProcessedUrl(null);
      setThumbnailUrl(null);
      
      try {
        const arrayBuffer = await selected.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        setFileBytes(bytes);

        // Generate thumbnail for cropping reference
        // @ts-ignore
        const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Preview first page
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({ canvasContext: context as any, viewport: viewport, canvasFactory: undefined } as any).promise;
          setThumbnailUrl(canvas.toDataURL("image/jpeg"));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate preview for cropping.");
      }
    }
  };

  const processCrop = async () => {
    if (!fileBytes || !completedCrop) return;
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      
      pages.forEach(page => {
        const { width, height } = page.getSize();
        
        // completedCrop is in % (e.x 10% from top, 10% from left, 80% width)
        const newX = width * (completedCrop.x / 100);
        // PDF Y-coordinate starts from bottom! Web Y-coordinate starts from top.
        // We must map it carefully.
        const newHeight = height * (completedCrop.height / 100);
        const newWidth = width * (completedCrop.width / 100);
        
        // completedCrop.y is % from the TOP. So the bottom Y point in web coordinates is y + height.
        // In PDF coordinates, the bottom Y point is height - (y + height)
        const newY = height * (1 - ((completedCrop.y + completedCrop.height) / 100));
        
        if (newWidth > 0 && newHeight > 0) {
           page.setCropBox(newX, newY, newWidth, newHeight);
        }
      });
      
      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      toast.success("Document visually cropped successfully!");
    } catch (error: any) {
      toast.error(`Failed to crop document: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `Cropped_${file?.name || 'document.pdf'}`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12 animate-in fade-in">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <MaximizeIcon className="w-10 h-10 text-cyan-500" />
          Visual Crop PDF
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Drag the bounding box over your document to dynamically trim unwanted margins.</p>
      </div>
      
      <Card className="max-w-4xl mx-auto border-2 dark:bg-slate-900/60 bg-white/60 backdrop-blur-2xl">
        <CardContent className="p-8 space-y-8">
           {!processedUrl ? (
             <div className="flex flex-col items-center">
               
               {!thumbnailUrl ? (
                  <label className="w-full border-2 border-dashed rounded-2xl p-16 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center">
                    <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
                    <UploadCloudIcon className="w-12 h-12 text-slate-400 group-hover:text-cyan-500 transition-colors mb-4" />
                    <h3 className="text-xl font-bold mb-2">Select PDF to Crop</h3>
                    <p className="text-sm text-slate-500 break-all">{file ? file.name : 'Or click to browse files'}</p>
                  </label>
               ) : (
                 <div className="w-full flex flex-col md:flex-row gap-8">
                   <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl flex items-center justify-center overflow-auto border shadow-inner max-h-[600px]">
                      <ReactCrop 
                          crop={crop} 
                          onChange={c => setCrop(c)} 
                          onComplete={(c, pc) => setCompletedCrop(pc)}
                          className="max-w-full drop-shadow-xl"
                      >
                         <img src={thumbnailUrl} alt="PDF Preview" className="max-w-full h-auto pointer-events-none" />
                      </ReactCrop>
                   </div>
                   <div className="w-full md:w-80 space-y-6 flex flex-col justify-center">
                     <div className="p-4 bg-cyan-50 border border-cyan-100 dark:bg-cyan-900/20 dark:border-cyan-800 rounded-xl space-y-2">
                       <h3 className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-2"><CropIcon className="w-4 h-4"/> Crop Applied</h3>
                       <p className="text-sm text-cyan-700 dark:text-cyan-400/80">Manually drag the boxed corners to isolate the specific area you want to keep. This crop will be uniformly applied to all pages.</p>
                     </div>
                     <Button size="lg" className="w-full text-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl" onClick={processCrop} disabled={isProcessing}>
                       {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CropIcon className="mr-2 h-5 w-5" />}
                       Apply Crop Bounds
                     </Button>
                     <Button variant="outline" className="w-full" onClick={() => { setThumbnailUrl(null); setFile(null); }}>Cancel</Button>
                   </div>
                 </div>
               )}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center p-12 space-y-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl shadow-inner">
               <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <DownloadIcon className="h-10 w-10 text-emerald-500 animate-bounce" />
               </div>
               <div className="text-center">
                 <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">Crop Boundaries Applied!</h3>
                 <p className="text-muted-foreground text-lg">Your custom viewer bounds have been stripped and permanently baked into the document.</p>
               </div>
               <div className="flex gap-4 w-full max-w-md mt-4">
                 <Button onClick={triggerDownload} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl" size="lg">
                   Download Cropped PDF
                 </Button>
               </div>
               <Button variant="ghost" onClick={() => { setFile(null); setProcessedUrl(null); setThumbnailUrl(null); }} className="w-full max-w-md">
                 Crop another file
               </Button>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
