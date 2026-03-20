import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FilePlusIcon, Grid2x2Icon, ShieldCheckIcon, FileEditIcon, 
  ScanTextIcon, ArrowRightIcon, LockKeyholeIcon, FileUpIcon,
  ZapIcon, FileArchiveIcon, ArrowLeftRightIcon, CheckCircle2Icon,
  SparklesIcon, ImageIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-20%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[150px] pointer-events-none" />
      
      {/* Brand Identity Header / Navigation */}
      <header className="absolute top-0 w-full z-50 border-b border-white/5 bg-neutral-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-lg shadow-indigo-500/20">
               <FileEditIcon className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-bold tracking-tight text-white">DocuStudio<span className="text-indigo-500">.</span></span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-400">
             <Link href="#features" className="hover:text-white transition-colors">Tools</Link>
             <Link href="#security" className="hover:text-white transition-colors">Privacy</Link>
             <Link href="/pdf/intelligence" className="hover:text-white transition-colors flex items-center gap-1">
               <SparklesIcon className="w-3 h-3 text-fuchsia-400" /> AI Features
             </Link>
          </nav>
          <div>
            <Link href="/pdf/organize">
              <Button className="hidden md:inline-flex bg-white text-neutral-950 hover:bg-neutral-200 rounded-full px-6 font-semibold">
                Open App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-40 pb-24 space-y-32 relative z-10">
        
        {/* HERO SECTION */}
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* Trust Factor Badge (CRITICAL) */}
          <div className="inline-flex items-center justify-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 shadow-sm shadow-emerald-500/5">
            <LockKeyholeIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">100% Secure • Files processed locally • Never uploaded to any server</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Supercharge your PDFs, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">safely & instantly.</span>
          </h1>
          
          <p className="text-neutral-400 text-xl leading-relaxed max-w-2xl mx-auto">
            Merge, split, compress, and secure your documents directly in your browser. No slow uploads. No privacy risks. Just powerful tools working at lightspeed.
          </p>
          
          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 w-full sm:w-auto">
            <Link href="/pdf/organize" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 group">
                <FileUpIcon className="mr-2 h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                Upload PDF
              </Button>
            </Link>
            <Link href="/pdf/split-merge" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-neutral-700 hover:bg-neutral-800 text-white shadow-sm transition-all">
                Explore Tools <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-8 text-sm text-neutral-500 font-medium">
             <span className="flex items-center gap-2"><CheckCircle2Icon className="w-4 h-4 text-emerald-500"/> Free forever</span>
             <span className="flex items-center gap-2"><CheckCircle2Icon className="w-4 h-4 text-emerald-500"/> No account needed</span>
             <span className="flex items-center gap-2"><CheckCircle2Icon className="w-4 h-4 text-emerald-500"/> Works offline</span>
          </div>
        </div>

        {/* FEATURES GRID SECTION */}
        <div id="features" className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Every tool you need</h2>
            <p className="text-neutral-400 text-lg">Click on any tool below to instantly process your files securely in your browser.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Merge */}
            <Link href="/pdf/split-merge" className="group block">
              <Card className="h-full border border-white/5 bg-neutral-900/50 backdrop-blur-xl hover:bg-neutral-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
                <CardHeader className="p-6">
                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 w-fit mb-4 group-hover:bg-indigo-500/20 transition-colors">
                    <Grid2x2Icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-indigo-400 transition-colors">Merge PDF</CardTitle>
                  <CardDescription className="text-neutral-400 mt-2">Combine multiple PDFs into one unified document instantly.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Split */}
            <Link href="/pdf/split-merge" className="group block">
              <Card className="h-full border border-white/5 bg-neutral-900/50 backdrop-blur-xl hover:bg-neutral-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
                <CardHeader className="p-6">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <FilePlusIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">Split PDF</CardTitle>
                  <CardDescription className="text-neutral-400 mt-2">Extract specific pages or separate one massive PDF into smaller files.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Compress */}
            <Link href="/pdf/finishing" className="group block relative">
              <div className="absolute top-4 right-4 bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-bold px-2 py-1 rounded-full border border-fuchsia-500/30">Flatten</div>
              <Card className="h-full border border-white/5 bg-neutral-900/50 backdrop-blur-xl hover:bg-neutral-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
                <CardHeader className="p-6">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <FileArchiveIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-emerald-400 transition-colors">Compress & Flatten</CardTitle>
                  <CardDescription className="text-neutral-400 mt-2">Reduce file size and flatten forms into a clean, uneditable document.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Convert OCR */}
            <Link href="/pdf/intelligence" className="group block">
              <Card className="h-full border border-white/5 bg-neutral-900/50 backdrop-blur-xl hover:bg-neutral-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1">
                <CardHeader className="p-6">
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
                    <ScanTextIcon className="h-6 w-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-orange-400 transition-colors">Convert to Text (OCR)</CardTitle>
                  <CardDescription className="text-neutral-400 mt-2">Use built-in AI intelligence to extract editable text from scanned images.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Shield / Security */}
            <Link href="/pdf/security" className="group block">
              <Card className="h-full border border-white/5 bg-neutral-900/50 backdrop-blur-xl hover:bg-neutral-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1">
                <CardHeader className="p-6">
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 w-fit mb-4 group-hover:bg-rose-500/20 transition-colors">
                    <ShieldCheckIcon className="h-6 w-6 text-rose-400" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-rose-400 transition-colors">Protect & Redact</CardTitle>
                  <CardDescription className="text-neutral-400 mt-2">Add passwords, lock printing, or black out sensitive data securely.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Convert PDF/Word */}
            <Link href="/convert" className="group block">
              <Card className="h-full border border-white/5 bg-neutral-900/50 backdrop-blur-xl hover:bg-neutral-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
                <CardHeader className="p-6">
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 w-fit mb-4 group-hover:bg-cyan-500/20 transition-colors">
                    <ArrowLeftRightIcon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-cyan-400 transition-colors">Universal Converter</CardTitle>
                  <CardDescription className="text-neutral-400 mt-2">Convert PDF to Word, Image to PDF, or extract images instantly offline.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Image Tools */}
            <Link href="/image" className="group block">
              <Card className="h-full border border-white/5 bg-neutral-900/50 backdrop-blur-xl hover:bg-neutral-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
                <CardHeader className="p-6">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <ImageIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-emerald-400 transition-colors">Image Studio</CardTitle>
                  <CardDescription className="text-neutral-400 mt-2">Resize dimensions, convert formats (JPG/PNG), and compress images natively.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Quick Organize */}
            <Link href="/pdf/organize" className="group block md:col-span-1 lg:col-span-2 xl:col-span-3">
              <Card className="h-full border border-white/5 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/5 backdrop-blur-xl hover:bg-neutral-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 border-t-indigo-500/30">
                <CardHeader className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="p-4 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex-shrink-0">
                     <ZapIcon className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white group-hover:text-indigo-400 transition-colors mb-2">Organize Pages Masterfully</CardTitle>
                    <CardDescription className="text-neutral-300 text-lg">Visually drag, drop, delete, and reorder pages in a stunning interface. No more wrestling with clunky desktop apps.</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-neutral-950/80 text-center py-8 relative z-10">
         <p className="text-neutral-500 text-sm">© 2026 DocuStudio. All files processed locally on your device.</p>
      </footer>
    </div>
  );
}
