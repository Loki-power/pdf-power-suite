"use client";

import { useState, useRef, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileIcon, 
  DownloadIcon, 
  Loader2, 
  ArrowRightIcon, 
  SparklesIcon, 
  ZapIcon, 
  RefreshCcwIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import { useHistory } from "@/components/HistoryProvider";

interface ConversionPageProps {
  title: string;
  subtitle: string;
  targetFormat: string;
  accentColor: "orange" | "rose" | "emerald" | "blue" | "purple" | "cyan";
  icon: LucideIcon;
  accept: string;
  onConvert: (file: File, setProgress: (status: string, value: number) => void, addLog: (msg: string) => void) => Promise<{ url: string; name: string }>;
  options?: ReactNode;
  initialOptions?: ReactNode;
  version?: string;
}

export default function ConversionPage({
  title,
  subtitle,
  targetFormat,
  accentColor,
  icon: Icon,
  accept,
  onConvert,
  options,
  initialOptions,
  version
}: ConversionPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ status: string; value: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  
  const { addHistoryItem } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colorMap = {
    orange: "from-orange-500 to-rose-600 shadow-orange-500/20 text-orange-500 bg-orange-500/10 border-orange-500/20",
    rose: "from-rose-500 to-pink-600 shadow-rose-500/20 text-rose-500 bg-rose-500/10 border-rose-500/20",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/20 text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "from-blue-500 to-indigo-600 shadow-blue-500/20 text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "from-purple-500 to-fuchsia-600 shadow-purple-500/20 text-purple-500 bg-purple-500/10 border-purple-500/20",
    cyan: "from-cyan-500 to-blue-600 shadow-cyan-500/20 text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  };

  const [gradClasses, shadowClass, textClass, bgClass, borderClass] = (colorMap[accentColor] || colorMap.orange).split(" ");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setProcessedUrl(null);
      setProgress(null);
      setLogs([]);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  const handleConvert = async () => {
    if (!file) return;
    try {
      setIsProcessing(true);
      setLogs([]);
      addLog(`Initializing ${title} Engine...`);
      
      const result = await onConvert(
        file, 
        (status, value) => setProgress({ status, value }),
        addLog
      );
      
      setProcessedUrl(result.url);
      setDownloadName(result.name);
      addHistoryItem({ action: `Converted ${file.name} to ${targetFormat}`, filename: file.name, module: "convert" });
      toast.success("Conversion successful!");
    } catch (error: any) {
      console.error(error);
      toast.error(`Engine error: ${error.message || "Unknown error"}`);
      addLog(`[ERROR] ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const reset = () => {
    setFile(null);
    setProcessedUrl(null);
    setProgress(null);
    setLogs([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b ${gradClasses} opacity-5 blur-[120px] pointer-events-none rounded-full`} />
      
      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-1000">
          {version && (
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${bgClass} ${textClass} text-[10px] font-bold tracking-widest uppercase border ${borderClass} shadow-sm mb-2`}>
              <ZapIcon className="h-3 w-3 animate-pulse" />
              <span>{version}</span>
            </div>
          )}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1]">
            {title.includes(" to ") ? (
              <>
                {title.split(" to ")[0]} to <span className={textClass}>{title.split(" to ")[1]}</span>
              </>
            ) : title}
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed pb-4">
            {subtitle}
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-3xl border border-slate-200 shadow-2xl rounded-[3rem] overflow-hidden">
          <CardContent className="p-0">
            {!file ? (
              <div 
                className="group cursor-pointer flex flex-col items-center justify-center p-20 sm:p-32 hover:bg-slate-50 transition-all duration-500 ease-out"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`h-24 w-24 sm:h-32 sm:w-32 rounded-[2.5rem] ${bgClass} flex items-center justify-center mb-8 border ${borderClass} shadow-2xl group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3`}>
                  <Icon className={`h-12 w-12 sm:h-16 sm:w-16 ${textClass} group-hover:animate-pulse`} />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Drop your file here</h3>
                <p className="text-slate-500 text-sm sm:text-base font-medium max-w-sm text-center">
                  Secure local processing. No files ever leave your browser.
                </p>
                <div className="mt-10 flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <ArrowRightIcon className="h-3 w-3" />
                  <span>Accepts {accept.toUpperCase()}</span>
                </div>
                
                {initialOptions && (
                  <div className="mt-12 w-full max-w-xl mx-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="h-[2px] w-12 bg-slate-200 mx-auto mb-8" />
                    {initialOptions}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 sm:p-12 space-y-10">
                
                {/* File Preview Card */}
                <div className={`flex flex-col sm:flex-row items-center justify-between p-6 rounded-[2rem] bg-slate-50 border ${borderClass} gap-6 shadow-inner relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradClasses} opacity-5 blur-2xl transform rotate-45 -mr-16 -mt-16`} />
                  <div className="flex items-center space-x-5 relative z-10 w-full sm:w-auto overflow-hidden">
                    <div className={`p-4 rounded-2xl ${bgClass} border ${borderClass}`}>
                      <FileIcon className={`h-8 w-8 ${textClass}`} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-slate-900 font-black text-lg truncate max-w-[250px] sm:max-w-md uppercase tracking-tighter">{file.name}</span>
                      <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest flex items-center ${textClass}`}>
                        <SparklesIcon className="mr-1.5 h-3 w-3" /> Engine Ready for Optimization
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={reset} className="rounded-full px-8 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 relative z-10">
                    Replace File
                  </Button>
                </div>

                {!processedUrl ? (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* Dynamic Options Area */}
                    {options && (
                      <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
                         <div className="flex items-center space-x-3 mb-2">
                           <ZapIcon className={`h-5 w-5 ${textClass}`} />
                           <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Configuration</h4>
                         </div>
                         {options}
                      </div>
                    )}

                    {/* Progress Bar & Logs */}
                    {isProcessing && (
                      <div className="space-y-6 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl relative overflow-hidden group">
                        <div className="flex justify-between items-center relative z-10">
                           <div className="flex items-center space-x-4">
                             <div className={`h-10 w-10 flex items-center justify-center rounded-full ${bgClass} border ${borderClass}`}>
                                <Loader2 className={`h-5 w-5 animate-spin ${textClass}`} />
                             </div>
                             <span className="text-slate-900 font-black text-lg uppercase tracking-tight italic">{progress?.status || "Processing..."}</span>
                           </div>
                           <span className={`${textClass} text-4xl font-black italic`}>{progress?.value || 0}%</span>
                        </div>
                        
                        <div className="h-5 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200 shadow-inner">
                           <div 
                             className={`h-full bg-gradient-to-r ${gradClasses} rounded-full transition-all duration-500 ease-out shadow-[0_0_20px_rgba(255,255,255,0.1)]`} 
                             style={{ width: `${progress?.value || 0}%` }} 
                           />
                        </div>

                        {/* Real-time Status Stream */}
                        <div className="bg-slate-50 rounded-3xl p-6 h-40 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-600 border border-slate-100 scrollbar-hide select-none transition-all group-hover:border-slate-200">
                           <div className="flex items-center space-x-2 mb-4 border-b border-slate-200 pb-2 opacity-60">
                              <RefreshCcwIcon className="h-3 w-3" />
                              <span className="uppercase font-black tracking-widest text-[9px]">Conversion Event Stream</span>
                           </div>
                           {logs.map((log, i) => (
                             <div key={i} className={`flex items-start space-x-2 py-0.5 ${i === 0 ? "text-slate-900 font-bold" : "opacity-60"}`}>
                               <span className={i === 0 ? textClass : "text-slate-300"}>{">"}</span>
                               <span>{log}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleConvert} 
                      disabled={isProcessing}
                      className={`w-full py-12 rounded-[2.5rem] bg-gradient-to-r ${gradClasses} text-white font-black text-2xl sm:text-3xl uppercase tracking-[0.3em] shadow-2xl ${shadowClass} transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 group overflow-hidden`}
                    >
                      <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <div className="flex items-center justify-center relative z-10">
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-4 h-8 w-8 animate-spin" />
                            Splicing Binary...
                          </>
                        ) : (
                          <>
                            <ZapIcon className="mr-4 h-8 w-8 group-hover:scale-125 transition-transform" />
                            Master Conversion
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-10 animate-in zoom-in-95 duration-700">
                    <div className="p-16 sm:p-24 rounded-[3.5rem] border-[6px] border-emerald-500/20 bg-emerald-500/5 text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      
                      <div className="relative z-10 space-y-8">
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-[2.5rem] bg-emerald-500/20 border-4 border-white/10 shadow-3xl shadow-emerald-500/40 animate-bounce transition-transform group-hover:scale-110">
                           <CheckCircle2Icon className="h-16 w-16 text-emerald-500" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-5xl sm:text-6xl font-black text-emerald-400 tracking-tighter uppercase leading-none">Victory!</h3>
                          <p className="text-emerald-500/60 text-lg sm:text-xl font-bold uppercase tracking-widest max-w-sm mx-auto italic">
                            Binary logic verified. Headers reconstructed. Content synchronized.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button 
                        size="lg" 
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = processedUrl; a.download = downloadName; a.click();
                        }}
                        className="h-24 rounded-[2rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl uppercase tracking-widest shadow-2xl shadow-emerald-500/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4"
                      >
                        <DownloadIcon className="h-7 w-7" />
                        Download {targetFormat}
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={reset}
                        className="h-24 rounded-[2rem] border-2 border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white hover:border-slate-500 font-extrabold text-sm uppercase tracking-[0.4em] transition-all hover:-translate-y-1 flex items-center justify-center"
                      >
                        Start New Cycle →
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical Badges Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.3em] text-slate-400 italic animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
           <div className="flex flex-col items-center space-y-3 group cursor-default">
              <div className="w-8 h-[2px] bg-slate-200 group-hover:bg-slate-400 group-hover:w-16 transition-all" />
              <span className="group-hover:text-slate-600 transition-colors text-center">SHA-256 Verified Binary</span>
           </div>
           <div className="flex flex-col items-center space-y-3 group cursor-default">
              <div className="w-8 h-[2px] bg-slate-200 group-hover:bg-slate-400 group-hover:w-16 transition-all" />
              <span className="group-hover:text-slate-600 transition-colors text-center">Memory Buffer Sanitized</span>
           </div>
           <div className="flex flex-col items-center space-y-3 group cursor-default">
              <div className="w-8 h-[2px] bg-slate-200 group-hover:bg-slate-400 group-hover:w-16 transition-all" />
              <span className="group-hover:text-slate-600 transition-colors text-center">Cross-Format Logic Sync</span>
           </div>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={accept} 
        className="hidden" 
      />
      
      <style key="local-styles" dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
