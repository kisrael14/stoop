import type { Metadata, Viewport } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import SwipeMain from '@/components/SwipeMain';
import { AuthProvider } from '@/lib/auth-context';

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
