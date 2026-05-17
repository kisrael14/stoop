'use client';

import { Check, Plus, X, UserPlus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type PersonEntry = {
  id: string;
  displayName: string;
  username: string;
  avatar: string | null;
};

type Props = {
  title: string;
  count?: number;
  emptyMessage?: string;
  people: PersonEntry[];
  loading?: boolean;
  onClose: () => void;
  followingIds: Set<string>;
  onToggleFollow?: (id: string) => void;
  togglingId?: string | null;
  findHref?: string;
};

export default function PeopleListModal({
  title, count, emptyMessage, people, loading, onClose,
  followingIds, onToggleFollow, togglingId, findHref,
}: Props) {
  const router = useRouter();

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-paper rounded-t-2xl shadow-2xl flex flex-col" style={{ maxHeight: '80vh' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-rule shrink-0 rounded-t-2xl bg-nav-bg">
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-white text-base uppercase tracking-widest leading-none">
              {title}
            </h2>
            {count !== undefined && (
              <p className="text-[10px] text-white/50 mt-0.5">{count} {count === 1 ? 'person' : 'people'}</p>
            )}
          </div>
          {findHref && (
            <button
              onClick={() => navigateTo(findHref)}
              className="flex items-center gap-1.5 bg-masthead text-[#12111a] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0"
            >
              <UserPlus size={12} />
              Find
            </button>
          )}
          <button onClick={onClose} className="text-white/50 hover:text-white shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 rounded-full border-2 border-masthead border-t-transparent animate-spin" />
            </div>
          ) : people.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="font-bold text-ink text-sm">{emptyMessage ?? 'No one here yet'}</p>
            </div>
          ) : (
            <div className="divide-y divide-rule/50 pb-6">
              {people.map((person) => {
                const iFollow = followingIds.has(person.id);
                const isToggling = togglingId === person.id;
                return (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-paper-dark transition-colors"
                  >
                    <button
                      onClick={() => navigateTo(`/users/${person.id}`)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-nav-bg border border-rule text-2xl shrink-0 overflow-hidden"
                    >
                      {person.avatar && person.avatar.startsWith('http')
                        ? <img src={person.avatar} alt={person.displayName} className="w-full h-full object-cover" />
                        : <span>{person.avatar || '👤'}</span>}
                    </button>
                    <button
                      onClick={() => navigateTo(`/users/${person.id}`)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="font-bold text-ink text-sm truncate">{person.displayName}</p>
                      <p className="text-[11px] text-ink-faint font-mono">@{person.username}</p>
                    </button>
                    {onToggleFollow && (
                      <button
                        onClick={() => onToggleFollow(person.id)}
                        disabled={isToggling}
                        className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-full border-2 font-bold transition-all disabled:opacity-50 ${
                          iFollow
                            ? 'bg-masthead/20 border-masthead text-masthead'
                            : 'bg-paper-dark border-rule text-ink-faint hover:border-masthead hover:text-masthead'
                        }`}
                        title={iFollow ? 'Unfollow' : 'Follow'}
                      >
                        {iFollow ? <Check size={15} /> : <Plus size={15} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
