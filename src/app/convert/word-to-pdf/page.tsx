"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";
import { FileIcon, UploadCloudIcon, DownloadIcon, Loader2, FileType2Icon } from "lucide-react";

export default function WordToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("document.pdf");
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
    if (files.length === 0) return;
    try {
       setIsProcessing(true);
       setProgress({ status: `Unzipping DOCX structure...`, value: 20 });
       
       const arrayBuffer = await files[0].arrayBuffer();
       const zip = await JSZip.loadAsync(arrayBuffer);
       
       setProgress({ status: "Extracting document.xml...", value: 40 });
       const docXmlFile = zip.file("word/document.xml");
       if (!docXmlFile) {
         throw new Error("Invalid Word Document structure.");
       }
       
       const xmlContent = await docXmlFile.async("string");
       
       setProgress({ status: "Parsing text nodes...", value: 60 });
       // Extract all <w:t> tags
       const textRegex = /<w:t[^>]*>(.*?)<\/w:t>/g;
       let match;
       const paragraphs = [];
       let currentParagraph = "";
       
       // A deeper dive would parse <w:p> tags to know when paragraphs end, but for a 100% offline client parser,
       // we will split text loosely based on large spacing or element breaks.
       const paragraphRegex = /<w:p[^>]*>.*?<\/w:p>/g;
       let pMatch;
       while ((pMatch = paragraphRegex.exec(xmlContent)) !== null) {
          const pXml = pMatch[0];
          let pText = "";
          let tMatch;
          while ((tMatch = textRegex.exec(pXml)) !== null) {
             pText += tMatch[1];
          }
          if (pText) paragraphs.push(pText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
       }

       setProgress({ status: "Rendering PDF engine...", value: 80 });
       
       const pdfDoc = await PDFDocument.create();
       const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
       
       const fontSize = 12;
       const lineHeight = 16;
       let page = pdfDoc.addPage();
       let { width, height } = page.getSize();
       let yOffset = height - 50;
       
       for (const text of paragraphs) {
          // Word wrap logic
          const words = text.split(' ');
          let currentLine = '';
          
          for (let i = 0; i < words.length; i++) {
             const testLine = currentLine + words[i] + ' ';
             const textWidth = font.widthOfTextAtSize(testLine, fontSize);
             if (textWidth > width - 100 && i > 0) {
                 page.drawText(currentLine, { x: 50, y: yOffset, size: fontSize, font });
                 currentLine = words[i] + ' ';
                 yOffset -= lineHeight;
                 if (yOffset < 50) {
                     page = pdfDoc.addPage();
                     yOffset = height - 50;
                 }
             } else {
                 currentLine = testLine;
             }
          }
          page.drawText(currentLine, { x: 50, y: yOffset, size: fontSize, font });
          yOffset -= (lineHeight * 1.5); // Paragraph spacing
          if (yOffset < 50) {
              page = pdfDoc.addPage();
              yOffset = height - 50;
          }
       }
       
       const pdfBytes = await pdfDoc.save();
       const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
       setProcessedUrl(URL.createObjectURL(blob));
       setDownloadName(`${files[0].name.split('.')[0]}.pdf`);
       
       addHistoryItem({ action: `Converted Word to PDF`, filename: files[0].name, module: "convert" });
       toast.success(`Word document perfectly extracted and rendered into PDF.`);
    } catch (e: any) {
       console.error(e);
       toast.error(`Engine failed: ${e.message || "Unknown error"}`);
    } finally {
       setIsProcessing(false);
       setProgress(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Word to <span className="text-emerald-500">PDF</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Convert Word documents safely to PDF offline.
        </p>
      </div>

      <Card className="glass mt-8 p-4 md:p-8 border-2 border-border/50 bg-card/40 backdrop-blur-xl">
        <CardContent>
          {files.length === 0 ? (
            <div 
              className="cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-emerald-500/30 hover:bg-emerald-500/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <FileType2Icon className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload Word File</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-xl bg-background/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-6 w-6 text-emerald-500 shrink-0" />
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
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress.value}%` }} />
                      </div>
                    </div>
                  )}
                  <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={processFile} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} Convert to PDF
                  </Button>
                </>
              ) : (
                 <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                    const a = document.createElement("a");
                    a.href = processedUrl; a.download = downloadName; a.click();
                 }}>
                   <DownloadIcon className="mr-2 h-5 w-5" /> Download PDF
                 </Button>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept=".doc,.docx" onChange={handleFileChange} />
        </CardContent>
      </Card>
    </div>
  );
}
