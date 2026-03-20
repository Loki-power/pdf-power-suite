"use client";

import { useState, useRef } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UploadCloudIcon, FileIcon, DownloadIcon, Loader2, FileArchiveIcon } from "lucide-react";

export default function ZipTool() {
  // Zip state
  const [zipFiles, setZipFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState("archive");
  const [isZipping, setIsZipping] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Unzip state
  const [unzipFile, setUnzipFile] = useState<File | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<{name: string, blob: Blob}[]>([]);
  const [isUnzipping, setIsUnzipping] = useState(false);
  const unzipInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ZIP HANDLERS
  const handleZipFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setZipFiles(Array.from(e.target.files));
    }
  };

  const createZip = async () => {
    if (zipFiles.length === 0) return;
    
    try {
      setIsZipping(true);
      const zip = new JSZip();
      
      zipFiles.forEach(file => {
        zip.file(file.name, file);
      });
      
      const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(content);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${zipName || "archive"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Zip file created and downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create zip file.");
    } finally {
      setIsZipping(false);
    }
  };

  // UNZIP HANDLERS
  const handleUnzipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.zip')) {
        toast.error("Please select a valid .zip file");
        return;
      }
      setUnzipFile(selected);
      setExtractedFiles([]);
    }
  };

  const extractZip = async () => {
    if (!unzipFile) return;

    try {
      setIsUnzipping(true);
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(unzipFile);
      
      const extracted: {name: string, blob: Blob}[] = [];
      
      for (const [filename, fileData] of Object.entries(loadedZip.files)) {
        if (!fileData.dir) {
          const blob = await fileData.async("blob");
          extracted.push({ name: filename, blob });
        }
      }
      
      setExtractedFiles(extracted);
      toast.success(`Successfully extracted ${extracted.length} files.`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to extract zip file. It might be corrupt.");
    } finally {
      setIsUnzipping(false);
    }
  };

  const downloadExtractedFile = (file: {name: string, blob: Blob}) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.split('/').pop() || file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          File <span className="gradient-text">Zipper & Extractor</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Compress multiple files into an archive or extract contents from a zip file entirely locally.
        </p>
      </div>

      <Tabs defaultValue="compress" className="w-full mt-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 glass">
          <TabsTrigger value="compress">Compress (Create Zip)</TabsTrigger>
          <TabsTrigger value="extract">Extract (Unzip)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compress">
          <Card className="glass border-2 border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <CardTitle>Create a Zip Archive</CardTitle>
              <CardDescription>Select files to compress into a single .zip file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div 
                className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-xl hover:bg-muted/30 transition-colors"
                onClick={() => zipInputRef.current?.click()}
              >
                <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <UploadCloudIcon className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-1">Select files to compress</h3>
                <p className="text-sm text-muted-foreground">You can select multiple files</p>
              </div>
              
              <input 
                type="file" 
                ref={zipInputRef} 
                className="hidden" 
                multiple
                onChange={handleZipFilesChange}
              />

              {zipFiles.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-4 max-h-[250px] overflow-y-auto p-4 rounded-xl bg-background/50 border">
                    <p className="text-sm font-medium text-muted-foreground">{zipFiles.length} file(s) pending for compression:</p>
                    {zipFiles.map((f, i) => (
                      <div key={i} className="flex items-center space-x-3 text-sm">
                        <FileIcon className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="truncate flex-1">{f.name}</span>
                        <span className="text-muted-foreground shrink-0">{formatSize(f.size)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1 w-full">
                      <Label htmlFor="zipName">Archive Name</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          id="zipName" 
                          value={zipName} 
                          onChange={(e) => setZipName(e.target.value)} 
                          placeholder="archive"
                        />
                        <span className="text-muted-foreground font-mono">.zip</span>
                      </div>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={createZip} 
                      disabled={isZipping || zipFiles.length === 0}
                      className="w-full sm:w-auto"
                    >
                      {isZipping ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Compressing...</>
                      ) : (
                        <><FileArchiveIcon className="mr-2 h-5 w-5" /> Download Zip</>
                      )}
                    </Button>
                  </div>
                  <Button variant="ghost" className="w-full" onClick={() => setZipFiles([])}>Clear Selection</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extract">
          <Card className="glass border-2 border-cyan-500/20 hover:border-cyan-500/50 transition-colors">
            <CardHeader className="text-center">
              <CardTitle>Extract a Zip Archive</CardTitle>
              <CardDescription>Select a .zip file to view and download its contents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!unzipFile ? (
                 <div 
                 className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-xl hover:bg-muted/30 transition-colors"
                 onClick={() => unzipInputRef.current?.click()}
               >
                 <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                   <FileArchiveIcon className="h-8 w-8 text-cyan-500" />
                 </div>
                 <h3 className="text-xl font-semibold mb-1">Select a .zip file</h3>
                 <p className="text-sm text-muted-foreground">Click to browse your computer</p>
               </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-background/50 border">
                    <FileArchiveIcon className="h-8 w-8 text-cyan-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{unzipFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(unzipFile.size)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setUnzipFile(null); setExtractedFiles([]); }}>
                      Clear
                    </Button>
                  </div>

                  {extractedFiles.length === 0 ? (
                    <Button size="lg" className="w-full" onClick={extractZip} disabled={isUnzipping}>
                      {isUnzipping ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Reading contents...</>
                      ) : (
                        "Read Contents"
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                      <p className="font-medium">Extracted {extractedFiles.length} files:</p>
                      <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-2">
                        {extractedFiles.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center space-x-3 overflow-hidden mr-4">
                              <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                              <div className="truncate">
                                <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatSize(file.blob.size)}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => downloadExtractedFile(file)}>
                              <DownloadIcon className="h-4 w-4 mr-2" /> Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input 
                type="file" 
                ref={unzipInputRef} 
                className="hidden" 
                accept=".zip,application/zip"
                onChange={handleUnzipFileChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
