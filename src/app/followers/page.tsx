'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ME, getUserById } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

type Person = { id: string; displayName: string; username: string; avatar: string };

function Avatar({ src, name }: { src: string; name: string }) {
  if (src.startsWith('http')) {
    return <img src={src} alt={name} className="h-full w-full object-cover rounded-full" />;
  }
  return <span>{src || '👤'}</span>;
}

export default function FollowersPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [followers, setFollowers] = useState<Person[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const run = async () => {
        try {
          const { data: followerRows } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('following_id', authUser.id);
          const ids: string[] = (followerRows ?? []).map((f: any) => f.follower_id);
          if (ids.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, display_name, avatar')
              .in('id', ids);
            setFollowers(
              (profiles ?? []).map((p: any) => ({
                id: p.id,
                displayName: p.display_name || p.username || 'Unknown',
                username: p.username || '',
                avatar: p.avatar || '👤',
              }))
            );
          }
        } catch (e) {
          console.error('Followers fetch error:', e);
        } finally {
          setLoaded(true);
        }
      };
      run();
    } else {
      // Mock fallback
      const mock: Person[] = ME.followerIds
        .map((id) => getUserById(id))
        .filter((u): u is NonNullable<ReturnType<typeof getUserById>> => u != null)
        .map((u) => ({ id: u.id, displayName: u.displayName, username: u.username, avatar: u.avatar as string }));
      setFollowers(mock);
      setLoaded(true);
    }
  }, [authUser?.id]);

  return (
    <div className="flex flex-col min-h-full pb-20">
      <div className="sticky top-14 z-30 bg-nav-bg border-b border-rule flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-ink/60 hover:text-ink transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-ink text-base">Following You</h1>
          <p className="text-[10px] text-ink-faint">{followers.length} people follow you</p>
        </div>
      </div>

      {!loaded ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 rounded-full border-2 border-masthead border-t-transparent animate-spin" />
        </div>
      ) : followers.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 px-8 py-16 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-bold text-ink mb-1">No followers yet</p>
          <p className="text-sm text-ink-muted">Share your takes to get noticed</p>
        </div>
      ) : (
        <div className="divide-y divide-rule/60">
          {followers.map((person) => {
            const iFollow = authUser
              ? authUser.followingProfiles?.some((p) => p.id === person.id) ?? false
              : ME.followingIds.includes(person.id);
            return (
              <Link
                key={person.id}
                href={`/users/${person.id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-paper-dark transition-colors"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-dark border border-rule text-2xl shrink-0 overflow-hidden">
                  <Avatar src={person.avatar} name={person.displayName} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-sm">{person.displayName}</p>
                  <p className="text-[11px] text-ink-faint font-mono">@{person.username}</p>
                  {iFollow && (
                    <p className="text-[10px] text-masthead font-bold mt-0.5">You follow them back</p>
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
