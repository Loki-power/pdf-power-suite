"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
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
  FileIcon,
  LayersIcon
} from "lucide-react";

export default function WatermarkPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const { addHistoryItem } = useHistory();
  
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
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

  const processWatermark = async () => {
    if (!fileBytes || !watermarkText) return;
    
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * 15),
          y: height / 2 - 50,
          size: 60,
          color: rgb(0.5, 0.5, 0.5),
          opacity: 0.3,
          rotate: degrees(45),
        });
      }

      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      addHistoryItem({ action: "Applied Watermark", filename: file?.name || "document", module: "watermark" });
      toast.success("Watermark applied successfully!");
    } catch (e: any) {
      toast.error("Failed to apply watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `watermarked-${file?.name || 'document.pdf'}`;
    a.click();
  };

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Add <span className="text-blue-500">Watermark</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Stamp an image or text over your PDF in seconds.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-slate-200">
        <CardContent>
          {!file ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-blue-500/30 hover:bg-blue-500/5 transition-colors bg-white shadow-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <UploadCloudIcon className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Select PDF file</h3>
              <p className="text-muted-foreground">Upload a document to watermark.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-slate-50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFile(null); setFileBytes(null); setProcessedUrl(null);}}>
                  Change File
                </Button>
              </div>

              {!processedUrl ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="wtext">Watermark Text</Label>
                      <Input 
                        id="wtext" 
                        placeholder="e.g. CONFIDENTIAL" 
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="h-12 text-lg"
                      />
                    </div>
                  </div>
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={processWatermark} disabled={isProcessing || !watermarkText}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LayersIcon className="mr-2 h-5 w-5" />}
                    Apply Watermark
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-green-500/5 border border-green-500/20 rounded-xl animate-in fade-in">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <DownloadIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-600 mb-2">Watermark Applied!</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Your document has been successfully watermarked.
                    </p>
                  </div>
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={triggerDownload}>
                    <DownloadIcon className="mr-2 h-5 w-5" /> Download Watermarked PDF
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
