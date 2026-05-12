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
    { href: '/neighborhoods', label: 'Neighborhoods', icon: Home },
    { href: '/discover', label: 'Discover', icon: Compass },
  ];

  return (
    <>
      {/* Quick-chat drawer backdrop */}
      {chatDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setChatDrawerOpen(false)}
        />
      )}

      {/* Quick-chat slide-up drawer */}
      {chatDrawerOpen && (
        <div className="fixed bottom-16 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-2xl border border-slate-800 bg-slate-950 shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div>
              <p className="font-bold text-white">Jump to a Chat</p>
              <p className="text-xs text-slate-500 mt-0.5">Select a neighborhood to open its chat</p>
            </div>
            <button onClick={() => setChatDrawerOpen(false)} className="text-slate-500 hover:text-white">
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
                  className="flex w-full items-center gap-4 px-5 py-3.5 hover:bg-slate-900 transition-colors border-b border-slate-800/50 last:border-0"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-xl shrink-0">
                    {chat.emoji}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-white truncate">{chat.name}</p>
                    {lastMsg && (
                      <p className="text-xs text-slate-500 truncate">{lastMsg.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lastMsg && (
                      <span className="text-xs text-slate-600">{timeAgo(lastMsg.timestamp)}</span>
                    )}
                    <ChevronRight size={16} className="text-slate-600" />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-slate-800">
            <Link
              href="/neighborhoods"
              onClick={() => setChatDrawerOpen(false)}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300"
            >
              <Search size={14} />
              Browse all neighborhoods
            </Link>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm z-30">
        <div className="flex items-stretch">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
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
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              chatDrawerOpen ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="relative">
              <MessageCircle size={20} strokeWidth={chatDrawerOpen ? 2.5 : 1.8} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-orange-500 text-[7px] font-bold text-white">
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
