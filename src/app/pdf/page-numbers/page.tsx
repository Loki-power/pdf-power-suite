"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";
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
  ListOrderedIcon
} from "lucide-react";

export default function PageNumbersPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const { addHistoryItem } = useHistory();
  
  const [pageNumPrefix, setPageNumPrefix] = useState("Page ");
  const [pageNumSuffix, setPageNumSuffix] = useState(" of {total}");
  
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

  const processPageNumbers = async () => {
    if (!fileBytes) return;
    try {
      setIsProcessing(true);
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width } = page.getSize();
        const stamp = `${pageNumPrefix}${i + 1}${pageNumSuffix.replace('{total}', pages.length.toString())}`;
        
        page.drawText(stamp, {
          x: width / 2 - (stamp.length * 4),
          y: 30, // Bottom center
          size: 12,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified as any], { type: "application/pdf" });
      setProcessedUrl(URL.createObjectURL(blob));
      addHistoryItem({ action: "Added Page Numbers", filename: file?.name || "document", module: "page-numbers" });
      toast.success(`Page numbers applied to ${pages.length} pages!`);
    } catch (e: any) {
      toast.error("Failed to apply Page Numbers.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `numbered-${file?.name || 'document.pdf'}`;
    a.click();
  };

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Add <span className="text-cyan-500">Page Numbers</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Add page numbers to your document with ease.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-slate-200">
        <CardContent>
          {!file ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-cyan-500/30 hover:bg-cyan-500/5 transition-colors bg-white shadow-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
                <UploadCloudIcon className="h-10 w-10 text-cyan-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Select PDF file</h3>
              <p className="text-muted-foreground">Upload a document to paginate.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-slate-50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-cyan-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {setFile(null); setFileBytes(null); setProcessedUrl(null);}}>
                  Change File
                </Button>
              </div>

              {!processedUrl ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                       <Label htmlFor="pprefix">Prefix text</Label>
                       <Input id="pprefix" placeholder="e.g. Page " value={pageNumPrefix} onChange={(e) => setPageNumPrefix(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                       <Label htmlFor="psuffix">Suffix (use {`{total}`} for max pages)</Label>
                       <Input id="psuffix" placeholder="e.g. of {total}" value={pageNumSuffix} onChange={(e) => setPageNumSuffix(e.target.value)} />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-100 border rounded-xl text-center">
                     <p className="text-sm font-mono text-slate-500">Preview format: {pageNumPrefix}1{pageNumSuffix.replace('{total}', '10')}</p>
                  </div>
                  <Button size="lg" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={processPageNumbers} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ListOrderedIcon className="mr-2 h-5 w-5" />}
                    Apply Page Numbers
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-green-500/5 border border-green-500/20 rounded-xl animate-in fade-in">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <DownloadIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-600 mb-2">Page Numbers Added!</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Your document has been successfully paginated.
                    </p>
                  </div>
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={triggerDownload}>
                    <DownloadIcon className="mr-2 h-5 w-5" /> Download Numbered PDF
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
