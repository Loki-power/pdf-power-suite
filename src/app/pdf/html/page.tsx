"use client";
import React, { useState, useRef } from "react";
import { GlobeIcon, PrinterIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function HTMLtoPDF() {
  const [htmlCode, setHtmlCode] = useState("<h1>Hello World</h1>\n<p>Paste your HTML directly here!</p>");
  const [isProcessing, setIsProcessing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const triggerPrint = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        const doc = iframe.contentWindow.document;
        doc.open();
        // Add minimal styling for a clean print output
        doc.write(`
          <html><head><style>
            body { font-family: system-ui, sans-serif; padding: 20px; line-height: 1.5; }
            @media print { body { padding: 0; } }
          </style></head><body>
          ${htmlCode}
          </body></html>
        `);
        doc.close();
        
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      setIsProcessing(false);
    }, 500); // short delay to ensure DOM is fully written before print starts
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12 animate-in fade-in">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <GlobeIcon className="w-10 h-10 text-emerald-500" />
          HTML to PDF
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Convert pure HTML code natively into a beautiful PDF using built-in print engines.</p>
        <p className="text-sm font-semibold text-emerald-500">Works 100% offline. Just select "Save as PDF" when the dialog opens!</p>
      </div>
      
      <Card className="max-w-4xl mx-auto border-2 border-emerald-500/20 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl">
        <CardContent className="p-6 md:p-8 space-y-6">
           <Textarea 
             className="w-full h-64 font-mono text-sm border-2 rounded-xl"
             placeholder="Paste HTML Code here..."
             value={htmlCode}
             onChange={e => setHtmlCode(e.target.value)}
           />
           
           <Button size="lg" className="w-full text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" onClick={triggerPrint} disabled={isProcessing}>
             {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PrinterIcon className="mr-2 h-5 w-5" />}
             Open PDF Print Engine
           </Button>
           
           {/* Hidden iframe used solely to construct and print the DOM */}
           <iframe ref={iframeRef} className="hidden" title="print-buffer" />
        </CardContent>
      </Card>
    </div>
  );
}
