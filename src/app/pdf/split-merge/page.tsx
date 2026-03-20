"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { 
  UploadCloudIcon, 
  DownloadIcon, 
  Loader2, 
  FilePlusIcon, 
  ScissorsIcon,
  XIcon,
  FileIcon
} from "lucide-react";

export default function SplitMerge() {
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitRanges, setSplitRanges] = useState<string>("1-2, 4, 6-8");
  
  const { addHistoryItem } = useHistory();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.pdf");
  
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);

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
      
      // Parse ranges (e.g. "1-3, 5, 7-9")
      const pagesToExtract = new Set<number>();
      const parts = splitRanges.split(',').map(s => s.trim());
      
      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-');
          let start = parseInt(startStr);
          let end = parseInt(endStr);
          
          if (isNaN(start) || isNaN(end)) throw new Error("Invalid range format");
          
          // pdf-lib is 0-indexed, user input is 1-indexed
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
          Split & <span className="gradient-text">Merge</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Combine multiple PDFs into one or extract specific pages. 100% offline.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50">
        <CardContent>
          <Tabs defaultValue="merge" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="merge" className="text-lg gap-2" onClick={() => setProcessedUrl(null)}>
                <FilePlusIcon className="h-5 w-5" /> Merge PDFs
              </TabsTrigger>
              <TabsTrigger value="split" className="text-lg gap-2" onClick={() => setProcessedUrl(null)}>
                <ScissorsIcon className="h-5 w-5" /> Split PDF
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="merge" className="space-y-6">
              <div 
                className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-blue-500/30 hover:bg-blue-500/5 transition-colors"
                onClick={() => mergeInputRef.current?.click()}
              >
                <UploadCloudIcon className="h-10 w-10 text-blue-500 mb-4" />
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
                          <FileIcon className="h-5 w-5 text-blue-500 shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeMergeFile(idx)}>
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {!processedUrl ? (
                    <Button size="lg" className="w-full" onClick={processMerge} disabled={isProcessing || mergeFiles.length < 2}>
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
            </TabsContent>

            <TabsContent value="split" className="space-y-6">
              {!splitFile ? (
                <div 
                  className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-purple-500/30 hover:bg-purple-500/5 transition-colors"
                  onClick={() => splitInputRef.current?.click()}
                >
                  <UploadCloudIcon className="h-10 w-10 text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold">Select PDF to Split</h3>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileIcon className="h-6 w-6 text-purple-500 shrink-0" />
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
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Create a new PDF containing only these specific pages.</p>
                  </div>

                  {!processedUrl ? (
                    <Button size="lg" className="w-full" onClick={processSplit} disabled={isProcessing || !splitRanges}>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
