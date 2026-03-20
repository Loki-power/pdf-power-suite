"use client";

import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
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
  FileEditIcon,
  FingerprintIcon,
  TagsIcon,
  FileIcon,
  EraserIcon,
  LayersIcon
} from "lucide-react";

export default function Finishing() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const { addHistoryItem } = useHistory();
  
  // Watermark state
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);

  // Sign state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Bates state
  const [batesPrefix, setBatesPrefix] = useState("CASE-");
  const [batesStartPos, setBatesStartPos] = useState(1);

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

  // Canvas Drawing Logic
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
          ctx.strokeStyle = '#2563eb'; // Blue ink
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


  // Processors
  const processWatermark = async () => {
    if (!fileBytes || !watermarkText) return;
    
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * 15),
          y: height / 2 - 50,
          size: 60,
          color: rgb(0.5, 0.5, 0.5),
          opacity: watermarkOpacity,
          rotate: degrees(45),
        });
      }

      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      addHistoryItem({ action: "Applied Watermark", filename: file?.name || "document", module: "finishing" });
      toast.success("Watermark applied successfully!");
    } catch (e: any) {
      toast.error("Failed to apply watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processBates = async () => {
    if (!fileBytes) return;
    
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();
      
      let currentNumber = batesStartPos;

      for (const page of pages) {
        const { width } = page.getSize();
        const stamp = `${batesPrefix}${String(currentNumber).padStart(4, '0')}`;
        
        page.drawText(stamp, {
          x: width - 150,
          y: 30, // Bottom right footer
          size: 14,
          color: rgb(0.2, 0.2, 0.2),
        });
        currentNumber++;
      }

      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      addHistoryItem({ action: "Applied Bates Stamp", filename: file?.name || "document", module: "finishing" });
      toast.success(`Bates numbering applied! Last page: ${batesPrefix}${String(currentNumber-1).padStart(4, '0')}`);
    } catch (e: any) {
      toast.error("Failed to apply Bates Numbering.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processFlatten = async () => {
    if (!fileBytes) return;
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.load(fileBytes);
      const form = pdfDoc.getForm();
      form.flatten(); // Flattens all form fields and annotations into static content

      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      addHistoryItem({ action: "Flattened PDF", filename: file?.name || "document", module: "finishing" });
      toast.success("PDF flattened successfully!");
    } catch (e: any) {
      toast.error("Failed to flatten PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processSignature = async () => {
    if (!fileBytes || !canvasRef.current) return;

    // Check if canvas is empty
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

      // Append signature to the bottom of the LAST page by default
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
      addHistoryItem({ action: "Appended e-Signature", filename: file?.name || "document", module: "finishing" });
      toast.success("Signature appended to the last page!");
    } catch (e: any) {
      toast.error("Failed to apply signature.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = (suffix: string) => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `${suffix}-${file?.name || 'document.pdf'}`;
    a.click();
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          PDF <span className="gradient-text">Finishing</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Add the final legal or professional touches to your documents.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50">
        <CardContent>
          {!file ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-fuchsia-500/30 hover:bg-fuchsia-500/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-fuchsia-500/10 flex items-center justify-center mb-6">
                <UploadCloudIcon className="h-10 w-10 text-fuchsia-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Select Document</h3>
              <p className="text-muted-foreground">Upload a PDF to apply finishing options.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-fuchsia-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFile(null); setFileBytes(null); setProcessedUrl(null);}}>
                  Change File
                </Button>
              </div>

              {!processedUrl ? (
                <Tabs defaultValue="watermark" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-8 h-12">
                    <TabsTrigger value="watermark" className="text-md gap-1">
                      <FileEditIcon className="h-4 w-4 hidden sm:block" /> <span className="hidden sm:inline">Watermark</span><span className="sm:hidden">Mark</span>
                    </TabsTrigger>
                    <TabsTrigger value="sign" className="text-md gap-1">
                      <FingerprintIcon className="h-4 w-4 hidden sm:block" /> e-Sign
                    </TabsTrigger>
                    <TabsTrigger value="bates" className="text-md gap-1">
                      <TagsIcon className="h-4 w-4 hidden sm:block" /> <span className="hidden sm:inline">Bates Num</span><span className="sm:hidden">Tags</span>
                    </TabsTrigger>
                    <TabsTrigger value="flatten" className="text-md gap-1">
                      <LayersIcon className="h-4 w-4 hidden sm:block" /> Flatten
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* WATERMARK */}
                  <TabsContent value="watermark" className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="wtext">Watermark Text</Label>
                        <Input 
                          id="wtext" 
                          placeholder="e.g. CONFIDENTIAL" 
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button size="lg" className="w-full" onClick={processWatermark} disabled={isProcessing || !watermarkText}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileEditIcon className="mr-2 h-5 w-5" />}
                      Apply Watermark
                    </Button>
                  </TabsContent>

                  {/* E-SIGN */}
                  <TabsContent value="sign" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Draw Signature</Label>
                        <Button variant="ghost" size="sm" onClick={clearCanvas} className="h-8 gap-1 text-muted-foreground hover:text-foreground">
                          <EraserIcon className="h-3 w-3" /> Clear
                        </Button>
                      </div>
                      <div className="relative border-2 border-dashed rounded-xl overflow-hidden bg-background">
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
                      <p className="text-xs text-muted-foreground text-center">Will be placed at the bottom-left of the final page.</p>
                    </div>
                    <Button size="lg" className="w-full" onClick={processSignature} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FingerprintIcon className="mr-2 h-5 w-5" />}
                      Apply Signature
                    </Button>
                  </TabsContent>

                  {/* BATES NUMBERING */}
                  <TabsContent value="bates" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bprefix">Prefix</Label>
                        <Input 
                          id="bprefix" 
                          placeholder="CASE-" 
                          value={batesPrefix}
                          onChange={(e) => setBatesPrefix(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bstart">Start Number</Label>
                        <Input 
                          id="bstart" 
                          type="number" 
                          min="1"
                          value={batesStartPos}
                          onChange={(e) => setBatesStartPos(parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-muted/20 border rounded-xl text-center">
                       <p className="text-sm font-mono text-muted-foreground">Preview format: {batesPrefix}{String(batesStartPos).padStart(4, '0')}</p>
                    </div>
                    <Button size="lg" className="w-full" onClick={processBates} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <TagsIcon className="mr-2 h-5 w-5" />}
                      Apply Bates Stamp
                    </Button>
                  </TabsContent>

                  {/* FLATTEN */}
                  <TabsContent value="flatten" className="space-y-6">
                    <div className="p-4 bg-muted/20 border rounded-xl">
                       <h3 className="font-semibold text-lg mb-2">Flatten Document</h3>
                       <p className="text-sm text-muted-foreground">
                         Flattening a PDF converts interactive elements like form fields (text boxes, checkboxes, dropdowns) into static, uneditable visual content. This prevents further changes and is ideal for finalized documents before archiving or submission.
                       </p>
                    </div>
                    <Button size="lg" className="w-full" onClick={processFlatten} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LayersIcon className="mr-2 h-5 w-5" />}
                      Flatten PDF Let's Go
                    </Button>
                  </TabsContent>

                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-green-500/5 border border-green-500/20 rounded-xl animate-in fade-in">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <DownloadIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-500 mb-2">Process Complete</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Your document has been processed and is ready to download.
                    </p>
                  </div>
                  <Button size="lg" className="w-full" onClick={() => triggerDownload('finished')}>
                    <DownloadIcon className="mr-2 h-5 w-5" /> Download Finished Document
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
