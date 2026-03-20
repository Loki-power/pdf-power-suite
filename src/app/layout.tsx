import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { HistoryProvider } from '@/components/HistoryProvider';
import { HistorySidebar } from '@/components/HistorySidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PDF Power-Suite',
  description: 'A comprehensive suite of PDF tools entirely in your browser.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <HistoryProvider>
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2 px-4">
              <span className="font-bold sm:inline-block gradient-text">
                PDF Power-Suite
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/pdf/organize" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Organize Pages
              </Link>
              <Link href="/pdf/split-merge" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Split/Merge
              </Link>
              <Link href="/pdf/security" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Security
              </Link>
              <Link href="/pdf/finishing" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Finishing
              </Link>
              <Link href="/pdf/intelligence" className="transition-colors hover:text-foreground/80 text-foreground/60">
                OCR & Redaction
              </Link>
              <Link href="/convert" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Converter
              </Link>
              <Link href="/image" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Image Tools
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <HistorySidebar />
        </HistoryProvider>
        <Toaster />
      </body>
    </html>
  );
}
