"use client";
import React from "react";
import { CropIcon, AlertCircleIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CropPDF() {
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <CropIcon className="w-10 h-10 text-blue-500" />
          Crop PDF
        </h1>
      </div>
      <Card className="max-w-xl mx-auto border-dashed border-2 bg-muted/30">
        <CardContent className="p-12 text-center space-y-6">
           <AlertCircleIcon className="w-16 h-16 mx-auto text-blue-400 opacity-80" />
           <h3 className="text-2xl font-bold">Interactive Cropper in Development</h3>
           <p className="text-muted-foreground">We are perfecting the DOM layout logic required to manipulate exact mediaBoxes securely on mobile.</p>
           <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
        </CardContent>
      </Card>
    </div>
  );
}
