"use client";
import React from "react";
import { GlobeIcon, AlertCircleIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HTMLtoPDF() {
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <GlobeIcon className="w-10 h-10 text-emerald-500" />
          HTML to PDF
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Convert webpages directly to beautiful PDFs offline.</p>
      </div>
      
      <Card className="max-w-xl mx-auto border-dashed border-2 bg-muted/30">
        <CardContent className="p-12 text-center space-y-6">
           <AlertCircleIcon className="w-16 h-16 mx-auto text-emerald-400 opacity-80" />
           <h3 className="text-2xl font-bold">Requires Backend Processing</h3>
           <p className="text-muted-foreground">DocuPro is currently a strictly offline app for absolute privacy. HTML conversion requires a headless browser backend which violates this constraint. We are researching local WASM alternatives.</p>
           <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
        </CardContent>
      </Card>
    </div>
  );
}
