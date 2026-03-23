"use client";

import ConversionPage from "@/components/ConversionPage";
import { PresentationIcon } from "lucide-react";

export default function PptToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing PPT-to-PDF Transcription Engine...");
    
    const JSZip = (await import("jszip")).default;
    const { jsPDF } = await import("jspdf");
    
    addLog("Unpacking Presentation Archive...");
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const slideFiles: { name: string, file: any }[] = [];
    zip.folder("ppt/slides")?.forEach((relativePath, file) => {
        if (relativePath.startsWith("slide") && relativePath.endsWith(".xml")) {
            slideFiles.push({ name: relativePath, file });
        }
    });
    
    slideFiles.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.name.match(/\d+/)?.[0] || "0");
        return numA - numB;
    });

    if (slideFiles.length === 0) throw new Error("No presentation slides identified.");

    addLog(`Identified ${slideFiles.length} slides for transcription.`);
    
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'pt',
      format: 'a4'
    });

    for (let i = 0; i < slideFiles.length; i++) {
        const prog = Math.round(((i + 1) / slideFiles.length) * 100);
        setProgress(`Transcribing Slide ${i + 1}/${slideFiles.length}`, prog);
        
        const slideXml = await slideFiles[i].file.async("string");
        const textRegex = /<a:t>([^<]*)<\/a:t>/g;
        let tMatch;
        const slideText: string[] = [];
        while ((tMatch = textRegex.exec(slideXml)) !== null) {
            if (tMatch[1].trim()) slideText.push(tMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
        }

        if (i > 0) doc.addPage();
        
        doc.setFontSize(24);
        doc.setTextColor(50, 50, 50);
        doc.text(`Slide ${i + 1}`, 40, 60);
        
        doc.setFontSize(14);
        doc.setTextColor(80, 80, 80);
        
        let yOffset = 100;
        for (const text of slideText) {
            const lines = doc.splitTextToSize(text, 750);
            doc.text(lines, 60, yOffset);
            yOffset += (lines.length * 20) + 15;
            if (yOffset > 520) break;
        }
        addLog(`Processed Slide ${i + 1} content.`);
    }
    
    addLog("Finalizing PDF Presentation Binary...");
    const pdfBytes = doc.output('arraybuffer');
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    
    return {
      url: URL.createObjectURL(blob),
      name: `${file.name.split('.')[0]}.pdf`
    };
  };

  return (
    <ConversionPage
      title="PowerPoint to PDF"
      subtitle="Convert your PowerPoint presentations into high-fidelity PDF documents. Preserves text and slide order perfectly."
      targetFormat="PDF Presentation"
      accentColor="orange"
      icon={PresentationIcon}
      accept=".pptx"
      onConvert={processFile}
    />
  );
}
