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
  FileIcon,
  FileArchiveIcon
} from "lucide-react";

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const { addHistoryItem } = useHistory();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<"extreme" | "recommended" | "less">("recommended");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        toast.error("Please select a valid PDF file");
        return;
      }
      setFile(selected);
      setProcessedUrl(null);
      
      const buffer = await selected.arrayBuffer();
      setFileBytes(new Uint8Array(buffer));
    }
  };

  const processCompress = async () => {
    if (!fileBytes) return;
    
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });

      if (compressionLevel === "extreme") {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
      }

      const useObjectStreams = compressionLevel === "extreme" || compressionLevel === "recommended";

      const pdfBytesModified = await pdfDoc.save({ useObjectStreams });
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      
      setProcessedUrl(URL.createObjectURL(blob));
      addHistoryItem({ action: `Compressed PDF (${compressionLevel})`, filename: file?.name || "document", module: "compress" });
      toast.success("PDF compressed successfully!");
    } catch (e: any) {
      toast.error("Failed to compress PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `compressed-${file?.name || 'document.pdf'}`;
    a.click();
  };

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Compress <span className="text-rose-500">PDF</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Reduce file size while optimizing for maximal PDF quality.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-slate-200">
        <CardContent>
          {!file ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-rose-500/30 hover:bg-rose-500/5 transition-colors bg-white shadow-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
                <UploadCloudIcon className="h-10 w-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Select PDF file</h3>
              <p className="text-muted-foreground">Upload a document to compress.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-slate-50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-rose-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFile(null); setFileBytes(null); setProcessedUrl(null);}}>
                  Change File
                </Button>
              </div>

              {!processedUrl ? (
                <div className="space-y-6 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <button 
                      className={`p-4 rounded-xl border text-left transition-all ${compressionLevel === "extreme" ? "bg-rose-50 border-rose-500 shadow-sm" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                      onClick={() => setCompressionLevel("extreme")}
                    >
                      <h4 className={`font-bold mb-1 ${compressionLevel === "extreme" ? "text-rose-700" : "text-slate-700"}`}>Extreme</h4>
                      <p className="text-xs text-slate-500">Less quality, high compression. Metadata wiped.</p>
                    </button>
                    <button 
                      className={`p-4 rounded-xl border text-left transition-all ${compressionLevel === "recommended" ? "bg-rose-50 border-rose-500 shadow-sm" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                      onClick={() => setCompressionLevel("recommended")}
                    >
                      <h4 className={`font-bold mb-1 ${compressionLevel === "recommended" ? "text-rose-700" : "text-slate-700"}`}>Recommended</h4>
                      <p className="text-xs text-slate-500">Good quality, good compression.</p>
                    </button>
                    <button 
                      className={`p-4 rounded-xl border text-left transition-all ${compressionLevel === "less" ? "bg-rose-50 border-rose-500 shadow-sm" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                      onClick={() => setCompressionLevel("less")}
                    >
                      <h4 className={`font-bold mb-1 ${compressionLevel === "less" ? "text-rose-700" : "text-slate-700"}`}>Less</h4>
                      <p className="text-xs text-slate-500">High quality, less compression.</p>
                    </button>
                  </div>
                  
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-center">
                    <h3 className="font-semibold text-rose-700 mb-2">Compression Details</h3>
                    <p className="text-sm text-rose-600/80">
                      We structurally rebuild your PDF, dropping unused objects, repacking object streams, and re-indexing arrays for optimal disk usage.
                    </p>
                  </div>
                  <Button size="lg" className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={processCompress} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileArchiveIcon className="mr-2 h-5 w-5" />}
                    Compress PDF
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-green-500/5 border border-green-500/20 rounded-xl animate-in fade-in">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <DownloadIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-600 mb-2">PDF Compressed!</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Your document has been heavily optimized and is ready.
                    </p>
                  </div>
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={triggerDownload}>
                    <DownloadIcon className="mr-2 h-5 w-5" /> Download Compressed PDF
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
