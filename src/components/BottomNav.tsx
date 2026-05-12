'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MessageCircle, Swords, Handshake, Flame } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/stoop', label: 'My Stoop', icon: User },
  { href: '/chats', label: 'Chats', icon: MessageCircle },
  { href: '/debates', label: 'Debates', icon: Swords },
  { href: '/bets', label: 'Bets', icon: Handshake },
  { href: '/hot-takes', label: 'Hot Takes', icon: Flame },
];

const HIDDEN_ON = ['/onboarding'];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                active
                  ? label === 'Hot Takes'
                    ? 'text-orange-400'
                    : label === 'Debates'
                    ? 'text-blue-400'
                    : label === 'Bets'
                    ? 'text-green-400'
                    : 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon
                size={20}
                className={
                  active && label === 'Hot Takes'
                    ? 'text-orange-400'
                    : active && label === 'Debates'
                    ? 'text-blue-400'
                    : active && label === 'Bets'
                    ? 'text-green-400'
                    : ''
                }
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
