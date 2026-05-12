'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Flame,
  Swords,
  Handshake,
  Send,
  Smile,
  Sparkles,
  Image as ImageIcon,
  Users,
  X,
} from 'lucide-react';
import { getChatById, getUserById, ME } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';
import type { Message, MessageTag } from '@/lib/types';

const EMOJI_REACTIONS = ['🔥', '💯', '😂', '🧢', '👀', '😭', '🤬', '❤️'];

export default function ChatRoomPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const router = useRouter();
  const chat = getChatById(chatId);

  const [messages, setMessages] = useState<Message[]>(chat?.messages ?? []);
  const [inputText, setInputText] = useState('');
  const [pendingTag, setPendingTag] = useState<MessageTag | null>(null);
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Chat not found
      </div>
    );
  }

  const members = chat.memberIds.map((id) => getUserById(id)).filter(Boolean);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const msg: Message = {
      id: `new-${Date.now()}`,
      chatId: chat.id,
      userId: 'me',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      tag: pendingTag ?? undefined,
      reactions: [],
    };
    setMessages((prev) => [...prev, msg]);
    setInputText('');
    setPendingTag(null);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: existing.userIds.includes('me')
              ? m.reactions
                  .map((r) =>
                    r.emoji === emoji
                      ? { ...r, userIds: r.userIds.filter((id) => id !== 'me') }
                      : r
                  )
                  .filter((r) => r.userIds.length > 0)
              : m.reactions.map((r) =>
                  r.emoji === emoji ? { ...r, userIds: [...r.userIds, 'me'] } : r
                ),
          };
        }
        return { ...m, reactions: [...m.reactions, { emoji, userIds: ['me'] }] };
      })
    );
    setShowReactionsFor(null);
  };

  const sendAIMessage = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    const question = aiQuery.trim();
    setAiQuery('');

    setTimeout(() => {
      const aiResponses: Record<string, string> = {
        default:
          '📊 Based on current stats and historical trends, that\'s a great question. The data suggests the answer depends on several key factors including recent performance, injury reports, and head-to-head records. Want me to dig deeper into any specific aspect?',
      };

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        chatId: chat.id,
        userId: 'ai',
        content: `**Q: ${question}**\n\n${aiResponses.default}`,
        timestamp: new Date().toISOString(),
        reactions: [],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setAiLoading(false);
      setShowAI(false);
    }, 1200);
  };

  const tagConfig = {
    'hot-take': { label: 'Hot Take', emoji: '🔥', color: 'bg-orange-500', border: 'border-orange-500/40', bg: 'bg-orange-950/30' },
    debate: { label: 'Debate', emoji: '⚔️', color: 'bg-blue-500', border: 'border-blue-500/40', bg: 'bg-blue-950/30' },
    bet: { label: 'Bet', emoji: '🤝', color: 'bg-green-500', border: 'border-green-500/40', bg: 'bg-green-950/30' },
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white p-1">
          <ArrowLeft size={22} />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xl">
          {chat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{chat.name}</p>
          <p className="text-xs text-slate-400">{members.length} members</p>
        </div>
        <button className="text-slate-400 hover:text-white p-1">
          <Users size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const sender = msg.userId === 'ai' ? null : getUserById(msg.userId);
          const isMe = msg.userId === 'me';
          const isAI = msg.userId === 'ai';
          const tag = msg.tag ? tagConfig[msg.tag] : null;

          return (
            <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              {!isMe && (
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm mt-1">
                  {isAI ? '✦' : sender?.avatar}
                </div>
              )}

              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Sender name */}
                {!isMe && (
                  <p className="mb-1 text-xs font-medium text-slate-400 px-1">
                    {isAI ? 'Ask AI ✦' : sender?.displayName}
                  </p>
                )}

                {/* Tag badge */}
                {tag && (
                  <div
                    className={`mb-1 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white self-start ${tag.color}`}
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed cursor-pointer ${
                    isAI
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : isMe
                      ? 'bg-orange-500 text-white rounded-tr-sm'
                      : tag
                      ? `border text-slate-100 rounded-tl-sm ${tag.border} ${tag.bg}`
                      : 'bg-slate-800 text-slate-100 rounded-tl-sm'
                  }`}
                  onDoubleClick={() =>
                    setShowReactionsFor(showReactionsFor === msg.id ? null : msg.id)
                  }
                >
                  {isAI ? (
                    <div>
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i} className={i === 0 ? 'font-semibold text-slate-300 mb-1' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Reaction picker */}
                {showReactionsFor === msg.id && (
                  <div className="mt-1 flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1.5 border border-slate-700 shadow-xl">
                    {EMOJI_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(msg.id, emoji)}
                        className="text-lg hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Reactions display */}
                {msg.reactions.length > 0 && (
                  <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? 'justify-end' : ''}`}>
                    {msg.reactions
                      .filter((r) => r.userIds.length > 0)
                      .map((r) => (
                        <button
                          key={r.emoji}
                          onClick={() => addReaction(msg.id, r.emoji)}
                          className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs border transition-colors ${
                            r.userIds.includes('me')
                              ? 'border-orange-500/50 bg-orange-900/30 text-orange-300'
                              : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {r.emoji} {r.userIds.length}
                        </button>
                      ))}
                  </div>
                )}

                {/* Timestamp */}
                <p className="mt-0.5 text-[10px] text-slate-600 px-1">{timeAgo(msg.timestamp)}</p>
              </div>
            </div>
          );
        })}

        {aiLoading && (
          <div className="flex gap-2.5 items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm">
              ✦
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-2.5">
              <div className="flex gap-1.5 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Ask AI panel */}
      {showAI && (
        <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Ask AI — Sports Only</span>
            <button onClick={() => setShowAI(false)} className="ml-auto text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
              placeholder="Who has the most playoff wins since 2010?"
              autoFocus
              className="flex-1 rounded-xl bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none border border-slate-700 focus:border-purple-500 transition-colors"
            />
            <button
              onClick={sendAIMessage}
              disabled={!aiQuery.trim()}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40 transition-colors"
            >
              Ask
            </button>
          </div>
        </div>
      )}

      {/* Tag selector */}
      {pendingTag && (
        <div className="flex-shrink-0 px-4 py-2 flex items-center gap-2 bg-slate-900 border-t border-slate-800">
          <span className="text-xs text-slate-400">Tagging as:</span>
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white ${tagConfig[pendingTag].color}`}
          >
            {tagConfig[pendingTag].emoji} {tagConfig[pendingTag].label}
          </div>
          <button
            onClick={() => setPendingTag(null)}
            className="ml-auto text-slate-500 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-slate-800 bg-slate-950 px-3 py-3">
        {/* Tag buttons */}
        <div className="flex items-center gap-2 mb-2.5">
          {(['hot-take', 'debate', 'bet'] as MessageTag[]).map((tag) => {
            const cfg = tagConfig[tag];
            const isActive = pendingTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setPendingTag(isActive ? null : tag)}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors ${
                  isActive
                    ? `${cfg.color} text-white border-transparent`
                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { setShowAI(true); setShowReactionsFor(null); }}
              className="flex items-center gap-1 rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-purple-400 hover:border-purple-600 hover:text-purple-300 transition-colors"
            >
              <Sparkles size={11} />
              Ask AI
            </button>
          </div>
        </div>

        {/* Message input */}
        <div className="flex items-center gap-2">
          <button className="text-slate-500 hover:text-white p-1">
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={
              pendingTag
                ? `Drop your ${tagConfig[pendingTag].label.toLowerCase()}...`
                : 'Message...'
            }
            className="flex-1 rounded-full bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none border border-slate-700 focus:border-slate-600 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
