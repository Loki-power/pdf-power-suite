"use client";

import ConversionPage from "@/components/ConversionPage";
import { ImagePlusIcon } from "lucide-react";

export default function JpgToPdf() {
  const processFile = async (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => {
    addLog("Initializing Image-to-PDF Splicer...");
    
    const { jsPDF } = await import("jspdf");
    const img = new Image();
    const dataUrl = URL.createObjectURL(file);
    
    return new Promise<{ url: string; name: string }>((resolve, reject) => {
      img.onload = () => {
        addLog(`Analyzing image dimensions: ${img.width}x${img.height}`);
        setProgress("Capturing Geometry", 50);
        
        // Calculate orientation
        const orientation = img.width > img.height ? 'l' : 'p';
        const doc = new jsPDF({
          orientation: orientation,
          unit: 'px',
          format: [img.width, img.height]
        });
        
        addLog("Injecting Image Stream into PDF Container...");
        doc.addImage(img, 'JPEG', 0, 0, img.width, img.height);
        
        setProgress("Finalizing Binary", 90);
        const pdfBlob = doc.output('blob');
        
        URL.revokeObjectURL(dataUrl);
        addLog("Image successfully encapsulated in PDF.");
        
        resolve({
          url: URL.createObjectURL(pdfBlob),
          name: `${file.name.split('.')[0]}.pdf`
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(dataUrl);
        reject(new Error("Failed to load image metadata."));
      };
      
      img.src = dataUrl;
    });
  };

  return (
    <ConversionPage
      title="JPG to PDF"
      subtitle="Convert your JPG images into high-quality PDF documents. Ideal for scanning documents and sharing images professionally."
      targetFormat="PDF Document"
      accentColor="emerald"
      icon={ImagePlusIcon}
      accept="image/jpeg,image/png"
      onConvert={processFile}
    />
  );
}
