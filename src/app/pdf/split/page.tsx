"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { 
  UploadCloudIcon, 
  DownloadIcon, 
  Loader2, 
  ScissorsIcon,
  FileIcon
} from "lucide-react";

export default function SplitPDF() {
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitRanges, setSplitRanges] = useState<string>("1-2, 4, 6-8");
  
  const { addHistoryItem } = useHistory();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.pdf");
  
  const splitInputRef = useRef<HTMLInputElement>(null);

  const handleSplitFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Please select a valid PDF file");
        return;
      }
      setSplitFile(file);
      setProcessedUrl(null);
    }
  };

  const processSplit = async () => {
    if (!splitFile || !splitRanges) {
      toast.error("Please provide a file and a valid page range.");
      return;
    }

    try {
      setIsProcessing(true);
      
      const buffer = await splitFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(buffer);
      const totalPages = originalPdf.getPageCount();
      
      const newPdf = await PDFDocument.create();
      
      const pagesToExtract = new Set<number>();
      const parts = splitRanges.split(',').map(s => s.trim());
      
      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-');
          let start = parseInt(startStr);
          let end = parseInt(endStr);
          
          if (isNaN(start) || isNaN(end)) throw new Error("Invalid range format");
          
          start = Math.max(1, start);
          end = Math.min(totalPages, end);
          
          if (start > end) throw new Error("Start page cannot be strictly greater than end page.");
          
          for (let i = start; i <= end; i++) {
            pagesToExtract.add(i - 1);
          }
        } else {
          const page = parseInt(part);
          if (isNaN(page)) throw new Error("Invalid page number");
          if (page >= 1 && page <= totalPages) {
            pagesToExtract.add(page - 1);
          }
        }
      }
      
      if (pagesToExtract.size === 0) {
        toast.error("No valid pages found in that range.");
        setIsProcessing(false);
        return;
      }

      const indices = Array.from(pagesToExtract).sort((a,b) => a-b);
      const copiedPages = await newPdf.copyPages(originalPdf, indices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setProcessedUrl(url);
      setDownloadName(`split-${splitFile.name}`);
      addHistoryItem({ action: `Split / Extracted ${indices.length} pages`, filename: splitFile.name, module: "split" });
      toast.success(`Extracted ${indices.length} pages successfully!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to split PDF. Please check your page ranges.");
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
          Split <span className="text-blue-500">PDF</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Extract specific pages from your PDF file instantly offline.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50">
        <CardContent>
          <div className="space-y-6">
            {!splitFile ? (
              <div 
                className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-blue-500/30 hover:bg-blue-500/5 transition-colors"
                onClick={() => splitInputRef.current?.click()}
              >
                <UploadCloudIcon className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold">Select PDF to Split</h3>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{splitFile.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setSplitFile(null); setProcessedUrl(null);}}>
                  Change File
                </Button>
              </div>
            )}

            <input 
              type="file" 
              ref={splitInputRef} 
              className="hidden" 
              accept="application/pdf"
              onChange={handleSplitFile}
            />

            {splitFile && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="ranges" className="text-sm font-semibold">Pages to Extract (e.g. 1-3, 5, 7-10)</Label>
                  <Input 
                    id="ranges" 
                    placeholder="1-5, 8, 11-13" 
                    value={splitRanges}
                    onChange={(e) => setSplitRanges(e.target.value)}
                    className="font-mono h-12"
                  />
                  <p className="text-xs text-muted-foreground">Create a new PDF containing only these specific pages.</p>
                </div>

                {!processedUrl ? (
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={processSplit} disabled={isProcessing || !splitRanges}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ScissorsIcon className="mr-2 h-5 w-5" />}
                    Extract Pages
                  </Button>
                ) : (
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={triggerDownload}>
                    <DownloadIcon className="mr-2 h-5 w-5" /> Download Split PDF
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
