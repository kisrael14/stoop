'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Home, MessageCircle, X, ChevronRight, Search, Compass } from 'lucide-react';
import { CHATS } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';

const HIDDEN_ON = ['/login', '/onboarding'];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const navItems = [
    { href: '/stoop', label: 'My Stoop', icon: User },
    { href: '/neighborhoods', label: 'Neighbors', icon: Home },
    { href: '/discover', label: 'Discover', icon: Compass },
  ];

  return (
    <>
      {/* Quick-chat drawer backdrop */}
      {chatDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
          onClick={() => setChatDrawerOpen(false)}
        />
      )}

      {/* Quick-chat slide-up drawer */}
      {chatDrawerOpen && (
        <div className="fixed bottom-16 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-2xl border border-rule bg-paper shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
            <div>
              <p className="font-display font-bold text-ink text-lg">Jump to a Chat</p>
              <p className="text-xs text-ink-faint mt-0.5">Select a neighborhood to open its chat</p>
            </div>
            <button onClick={() => setChatDrawerOpen(false)} className="text-ink-faint hover:text-ink">
              <X size={20} />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {CHATS.map((chat) => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setChatDrawerOpen(false);
                    router.push(`/neighborhoods/${chat.id}?tab=chat`);
                  }}
                  className="flex w-full items-center gap-4 px-5 py-3.5 hover:bg-paper-dark transition-colors border-b border-rule/40 last:border-0"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-dark text-xl shrink-0 border border-rule">
                    {chat.emoji}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-ink truncate">{chat.name}</p>
                    {lastMsg && (
                      <p className="text-xs text-ink-muted truncate">{lastMsg.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lastMsg && (
                      <span className="text-xs text-ink-faint">{timeAgo(lastMsg.timestamp)}</span>
                    )}
                    <ChevronRight size={16} className="text-ink-faint" />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-rule">
            <Link
              href="/neighborhoods"
              onClick={() => setChatDrawerOpen(false)}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-masthead hover:text-masthead/80"
            >
              <Search size={14} />
              Browse all neighborhoods
            </Link>
          </div>
        </div>
      )}

      {/* Bottom nav bar — newspaper footer style */}
      <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t-2 border-rule bg-paper/97 backdrop-blur-sm z-30">
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

          {/* Chats quick-access button */}
          <button
            onClick={() => setChatDrawerOpen((o) => !o)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
              chatDrawerOpen ? 'text-masthead' : 'text-ink-faint hover:text-ink-muted'
            }`}
          >
            <div className="relative">
              <MessageCircle size={20} strokeWidth={chatDrawerOpen ? 2.5 : 1.8} />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-masthead text-[7px] font-bold text-paper">
                3
              </span>
            </div>
            Chats
          </button>
        </div>
      </nav>
    </>
  );
}
