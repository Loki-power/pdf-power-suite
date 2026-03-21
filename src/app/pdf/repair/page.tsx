"use client";
import React, { useState } from "react";
import { WrenchIcon, UploadCloudIcon, DownloadIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';

export default function RepairPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessedUrl(null);
    }
  };

  const processRepair = async () => {
    if (!file) return;
    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      
      // Attempt to load ignoring all encryption and structural warnings to force reconstruction
      const pdfDoc = await PDFDocument.load(arrayBuffer, { 
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false 
      });
      
      pdfDoc.setCreator("DocuPro PDF Repair Engine");
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false }); // Avoid deep streams to prevent further structural corruption
      
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      toast.success("PDF structure successfully rebuilt and repaired!");
    } catch (error: any) {
      console.error(error);
      toast.error(`Repair failed: ${error.message} - Document may be too severely corrupted.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `Repaired_${file?.name || 'document.pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <WrenchIcon className="w-10 h-10 text-blue-500" />
          Repair PDF
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Reconstruct corrupted XREF tables and restore damaged PDF structures entirely offline.</p>
      </div>
      
      <Card className="max-w-xl mx-auto border-2 dark:bg-slate-900/60 bg-white/60 backdrop-blur-2xl">
        <CardContent className="p-8 space-y-8">
           {!processedUrl ? (
             <>
               <label className="border-2 border-dashed rounded-2xl p-12 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center">
                 <input type="file" multiple={false} accept=".pdf" className="hidden" onChange={handleUpload} />
                 <UploadCloudIcon className="w-12 h-12 text-slate-400 group-hover:text-blue-500 transition-colors mb-4" />
                 <h3 className="text-xl font-bold mb-2">Drop Corrupt PDF here</h3>
                 <p className="text-sm text-slate-500">{file ? file.name : 'Or click to browse files'}</p>
               </label>
               
               {file && (
                 <Button size="lg" className="w-full text-lg bg-blue-600 hover:bg-blue-700 text-white" onClick={processRepair} disabled={isProcessing}>
                   {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <WrenchIcon className="mr-2 h-5 w-5" />}
                   Attempt Auto-Repair
                 </Button>
               )}
             </>
           ) : (
             <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl animate-in zoom-in-95">
               <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <DownloadIcon className="h-8 w-8 text-emerald-500 animate-bounce" />
               </div>
               <div className="text-center">
                 <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Repaired Successfully!</h3>
                 <p className="text-muted-foreground">The document structure was rebuilt successfully.</p>
               </div>
               <div className="flex gap-4 w-full">
                 <Button onClick={triggerDownload} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                   Download Repaired PDF
                 </Button>
               </div>
               <Button variant="ghost" onClick={() => { setFile(null); setProcessedUrl(null); }} className="w-full">
                 Repair another file
               </Button>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
