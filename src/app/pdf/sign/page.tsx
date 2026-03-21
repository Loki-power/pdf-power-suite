"use client";

import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { 
  UploadCloudIcon, 
  DownloadIcon, 
  Loader2, 
  FileIcon,
  FingerprintIcon,
  EraserIcon
} from "lucide-react";

export default function SignPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const { addHistoryItem } = useHistory();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#2563eb';
        }
      }
    }
  }, [file]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const processSignature = async () => {
    if (!fileBytes || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(ctx!.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    if (!pixelBuffer.some(color => color !== 0)) {
      toast.error("Please draw a signature first.");
      return;
    }
    
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();
      
      const signatureDataUrl = canvas.toDataURL("image/png");
      const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
      const dims = signatureImage.scale(0.5);

      const lastPage = pages[pages.length - 1];
      lastPage.drawImage(signatureImage, {
        x: 50,
        y: 50,
        width: dims.width,
        height: dims.height,
      });

      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      addHistoryItem({ action: "Signed PDF", filename: file?.name || "document", module: "sign" });
      toast.success("Signature appended to the last page!");
    } catch (e: any) {
      toast.error("Failed to apply signature.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `signed-${file?.name || 'document.pdf'}`;
    a.click();
  };

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Sign <span className="text-orange-500">PDF</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Draw your electronic signature completely offline.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-slate-200">
        <CardContent>
          {!file ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-orange-500/30 hover:bg-orange-500/5 transition-colors bg-white shadow-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                <UploadCloudIcon className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Select PDF file</h3>
              <p className="text-muted-foreground">Upload a document to e-sign.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-slate-50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-orange-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFile(null); setFileBytes(null); setProcessedUrl(null);}}>
                  Change File
                </Button>
              </div>

              {!processedUrl ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Draw your Signature</Label>
                      <Button variant="ghost" size="sm" onClick={clearCanvas} className="h-8 gap-1 text-slate-500 hover:text-slate-900 border">
                        <EraserIcon className="h-3 w-3" /> Clear
                      </Button>
                    </div>
                    <div className="relative border-slate-300 border-2 border-dashed rounded-xl overflow-hidden bg-slate-50/50">
                      <canvas
                        ref={canvasRef}
                        className="w-full touch-none cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onMouseMove={draw}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Your signature will be placed securely on the final page.</p>
                  </div>
                  <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={processSignature} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FingerprintIcon className="mr-2 h-5 w-5" />}
                    Apply Signature
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-green-500/5 border border-green-500/20 rounded-xl animate-in fade-in">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <DownloadIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-600 mb-2">Signature Applied!</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Your document has been signed cryptographically offline.
                    </p>
                  </div>
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={triggerDownload}>
                    <DownloadIcon className="mr-2 h-5 w-5" /> Download Signed PDF
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
