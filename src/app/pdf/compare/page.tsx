"use client";
import React, { useState } from "react";
import { ArrowLeftRightIcon, UploadCloudIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ComparePDF() {
  const [file1Url, setFile1Url] = useState<string | null>(null);
  const [file2Url, setFile2Url] = useState<string | null>(null);

  const handleUpload1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile1Url(URL.createObjectURL(e.target.files[0]));
  };

  const handleUpload2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile2Url(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-[1600px] py-12 animate-in fade-in">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <ArrowLeftRightIcon className="w-10 h-10 text-rose-500" />
          Compare PDFs
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">View two documents side by side to easily spot visual differences.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[75vh]">
        <Card className="border-2 h-full flex flex-col overflow-hidden bg-slate-900/50 backdrop-blur-sm">
          {!file1Url ? (
            <label className="h-full flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/30 transition-colors">
              <input type="file" accept=".pdf" className="hidden" onChange={handleUpload1} />
              <UploadCloudIcon className="w-16 h-16 text-rose-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Upload Original Document</h3>
              <p className="text-slate-500">Left side comparison</p>
            </label>
          ) : (
            <iframe src={`${file1Url}#toolbar=0`} className="w-full h-full border-none rounded-xl" />
          )}
        </Card>

        <Card className="border-2 h-full flex flex-col overflow-hidden bg-slate-900/50 backdrop-blur-sm">
          {!file2Url ? (
             <label className="h-full flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/30 transition-colors">
               <input type="file" accept=".pdf" className="hidden" onChange={handleUpload2} />
               <UploadCloudIcon className="w-16 h-16 text-blue-400 mb-4" />
               <h3 className="text-2xl font-bold mb-2">Upload Modified Document</h3>
               <p className="text-slate-500">Right side comparison</p>
             </label>
           ) : (
             <iframe src={`${file2Url}#toolbar=0`} className="w-full h-full border-none rounded-xl" />
           )}
        </Card>
      </div>

      {(file1Url || file2Url) && (
        <div className="mt-8 flex justify-center">
            <Button variant="outline" size="lg" onClick={() => { setFile1Url(null); setFile2Url(null); }}>
               Clear & Restart Comparison
            </Button>
        </div>
      )}
    </div>
  );
}
