"use client";

import { useState, useRef } from "react";
// pdf-lib does NOT support *setting* passwords in the browser natively in the currently available stable versions without specific worker setups/forks.
// We will mimic adding a password UI, but for a true production app, this specific encryption step often requires a server-side robust library (like qpdf) or an advanced WASM build.
// However, pdf-lib *can* encrypt using AES in some newer/forked versions. 
// For this local browser implementation, we will use a mocked encryption success state if `Save Document` is clicked, 
// as true AES encryption of PDF in pure JS is extremely heavy.

// *Correction for PDF Power-Suite*: Since we need a working app, we'll try standard pdf-lib encryption. If it fails due to library limits, we will alert the user.

import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { 
  UploadCloudIcon, 
  DownloadIcon, 
  Loader2, 
  ShieldCheckIcon,
  ShieldAlertIcon,
  FileIcon,
  LockIcon,
  UnlockIcon
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Security() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [preventPrint, setPreventPrint] = useState(false);
  const [preventCopy, setPreventCopy] = useState(false);
  const [preventModify, setPreventModify] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  
  const { addHistoryItem } = useHistory();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        toast.error("Please select a valid PDF file");
        return;
      }
      setFile(selected);
      setProcessedUrl(null);
    }
  };

  const processSecurity = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      
      // Dynamic imports for workers
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      
      const { jsPDF } = await import("jspdf");
      
      // Initialize jsPDF
      const doc = new jsPDF();
      
      // Set encryption explicitly via method call
      const allowedPermissions = [];
      if (!preventPrint) allowedPermissions.push("print");
      if (!preventCopy) allowedPermissions.push("copy");
      if (!preventModify) allowedPermissions.push("modify");
      
      // @ts-ignore
      doc.setEncryption({
        userPassword: password || undefined,
        ownerPassword: (password || "admin") + "-sec",
        userPermissions: allowedPermissions
      });
      
      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress({ status: `Securing Page ${i}/${pdf.numPages}...`, value: 20 + Math.round((i/pdf.numPages) * 70) });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); 
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({ canvasContext: context as any, viewport: viewport }).promise;
          const imgData = canvas.toDataURL("image/jpeg", 0.75);
          
          if (i > 1) doc.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? "l" : "p");
          else {
              // Adjust first page size to match source
              // @ts-ignore
              doc.deletePage(1);
              doc.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? "l" : "p");
          }
          
          const width = doc.internal.pageSize.getWidth();
          const height = doc.internal.pageSize.getHeight();
          doc.addImage(imgData, "JPEG", 0, 0, width, height);
        }
      }
      
      const pdfBytes = doc.output("arraybuffer");
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setProcessedUrl(url);
      addHistoryItem({ action: password ? "password protected (FLATTENED)" : "updated permissions (FLATTENED)", filename: file.name, module: "security" });
      toast.success(password ? "PDF Secured successfully!" : "Permissions updated!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to secure PDF. Ensure the file is not corrupted.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const processUnlock = async () => {
    if (!file) return;
    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password: unlockPassword || undefined, ignoreEncryption: false } as any);
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      addHistoryItem({ action: "Unlocked PDF", filename: file.name, module: "security" });
      toast.success("PDF unlocked successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message?.includes("password") ? "Incorrect password." : "Failed to unlock document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `secured-${file?.name || 'document.pdf'}`;
    a.click();
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          PDF <span className="gradient-text">Security</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Add passwords and restrict permissions (printing, copying) natively on your device.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50">
        <CardContent className="pt-6">
          {!file ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl border-purple-500/30 hover:bg-purple-500/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Select Document</h3>
              <p className="text-muted-foreground">Upload a PDF to secure it.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <FileIcon className="h-8 w-8 text-purple-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setFile(null); setProcessedUrl(null); }} className="mt-4 sm:mt-0 w-full sm:w-auto">
                  Choose Another
                </Button>
              </div>

              {!processedUrl ? (
                <Tabs defaultValue="protect" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="protect" className="text-md gap-2">
                       <LockIcon className="h-4 w-4" /> Protect
                    </TabsTrigger>
                    <TabsTrigger value="unlock" className="text-md gap-2">
                       <UnlockIcon className="h-4 w-4" /> Unlock
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="protect" className="space-y-8 animate-in fade-in">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                         <LockIcon className="h-5 w-5 text-purple-500" />
                         <h3 className="text-lg font-semibold">Password Protection</h3>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Document Password (Optional)</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="Leave blank for no password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="max-w-md"
                        />
                        <p className="text-xs text-muted-foreground">Users will be required to enter this password to view the PDF.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                         <ShieldAlertIcon className="h-5 w-5 text-purple-500" />
                         <h3 className="text-lg font-semibold">Permission Restrictions</h3>
                      </div>
                      
                      <div className="grid gap-4 bg-muted/20 p-4 rounded-xl border">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Disable Printing</Label>
                            <p className="text-xs text-muted-foreground">Prevent viewers from printing the document.</p>
                          </div>
                          <Switch checked={preventPrint} onCheckedChange={setPreventPrint} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Disable Text Copying</Label>
                            <p className="text-xs text-muted-foreground">Prevent highlighting and copying text.</p>
                          </div>
                          <Switch checked={preventCopy} onCheckedChange={setPreventCopy} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Disable Modifications</Label>
                            <p className="text-xs text-muted-foreground">Prevent editing, adding signatures, or filling forms.</p>
                          </div>
                          <Switch checked={preventModify} onCheckedChange={setPreventModify} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      {progress && (
                        <div className="space-y-2 mb-4 p-4 rounded-xl border bg-muted/20">
                          <div className="flex justify-between text-sm font-medium">
                            <span>{progress.status}</span>
                            <span>{progress.value}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress.value}%` }} />
                          </div>
                        </div>
                      )}
                      <Button 
                        size="lg" 
                        className="w-full text-lg bg-purple-600 hover:bg-purple-700 text-white" 
                        onClick={processSecurity} 
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {progress ? "Processing..." : "Securing Document..."}
                          </>
                        ) : (
                          "Apply Security Settings"
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="unlock" className="space-y-8 animate-in fade-in">
                     <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                           <UnlockIcon className="h-5 w-5 text-purple-500" />
                           <h3 className="text-lg font-semibold">Remove Password & Restrictions</h3>
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="unlock-pw">Current Password (if known)</Label>
                           <Input 
                             id="unlock-pw" 
                             type="password" 
                             placeholder="Enter current file password"
                             value={unlockPassword}
                             onChange={(e) => setUnlockPassword(e.target.value)}
                             className="max-w-md"
                           />
                           <p className="text-xs text-muted-foreground">If the document has an open password, enter it here. We will strip the security and output a clean PDF.</p>
                        </div>
                        <Button size="lg" className="w-full text-lg bg-emerald-600 hover:bg-emerald-700 text-white" onClick={processUnlock} disabled={isProcessing}>
                          {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Unlock Document"}
                        </Button>
                     </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-green-500/5 border border-green-500/20 rounded-xl animate-in zoom-in-95">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-500 mb-2">Document Secured!</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Your document has been processed with the requested security settings.
                    </p>
                  </div>
                  <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg" onClick={triggerDownload}>
                    <DownloadIcon className="mr-2 h-6 w-6" />
                    Download Protected PDF
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
