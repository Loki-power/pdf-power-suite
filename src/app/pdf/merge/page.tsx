"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { 
  UploadCloudIcon, 
  DownloadIcon, 
  Loader2, 
  FilePlusIcon, 
  XIcon,
  FileIcon
} from "lucide-react";

export default function MergePDF() {
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const { addHistoryItem } = useHistory();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.pdf");
  
  const mergeInputRef = useRef<HTMLInputElement>(null);

  const handleMergeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === "application/pdf");
      if (newFiles.length !== e.target.files.length) {
        toast.warning("Some non-PDF files were ignored.");
      }
      setMergeFiles([...mergeFiles, ...newFiles]);
      setProcessedUrl(null);
    }
  };

  const removeMergeFile = (index: number) => {
    const updated = [...mergeFiles];
    updated.splice(index, 1);
    setMergeFiles(updated);
  };

  const processMerge = async () => {
    if (mergeFiles.length < 2) {
      toast.error("Please select at least 2 PDF files to merge.");
      return;
    }

    try {
      setIsProcessing(true);
      const mergedPdf = await PDFDocument.create();

      for (const file of mergeFiles) {
        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setProcessedUrl(url);
      setDownloadName(`merged-${Date.now()}.pdf`);
      addHistoryItem({ action: `Merged ${mergeFiles.length} PDFs`, filename: "Multiple files", module: "merge" });
      toast.success("PDFs merged successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to merge PDFs. One of them might be corrupt or encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = downloadName;
    a.click();
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Merge <span className="text-orange-500">PDF</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Combine multiple PDFs into one document securely offline.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50">
        <CardContent>
          <div className="space-y-6">
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-orange-500/30 hover:bg-orange-500/5 transition-colors"
              onClick={() => mergeInputRef.current?.click()}
            >
              <UploadCloudIcon className="h-10 w-10 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold">Select PDFs to Merge</h3>
              <p className="text-sm text-muted-foreground">You can select multiple files at once.</p>
            </div>
            
            <input 
              type="file" 
              multiple
              ref={mergeInputRef} 
              className="hidden" 
              accept="application/pdf"
              onChange={handleMergeFiles}
            />

            {mergeFiles.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Files to merge (in order):</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {mergeFiles.map((file, idx) => (
                    <div key={idx} className="flex flex-row items-center justify-between p-3 border rounded-lg bg-background/50">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileIcon className="h-5 w-5 text-orange-500 shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeMergeFile(idx)}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {!processedUrl ? (
                  <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={processMerge} disabled={isProcessing || mergeFiles.length < 2}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FilePlusIcon className="mr-2 h-5 w-5" />}
                    Merge {mergeFiles.length} Files
                  </Button>
                ) : (
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={triggerDownload}>
                    <DownloadIcon className="mr-2 h-5 w-5" /> Download Merged PDF
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
