"use client";
import React from "react";
import { SettingsIcon, AlertCircleIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PDFA() {
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <SettingsIcon className="w-10 h-10 text-orange-500" />
          PDF to PDF/A
        </h1>
      </div>
      <Card className="max-w-xl mx-auto border-dashed border-2 bg-muted/30">
        <CardContent className="p-12 text-center space-y-6">
           <AlertCircleIcon className="w-16 h-16 mx-auto text-orange-400 opacity-80" />
           <h3 className="text-2xl font-bold">In Development</h3>
           <p className="text-muted-foreground">Adding ISO standard metadata layers offline requires heavy WASM processing. This module is coming in v2.0.</p>
           <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
        </CardContent>
      </Card>
    </div>
  );
}
