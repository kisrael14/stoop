import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Barlow_Condensed, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import SwipeMain from '@/components/SwipeMain';
import { AuthProvider } from '@/lib/auth-context';

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-barlow',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
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
    <html lang="en" className={`h-full ${bebasNeue.variable} ${barlowCondensed.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="h-full bg-paper text-ink">
        <AuthProvider>
          <div className="relative mx-auto flex h-full max-w-md flex-col overflow-hidden shadow-2xl">
            <SwipeMain>{children}</SwipeMain>
            <BottomNav />
          </div>
          <TopBar />
        </AuthProvider>
      </body>
    </html>
  );
}
