'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { ME, getUserById, USERS } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';

export default function NeighborsPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const isRealUser = !!authUser?.profile;

  type Person = { id: string; displayName: string; username: string; avatar: string };

  const neighbors: Person[] = isRealUser && authUser?.followingProfiles != null
    ? authUser.followingProfiles.map((fp) => ({
        id: fp.id,
        displayName: fp.display_name,
        username: fp.username,
        avatar: fp.avatar,
      }))
    : ME.followingIds
        .map((id) => getUserById(id))
        .filter((u): u is NonNullable<ReturnType<typeof getUserById>> => u != null)
        .map((u) => ({ id: u.id, displayName: u.displayName, username: u.username, avatar: u.avatar }));

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-nav-bg border-b border-rule flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-ink/60 hover:text-ink transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-ink text-base">Neighbors</h1>
          <p className="text-[10px] text-ink-faint">{neighbors.length} people you follow</p>
        </div>
        <Link
          href="/discover"
          className="flex items-center gap-1.5 bg-masthead text-[#12111a] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide hover:bg-masthead/80 transition-colors"
        >
          <UserPlus size={12} />
          Find
        </Link>
      </div>

      {neighbors.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 px-8 py-16 text-center">
          <p className="text-4xl mb-3">🏘</p>
          <p className="font-bold text-ink mb-1">No neighbors yet</p>
          <p className="text-sm text-ink-muted mb-4">Follow people to build your neighborhood</p>
          <Link
            href="/discover"
            className="bg-masthead text-[#12111a] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-masthead/80 transition-colors"
          >
            Find Neighbors
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-rule/60">
          {neighbors.map((person) => {
            const full = getUserById(person.id);
            const mutualCount = full
              ? USERS.filter((u) => u.id !== 'me' && u.followingIds?.includes(person.id) && ME.followingIds.includes(u.id)).length
              : 0;
            return (
              <Link
                key={person.id}
                href={`/users/${person.id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-paper-dark transition-colors"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-dark border border-rule text-2xl shrink-0">
                  {person.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-sm">{person.displayName}</p>
                  <p className="text-[11px] text-ink-faint font-mono">@{person.username}</p>
                  {mutualCount > 0 && (
                    <p className="text-[10px] text-ink-muted mt-0.5">{mutualCount} mutual neighbor{mutualCount !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
