import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { HistoryProvider } from '@/components/HistoryProvider';
import { HistorySidebar } from '@/components/HistorySidebar';
import { Header } from '@/components/Header';
import { GoogleAnalytics } from '@next/third-parties/google';

import { ThemeProvider } from '@/components/ThemeProvider';

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem disableTransitionOnChange>
        <HistoryProvider>
          <Header />
        <main className="flex-1">
          {children}
        </main>
        <HistorySidebar />
        </HistoryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
