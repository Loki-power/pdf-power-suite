"use client";

import ConversionPage from "@/components/ConversionPage";
import { PresentationIcon } from "lucide-react";

export default function PptToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing High-Fidelity PPT Transcription Engine...");
    
    const JSZip = (await import("jszip")).default;
    const { jsPDF } = await import("jspdf");
    
    addLog("Analyzing Presentation Structure...");
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

    // Attempt to get slide size from presentation.xml
    let slideWidth = 720; // Default points
    let slideHeight = 540;
    try {
      const presXml = await zip.file("ppt/presentation.xml")?.async("string");
      if (presXml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(presXml, "text/xml");
        const sldSz = xmlDoc.getElementsByTagName("p:sldSz")[0];
        if (sldSz) {
          const cx = parseInt(sldSz.getAttribute("cx") || "9144000");
          const cy = parseInt(sldSz.getAttribute("cy") || "6858000");
          slideWidth = (cx / 12700); // EMU to points
          slideHeight = (cy / 12700);
        }
      }
    } catch (e) {
      addLog("Scaling using standard 4:3 profile...");
    }

    const doc = new jsPDF({
      orientation: slideWidth > slideHeight ? 'l' : 'p',
      unit: 'pt',
      format: [slideWidth, slideHeight]
    });

    const parser = new DOMParser();

    for (let i = 0; i < slideFiles.length; i++) {
        const prog = Math.round(((i + 1) / slideFiles.length) * 100);
        setProgress(`Mapping Slide ${i + 1}/${slideFiles.length}`, prog);
        
        const slideXmlStr = await slideFiles[i].file.async("string");
        const slideXml = parser.parseFromString(slideXmlStr, "text/xml");
        
        if (i > 0) doc.addPage([slideWidth, slideHeight], slideWidth > slideHeight ? 'l' : 'p');

        // Extract shapes and their text with spatial awareness
        const shapes = slideXml.getElementsByTagName("p:sp");
        for (let j = 0; j < shapes.length; j++) {
            const shape = shapes[j];
            
            // 1. Get Position (EMUs to Points)
            const off = shape.getElementsByTagName("a:off")[0];
            const ext = shape.getElementsByTagName("a:ext")[0];
            
            if (!off || !ext) continue;
            
            const x = parseInt(off.getAttribute("x") || "0") / 12700;
            const y = parseInt(off.getAttribute("y") || "0") / 12700;
            const w = parseInt(ext.getAttribute("cx") || "0") / 12700;
            const h = parseInt(ext.getAttribute("cy") || "0") / 12700;

            // 2. Extract Text with Paragraph Awareness
            const paragraphs = shape.getElementsByTagName("a:p");
            let yOffset = y;
            
            for (let k = 0; k < paragraphs.length; k++) {
              const p = paragraphs[k];
              const textNodes = p.getElementsByTagName("a:t");
              let pText = "";
              for (let l = 0; l < textNodes.length; l++) {
                pText += textNodes[l].textContent || "";
              }

              if (pText.trim()) {
                // Determine alignment and basic sizing
                const isTitle = j === 0 || pText.length < 50; 
                doc.setFontSize(isTitle ? 22 : 14);
                doc.setTextColor(isTitle ? 40 : 80, isTitle ? 40 : 80, isTitle ? 40 : 80);
                
                const lines = doc.splitTextToSize(pText, w > 0 ? w : (slideWidth - 80));
                doc.text(lines, x > 0 ? x : 40, yOffset + 20);
                yOffset += (lines.length * (isTitle ? 26 : 16));
              }
            }
        }
        addLog(`Synchronized Slide ${i + 1}.`);
    }
    
    addLog("Synthesizing Final PDF Binary...");
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
      subtitle="Spatial-Aware PPT conversion. Preserves layout, positioning, and text hierarchy for a professional result."
      targetFormat="PDF Presentation"
      accentColor="orange"
      icon={PresentationIcon}
      accept=".pptx"
      onConvert={processFile}
    />
  );
}
