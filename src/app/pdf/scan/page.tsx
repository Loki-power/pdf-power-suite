"use client";
import React, { useState, useRef, useEffect } from "react";
import { ScanIcon, CameraIcon, RotateCcwIcon, DownloadIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';

export default function ScanToPDF() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast.error("Camera access denied or unavailable.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]); // Need to ensure camera stops when unmounting

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Save as PNG to avoid jpeg artifacts on text
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const processToPDF = async () => {
    if (!capturedImage) return;
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.create();
      
      const imgBytes = await fetch(capturedImage).then(res => res.arrayBuffer());
      const image = await pdfDoc.embedPng(imgBytes); // we saved as png
      const { width, height } = image.scale(1);
      
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      toast.success("Scan converted to PDF successfully!");
    } catch (error: any) {
      toast.error(`Failed to create PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `Scanned_Document_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12 animate-in fade-in">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <ScanIcon className="w-10 h-10 text-emerald-500" />
          Scan to PDF
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Use your device camera to securely capture and vectorize documents straight to PDF.</p>
      </div>
      
      <Card className="max-w-xl mx-auto border-2 dark:bg-slate-900/60 bg-white/60 backdrop-blur-2xl">
        <CardContent className="p-8 space-y-6">
           
           {!processedUrl ? (
             <div className="flex flex-col items-center gap-4">
               {/* Viewer / Capture Area */}
               <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative border flex items-center justify-center">
                 {!stream && !capturedImage && (
                   <Button onClick={startCamera} variant="secondary" className="absolute z-10">
                      <CameraIcon className="w-5 h-5 mr-2" /> Start Camera
                   </Button>
                 )}
                 <video 
                   ref={videoRef} 
                   autoPlay 
                   playsInline 
                   className={`w-full h-full object-cover ${stream ? 'block' : 'hidden'}`} 
                 />
                 {capturedImage && (
                   <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                 )}
                 <canvas ref={canvasRef} className="hidden" />
               </div>

               {/* Controls */}
               {stream && (
                 <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={captureFrame}>
                   📸 Capture Document
                 </Button>
               )}

               {capturedImage && (
                 <div className="flex gap-4 w-full">
                    <Button variant="outline" size="lg" className="flex-1" onClick={retake}>
                      <RotateCcwIcon className="mr-2 w-5 h-5" /> Retake
                    </Button>
                    <Button size="lg" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={processToPDF} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ScanIcon className="w-5 h-5 mr-2" />}
                      Save as PDF
                    </Button>
                 </div>
               )}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
               <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <DownloadIcon className="h-8 w-8 text-emerald-500 animate-bounce" />
               </div>
               <div className="text-center">
                 <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Scan Successful!</h3>
                 <p className="text-muted-foreground">Your scanned document is ready.</p>
               </div>
               <div className="flex gap-4 w-full">
                 <Button onClick={triggerDownload} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                   Download Scanned PDF
                 </Button>
               </div>
               <Button variant="ghost" onClick={() => { setProcessedUrl(null); setCapturedImage(null); }} className="w-full">
                 Scan another document
               </Button>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
