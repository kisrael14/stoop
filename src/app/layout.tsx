import type { Metadata, Viewport } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Stoop Sports',
  description: 'Your neighborhood sports group chat',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${playfair.variable}`}>
      <body className="h-full bg-paper text-ink">
        <div className="relative mx-auto flex h-full max-w-md flex-col overflow-hidden shadow-2xl">
          <main className="flex-1 overflow-y-auto pb-16">{children}</main>
          <BottomNav />
        </div>
        <TopBar />
      </body>
    </html>
  );
}
