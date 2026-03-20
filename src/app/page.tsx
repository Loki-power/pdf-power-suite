import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileIcon, FilePlusIcon, FileCode2Icon, Grid2x2Icon, 
  ShieldCheckIcon, FingerprintIcon, FileEditIcon, TagsIcon, 
  BrainCircuitIcon, ScanTextIcon, ArrowRightIcon, ShieldAlertIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const modules = [
    {
      title: "Core Operations",
      delay: "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100",
      items: [
        { title: "Organize Pages", desc: "Drag, drop, delete, and visually reorder your PDF pages with ease.", icon: <Grid2x2Icon className="h-10 w-10 text-blue-500" />, href: "/pdf/organize", color: "from-blue-500/20 to-cyan-500/20", hover: "hover:shadow-blue-500/20 hover:border-blue-500/50" },
        { title: "Split & Merge", desc: "Combine multiple documents into one, or extract specific page ranges seamlessly.", icon: <FilePlusIcon className="h-10 w-10 text-indigo-500" />, href: "/pdf/split-merge", color: "from-indigo-500/20 to-blue-500/20", hover: "hover:shadow-indigo-500/20 hover:border-indigo-500/50" },
      ]
    },
    {
      title: "Security & Legal Finishing",
      delay: "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300",
      items: [
        { title: "Protect & Unlock", desc: "Encrypt documents with passwords and lock down printing or copying permissions.", icon: <ShieldCheckIcon className="h-10 w-10 text-purple-500" />, href: "/pdf/security", color: "from-purple-500/20 to-fuchsia-500/20", hover: "hover:shadow-purple-500/20 hover:border-purple-500/50" },
        { title: "Digital e-Signatures", desc: "Draw or place digital signatures directly onto your document pages.", icon: <FingerprintIcon className="h-10 w-10 text-fuchsia-500" />, href: "/pdf/finishing?tab=sign", color: "from-fuchsia-500/20 to-pink-500/20", hover: "hover:shadow-fuchsia-500/20 hover:border-fuchsia-500/50" },
        { title: "Custom Watermarks", desc: "Brand your documents with custom permanent text or image watermarks.", icon: <FileEditIcon className="h-10 w-10 text-pink-500" />, href: "/pdf/finishing?tab=watermark", color: "from-pink-500/20 to-rose-500/20", hover: "hover:shadow-pink-500/20 hover:border-pink-500/50" },
        { title: "Bates Numbering", desc: "Embed sequential identification indexing numbers on legal documents.", icon: <TagsIcon className="h-10 w-10 text-rose-500" />, href: "/pdf/finishing?tab=bates", color: "from-rose-500/20 to-orange-500/20", hover: "hover:shadow-rose-500/20 hover:border-rose-500/50" },
      ]
    },
    {
      title: "Next-Gen AI Intelligence",
      delay: "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500",
      items: [
        { title: "Smart Offline OCR", desc: "Extract raw, selectable text from scanned image PDFs completely offline using WebAssembly.", icon: <ScanTextIcon className="h-10 w-10 text-emerald-500" />, href: "/pdf/intelligence?tab=ocr", color: "from-emerald-500/20 to-teal-500/20", hover: "hover:shadow-emerald-500/20 hover:border-emerald-500/50" },
        { title: "Smart Redaction", desc: "Auto-detect and securely black out sensitive data like emails, IDs, and phone numbers.", icon: <FileCode2Icon className="h-10 w-10 text-teal-500" />, href: "/pdf/intelligence?tab=redact", color: "from-teal-500/20 to-cyan-500/20", hover: "hover:shadow-teal-500/20 hover:border-teal-500/50" },
      ]
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl py-16 px-4 md:px-8 space-y-20 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center justify-center space-x-2 bg-muted/50 backdrop-blur-md border rounded-full px-4 py-1.5 mb-4 shadow-sm">
            <ShieldAlertIcon className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">100% Client-Side Processing • Your Data Never Leaves Your Device</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x">Document</span> Studio.
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed">
            Merge, secure, organize, and intelligently OCR your PDFs with a lightning-fast suite of professional tools built directly into your browser.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/pdf/organize">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all">
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pdf/intelligence">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-border/50 hover:bg-background shadow-sm hover:shadow-md transition-all">
                Try Smart OCR
              </Button>
            </Link>
          </div>
        </div>

        {/* Modules Section */}
        <div className="space-y-16">
          {modules.map((mod, i) => (
            <div key={i} className={`space-y-6 ${mod.delay}`}>
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-bold tracking-tight">{mod.title}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mod.items.map((tool) => (
                  <Link href={tool.href} key={tool.title} className="group">
                    <Card className={`h-full border border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-2xl ${tool.hover} overflow-hidden relative`}>
                      {/* Interactive Card Background Glow on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none from-white to-transparent" />
                      
                      <CardHeader className="p-6 relative z-10">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${tool.color} w-fit shadow-sm border border-white/5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          {tool.icon}
                        </div>
                        <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                        <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                          {tool.desc}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
