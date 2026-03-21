"use client";
import React, { useState } from "react";
import { CropIcon, UploadCloudIcon, DownloadIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';

export default function CropPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessedUrl(null);
    }
  };

  const processCrop = async () => {
    if (!file) return;
    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      pages.forEach(page => {
        const { width, height } = page.getSize();
        // Set new mediaBox based on margins provided by user (in points)
        // CropBox format: [x, y, width, height]
        const newX = left;
        const newY = bottom; // PDF coordinate system origin is bottom-left
        const newWidth = width - left - right;
        const newHeight = height - top - bottom;
        
        if (newWidth > 0 && newHeight > 0) {
           page.setCropBox(newX, newY, newWidth, newHeight);
        }
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      toast.success("Document cropped successfully!");
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12 animate-in fade-in">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <CropIcon className="w-10 h-10 text-blue-500" />
          Crop PDF Pages
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Trim unwanted white space or margins from your PDF pages instantly.</p>
      </div>
      
      <Card className="max-w-3xl mx-auto border-2 dark:bg-slate-900/60 bg-white/60 backdrop-blur-2xl">
        <CardContent className="p-8 space-y-8">
           {!processedUrl ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <label className="border-2 border-dashed rounded-2xl p-12 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center h-full">
                 <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
                 <UploadCloudIcon className="w-12 h-12 text-slate-400 group-hover:text-blue-500 transition-colors mb-4" />
                 <h3 className="text-xl font-bold mb-2">Select PDF to Crop</h3>
                 <p className="text-sm text-slate-500 break-all">{file ? file.name : 'Or click to browse files'}</p>
               </label>
               
               <div className="space-y-6">
                 <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                   <CropIcon className="h-4 w-4" /> Margin Settings (pt)
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Top Margin</Label>
                     <Input type="number" value={top} onChange={e => setTop(Number(e.target.value) || 0)} min="0" />
                   </div>
                   <div className="space-y-2">
                     <Label>Bottom Margin</Label>
                     <Input type="number" value={bottom} onChange={e => setBottom(Number(e.target.value) || 0)} min="0" />
                   </div>
                   <div className="space-y-2">
                     <Label>Left Margin</Label>
                     <Input type="number" value={left} onChange={e => setLeft(Number(e.target.value) || 0)} min="0" />
                   </div>
                   <div className="space-y-2">
                     <Label>Right Margin</Label>
                     <Input type="number" value={right} onChange={e => setRight(Number(e.target.value) || 0)} min="0" />
                   </div>
                 </div>
                 
                 <Button size="lg" className="w-full text-lg bg-blue-600 hover:bg-blue-700 text-white" onClick={processCrop} disabled={!file || isProcessing}>
                   {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CropIcon className="mr-2 h-5 w-5" />}
                   Apply Crop
                 </Button>
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
               <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <DownloadIcon className="h-8 w-8 text-emerald-500 animate-bounce" />
               </div>
               <div className="text-center">
                 <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Crop Applied!</h3>
                 <p className="text-muted-foreground">The document media boxes have been updated.</p>
               </div>
               <div className="flex gap-4 w-full">
                 <Button onClick={triggerDownload} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                   Download Cropped PDF
                 </Button>
               </div>
               <Button variant="ghost" onClick={() => { setFile(null); setProcessedUrl(null); }} className="w-full">
                 Crop another file
               </Button>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
