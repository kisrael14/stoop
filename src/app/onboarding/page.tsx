'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronRight, Check, GripVertical, Camera } from 'lucide-react';
import { TEAMS, USERS } from '@/lib/mock-data';
import type { Team, FanTeam, FandomLevel } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

type Step = 1 | 2 | 3;

const AVATAR_EMOJIS = [
  '🏈', '🏀', '⚾', '⚽', '🏒', '🎾', '🏆', '🥊',
  '🦁', '🐺', '🦅', '🐻', '🦊', '🐯', '🦈', '🐉',
  '🔥', '⚡', '💪', '🙌', '🤙', '😎', '🤘', '😤',
  '🌟', '🎯', '💥', '🤖', '👊', '🫡',
];

const FANDOM_LEVELS: { value: FandomLevel; label: string; emoji: string; desc: string }[] = [
  { value: 'casual',       label: 'Casual',      emoji: '😎', desc: 'Highlights & major moments only' },
  { value: 'fair-weather', label: 'Fair Weather', emoji: '📺', desc: 'Regular coverage & discussions' },
  { value: 'supporter',    label: 'Supporter',   emoji: '🔥', desc: 'Deep dives, stats, all the takes' },
  { value: 'diehard',      label: 'Die-Hard',    emoji: '🫡', desc: 'Full immersion — every game, every debate' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { session, refreshProfile } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [avatar, setAvatar] = useState('🤙');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const [username, setUsername] = useState(
    (session?.user?.user_metadata?.username as string | undefined) ?? ''
  );
  const [bio, setBio] = useState('');

  const [teamSearch, setTeamSearch] = useState('');
  const [fanTeams, setFanTeams] = useState<FanTeam[]>([]);
  const [showFandomTutorial, setShowFandomTutorial] = useState(false);
  const [fandomTutorialSeen, setFandomTutorialSeen] = useState(false);

  const [following, setFollowing] = useState<string[]>([]);

  const filteredTeams = TEAMS.filter(
    (t) =>
      !fanTeams.find((ft) => ft.team.id === t.id) &&
      (t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
        t.city.toLowerCase().includes(teamSearch.toLowerCase()) ||
        t.league.toLowerCase().includes(teamSearch.toLowerCase()))
  );

  const addTeam = (team: Team) => {
    const wasEmpty = fanTeams.length === 0;
    setFanTeams((prev) => [...prev, { team, rank: prev.length + 1, fandomLevel: 'casual' as FandomLevel }]);
    if (wasEmpty && !fandomTutorialSeen) {
      setShowFandomTutorial(true);
      setFandomTutorialSeen(true);
    }
    // Intentionally not clearing teamSearch so the dropdown stays open for multi-select
  };

  const removeTeam = (teamId: string) => {
    setFanTeams((prev) =>
      prev
        .filter((ft) => ft.team.id !== teamId)
        .map((ft, i) => ({ ...ft, rank: i + 1 }))
    );
  };

  const setTeamFandomLevel = (teamId: string, level: FandomLevel) => {
    setFanTeams((prev) => prev.map((ft) => ft.team.id === teamId ? { ...ft, fandomLevel: level } : ft));
  };

  const suggestedUsers = USERS.filter((u) => u.id !== 'me').slice(0, 4);

  const toggleFollow = (userId: string) => {
    setFollowing((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    setAvatarPickerOpen(false);
  };

  const canAdvanceStep1 = username.trim().length > 0;
  const canAdvanceStep2 = fanTeams.length > 0;

  const stepLabels = ['Your Info', 'Your Teams', 'Find Neighbors'];

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Masthead */}
      <div className="px-6 pt-12 pb-6 bg-ink">
        <h1 className="font-display text-3xl font-black text-paper mb-1">Stoop Sports</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-paper/50 mb-5">Setup Your Stoop</p>

        <div className="flex items-center gap-3">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center text-xs font-bold transition-colors ${
                  step > s
                    ? 'bg-field text-paper'
                    : step === s
                    ? 'bg-press text-paper'
                    : 'bg-ink-muted/30 text-paper/40'
                }`}
              >
                {step > s ? <Check size={13} /> : s}
              </div>
              {s < 3 && (
                <div className={`h-0.5 w-6 transition-colors ${step > s ? 'bg-field' : 'bg-ink-muted/30'}`} />
              )}
            </div>
          ))}
          <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-paper/60">
            {stepLabels[step - 1]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6">

        {/* ── Step 1: Profile ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-xl font-bold text-ink mb-1">Claim your spot</h2>
              <p className="text-sm text-ink-muted italic">Set up your fan identity</p>
            </div>

            {/* Clickable avatar */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAvatarPickerOpen(true)}
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-paper-dark border-2 border-rule overflow-hidden hover:border-ink transition-colors group"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">{avatar}</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-paper" />
                </div>
              </button>
              <div>
                <p className="text-xs font-bold text-ink mb-1.5">Your Avatar</p>
                <button
                  onClick={() => setAvatarPickerOpen(true)}
                  className="border border-rule px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-muted hover:bg-paper-dark transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted font-bold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                    placeholder="jhayes23"
                    className="w-full border border-rule bg-paper-dark py-3 pl-7 pr-4 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm"
                  />
                </div>
                <p className="mt-1 text-[11px] text-ink-faint italic">This is your name on the Stoop</p>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  Bio <span className="text-ink-faint normal-case">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your neighborhood who you are..."
                  rows={3}
                  maxLength={120}
                  className="w-full border border-rule bg-paper-dark px-4 py-3 text-ink placeholder-ink-faint outline-none focus:border-ink resize-none transition-colors text-sm"
                />
                <p className="mt-1 text-right text-[10px] text-ink-faint font-mono">{bio.length}/120</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Teams ── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-xl font-bold text-ink mb-1">Build your fandom</h2>
              <p className="text-sm text-ink-muted italic">Search teams & set your fandom level for each.</p>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search NFL, NBA, teams..."
                className="w-full border border-rule bg-paper-dark py-3 pl-9 pr-4 text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors text-sm"
              />
            </div>

            {teamSearch && (
              <div className="border border-rule bg-paper overflow-hidden -mt-3">
                {filteredTeams.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-ink-muted italic">No results found</p>
                ) : (
                  filteredTeams.slice(0, 6).map((team) => (
                    <button
                      key={team.id}
                      onClick={() => addTeam(team)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-dark transition-colors border-b border-rule/50 last:border-0"
                    >
                      <span className="text-2xl">{team.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-ink text-sm">{team.city} {team.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{team.league}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-press">+ Add</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {fanTeams.length > 0 && (
              <div className="flex flex-col gap-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">
                  Your teams
                </p>
                {fanTeams.map((ft, index) => (
                  <div
                    key={ft.team.id}
                    className="border-b border-rule/50 bg-paper last:border-0"
                    style={{ borderLeftWidth: '3px', borderLeftColor: ft.team.color, borderLeftStyle: 'solid' }}
                  >
                    <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                      <GripVertical size={15} className="text-ink-faint cursor-grab shrink-0" />
                      <span
                        className="flex h-6 w-6 items-center justify-center text-xs font-bold text-paper shrink-0"
                        style={{ backgroundColor: ft.team.color }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-xl">{ft.team.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-ink text-sm truncate">{ft.team.city} {ft.team.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{ft.team.league}</p>
                      </div>
                      <button onClick={() => removeTeam(ft.team.id)} className="text-ink-faint hover:text-masthead transition-colors shrink-0">
                        <X size={15} />
                      </button>
                    </div>
                    {/* Fandom level selector */}
                    <div className="flex gap-1 px-4 pb-3">
                      {FANDOM_LEVELS.map((fl) => (
                        <button
                          key={fl.value}
                          onClick={() => setTeamFandomLevel(ft.team.id, fl.value)}
                          className={`flex-1 py-1.5 text-[8px] font-bold uppercase tracking-wide transition-colors border leading-tight ${
                            ft.fandomLevel === fl.value
                              ? 'bg-ink text-paper border-ink'
                              : 'bg-paper text-ink-muted border-rule hover:bg-paper-dark'
                          }`}
                        >
                          {fl.emoji}<br />{fl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fanTeams.length === 0 && !teamSearch && (
              <div className="border-2 border-dashed border-rule px-6 py-10 text-center">
                <p className="font-display text-3xl mb-2 text-ink-faint">🏆</p>
                <p className="font-display font-bold text-ink">Search for your first team</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Neighbors ── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-xl font-bold text-ink mb-1">Find your neighbors</h2>
              <p className="text-sm text-ink-muted italic">Follow fans to build your stoop. Do this anytime.</p>
            </div>

            <div className="flex flex-col gap-0">
              {suggestedUsers.map((user, i) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 px-4 py-3.5 bg-paper hover:bg-paper-dark transition-colors border-b border-rule/50 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dark border border-rule text-2xl shrink-0">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink">{user.displayName}</p>
                    <p className="text-[11px] text-ink-faint font-mono">@{user.username}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {user.fanTeams.slice(0, 2).map((ft) => (
                        <span
                          key={ft.team.id}
                          className="px-2 py-0.5 text-[10px] font-bold text-paper uppercase tracking-wide"
                          style={{ backgroundColor: ft.team.color + '80' }}
                        >
                          {ft.team.emoji} {ft.team.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                      following.includes(user.id)
                        ? 'border border-rule bg-paper-dark text-ink-muted'
                        : 'bg-ink text-paper hover:bg-ink/80'
                    }`}
                  >
                    {following.includes(user.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="sticky bottom-0 border-t-2 border-rule bg-paper px-6 py-4">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as Step)}
              className="border border-rule px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-muted hover:bg-paper-dark transition-colors"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((prev) => (prev + 1) as Step)}
              disabled={step === 1 ? !canAdvanceStep1 : !canAdvanceStep2}
              className="flex flex-1 items-center justify-center gap-2 bg-ink py-3 text-xs font-bold text-paper uppercase tracking-widest hover:bg-ink/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={async () => {
                if (!session?.user) { router.push('/stoop'); return; }
                setSaving(true); setSaveError('');
                const userId = session.user.id;

                let savedAvatar = avatar;
                if (avatarFile) {
                  const ext = avatarFile.name.split('.').pop() ?? 'jpg';
                  const path = `${userId}/avatar.${ext}`;
                  const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
                  if (!uploadErr) {
                    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
                    savedAvatar = urlData.publicUrl;
                  }
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: profileErr } = await (supabase.from('profiles') as any).upsert({
                  id: userId,
                  username: username.trim().toLowerCase(),
                  display_name: username.trim(),
                  bio: bio.trim() || null,
                  avatar: savedAvatar,
                });
                if (profileErr) { setSaving(false); setSaveError((profileErr as { message: string }).message); return; }
                if (fanTeams.length > 0) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await (supabase.from('user_teams') as any).upsert(
                    fanTeams.map((ft) => ({ user_id: userId, team_id: ft.team.id, fandom_level: ft.fandomLevel }))
                  );
                }
                await refreshProfile();
                setSaving(false);
                router.push('/stoop');
              }}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 bg-ink py-3 text-xs font-bold text-paper uppercase tracking-widest hover:bg-ink/80 disabled:opacity-60 transition-colors"
            >
              {saving ? '…' : 'Enter the Stoop 🏟️'}
            </button>
          )}
        </div>

        {step === 3 && (
          <>
            {saveError && <p className="text-xs text-masthead text-center mt-2">{saveError}</p>}
            <button
              onClick={() => router.push('/stoop')}
              className="mt-3 w-full text-center text-xs text-ink-faint hover:text-ink-muted italic"
            >
              Skip for now
            </button>
          </>
        )}
      </div>

      {/* ── Avatar Picker Modal ── */}
      {avatarPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-ink/60"
          onClick={() => setAvatarPickerOpen(false)}
        >
          <div
            className="w-full bg-paper rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink">Choose Your Avatar</h3>
              <button onClick={() => setAvatarPickerOpen(false)} className="text-ink-faint hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-3 border-2 border-dashed border-rule px-4 py-3 mb-5 hover:bg-paper-dark transition-colors"
            >
              <Camera size={18} className="text-ink-muted" />
              <span className="text-sm font-bold text-ink-muted uppercase tracking-wider">Upload Photo</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3">Or pick an emoji</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => { setAvatar(e); setAvatarUrl(null); setAvatarFile(null); setAvatarPickerOpen(false); }}
                  className={`flex h-12 items-center justify-center text-2xl rounded-lg transition-colors ${
                    avatar === e && !avatarUrl ? 'bg-ink/10 ring-2 ring-ink' : 'hover:bg-paper-dark'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Fandom Tutorial Modal ── */}
      {showFandomTutorial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-6"
          onClick={() => setShowFandomTutorial(false)}
        >
          <div
            className="w-full max-w-sm bg-paper rounded-xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-display font-black text-lg text-ink leading-tight">Fandom Levels</h3>
                <p className="text-[11px] text-ink-muted">Drive your Stoop content</p>
              </div>
            </div>

            <p className="text-sm text-ink-muted mb-4 leading-relaxed">
              Your fandom level for each team controls <span className="font-bold text-ink">how much content</span> you see about that team on your Stoop — from light highlights to full immersion.
            </p>

            <div className="flex flex-col gap-2 mb-5">
              {FANDOM_LEVELS.map((fl) => (
                <div key={fl.value} className="flex items-start gap-3 border border-rule/50 px-3 py-2.5 rounded">
                  <span className="text-xl leading-tight mt-0.5">{fl.emoji}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink">{fl.label}</p>
                    <p className="text-[11px] text-ink-muted leading-snug">{fl.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-ink-faint mb-4 italic text-center">
              You can change this anytime from your profile.
            </p>

            <button
              onClick={() => setShowFandomTutorial(false)}
              className="w-full bg-ink text-paper py-3 text-xs font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors rounded"
            >
              Got It — Let&apos;s Build My Stoop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
