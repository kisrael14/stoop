'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Home, Newspaper } from 'lucide-react';

const HIDDEN_ON = ['/login', '/onboarding'];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const navItems = [
    { href: '/stoop', label: 'My Stoop', icon: User },
    { href: '/streets', label: 'The Streets', icon: Newspaper },
    { href: '/neighborhoods', label: 'Neighborhoods', icon: Home },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-rule bg-nav-bg z-30">
      <div className="flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                active ? 'text-masthead' : 'text-ink-faint hover:text-ink-muted'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
