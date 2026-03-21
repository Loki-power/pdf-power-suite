"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, UploadCloudIcon, DownloadIcon, Loader2, FileTextIcon } from "lucide-react";

export default function PdfToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.doc");
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([e.target.files[0]]);
      setProcessedUrl(null);
      setProgress(null);
    }
  };

  const processFile = async () => {
    if (files.length === 0 || files[0].type !== "application/pdf") {
      toast.error("Please select a valid PDF file.");
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress({ status: "Parsing PDF...", value: 15 });
      
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress({ status: `Extracting Text (Page ${i})...`, value: 15 + Math.round((i/pdf.numPages) * 70) });
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += `<p>${pageText}</p><br style="page-break-after: always;">`;
      }
      
      setProgress({ status: "Formatting Document Layout...", value: 95 });
      
      const docHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Export</title></head>
      <body>${fullText || '<p>No text found to extract.</p>'}</body>
      </html>`;
      
      const blob = new Blob([docHtml], { type: 'application/msword' });
      
      setProcessedUrl(URL.createObjectURL(blob));
      setDownloadName(`${files[0].name.replace('.pdf', '')}.doc`);
      addHistoryItem({ action: `Converted PDF to Word (.doc)`, filename: files[0].name, module: "convert" });
      toast.success("Word document successfully wrapped and exported!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Failed to convert PDF to Word: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          PDF to <span className="text-cyan-500">Word</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Extract text intelligently into an editable MS Word format offline.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl">
        <CardContent>
          {files.length === 0 ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-cyan-500/30 hover:bg-cyan-500/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
                <FileTextIcon className="h-10 w-10 text-cyan-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload PDF</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-cyan-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{files[0].name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFiles([]); setProcessedUrl(null);}}>Change File</Button>
              </div>

              {!processedUrl ? (
                <>
                  {progress && (
                    <div className="space-y-2 mb-6 p-4 rounded-xl border bg-muted/20">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{progress.status}</span>
                        <span>{progress.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress.value}%` }} />
                      </div>
                    </div>
                  )}
                  <Button size="lg" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={processFile} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} Convert to Word
                  </Button>
                </>
              ) : (
                 <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                    const a = document.createElement("a");
                    a.href = processedUrl; a.download = downloadName; a.click();
                 }}>
                   <DownloadIcon className="mr-2 h-5 w-5" /> Download Document
                 </Button>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
        </CardContent>
      </Card>
    </div>
  );
}
