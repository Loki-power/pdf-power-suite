"use client";
import React, { useState } from "react";
import { EditIcon, UploadCloudIcon, DownloadIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'sonner';

export default function EditPDF() {
  const [file, setFile] = useState<File | null>(null);
  
  // Minimalist editor state
  const [text, setText] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(500);
  const [fontSize, setFontSize] = useState(16);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessedUrl(null);
    }
  };

  const processEdit = async () => {
    if (!file || !text.trim()) {
       toast.error("Please provide both a file and text to insert.");
       return;
    }
    
    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      const targetPageIdx = pageNum - 1;
      if (targetPageIdx < 0 || targetPageIdx >= pages.length) {
         throw new Error(`Invalid page number. Document has ${pages.length} pages.`);
      }
      
      const page = pages[targetPageIdx];
      
      // Draw the text
      page.drawText(text, {
         x: posX,
         y: posY,
         size: fontSize,
         color: rgb(0, 0, 0)
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      toast.success("Text successfully embedded into the PDF!");
    } catch (error: any) {
      toast.error(`Editing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `Edited_${file?.name || 'document.pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12 animate-in fade-in">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <EditIcon className="w-10 h-10 text-purple-500" />
          Edit PDF
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Add text annotations directly to specific pages and coordinates offline.</p>
      </div>
      
      <Card className="max-w-3xl mx-auto border-2 dark:bg-slate-900/60 bg-white/60 backdrop-blur-2xl">
        <CardContent className="p-8 space-y-6">
           {!processedUrl ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <label className="border-2 border-dashed rounded-2xl p-12 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                 <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
                 <UploadCloudIcon className="w-12 h-12 text-slate-400 group-hover:text-purple-500 transition-colors mb-4" />
                 <h3 className="text-xl font-bold mb-2">Select PDF to Edit</h3>
                 <p className="text-sm text-slate-500 break-all">{file ? file.name : 'Or click to browse files'}</p>
               </label>
               
               <div className="space-y-4 border rounded-xl p-6 bg-slate-50 dark:bg-slate-950/50">
                 <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                   <EditIcon className="h-4 w-4" /> Text Stamping Tool
                 </h3>
                 <div className="space-y-2">
                   <Label>Text content</Label>
                   <Textarea placeholder="Type what you want to add..." value={text} onChange={e => setText(e.target.value)} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <Label className="text-xs">Page #</Label>
                     <Input type="number" value={pageNum} onChange={e => setPageNum(Number(e.target.value) || 1)} min="1" />
                   </div>
                   <div className="space-y-1">
                     <Label className="text-xs">Font Size (pt)</Label>
                     <Input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value) || 12)} min="1" max="144" />
                   </div>
                   <div className="space-y-1">
                     <Label className="text-xs">X Position (Left)</Label>
                     <Input type="number" value={posX} onChange={e => setPosX(Number(e.target.value) || 0)} />
                   </div>
                   <div className="space-y-1">
                     <Label className="text-xs">Y Position (Bottom)</Label>
                     <Input type="number" value={posY} onChange={e => setPosY(Number(e.target.value) || 0)} />
                   </div>
                 </div>
                 
                 <Button size="lg" className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white" onClick={processEdit} disabled={!file || isProcessing}>
                   {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <EditIcon className="mr-2 h-5 w-5" />}
                   Apply Text to PDF
                 </Button>
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
               <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <DownloadIcon className="h-8 w-8 text-emerald-500 animate-bounce" />
               </div>
               <div className="text-center">
                 <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Edit Applied!</h3>
                 <p className="text-muted-foreground">The text has been permanently embedded into the document.</p>
               </div>
               <div className="flex gap-4 w-full">
                 <Button onClick={triggerDownload} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                   Download Edited PDF
                 </Button>
               </div>
               <Button variant="ghost" onClick={() => { setFile(null); setProcessedUrl(null); }} className="w-full">
                 Edit another file
               </Button>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
