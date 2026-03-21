"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MenuIcon, XIcon, ShieldCheckIcon, LockKeyholeIcon, CpuIcon } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/pdf/organize", label: "Organize" },
    { href: "/pdf/split-merge", label: "Split/Merge" },
    { href: "/pdf/security", label: "Security" },
    { href: "/pdf/finishing", label: "Finishing" },
    { href: "/pdf/intelligence", label: "AI Tools" },
    { href: "/convert", label: "Converter" },
    { href: "/image", label: "Image Tools" },
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

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center px-4">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    isActive 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Actions / CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/pdf/organize">
               <Button className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white border-0 shadow-lg shadow-orange-500/20 rounded-full px-6 font-bold transition-transform hover:scale-105">
                  Get Started
               </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-3xl border-b border-white/5 shadow-2xl p-4 flex flex-col gap-2 max-h-[calc(100vh-5rem)] overflow-y-auto animate-in slide-in-from-top-2">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link 
                  key={link.href} 
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
