"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { UploadCloudIcon, FileIcon, DownloadIcon, Loader2 } from "lucide-react";

export default function PdfResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{ original: string; new: string; reduction: string } | null>(null);
  
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedInfo = e.target.files[0];
      if (selectedInfo.type !== "application/pdf") {
        toast.error("Please select a valid PDF file");
        return;
      }
      setFile(selectedInfo);
      setProcessedUrl(null);
      setStats(null);
    }
  };

  const processPDF = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF. pdf-lib will parse it and when we save it, 
      // it often recalculates and drops unused objects/metadata, shrinking the size slightly.
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Save it back to bytes. 
      // We can use useObjectStreams: false because it sometimes simplifies the structure (though useObjectStreams: true can compress better, we'll try standard save).
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setProcessedUrl(url);
      
      const originalSize = file.size;
      const newSize = blob.size;
      const reduction = originalSize > 0 ? ((originalSize - newSize) / originalSize * 100).toFixed(1) : "0";
      
      setStats({
        original: formatSize(originalSize),
        new: formatSize(newSize),
        reduction: reduction
      });
      
      addHistoryItem({
        action: `Optimized PDF (-${reduction}%)`,
        filename: file.name,
        module: "resize"
      });
      
      toast.success("PDF processed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process PDF. It might be corrupt or encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          PDF <span className="gradient-text">Resizer</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Optimize your PDF completely locally. No files are uploaded to any server.
        </p>
      </div>

      <Card className="glass mt-8 p-6 md:p-12 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center space-y-6 text-center outline-none">
          {!file ? (
            <div 
              className="cursor-pointer flex flex-col items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <UploadCloudIcon className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Click to browse</h3>
              <p className="text-muted-foreground">Select a PDF file to optimize</p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full max-w-md space-y-6">
              <div className="flex items-center space-x-4 w-full p-4 rounded-xl bg-background/50 border">
                <FileIcon className="h-8 w-8 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setProcessedUrl(null); }} disabled={isProcessing}>
                  Clear
                </Button>
              </div>

              {!processedUrl ? (
                <Button 
                  size="lg" 
                  className="w-full text-lg" 
                  onClick={processPDF} 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Optimize PDF"
                  )}
                </Button>
              ) : (
                <div className="w-full space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Original</p>
                      <p className="font-semibold">{stats?.original}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Optimized</p>
                      <p className="font-semibold text-primary">{stats?.new}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reduced</p>
                      <p className="font-semibold text-green-500">{stats?.reduction}%</p>
                    </div>
                  </div>
                  <Button size="lg" className="w-full gap-2" onClick={() => {
                    const a = document.createElement("a");
                    a.href = processedUrl || "";
                    a.download = `optimized-${file.name}`;
                    a.click();
                  }}>
                    <DownloadIcon className="h-5 w-5" />
                    Download Optimized PDF
                  </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
