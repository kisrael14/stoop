'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ME, getUserById } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import PeopleListModal, { type PersonEntry } from '@/components/PeopleListModal';

export default function FollowersPage() {
  const router = useRouter();
  const { user: authUser, refreshProfile } = useAuth();
  const [people, setPeople] = useState<PersonEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const ids = authUser?.followingProfiles?.map((p) => p.id) ?? ME.followingIds;
    setFollowingIds(new Set(ids));
  }, [authUser?.id, authUser?.followingProfiles?.length]);

  useEffect(() => {
    if (authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const run = async () => {
        try {
          const { data: rows } = await supabase.from('follows').select('follower_id').eq('following_id', authUser.id);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ids: string[] = (rows ?? []).map((r: any) => r.follower_id);
          if (ids.length > 0) {
            const { data: profiles } = await supabase.from('profiles').select('id, username, display_name, avatar').in('id', ids);
            setPeople(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (profiles ?? []).map((p: any) => ({
                id: p.id,
                displayName: p.display_name || p.username || 'Unknown',
                username: p.username || '',
                avatar: p.avatar || null,
              }))
            );
          }
        } finally {
          setLoaded(true);
        }
      };
      run();
    } else {
      setPeople(
        ME.followerIds
          .map((id) => getUserById(id))
          .filter((u): u is NonNullable<ReturnType<typeof getUserById>> => u != null)
          .map((u) => ({ id: u.id, displayName: u.displayName, username: u.username, avatar: u.avatar as string }))
      );
      setLoaded(true);
    }
  }, [authUser?.id]);

  const toggleFollow = async (personId: string) => {
    if (togglingId) return;
    setTogglingId(personId);
    const nowFollowing = !followingIds.has(personId);
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (nowFollowing) next.add(personId); else next.delete(personId);
      return next;
    });
    if (authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      if (nowFollowing) {
        await supabase.from('follows').upsert({ follower_id: authUser.id, following_id: personId });
      } else {
        await supabase.from('follows').delete().eq('follower_id', authUser.id).eq('following_id', personId);
      }
      await refreshProfile();
    }
    setTogglingId(null);
  };

  return (
    <PeopleListModal
      title="Following You"
      count={people.length}
      emptyMessage="No followers yet. Share your takes to get noticed!"
      people={people}
      loading={!loaded}
      onClose={() => router.back()}
      followingIds={followingIds}
      onToggleFollow={toggleFollow}
      togglingId={togglingId}
    />
  );
}
