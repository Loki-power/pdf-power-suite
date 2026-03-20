"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { 
  UploadCloudIcon, ImageIcon, DownloadIcon, Loader2, 
  RefreshCwIcon, ExpandIcon, ZapIcon, CheckCircle2Icon
} from "lucide-react";

export default function ImageToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("optimized-image");
  const [stats, setStats] = useState<{ original: string; new: string; reduction: string } | null>(null);
  
  // Format Convert State
  const [targetFormat, setTargetFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  
  // Resize State
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [newWidth, setNewWidth] = useState("");
  const [newHeight, setNewHeight] = useState("");
  const [lockRatio, setLockRatio] = useState(true);

  // Compress State
  const [quality, setQuality] = useState([80]); // 80%

  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setFile(selected);
      setProcessedUrl(null);
      setStats(null);

      // Pre-calculate dimensions
      const img = new Image();
      img.src = URL.createObjectURL(selected);
      img.onload = () => {
        setDimensions({ w: img.width, h: img.height });
        setNewWidth(img.width.toString());
        setNewHeight(img.height.toString());
      };
    }
  };

  const handleWidthChange = (val: string) => {
    setNewWidth(val);
    if (lockRatio && dimensions.w > 0) {
      const ratio = dimensions.h / dimensions.w;
      setNewHeight(Math.round(parseInt(val || "0") * ratio).toString());
    }
  };

  const handleHeightChange = (val: string) => {
    setNewHeight(val);
    if (lockRatio && dimensions.h > 0) {
      const ratio = dimensions.w / dimensions.h;
      setNewWidth(Math.round(parseInt(val || "0") * ratio).toString());
    }
  };

  const processImage = async (mode: "convert" | "resize" | "compress") => {
    if (!file) return;
    
    try {
      setIsProcessing(true);
      
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context missing");

      let outFormat = file.type;
      let outQuality = 1.0;

      if (mode === "resize") {
        canvas.width = parseInt(newWidth) || dimensions.w;
        canvas.height = parseInt(newHeight) || dimensions.h;
      } else {
        canvas.width = dimensions.w;
        canvas.height = dimensions.h;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (mode === "convert") {
        outFormat = targetFormat;
      } else if (mode === "compress") {
        outFormat = "image/jpeg"; // JPEG best for compression scaling
        outQuality = quality[0] / 100;
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), outFormat, outQuality);
      });

      const processed = URL.createObjectURL(blob);
      setProcessedUrl(processed);

      const ext = outFormat.split('/')[1];
      setDownloadName(`processed-${file.name.split('.')[0]}.${ext}`);
      
      const reduction = file.size > 0 ? ((file.size - blob.size) / file.size * 100).toFixed(1) : "0";
      setStats({
        original: formatSize(file.size),
        new: formatSize(blob.size),
        reduction: parseFloat(reduction) > 0 ? reduction : "None"
      });

      addHistoryItem({ action: `Image ${mode} operation`, filename: file.name, module: "image" });
      toast.success("Image processed completely offline!");

    } catch (e) {
      console.error(e);
      toast.error("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Image <span className="gradient-text">Studio</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Resize, encode, and compress images entirely in your browser without uploading anything.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl">
        <CardContent>
          {!file ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-emerald-500/30 hover:bg-emerald-500/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <UploadCloudIcon className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload Image</h3>
              <p className="text-muted-foreground">Select JPG, PNG, WEBP, etc.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="Preview" className="h-12 w-12 object-cover rounded-md border shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(file.size)} • {dimensions.w}x{dimensions.h}px</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setProcessedUrl(null); }} disabled={isProcessing}>
                  Change Image
                </Button>
              </div>

              {!processedUrl ? (
                <Tabs defaultValue="convert" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
                    <TabsTrigger value="convert" className="text-md gap-2"><RefreshCwIcon className="h-4 w-4 hidden sm:block"/> Convert</TabsTrigger>
                    <TabsTrigger value="resize" className="text-md gap-2"><ExpandIcon className="h-4 w-4 hidden sm:block"/> Resize</TabsTrigger>
                    <TabsTrigger value="compress" className="text-md gap-2"><ZapIcon className="h-4 w-4 hidden sm:block"/> Compress</TabsTrigger>
                  </TabsList>

                  {/* FORMAT CONVERT */}
                  <TabsContent value="convert" className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-3 gap-4">
                       {(["image/png", "image/jpeg", "image/webp"] as const).map(fmt => (
                         <div 
                           key={fmt} 
                           onClick={() => setTargetFormat(fmt)}
                           className={`cursor-pointer p-4 rounded-xl border-2 flex items-center justify-center transition-all ${targetFormat === fmt ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/50 hover:bg-muted/50'}`}
                         >
                            <span className="font-bold uppercase tracking-wide">{fmt.split('/')[1]}</span>
                            {targetFormat === fmt && <CheckCircle2Icon className="absolute top-2 right-2 h-4 w-4 text-emerald-500" />}
                         </div>
                       ))}
                    </div>
                    <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => processImage("convert")} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null} Encode Format
                    </Button>
                  </TabsContent>

                  {/* RESIZE */}
                  <TabsContent value="resize" className="space-y-6 animate-in fade-in">
                    <div className="flex items-center justify-between mb-2">
                       <Label className="text-base font-semibold">Dimensions (px)</Label>
                       <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border">
                         <Label htmlFor="lock" className="text-xs cursor-pointer">Lock Aspect Ratio</Label>
                         <Switch id="lock" checked={lockRatio} onCheckedChange={setLockRatio} />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Width</Label>
                        <Input type="number" value={newWidth} onChange={(e) => handleWidthChange(e.target.value)} className="h-12 text-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <Input type="number" value={newHeight} onChange={(e) => handleHeightChange(e.target.value)} className="h-12 text-lg" />
                      </div>
                    </div>
                    <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => processImage("resize")} disabled={isProcessing || !newWidth || !newHeight}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null} Apply Resizing
                    </Button>
                  </TabsContent>

                  {/* COMPRESS */}
                  <TabsContent value="compress" className="space-y-6 animate-in fade-in">
                    <div className="space-y-4 bg-muted/20 p-6 rounded-xl border">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Compression Quality</Label>
                        <span className="text-sm font-black text-emerald-500">{quality[0]}%</span>
                      </div>
                      <Slider 
                        value={quality} 
                        onValueChange={(v) => setQuality(v as number[])} 
                        max={100} min={10} step={1} 
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground text-center">Lowering quality significantly reduces file size. Best optimized under 80%.</p>
                    </div>
                    <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => processImage("compress")} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null} Optimize & Compress
                    </Button>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="w-full space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="grid grid-cols-3 gap-4 text-center p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-inner">
                    <div className="flex flex-col items-center justify-center p-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Original Size</p>
                      <p className="text-xl font-bold">{stats?.original}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 border-x border-emerald-500/20">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">New Size</p>
                      <p className="text-xl font-bold text-emerald-400">{stats?.new}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Reduction</p>
                      <p className="text-2xl font-black text-emerald-500 whitespace-nowrap">{stats?.reduction}%</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-6">
                    <div className="group relative border border-white/10 rounded-xl overflow-hidden bg-black/40 shadow-2xl p-4 max-w-sm w-full">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={processedUrl} alt="Processed output" className="w-full max-h-64 object-contain rounded-lg shadow-emerald-500/10 shadow-xl" />
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    </div>
                    
                    <div className="flex items-center space-x-4 w-full">
                      <Button variant="outline" size="lg" className="w-full" onClick={() => { setProcessedUrl(null); }}>
                         Back
                      </Button>
                      <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20" onClick={() => {
                        const a = document.createElement("a");
                        a.href = processedUrl || "";
                        a.download = downloadName;
                        a.click();
                      }}>
                        <DownloadIcon className="mr-2 h-5 w-5" /> Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
