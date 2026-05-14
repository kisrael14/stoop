'use client';

import { useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const NAV_PAGES = ['/stoop', '/streets', '/neighborhoods'];
const MIN_SWIPE_PX = 50;

export default function SwipeMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const startX = useRef(0);
  const startY = useRef(0);

  const currentIndex = NAV_PAGES.indexOf(pathname);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (currentIndex === -1) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < MIN_SWIPE_PX) return;
    if (dx < 0 && currentIndex < NAV_PAGES.length - 1) {
      router.push(NAV_PAGES[currentIndex + 1]);
    } else if (dx > 0 && currentIndex > 0) {
      router.push(NAV_PAGES[currentIndex - 1]);
    }
  };

  return (
    <main
      className="flex-1 overflow-y-auto pb-16 pt-14"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </main>
  );
}
