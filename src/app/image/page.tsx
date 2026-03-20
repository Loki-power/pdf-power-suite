"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UploadCloudIcon, ImageIcon, DownloadIcon, Loader2 } from "lucide-react";

export default function ImageReducer() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState([80]); // default 80%
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{ original: string; new: string; reduction: string } | null>(null);
  
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
      const selected = e.target.files[0];
      if (!selected.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setFile(selected);
      setProcessedUrl(null);
      setStats(null);
    }
  };

  const processImage = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality", quality[0].toString());

      const res = await fetch("/api/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const blob = await res.blob();
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
      
      toast.success("Image reduced successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process image on server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Image <span className="gradient-text">Reducer</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Compress and optimize your images via our robust server API powered by Sharp.
        </p>
      </div>

      <Card className="glass mt-8 p-6 md:p-12 border-2 border-dashed border-green-500/20 hover:border-green-500/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center space-y-6 text-center">
          {!file ? (
            <div 
              className="cursor-pointer flex flex-col items-center w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                <UploadCloudIcon className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Click to browse</h3>
              <p className="text-muted-foreground">Select an image to reduce size</p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full max-w-md space-y-8">
              <div className="flex items-center space-x-4 w-full p-4 rounded-xl bg-background/50 border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name} 
                  className="h-12 w-12 object-cover rounded-md border" 
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setProcessedUrl(null); }} disabled={isProcessing}>
                  Clear
                </Button>
              </div>

              {!processedUrl ? (
                <div className="w-full space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Compression Quality</Label>
                      <span className="text-sm font-semibold">{quality[0]}%</span>
                    </div>
                    <Slider 
                      value={quality} 
                      onValueChange={(v) => setQuality(v as number[])} 
                      max={100} 
                      min={10} 
                      step={1} 
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground text-left">
                      Lower quality means smaller file size but more visual artifacts.
                    </p>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full text-lg" 
                    onClick={processImage} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Reduce Image"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Original</p>
                      <p className="font-semibold">{stats?.original}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Optimized</p>
                      <p className="font-semibold text-green-500">{stats?.new}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reduced</p>
                      <p className="font-semibold text-green-500">{stats?.reduction}%</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-center border rounded-xl overflow-hidden bg-background/50 p-2">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={processedUrl} alt="Processed output" className="max-h-64 object-contain" />
                    </div>
                    <Button size="lg" className="w-full gap-2" onClick={() => {
                      const a = document.createElement("a");
                      a.href = processedUrl || "";
                      a.download = `optimized-${file.name}`;
                      a.click();
                    }}>
                      <DownloadIcon className="h-5 w-5" />
                      Download Optimized Image
                    </Button>
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
