import { Card, CardContent } from "@/components/ui/card";
import { 
  FilePlusIcon, Grid2x2Icon, ShieldCheckIcon, FileEditIcon, 
  ArrowRightIcon, LockKeyholeIcon, FileUpIcon,
  ZapIcon, FileArchiveIcon, ArrowLeftRightIcon, CheckCircle2Icon,
  SparklesIcon, ImageIcon, FileTextIcon, ImagePlusIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 overflow-hidden font-sans">
      
      {/* Dynamic Background Glows for Premium WOW Factor */}
      <div className="absolute top-0 left-1/2 w-[1200px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-600/20 to-fuchsia-600/20 blur-[120px] opacity-80 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] rounded-full bg-blue-600/10 blur-[150px] opacity-60 pointer-events-none" />
      
      {/* Brand Identity Header */}
      <header className="relative z-50 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-3 group cursor-pointer">
             <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
               <FileEditIcon className="w-5 h-5 text-white" />
             </div>
             <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">Docu<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Studio</span></span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-400">
             <Link href="#tools" className="hover:text-white transition-colors">Our Tools</Link>
             <Link href="/convert" className="hover:text-white transition-colors">Convert Files</Link>
             <Link href="/pdf/security" className="hover:text-white transition-colors flex items-center gap-1">
               <ShieldCheckIcon className="w-4 h-4 text-emerald-400" /> Privacy
             </Link>
          </nav>
          <div>
            <Link href="/pdf/organize">
              <Button className="hidden md:inline-flex bg-white text-slate-950 hover:bg-slate-200 rounded-full px-6 font-bold shadow-lg hover:shadow-white/20 transition-all">
                Open Workspace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-24 space-y-32">
        
        {/* HERO SECTION */}
        <div className="flex flex-col items-center text-center space-y-10 max-w-5xl mx-auto px-6 animate-in fade-in zoom-in-95 duration-1000 ease-out">
          
          {/* Trust Factor Badge (CRITICAL FIX) */}
          <div className="inline-flex items-center justify-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-6 py-2.5 shadow-2xl shadow-emerald-500/10 backdrop-blur-sm transition-transform hover:scale-105">
            <LockKeyholeIcon className="h-5 w-5 text-emerald-400" />
            <span className="text-sm md:text-base font-bold text-emerald-400 tracking-wide uppercase">Your files are processed securely and not stored.</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[1.05] text-white drop-shadow-2xl">
            The Ultimate <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 drop-shadow-sm">
              Document Tool.
            </span>
          </h1>
          
          <p className="text-slate-400 text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
            Everything you need to merge, split, compress, and convert your files offline. Zero uploads. Lightning fast. Free forever.
          </p>
          
          {/* Massive CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 w-full sm:w-auto">
            <Link href="/pdf/organize" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-16 md:h-20 px-10 md:px-14 text-xl md:text-2xl font-extrabold rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1 hover:scale-[1.02] active:scale-95 group border border-white/10">
                <FileUpIcon className="mr-3 h-7 w-7 group-hover:-translate-y-1 transition-transform" />
                Upload File
              </Button>
            </Link>
            <Link href="/convert" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 md:h-20 px-10 md:px-14 text-xl md:text-2xl font-extrabold rounded-full border-2 border-slate-700 hover:bg-slate-800 text-white shadow-lg transition-all hover:-translate-y-1 group bg-slate-900/50 backdrop-blur-md">
                <ZapIcon className="mr-3 h-6 w-6 text-yellow-400 group-hover:rotate-12 transition-transform" />
                Convert Now
              </Button>
            </Link>
          </div>
        </div>

        {/* SUPPORTED FORMATS (CRITICAL FIX) */}
        <div className="border-y border-white/5 bg-slate-900/40 backdrop-blur-xl py-12">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="text-center text-sm font-bold tracking-widest text-slate-500 uppercase mb-8">Supported Formats</p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-80 hover:opacity-100 transition-opacity duration-300">
               <div className="flex flex-col items-center justify-center space-y-3 group cursor-default">
                 <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                   <FileTextIcon className="w-10 h-10 text-red-500" />
                 </div>
                 <span className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors">📄 PDF</span>
               </div>
               
               <div className="flex flex-col items-center justify-center space-y-3 group cursor-default">
                 <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                   <FileTextIcon className="w-10 h-10 text-blue-500" />
                 </div>
                 <span className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors">📝 DOCX</span>
               </div>

               <div className="flex flex-col items-center justify-center space-y-3 group cursor-default">
                 <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                   <ImagePlusIcon className="w-10 h-10 text-emerald-500" />
                 </div>
                 <span className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors">🖼️ JPG / PNG</span>
               </div>
            </div>
          </div>
        </div>

        {/* OUR TOOLS GRID (CRITICAL FIX) */}
        <div id="tools" className="container mx-auto px-6 max-w-7xl animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-1.5 border border-white/5 mb-4">
               <SparklesIcon className="w-4 h-4 text-indigo-400" />
               <span className="text-sm font-bold tracking-wider text-slate-300 uppercase">Feature rich</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white">🧰 Our Tools</h2>
            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">Click on any tool below to instantly process your files securely.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* 1. Merge PDF */}
            <Link href="/pdf/split-merge" className="group block focus:outline-none focus:ring-4 focus:ring-indigo-500/50 rounded-3xl">
              <Card className="h-full border border-white/5 bg-slate-900/60 backdrop-blur-2xl hover:bg-slate-800/80 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] hover:-translate-y-2 rounded-3xl overflow-hidden cursor-pointer relative">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0">
                  <ArrowRightIcon className="text-indigo-400 w-6 h-6" />
                </div>
                <CardContent className="p-8 md:p-10 flex flex-col items-start gap-6">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-500">
                    <Grid2x2Icon className="h-10 w-10 text-indigo-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">📄 Merge PDF</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">Combine multiple PDFs and images into one unified document instantly.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 2. Split PDF */}
            <Link href="/pdf/split-merge" className="group block focus:outline-none focus:ring-4 focus:ring-blue-500/50 rounded-3xl">
              <Card className="h-full border border-white/5 bg-slate-900/60 backdrop-blur-2xl hover:bg-slate-800/80 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] hover:-translate-y-2 rounded-3xl overflow-hidden cursor-pointer relative">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0">
                  <ArrowRightIcon className="text-blue-400 w-6 h-6" />
                </div>
                <CardContent className="p-8 md:p-10 flex flex-col items-start gap-6">
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-500">
                    <FilePlusIcon className="h-10 w-10 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">✂️ Split PDF</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">Extract specific pages or separate one massive PDF into smaller files cleanly.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* 3. Convert Files */}
            <Link href="/convert" className="group block focus:outline-none focus:ring-4 focus:ring-cyan-500/50 rounded-3xl">
              <Card className="h-full border border-white/5 bg-slate-900/60 backdrop-blur-2xl hover:bg-slate-800/80 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.2)] hover:-translate-y-2 rounded-3xl overflow-hidden cursor-pointer relative">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0">
                  <ArrowRightIcon className="text-cyan-400 w-6 h-6" />
                </div>
                <CardContent className="p-8 md:p-10 flex flex-col items-start gap-6">
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-500">
                    <ArrowLeftRightIcon className="h-10 w-10 text-cyan-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">🔄 Convert Files</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">PDF to Word, Image to PDF, or extract images instantly completely offline.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Additional High-Value Tools */}
            <Link href="/image" className="group block focus:outline-none focus:ring-4 focus:ring-emerald-500/50 rounded-3xl">
              <Card className="h-full border border-white/5 bg-slate-900/60 backdrop-blur-2xl hover:bg-slate-800/80 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] hover:-translate-y-2 rounded-3xl overflow-hidden cursor-pointer relative">
                <CardContent className="p-8 flex flex-col items-start gap-5">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all duration-300">
                    <ImageIcon className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">Image Studio</h3>
                    <p className="text-slate-400">Resize, compress, and encode formats.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pdf/finishing" className="group block focus:outline-none focus:ring-4 focus:ring-rose-500/50 rounded-3xl">
              <Card className="h-full border border-white/5 bg-slate-900/60 backdrop-blur-2xl hover:bg-slate-800/80 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.2)] hover:-translate-y-2 rounded-3xl overflow-hidden cursor-pointer relative">
                <CardContent className="p-8 flex flex-col items-start gap-5">
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 group-hover:bg-rose-500/20 transition-all duration-300">
                    <FileArchiveIcon className="h-8 w-8 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors mb-2">Compress PDF</h3>
                    <p className="text-slate-400">Dramatically reduce PDF file sizes.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pdf/security" className="group block focus:outline-none focus:ring-4 focus:ring-purple-500/50 rounded-3xl">
              <Card className="h-full border border-white/5 bg-slate-900/60 backdrop-blur-2xl hover:bg-slate-800/80 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)] hover:-translate-y-2 rounded-3xl overflow-hidden cursor-pointer relative">
                <CardContent className="p-8 flex flex-col items-start gap-5">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all duration-300">
                    <ShieldCheckIcon className="h-8 w-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">Protect & Redact</h3>
                    <p className="text-slate-400">Add secure passwords and lock edits.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

          </div>
        </div>

        {/* Global Security Assurance */}
        <div className="flex justify-center items-center py-12 opacity-80">
           <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-full px-8 py-4 shadow-xl">
              <LockKeyholeIcon className="w-6 h-6 text-emerald-500" />
              <p className="font-bold text-slate-300 text-lg">Trust Booster: <span className="text-emerald-400">Your files are processed securely and not stored.</span></p>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/90 text-center py-12 relative z-10">
         <p className="text-slate-500 font-medium">© 2026 DocuStudio. Built with privacy-first browser technology.</p>
      </footer>
    </div>
  );
}
