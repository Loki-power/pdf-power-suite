"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon, ShieldCheckIcon, LockKeyholeIcon, CpuIcon, ChevronDownIcon, Grid2x2Icon, FilePlusIcon, LayoutGridIcon, ScanIcon, FileArchiveIcon, WrenchIcon, ImagePlusIcon, FileTextIcon, PresentationIcon, DatabaseIcon, GlobeIcon, ImagesIcon, SettingsIcon, RotateCwIcon, ListOrderedIcon, LayersIcon, CropIcon, EditIcon, UnlockIcon, LockIcon, PenToolIcon, EyeOffIcon, ArrowLeftRightIcon } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const mobileLinks = [
    { href: "/pdf/split-merge", label: "MERGE PDF" },
    { href: "/pdf/split-merge", label: "SPLIT PDF" },
    { href: "/pdf/finishing", label: "COMPRESS PDF" },
    { href: "/convert", label: "CONVERT PDF" },
    { href: "/pdf/organize", label: "ALL PDF TOOLS" },
  ];

  return (
    <>
      {/* Custom Toolbar - Trust Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-500/90 py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-4 sm:gap-6 tracking-wide z-[60] relative">
        <div className="flex items-center gap-1.5 animate-pulse">
          <LockKeyholeIcon className="w-3.5 h-3.5" />
          <span>Secure processing</span>
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-amber-500/40" />
        <div className="flex items-center gap-1.5">
          <ShieldCheckIcon className="w-3.5 h-3.5" />
          <span>Files are not stored</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-105">
              <CpuIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white drop-shadow-sm">
              Docu<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav - Mega Menu Structure */}
          <nav className="hidden lg:flex items-center space-x-2 flex-1 justify-center px-4 font-bold text-sm tracking-wide h-full">
            <Link href="/pdf/split-merge" className="px-3 py-6 text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors">MERGE PDF</Link>
            <Link href="/pdf/split-merge" className="px-3 py-6 text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors">SPLIT PDF</Link>
            <Link href="/pdf/finishing" className="px-3 py-6 text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors">COMPRESS PDF</Link>

            {/* CONVERT PDF Dropdown */}
            <div className="relative group px-3 py-6 cursor-pointer">
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 group-hover:text-orange-500 transition-colors">
                CONVERT PDF <ChevronDownIcon className="w-4 h-4" />
              </div>
              
              {/* Invisible Bridge to prevent hover drop */}
              <div className="absolute top-full left-0 w-full h-4 bg-transparent z-40"></div>
              
              <div className="absolute top-[calc(100%+0.5rem)] -left-16 w-[400px] bg-white dark:bg-slate-900 shadow-xl border dark:border-slate-800 flex gap-6 rounded-xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                 <div className="flex-1">
                   <div className="text-xs text-slate-400 font-extrabold mb-3 tracking-wider uppercase">Convert to PDF</div>
                   <div className="flex flex-col gap-3">
                      <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><ImagePlusIcon className="w-4 h-4 text-emerald-500"/> JPG to PDF</Link>
                      <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><FileTextIcon className="w-4 h-4 text-blue-500"/> WORD to PDF</Link>
                      <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><PresentationIcon className="w-4 h-4 text-orange-500"/> POWERPOINT to PDF</Link>
                      <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><DatabaseIcon className="w-4 h-4 text-green-500"/> EXCEL to PDF</Link>
                      <Link href="/pdf/html" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><GlobeIcon className="w-4 h-4 text-slate-500"/> HTML to PDF</Link>
                   </div>
                 </div>
                 <div className="w-px bg-slate-100 dark:bg-slate-800"></div>
                 <div className="flex-1">
                   <div className="text-xs text-slate-400 font-extrabold mb-3 tracking-wider uppercase">Convert from PDF</div>
                   <div className="flex flex-col gap-3">
                      <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><ImagesIcon className="w-4 h-4 text-rose-500"/> PDF to JPG</Link>
                      <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><FileTextIcon className="w-4 h-4 text-cyan-500"/> PDF to WORD</Link>
                      <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><PresentationIcon className="w-4 h-4 text-cyan-500"/> PDF to POWERPOINT</Link>
                      <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><DatabaseIcon className="w-4 h-4 text-cyan-500"/> PDF to EXCEL</Link>
                      <Link href="/pdf/pdfa" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><SettingsIcon className="w-4 h-4 text-orange-500"/> PDF to PDF/A</Link>
                   </div>
                 </div>
              </div>
            </div>

            {/* ALL PDF TOOLS Mega Menu Dropdown */}
            <div className="relative group px-3 py-6 cursor-pointer">
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 group-hover:text-orange-500 transition-colors">
                ALL PDF TOOLS <ChevronDownIcon className="w-4 h-4" />
              </div>
              
               {/* Invisible Bridge */}
              <div className="absolute top-full left-0 w-full h-4 bg-transparent z-40"></div>
              
              <div className="absolute top-[calc(100%+0.5rem)] -right-32 w-[900px] bg-white dark:bg-slate-900 shadow-2xl border dark:border-slate-800 rounded-xl p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                 <div className="grid grid-cols-4 gap-8">
                   {/* Column 1: Organize & Optimize */}
                   <div className="space-y-8">
                     <div>
                       <div className="text-xs text-slate-400 font-extrabold mb-4 tracking-wider uppercase">Organize PDF</div>
                       <div className="flex flex-col gap-3.5">
                          <Link href="/pdf/split-merge" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><Grid2x2Icon className="w-4 h-4 text-orange-500"/> Merge PDF</Link>
                          <Link href="/pdf/split-merge" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><FilePlusIcon className="w-4 h-4 text-blue-500"/> Split PDF</Link>
                          <Link href="/pdf/organize" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><LayoutGridIcon className="w-4 h-4 text-rose-500"/> Organize PDF</Link>
                          <Link href="/pdf/scan" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><ScanIcon className="w-4 h-4 text-emerald-500"/> Scan to PDF</Link>
                       </div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-400 font-extrabold mb-4 tracking-wider uppercase">Optimize PDF</div>
                       <div className="flex flex-col gap-3.5">
                          <Link href="/pdf/finishing" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><FileArchiveIcon className="w-4 h-4 text-rose-500"/> Compress PDF</Link>
                          <Link href="/pdf/repair" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><WrenchIcon className="w-4 h-4 text-blue-500"/> Repair PDF</Link>
                       </div>
                     </div>
                   </div>
                   
                   {/* Column 2: Convert To PDF */}
                   <div>
                      <div className="text-xs text-slate-400 font-extrabold mb-4 tracking-wider uppercase">Convert to PDF</div>
                      <div className="flex flex-col gap-3.5">
                         <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><ImagePlusIcon className="w-4 h-4 text-emerald-500"/> JPG to PDF</Link>
                         <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><FileTextIcon className="w-4 h-4 text-blue-500"/> WORD to PDF</Link>
                         <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><PresentationIcon className="w-4 h-4 text-orange-500"/> POWERPOINT to PDF</Link>
                         <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><DatabaseIcon className="w-4 h-4 text-green-500"/> EXCEL to PDF</Link>
                         <Link href="/pdf/html" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><GlobeIcon className="w-4 h-4 text-emerald-500"/> HTML to PDF</Link>
                      </div>
                   </div>

                   {/* Column 3: Convert From PDF */}
                   <div>
                      <div className="text-xs text-slate-400 font-extrabold mb-4 tracking-wider uppercase">Convert from PDF</div>
                      <div className="flex flex-col gap-3.5">
                         <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><ImagesIcon className="w-4 h-4 text-rose-500"/> PDF to JPG</Link>
                         <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><FileTextIcon className="w-4 h-4 text-cyan-500"/> PDF to WORD</Link>
                         <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><PresentationIcon className="w-4 h-4 text-cyan-500"/> PDF to POWERPOINT</Link>
                         <Link href="/convert" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><DatabaseIcon className="w-4 h-4 text-cyan-500"/> PDF to EXCEL</Link>
                         <Link href="/pdf/pdfa" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><SettingsIcon className="w-4 h-4 text-orange-500"/> PDF to PDF/A</Link>
                      </div>
                   </div>

                   {/* Column 4: Edit & Security */}
                   <div className="space-y-8">
                     <div>
                       <div className="text-xs text-slate-400 font-extrabold mb-4 tracking-wider uppercase">Edit PDF</div>
                       <div className="flex flex-col gap-3.5">
                          <Link href="/pdf/organize" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><RotateCwIcon className="w-4 h-4 text-cyan-500"/> Rotate PDF</Link>
                          <Link href="/pdf/finishing" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><ListOrderedIcon className="w-4 h-4 text-cyan-500"/> Add page numbers</Link>
                          <Link href="/pdf/finishing" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><LayersIcon className="w-4 h-4 text-blue-500"/> Add watermark</Link>
                          <Link href="/pdf/crop" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><CropIcon className="w-4 h-4 text-blue-500"/> Crop PDF</Link>
                          <Link href="/pdf/edit" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><EditIcon className="w-4 h-4 text-purple-500"/> Edit PDF</Link>
                       </div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-400 font-extrabold mb-4 tracking-wider uppercase">PDF Security</div>
                       <div className="flex flex-col gap-3.5">
                          <Link href="/pdf/security" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><UnlockIcon className="w-4 h-4 text-purple-500"/> Unlock PDF</Link>
                          <Link href="/pdf/security" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><LockIcon className="w-4 h-4 text-purple-500"/> Protect PDF</Link>
                          <Link href="/pdf/finishing" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><PenToolIcon className="w-4 h-4 text-orange-500"/> Sign PDF</Link>
                          <Link href="/pdf/intelligence" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><EyeOffIcon className="w-4 h-4 text-orange-500"/> Redact PDF</Link>
                          <Link href="/pdf/compare" className="text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center gap-2"><ArrowLeftRightIcon className="w-4 h-4 text-rose-500"/> Compare PDF</Link>
                       </div>
                     </div>
                   </div>

                 </div>
              </div>
            </div>
          </nav>

          {/* User Actions / CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/pdf/organize">
               <Button className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white border-0 shadow-lg shadow-orange-500/20 rounded-full px-6 font-bold transition-transform hover:scale-105">
                  Get Started
               </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button 
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-3xl border-b border-white/5 shadow-2xl p-4 flex flex-col gap-2 max-h-[calc(100vh-5rem)] overflow-y-auto animate-in slide-in-from-top-2">
            {mobileLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link 
                  key={link.label} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-bold transition-all flex items-center ${
                    isActive 
                      ? "bg-gradient-to-r from-orange-500/10 to-rose-600/10 text-orange-400 border border-orange-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 mt-2 border-t border-white/10">
              <Link href="/pdf/organize" onClick={() => setIsOpen(false)}>
                 <Button className="w-full h-14 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform">
                    Get Started Now
                 </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
