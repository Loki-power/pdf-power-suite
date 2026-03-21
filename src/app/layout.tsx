import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { HistoryProvider } from '@/components/HistoryProvider';
import { HistorySidebar } from '@/components/HistorySidebar';
import { Header } from '@/components/Header';

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
          <Header />
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
