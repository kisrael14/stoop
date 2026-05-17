'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from './supabase/client';
import type { Database } from './supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserTeam = Database['public']['Tables']['user_teams']['Row'];

interface AuthUser {
  id: string;
  email: string | null;
  profile: Profile | null;
  teams: UserTeam[];
  followerCount: number;
  followingCount: number;
  leagues: string[];
  followingProfiles: Array<{ id: string; username: string; display_name: string; avatar: string }>;
  neighborhoodMemberships: Array<{ id: string; name: string; emoji: string; photo_url?: string | null }>;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  const loadProfile = async (authUser: User) => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const [{ data: profile }, { data: teams }, { count: followerCount }, { data: followingData }, { data: memberRows }, { data: leagueData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', authUser.id).single(),
      supabase.from('user_teams').select('*').eq('user_id', authUser.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', authUser.id),
      supabase.from('follows').select('following_id').eq('follower_id', authUser.id),
      sb.from('neighborhood_members').select('neighborhood_id').eq('user_id', authUser.id),
      sb.from('user_leagues').select('league_id').eq('user_id', authUser.id),
    ]);

    const followingIds = ((followingData ?? []) as Array<{ following_id: string }>).map((f) => f.following_id);

    let followingProfiles: Array<{ id: string; username: string; display_name: string; avatar: string }> = [];
    if (followingIds.length > 0) {
      const { data: fp } = await supabase.from('profiles').select('id, username, display_name, avatar').in('id', followingIds);
      followingProfiles = (fp ?? []) as typeof followingProfiles;
    }

    // Two-step: get hood IDs, then fetch neighborhood details
    const hoodIds = ((memberRows ?? []) as Array<{ neighborhood_id: string }>).map((m) => m.neighborhood_id);
    let neighborhoodMemberships: Array<{ id: string; name: string; emoji: string; photo_url?: string | null }> = [];
    if (hoodIds.length > 0) {
      const { data: hoodsData } = await supabase.from('neighborhoods').select('id, name, emoji, photo_url').in('id', hoodIds);
      neighborhoodMemberships = (hoodsData ?? []) as typeof neighborhoodMemberships;
    }

    const leagues = ((leagueData ?? []) as Array<{ league_id: string }>).map((l) => l.league_id);

    setUser({
      id: authUser.id,
      email: authUser.email ?? null,
      profile: profile ?? null,
      teams: teams ?? [],
      followerCount: followerCount ?? 0,
      followingCount: followingIds.length,
      leagues,
      followingProfiles,
      neighborhoodMemberships,
    });
  };

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user);
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useCurrentUser() {
  const { user } = useContext(AuthContext);
  return user;
}
