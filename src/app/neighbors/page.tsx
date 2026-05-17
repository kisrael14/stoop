'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ME, getUserById } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import PeopleListModal, { type PersonEntry } from '@/components/PeopleListModal';

export default function NeighborsPage() {
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
      if (authUser.followingProfiles && authUser.followingProfiles.length > 0) {
        setPeople(
          authUser.followingProfiles.map((fp) => ({
            id: fp.id,
            displayName: fp.display_name || fp.username || 'Unknown',
            username: fp.username || '',
            avatar: fp.avatar || null,
          }))
        );
        setLoaded(true);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = createClient() as any;
        const run = async () => {
          try {
            const { data: rows } = await supabase.from('follows').select('following_id').eq('follower_id', authUser.id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ids: string[] = (rows ?? []).map((r: any) => r.following_id);
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
      }
    } else {
      setPeople(
        ME.followingIds
          .map((id) => getUserById(id))
          .filter((u): u is NonNullable<ReturnType<typeof getUserById>> => u != null)
          .map((u) => ({ id: u.id, displayName: u.displayName, username: u.username, avatar: u.avatar as string }))
      );
      setLoaded(true);
    }
  }, [authUser?.id, authUser?.followingProfiles]);

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
      title="Neighbors"
      count={people.length}
      emptyMessage="No neighbors yet. Start following people!"
      people={people}
      loading={!loaded}
      onClose={() => router.back()}
      followingIds={followingIds}
      onToggleFollow={toggleFollow}
      togglingId={togglingId}
    />
  );
}
