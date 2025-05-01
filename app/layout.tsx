import 'katex/dist/katex.min.css';
import type React from 'react';
import '@/app/globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Dev Narula',
  description: "Dev Narula's Website",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
