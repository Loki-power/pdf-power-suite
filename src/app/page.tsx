// FORCE PUSH VERIFICATION: NEW CONVERSION TOOLS AND LIGHT THEME
import { Card, CardContent } from "@/components/ui/card";
import { 
  FilePlusIcon, Grid2x2Icon, ShieldCheckIcon,
  ArrowRightIcon, LockKeyholeIcon, FileUpIcon,
  ZapIcon, FileArchiveIcon, ArrowLeftRightIcon,
  SparklesIcon, ImageIcon, FileTextIcon, ImagePlusIcon,
  ImagesIcon, EditIcon, PresentationIcon, DatabaseIcon, 
  ListOrderedIcon, UnlockIcon, LockIcon, RotateCwIcon, 
  ScanIcon, SearchIcon, LayersIcon, SettingsIcon, PenToolIcon, 
  WrenchIcon, EyeOffIcon, CropIcon, CpuIcon, GlobeIcon, LayoutGridIcon,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500/10 overflow-hidden font-sans">
      
      {/* Dynamic Background Glows for Premium WOW Factor */}
      <div className="absolute top-0 left-1/2 w-[1200px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-orange-600/20 to-rose-600/20 blur-[120px] opacity-80 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] rounded-full bg-orange-600/10 blur-[150px] opacity-60 pointer-events-none" />
      
      <main className="relative z-10 pt-20 pb-24 space-y-32">
        
        {/* HERO SECTION */}
        <div className="flex flex-col items-center text-center space-y-10 max-w-5xl mx-auto px-4 sm:px-6 animate-in fade-in zoom-in-95 duration-1000 ease-out">
          
          {/* Trust Factor Badge */}
          <div className="inline-flex items-center justify-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 shadow-2xl shadow-emerald-500/5 backdrop-blur-sm transition-transform hover:scale-105">
            <LockKeyholeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-emerald-400 tracking-wide uppercase">Your files are processed securely and not stored.</span>
          </div>
          
          <div className="relative">
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[1.05] text-slate-900 drop-shadow-sm">
              The Ultimate <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-pink-500 drop-shadow-sm relative">
                Document Tool.
                {/* Visual Loading / Scanning Animation */}
                <div className="absolute -inset-x-6 top-1/2 h-[2px] bg-white/40 blur-[2px] z-10 animate-[scan_3s_ease-in-out_infinite]" />
              </span>
            </h1>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/20 blur-[100px] animate-pulse rounded-full" />
          </div>
          
          <p className="text-slate-600 text-lg sm:text-xl md:text-2xl font-medium leading-relaxed max-w-2xl sm:max-w-3xl mx-auto px-4">
            Everything you need to merge, split, compress, and convert your files offline. Zero uploads. Lightning fast. Free forever.
          </p>
          
          {/* Massive CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-6 pt-4 w-full sm:w-auto px-4">
            <Link href="/pdf/organize" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-16 sm:h-20 px-8 sm:px-14 text-lg sm:text-2xl font-extrabold rounded-2xl sm:rounded-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white shadow-2xl shadow-orange-600/30 transition-all hover:-translate-y-1 hover:scale-[1.02] active:scale-95 group border border-white/10 relative overflow-hidden">
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <div className="flex items-center justify-center relative z-10">
                  <FileUpIcon className="mr-3 h-6 w-6 sm:h-7 sm:w-7 group-hover:-translate-y-1 transition-transform" />
                  Upload File
                  {/* Fake loading spinner that appears only on click action via pure CSS active state */}
                  <div className="hidden group-active:block w-5 h-5 ml-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              </Button>
            </Link>
            <Link href="/convert/pdf-to-word" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 sm:h-20 px-8 sm:px-14 text-lg sm:text-2xl font-extrabold rounded-2xl sm:rounded-full border-2 border-slate-200 hover:bg-slate-50 text-slate-900 shadow-xl transition-all hover:-translate-y-1 group bg-white/80 backdrop-blur-md relative overflow-hidden">
                <span className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <div className="flex items-center justify-center relative z-10">
                  <ZapIcon className="mr-3 h-6 w-6 text-yellow-400 group-hover:scale-125 transition-transform" />
                  Convert Now
                </div>
              </Button>
            </Link>
          </div>
        </div>

        {/* SUPPORTED FORMATS (Upgraded Cards) */}
        <div className="relative">
          <div className="absolute inset-0 bg-slate-900/60 border-y border-white/5 backdrop-blur-3xl transform skew-y-1" />
          <div className="relative py-16 sm:py-20 lg:py-24 z-10">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
              <div className="text-center mb-12">
                <div className="inline-block bg-white/5 px-4 py-1.5 rounded-full border border-white/10 mb-4">
                  <p className="text-sm font-bold tracking-widest text-slate-300 uppercase">Seamless Processing</p>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Supported Formats</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-90 hover:opacity-100 transition-opacity duration-500">
                 
                 {/* Format 1: PDF */}
                 <Link href="/pdf/split-merge" className="group relative flex flex-col items-center p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 hover:border-red-500/50 hover:bg-white transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)] hover:-translate-y-2 overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-red-500/20 transition-colors duration-500" />
                   <div className="relative z-10 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors mb-6 shadow-inner">
                     <FileTextIcon className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">PDF</h3>
                   <p className="text-slate-500 font-medium mt-2 text-center">Portable Document Format</p>
                 </Link>
                 
                 {/* Format 2: DOCX */}
                 <Link href="/convert/pdf-to-word" className="group relative flex flex-col items-center p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 hover:border-blue-500/50 hover:bg-white transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] hover:-translate-y-2 overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors duration-500" />
                   <div className="relative z-10 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors mb-6 shadow-inner">
                     <FileTextIcon className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">DOCX</h3>
                   <p className="text-slate-500 font-medium mt-2 text-center">Microsoft Word Document</p>
                 </Link>

                 {/* Format 3: JPG/PNG */}
                 <Link href="/convert/pdf-to-jpg" className="group relative flex flex-col items-center p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:bg-white transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)] hover:-translate-y-2 overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors duration-500" />
                   <div className="relative z-10 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors mb-6 shadow-inner">
                     <ImagePlusIcon className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500" />
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">JPG <span className="text-xl text-slate-300">/</span> PNG</h3>
                   <p className="text-slate-500 font-medium mt-2 text-center">Standard Image Formats</p>
                 </Link>
                 
              </div>
            </div>
          </div>
        </div>

        <div id="tools" className="container mx-auto px-4 sm:px-6 max-w-7xl animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-1.5 border border-white/5 mb-4 backdrop-blur-sm">
               <SparklesIcon className="w-4 h-4 text-orange-400" />
               <span className="text-sm font-bold tracking-wider text-slate-300 uppercase">Every Tool You Need</span>
            </div>
             <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900">🧰 All PDF Tools</h2>
             <p className="text-slate-600 text-lg sm:text-xl font-medium max-w-3xl mx-auto px-4">
               Every tool you need to use PDFs, at your fingertips. All are fully offline, secure, and lightning fast. Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            
            <ToolCard href="/pdf/merge" title="Merge PDF" desc="Combine PDFs in the order you want." icon={Grid2x2Icon} color="orange" />
            <ToolCard href="/pdf/split" title="Split PDF" desc="Separate pages or extract a whole set." icon={FilePlusIcon} color="blue" />
            <ToolCard href="/pdf/compress" title="Compress PDF" desc="Reduce file size with maximal quality." icon={FileArchiveIcon} color="rose" />
            
            <ToolCard href="/convert/pdf-to-word" title="PDF to Word" desc="Convert PDF files into easy to edit DOCX." icon={FileTextIcon} color="cyan" />
            <ToolCard href="/convert/pdf-to-ppt" title="PDF to PowerPoint" desc="Turn PDF into PPTX slideshows." icon={PresentationIcon} color="cyan" />
            <ToolCard href="/convert/pdf-to-excel" title="PDF to Excel" desc="Pull data straight into spreadsheets." icon={DatabaseIcon} color="cyan" />
            
            <ToolCard href="/convert/word-to-pdf" title="Word to PDF" desc="Convert DOCX files into PDF." icon={FileTextIcon} color="emerald" />
            <ToolCard href="/convert/ppt-to-pdf" title="PowerPoint to PDF" desc="Convert PPTX slideshows to PDF." icon={PresentationIcon} color="emerald" />
            <ToolCard href="/convert/excel-to-pdf" title="Excel to PDF" desc="Convert EXCEL spreadsheets to PDF." icon={DatabaseIcon} color="emerald" />
            
            <ToolCard href="/pdf/edit" title="Edit PDF" desc="Add text, images, shapes or freehand." icon={EditIcon} color="purple" />
            <ToolCard href="/convert/pdf-to-jpg" title="PDF to JPG" desc="Convert PDF to JPG exactly." icon={ImagesIcon} color="rose" />
            <ToolCard href="/convert/jpg-to-pdf" title="JPG to PDF" desc="Convert JPG images to PDF." icon={ImagePlusIcon} color="emerald" />
            <ToolCard href="/pdf/sign" title="Sign PDF" desc="Sign yourself electronically." icon={PenToolIcon} color="orange" />
            <ToolCard href="/pdf/watermark" title="Watermark" desc="Stamp an image or text over PDF." icon={LayersIcon} color="blue" />
            <ToolCard href="/pdf/rotate" title="Rotate PDF" desc="Rotate your PDFs exactly as needed." icon={RotateCwIcon} color="cyan" />
            <ToolCard href="/pdf/html" title="HTML to PDF" desc="Convert webpages directly to PDF." icon={GlobeIcon} color="emerald" />
            
            <ToolCard href="/pdf/security" title="Unlock PDF" desc="Remove PDF password security." icon={UnlockIcon} color="purple" />
            <ToolCard href="/pdf/security" title="Protect PDF" desc="Encrypt and protect PDF with password." icon={LockIcon} color="purple" />
            <ToolCard href="/pdf/organize" title="Organize PDF" desc="Sort, delete, or add pages." icon={LayoutGridIcon} color="rose" />
            
            <ToolCard href="/pdf/pdfa" title="PDF to PDF/A" desc="Transform for long-term archiving." icon={SettingsIcon} color="orange" />
            <ToolCard href="/pdf/repair" title="Repair PDF" desc="Repair a damaged PDF quickly." icon={WrenchIcon} color="blue" />
            <ToolCard href="/pdf/page-numbers" title="Page Numbers" desc="Add page numbers with ease." icon={ListOrderedIcon} color="cyan" />
            
            <ToolCard href="/pdf/scan" title="Scan to PDF" desc="Capture scans using your camera." icon={ScanIcon} color="emerald" />
            <ToolCard href="/pdf/intelligence" title="OCR PDF" desc="Convert scanned text into searchable content." icon={SearchIcon} color="purple" />
            <ToolCard href="/pdf/compare" title="Compare PDF" desc="Side-by-side document comparison." icon={ArrowLeftRightIcon} color="rose" />
            
            <ToolCard href="/pdf/intelligence" title="Redact PDF" desc="Permanently remove sensitive info." icon={EyeOffIcon} color="orange" />
            <ToolCard href="/pdf/crop" title="Crop PDF" desc="Crop margins of PDF documents." icon={CropIcon} color="blue" />

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-center py-10 relative z-10 px-6">
         <div className="flex justify-center items-center mb-6">
            <div className="flex items-center space-x-2">
              <LockKeyholeIcon className="w-5 h-5 text-slate-500" />
              <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">100% Secure & Local</span>
            </div>
         </div>
         <p className="text-slate-500 font-medium">© 2026 DocuPro. Built with privacy-first browser technology.</p>
      </footer>
      
      {/* Global CSS for custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-300%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(300%); opacity: 0; }
        }
      `}} />
    </div>
  );
}

function ToolCard({ href, title, desc, icon: Icon, color }: { href: string, title: string, desc: string, icon: LucideIcon, color: string }) {
  // Check if it's a "New" feature denoted by the color badge
  const isNew = color.includes("Badge");
  const baseColor = color.replace("Badge", "");

  // Map colors to reliable Tailwind classes due to dynamic class limitations
  const colorMap: Record<string, string> = {
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500/20 ring-orange-500/50 shadow-orange-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20 ring-blue-500/50 shadow-blue-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:bg-cyan-500/20 ring-cyan-500/50 shadow-cyan-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20 ring-emerald-500/50 shadow-emerald-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500/20 ring-rose-500/50 shadow-rose-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20 ring-purple-500/50 shadow-purple-500/20",
  };

  // Safe fallback if color missing
  const activeColor = colorMap[baseColor] || colorMap.orange;
  const [textColor, bgColor, borderColor, hoverBgColor, ringColor, shadowColor] = activeColor.split(' ');

  return (
    <Link href={href} className={`group block focus:outline-none focus:ring-4 ${ringColor} rounded-3xl h-full`}>
      <Card className={`h-full border border-slate-100 bg-white hover:bg-slate-50 transition-all duration-500 hover:shadow-xl ${shadowColor} hover:-translate-y-2 rounded-3xl overflow-hidden cursor-pointer relative`}>
        {isNew && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-pulse">
            NEW!
          </div>
        )}
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
          <ArrowRightIcon className={`${textColor} w-5 h-5`} />
        </div>
        <CardContent className="p-4 sm:p-5 flex flex-col items-start gap-3 h-full">
          <div className={`p-3 rounded-2xl ${bgColor} border ${borderColor} shadow-inner ${hoverBgColor} group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
            <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${textColor}`} />
          </div>
          <div className="space-y-1.5 flex-1 w-full">
            <h3 className={`text-lg sm:text-xl font-bold text-slate-900 group-hover:${textColor} transition-colors tracking-tight leading-tight`}>{title}</h3>
            <p className="text-slate-500 text-sm leading-snug line-clamp-3">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
