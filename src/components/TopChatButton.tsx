'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, X, ChevronRight } from 'lucide-react';
import { CHATS } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';

const HIDDEN_ON = ['/login', '/onboarding'];

export default function TopChatButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const totalChats = CHATS.length;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-nav-bg/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating trigger — fixed in top-right of app frame */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 pointer-events-none h-0">
        <button
          onClick={() => setOpen((o) => !o)}
          className="absolute top-3 right-4 pointer-events-auto flex items-center justify-center h-9 w-9 rounded-full bg-nav-bg text-ink shadow-lg hover:bg-paper-dark active:scale-95 transition-all btn-3d"
          aria-label="Open chats"
        >
          <MessageCircle size={17} />
          {/* Unread badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-masthead text-[8px] font-bold text-[#12111a]">
            {totalChats}
          </span>
        </button>

        {/* Drawer */}
        {open && (
          <div className="absolute top-14 right-4 pointer-events-auto w-72 bg-paper-dark border border-rule rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-nav-bg">
              <p className="font-display font-bold text-ink text-sm">Your Chats</p>
              <button onClick={() => setOpen(false)} className="text-ink/60 hover:text-ink">
                <X size={16} />
              </button>
            </div>

            {/* Chat list */}
            <div className="max-h-72 overflow-y-auto">
              {CHATS.map((chat, i) => {
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setOpen(false);
                      router.push(`/neighborhoods/${chat.id}?tab=chat`);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-paper-dark transition-colors text-left border-b border-rule/50 last:border-0`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nav-bg text-lg shrink-0">
                      {chat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink text-sm truncate">{chat.name}</p>
                      {lastMsg && (
                        <p className="text-[11px] text-ink-muted truncate">{lastMsg.content}</p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {lastMsg && (
                        <span className="text-[10px] text-ink-faint font-mono">{timeAgo(lastMsg.timestamp)}</span>
                      )}
                      <ChevronRight size={13} className="text-ink-faint" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-rule px-4 py-2.5 bg-paper-dark">
              <button
                onClick={() => { setOpen(false); router.push('/neighborhoods'); }}
                className="w-full text-center text-[11px] font-bold uppercase tracking-widest text-masthead hover:underline"
              >
                All Neighborhoods →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
