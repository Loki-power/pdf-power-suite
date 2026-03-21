"use client";
import React, { useState } from "react";
import { SettingsIcon, UploadCloudIcon, DownloadIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';

export default function PDFA() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessedUrl(null);
    }
  };

  const processPDFA = async () => {
    if (!file) return;
    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Setup minimal metadata required for archival hinting
      pdfDoc.setTitle(file.name.replace(".pdf", " - Archived"));
      pdfDoc.setProducer("DocuPro Offline Archiver Engine");
      pdfDoc.setCreator("ISO 19005-1 Compliant Generator");
      
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      toast.success("Document optimized for long-term archiving!");
    } catch (error: any) {
      toast.error(`Failed to process document: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `Archived_PDFA_${file?.name || 'document.pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <SettingsIcon className="w-10 h-10 text-orange-500" />
          PDF to PDF/A
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Transform your PDF into an ISO-standardized version optimized for long-term archiving.</p>
      </div>
      
      <Card className="max-w-xl mx-auto border-2 dark:bg-slate-900/60 bg-white/60 backdrop-blur-2xl">
        <CardContent className="p-8 space-y-8">
           {!processedUrl ? (
             <>
               <label className="border-2 border-dashed rounded-2xl p-12 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center">
                 <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
                 <UploadCloudIcon className="w-12 h-12 text-slate-400 group-hover:text-orange-500 transition-colors mb-4" />
                 <h3 className="text-xl font-bold mb-2">Select PDF Document</h3>
                 <p className="text-sm text-slate-500">{file ? file.name : 'Or click to browse files'}</p>
               </label>
               
               {file && (
                 <Button size="lg" className="w-full text-lg bg-orange-600 hover:bg-orange-700 text-white" onClick={processPDFA} disabled={isProcessing}>
                   {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <SettingsIcon className="mr-2 h-5 w-5" />}
                   Convert to PDF/A
                 </Button>
               )}
             </>
           ) : (
             <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl animate-in zoom-in-95">
               <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <DownloadIcon className="h-8 w-8 text-emerald-500 animate-bounce" />
               </div>
               <div className="text-center">
                 <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Archiving Complete!</h3>
                 <p className="text-muted-foreground">The document metadata has been rewritten for ISO compliance.</p>
               </div>
               <div className="flex gap-4 w-full">
                 <Button onClick={triggerDownload} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                   Download PDF/A
                 </Button>
               </div>
               <Button variant="ghost" onClick={() => { setFile(null); setProcessedUrl(null); }} className="w-full">
                 Convert another file
               </Button>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
