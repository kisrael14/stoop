'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Home, MessageCircle, Swords, Handshake, Flame, Snowflake,
  Send, Sparkles, X, Trophy, Users, Pencil, Check, Plus, Search,
  AlertCircle, CheckCircle, Clock, Megaphone, MessageSquare, ChevronDown, ChevronUp, PenLine,
  Paperclip, Link2, Images,
} from 'lucide-react';
import BetSetupModal, { type BetSetupResult } from '@/components/BetSetupModal';
import DebateSetupModal, { type DebateSetupResult } from '@/components/DebateSetupModal';
import {
  getChatById, getUserById, ME, DEBATES, BETS, HOT_TAKES, TEAMS, ANALYSES, USERS,
} from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { markHoodSeen } from '@/components/PersistentSidebar';
import NeighborhoodFormModal from '@/components/NeighborhoodFormModal';
import MediaTab from '@/components/MediaTab';
import { timeAgo, voteLeader, totalReactions, teamDisplayName } from '@/lib/utils';
import type { Message, MessageTag, Debate, Bet, HotTake, HotTakeComment, VoteChoice, Analysis } from '@/lib/types';
import { sendNotification } from '@/lib/notifications';
import TeamLogo from '@/components/TeamLogo';
import { detectTeamIds } from '@/lib/players-data';
import { ALL_TEAMS } from '@/lib/teams-data';

type Tab = 'overview' | 'chat' | 'debates' | 'bets' | 'hot-takes' | 'analysis' | 'media';
const EMOJI_REACTIONS = ['🔥', '💯', '😂', '🧢', '👀', '😭', '🤬', '❤️'];
const HOT_TAKE_MAX = 280;

export default function NeighborhoodPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chat = getChatById(id);

  const initialTab = (searchParams.get('tab') as Tab) || 'overview';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const [messages, setMessages] = useState<Message[]>(chat?.messages ?? []);
  const [inputText, setInputText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [pendingTag, setPendingTag] = useState<MessageTag | null>(null);
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const [tagPickerFor, setTagPickerFor] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [betSetupClaim, setBetSetupClaim] = useState<string | null>(null);
  const [betSetupMessageId, setBetSetupMessageId] = useState<string | null>(null);
  const [debateSetupClaim, setDebateSetupClaim] = useState<string | null>(null);
  const [debateSetupMessageId, setDebateSetupMessageId] = useState<string | null>(null);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [lastSeenChat, setLastSeenChat] = useState<string>(new Date(0).toISOString());
  const [expandedAvatar, setExpandedAvatar] = useState<string | null>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [pendingMediaUrl, setPendingMediaUrl] = useState<string | null>(null);
  const [pendingMediaType, setPendingMediaType] = useState<'photo' | 'link' | null>(null);
  const [pendingMediaFile, setPendingMediaFile] = useState<File | null>(null);
  const [pendingLinkUrl, setPendingLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [debates, setDebates] = useState<Debate[]>(
    DEBATES.filter((d) => d.chatId === id)
  );
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);

  const [bets, setBets] = useState<Bet[]>(
    BETS.filter((b) => b.chatId === id)
  );
  const [expandedBet, setExpandedBet] = useState<string | null>(null);

  const [hotTakes, setHotTakes] = useState<HotTake[]>(
    HOT_TAKES.filter((h) => h.chatId === id)
  );
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const commentInputRef = useRef<HTMLInputElement>(null);

  const [analyses, setAnalyses] = useState<Analysis[]>(
    ANALYSES.filter((a) => a.chatId === id)
  );
  const [showAnalystCommentsFor, setShowAnalystCommentsFor] = useState<string | null>(null);
  const [analystCommentText, setAnalystCommentText] = useState('');
  const [analystMentionQuery, setAnalystMentionQuery] = useState('');
  const analystCommentInputRef = useRef<HTMLInputElement>(null);
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisBody, setAnalysisBody] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [chatName, setChatName] = useState(chat?.name ?? '');
  const [chatEmoji, setChatEmoji] = useState(chat?.emoji ?? '');
  const [localMemberIds, setLocalMemberIds] = useState<string[]>(chat?.memberIds ?? []);

  // ── Supabase / real neighborhood support ─────────────────
  const { user: authUser } = useAuth();
  const isRealId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  type DbProfile = { id: string; username: string; display_name: string; avatar: string };
  const [chatPhoto, setChatPhoto] = useState<string | null>(null);
  const [chatDescription, setChatDescription] = useState<string | null>(null);
  const [dbNeighborhood, setDbNeighborhood] = useState<{ id: string; name: string; emoji: string; photo_url?: string | null } | null>(null);
  const [dbMemberProfiles, setDbMemberProfiles] = useState<DbProfile[]>([]);
  const [dbMemberTeams, setDbMemberTeams] = useState<{ teamId: string; count: number }[]>([]);
  const [nicknameMap, setNicknameMap] = useState<Record<string, string>>({});
  const [dbLoading, setDbLoading] = useState(isRealId);

  // Mark this neighborhood as read immediately on entry
  useEffect(() => {
    if (isRealId) markHoodSeen(id);
  }, [id, isRealId]);

  useEffect(() => {
    if (!isRealId || !isSupabaseConfigured()) { setDbLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    const load = async () => {
      try {
        // Try with photo_url; fall back without it if the column doesn't exist yet
        let hood: { id: string; name: string; emoji: string; photo_url?: string | null; description?: string | null } | null = null;
        const { data: hoodFull, error: hoodFullErr } = await supabase.from('neighborhoods').select('id, name, emoji, photo_url, description').eq('id', id).single();
        if (!hoodFullErr) {
          hood = hoodFull;
        } else {
          // Fall back without optional columns
          const { data: hoodBasic, error: hoodBasicErr } = await supabase.from('neighborhoods').select('id, name, emoji').eq('id', id).single();
          if (hoodBasicErr || !hoodBasic) { console.error('Neighborhood fetch error:', hoodBasicErr); return; }
          hood = hoodBasic;
        }
        if (!hood) return;
        setDbNeighborhood(hood);
        setChatName(hood.name);
        setChatEmoji(hood.emoji);
        if (hood.photo_url) setChatPhoto(hood.photo_url);
        if (hood.description) setChatDescription(hood.description);
        const hoodName = hood.name;

        // Members — try with nickname, fall back without if column doesn't exist
        const { data: memberRowsWithNick, error: nickErr } = await supabase
          .from('neighborhood_members').select('user_id, nickname').eq('neighborhood_id', id);
        let memberRows: Array<{ user_id: string; nickname?: string | null }>;
        if (!nickErr) {
          memberRows = memberRowsWithNick ?? [];
        } else {
          const { data: memberRowsBasic } = await supabase
            .from('neighborhood_members').select('user_id').eq('neighborhood_id', id);
          memberRows = (memberRowsBasic ?? []).map((m: any) => ({ user_id: m.user_id, nickname: null }));
        }
        const userIds: string[] = memberRows.map((m) => m.user_id);
        const nicks: Record<string, string> = {};
        memberRows.forEach((m) => { if (m.nickname) nicks[m.user_id] = m.nickname; });
        setNicknameMap(nicks);
        let profiles: DbProfile[] = [];
        if (userIds.length > 0) {
          const { data: profileData } = await supabase
            .from('profiles').select('id, username, display_name, avatar').in('id', userIds);
          profiles = profileData ?? [];
        }
        setDbMemberProfiles(profiles);
        setLocalMemberIds(userIds);

        // Fetch teams followed by members
        if (userIds.length > 0) {
          const { data: teamRows } = await supabase
            .from('user_teams')
            .select('team_id')
            .in('user_id', userIds);
          const counts: Record<string, number> = {};
          (teamRows ?? []).forEach((r: { team_id: string }) => {
            counts[r.team_id] = (counts[r.team_id] ?? 0) + 1;
          });
          setDbMemberTeams(
            Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([teamId, count]) => ({ teamId, count }))
          );
        }

        // Fetch messages + debates + bets + hot_takes in parallel
        const [
          { data: msgs, error: msgsErr },
          { data: dbDebates },
          { data: dbBets },
          { data: dbHotTakes },
        ] = await Promise.all([
          supabase.from('messages').select('id, user_id, content, tag, created_at').eq('neighborhood_id', id).order('created_at', { ascending: true }).limit(200),
          supabase.from('debates').select('*').eq('neighborhood_id', id).order('created_at', { ascending: false }),
          supabase.from('bets').select('*').eq('neighborhood_id', id).order('created_at', { ascending: false }),
          supabase.from('hot_takes').select('*').eq('neighborhood_id', id).order('created_at', { ascending: false }),
        ]);

        if (msgsErr) console.error('Messages fetch error:', msgsErr);
        setMessages((msgs ?? []).map((m: any) => ({
          id: m.id, chatId: id, userId: m.user_id, content: m.content,
          tag: m.tag ?? undefined, timestamp: m.created_at, reactions: [],
        })));

        // Debate sides (two-step)
        const debateIds = (dbDebates ?? []).map((d: any) => d.id);
        const { data: dbDebateSides } = debateIds.length > 0
          ? await supabase.from('debate_sides').select('debate_id, user_id, side').in('debate_id', debateIds)
          : { data: [] };
        setDebates((dbDebates ?? []).map((d: any) => ({
          id: d.id, chatId: id, chatName: hoodName, claim: d.claim,
          side1Label: d.side1_label ?? undefined, side2Label: d.side2_label ?? undefined,
          side1UserIds: (dbDebateSides ?? []).filter((s: any) => s.debate_id === d.id && s.side === '1').map((s: any) => s.user_id),
          side2UserIds: (dbDebateSides ?? []).filter((s: any) => s.debate_id === d.id && s.side === '2').map((s: any) => s.user_id),
          arguments: [], votes: [], status: d.status, resolution: d.resolution ?? undefined,
          teamIds: d.team_ids ?? [], createdAt: d.created_at, isPublic: d.is_public,
        })));

        // Bet participants (two-step)
        const betIds = (dbBets ?? []).map((b: any) => b.id);
        const { data: dbBetParts } = betIds.length > 0
          ? await supabase.from('bet_participants').select('bet_id, user_id, side').in('bet_id', betIds)
          : { data: [] };
        setBets((dbBets ?? []).map((b: any) => {
          const parts = (dbBetParts ?? []).filter((p: any) => p.bet_id === b.id);
          return {
            id: b.id, chatId: id, chatName: hoodName, claim: b.claim,
            participantIds: parts.map((p: any) => p.user_id),
            side1Ids: parts.filter((p: any) => p.side === '1').map((p: any) => p.user_id),
            side2Ids: parts.filter((p: any) => p.side === '2').map((p: any) => p.user_id),
            side1Label: b.side1_label ?? undefined, side2Label: b.side2_label ?? undefined,
            stakes: b.stakes ?? undefined, status: b.status,
            winnerId: b.winner_id ?? undefined, isPush: b.is_push,
            teamIds: b.team_ids ?? [], createdAt: b.created_at, isPublic: b.is_public,
          };
        }));

        setHotTakes((dbHotTakes ?? []).map((h: any) => ({
          id: h.id, chatId: id, chatName: hoodName, content: h.content,
          authorId: h.author_id, reactions: [], teamIds: h.team_ids ?? [],
          createdAt: h.created_at, isPublic: h.is_public,
        })));

      } catch (e) {
        console.error('Neighborhood load exception:', e);
      } finally {
        setDbLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resolveUser = (uid: string) => {
    const nick = nicknameMap[uid];
    const db = dbMemberProfiles.find((p) => p.id === uid);
    if (db) return { id: db.id, displayName: nick || db.display_name, username: db.username, avatar: db.avatar || '🏈', bio: '', fanTeams: [], stats: { debatesWon: 0, debatesLost: 0, debatesDrew: 0, betsWon: 0, betsLost: 0, betsPending: 0, hotTakesPosted: 0, hotTakeReactions: 0 }, followingIds: [], followerIds: [], groupIds: [] };
    if (authUser?.profile && uid === authUser.id) return { id: authUser.id, displayName: nick || authUser.profile.display_name, username: authUser.profile.username, avatar: authUser.profile.avatar || '🏈', bio: '', fanTeams: [], stats: { debatesWon: 0, debatesLost: 0, debatesDrew: 0, betsWon: 0, betsLost: 0, betsPending: 0, hotTakesPosted: 0, hotTakeReactions: 0 }, followingIds: [], followerIds: [], groupIds: [] };
    return getUserById(uid);
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      const now = new Date().toISOString();
      localStorage.setItem(`hood-chat-seen-${id}`, now);
      setLastSeenChat(now);
    }
  }, [messages, activeTab, id]);

  useEffect(() => {
    const stored = localStorage.getItem(`hood-chat-seen-${id}`);
    if (stored) setLastSeenChat(stored);
  }, [id]);

  // Realtime subscription — appends new messages as they arrive without overwriting state
  useEffect(() => {
    if (!isRealId || !isSupabaseConfigured() || dbLoading) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    const channel = supabase
      .channel(`hood-msgs-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `neighborhood_id=eq.${id}` },
        (payload: any) => {
          const m = payload.new;
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === m.id)) return prev;
            return [...prev, {
              id: m.id, chatId: id, userId: m.user_id, content: m.content,
              tag: m.tag ?? undefined, timestamp: m.created_at, reactions: [],
            }];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isRealId, dbLoading]);

  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);

  if (dbLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 rounded-full border-2 border-masthead border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!chat && !dbNeighborhood) {
    return (
      <div className="flex items-center justify-center h-full text-ink-muted">
        Neighborhood not found
      </div>
    );
  }

  // Unified chat object — real DB data or mock chat
  const effectiveChat = chat ?? { id, name: chatName, emoji: chatEmoji, memberIds: localMemberIds, teamIds: [], messages: [] };

  const members = localMemberIds.map((mid) => resolveUser(mid)).filter(Boolean);
  const allFanTeams = members.flatMap((m) => m!.fanTeams).reduce<Record<string, number>>((acc, ft) => {
    acc[ft.team.id] = (acc[ft.team.id] || 0) + 1;
    return acc;
  }, {});
  const topTeams = Object.entries(allFanTeams)
    .sort((a, b) => b[1] - a[1])
    .map(([teamId, count]) => ({ team: TEAMS.find((t) => t.id === teamId)!, count }))
    .filter((x) => x.team);

  const tagConfig = {
    'hot-take': { label: 'Hot Take', emoji: '🔥', bg: 'bg-press', border: 'border-press/40', surface: 'bg-press/10 border-press/30' },
    debate: { label: 'Debate', emoji: '⚔️', bg: 'bg-navy', border: 'border-navy/40', surface: 'bg-navy/10 border-navy/30' },
    bet: { label: 'Bet', emoji: '🤝', bg: 'bg-field', border: 'border-field/40', surface: 'bg-field/10 border-field/30' },
    analysis: { label: 'Analysis', emoji: '📊', bg: 'bg-nav-bg', border: 'border-ink/40', surface: 'bg-ink/5 border-ink/20' },
  };

  const QUICK_REPLIES = [
    'Facts! 💯', 'Nah bro 🧢', 'Lmaooo 😂', "Let's gooo 🔥", 'Real talk',
    'Say less 👀', 'Not wrong tbh', 'Bro no 💀', 'I actually fw that',
  ];

  const triggerTypingReply = () => {
    const nonMe = members.filter((m) => m?.id !== 'me');
    if (nonMe.length === 0) return;
    const responder = nonMe[Math.floor(Math.random() * nonMe.length)]!;
    setTypingUserId(responder.id);
    setTimeout(() => {
      setTypingUserId(null);
      setMessages((prev) => [...prev, {
        id: `reply-${Date.now()}`,
        chatId: effectiveChat.id,
        userId: responder.id,
        content: QUICK_REPLIES[Math.floor(Math.random() * QUICK_REPLIES.length)],
        timestamp: new Date().toISOString(),
        reactions: [],
      }]);
    }, 1500 + Math.random() * 800);
  };

  // ─── Chat actions ────────────────────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() && !pendingMediaUrl) return;
    if (pendingTag === 'hot-take' && inputText.length > HOT_TAKE_MAX) return;

    // Capture before state clears
    const capturedMediaUrl = pendingMediaUrl;
    const capturedMediaType = pendingMediaType;
    const capturedMediaFile = pendingMediaFile;

    if (pendingTag === 'bet') {
      setBetSetupClaim(inputText.trim());
      setBetSetupMessageId(null);
      return;
    }

    if (pendingTag === 'debate') {
      setDebateSetupClaim(inputText.trim());
      setDebateSetupMessageId(null);
      return;
    }

    const effectiveChatId = chat?.id ?? id;
    const effectiveChatName = chatName || chat?.name || '';
    const senderId = (isRealId && authUser?.id) ? authUser.id : 'me';

    const msg: Message = {
      id: `new-${Date.now()}`,
      chatId: effectiveChatId,
      userId: senderId,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      tag: pendingTag ?? undefined,
      reactions: [],
      mediaUrl: pendingMediaUrl ?? undefined,
      mediaType: pendingMediaType ?? undefined,
    };
    setMessages((prev) => [...prev, msg]);
    setPendingMediaUrl(null);
    setPendingMediaType(null);
    setPendingMediaFile(null);
    setPendingLinkUrl('');
    setAttachMenuOpen(false);

    setSendError(null);

    // Persist to Supabase for real neighborhoods
    if (isRealId && authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const msgContent = inputText.trim();
      const msgTag = pendingTag;

      const { data: savedMsg, error: sendErr } = await supabase.from('messages').insert({
        neighborhood_id: id,
        user_id: authUser.id,
        content: msgContent,
        tag: msgTag ?? null,
      }).select().single();
      if (sendErr) {
        console.error('Message send failed:', sendErr);
        setSendError(sendErr.message ?? 'Message failed to send');
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      } else if (savedMsg) {
        // Swap temp ID → real DB ID so the realtime subscription deduplicates correctly
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, id: savedMsg.id } : m));
      }

      if (msgTag === 'hot-take') {
        const detectedTeams = detectTeamIds(msgContent);
        const mergedTeamIds = Array.from(new Set([...(chat?.teamIds ?? []), ...detectedTeams]));
        const newHT: HotTake = {
          id: `ht-new-${Date.now()}`, chatId: effectiveChatId, chatName: effectiveChatName,
          content: msgContent, authorId: senderId, reactions: [], teamIds: mergedTeamIds,
          createdAt: new Date().toISOString(),
        };
        setHotTakes((prev) => [newHT, ...prev]);
        sendNotification(`🔥 Hot Take — ${effectiveChatName}`, msgContent);
        await supabase.from('hot_takes').insert({
          content: msgContent, author_id: authUser.id, neighborhood_id: id,
          neighborhood_name: effectiveChatName, is_public: false, team_ids: mergedTeamIds,
        });
      }

      // Save photo/link to media section
      if (capturedMediaUrl && capturedMediaType === 'photo' && capturedMediaFile) {
        const ext = capturedMediaFile.name.split('.').pop() ?? 'jpg';
        const path = `neighborhood/${id}/${Date.now()}.${ext}`;
        const { data: up } = await supabase.storage.from('media-posts').upload(path, capturedMediaFile, { upsert: false });
        if (up) {
          const { data: urlData } = supabase.storage.from('media-posts').getPublicUrl(up.path);
          const realUrl = urlData?.publicUrl;
          if (realUrl) {
            const msgId = savedMsg?.id ?? msg.id;
            setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, mediaUrl: realUrl } : m));
            await supabase.from('media_posts').insert({
              author_id: authUser.id, context_type: 'neighborhood', context_id: id,
              type: 'photo', url: realUrl, caption: msgContent || null, title: null,
            });
          }
        }
      } else if (capturedMediaUrl && capturedMediaType !== 'photo') {
        await supabase.from('media_posts').insert({
          author_id: authUser.id, context_type: 'neighborhood', context_id: id,
          type: 'link', url: capturedMediaUrl, caption: msgContent || null, title: null,
        });
      }
    } else {
      triggerTypingReply();

      if (pendingTag === 'hot-take') {
        const detectedTeams = detectTeamIds(inputText.trim());
        const mergedTeamIds = Array.from(new Set([...(chat?.teamIds ?? []), ...detectedTeams]));
        const newHT: HotTake = {
          id: `ht-new-${Date.now()}`, chatId: effectiveChatId, chatName: effectiveChatName,
          content: inputText.trim(), authorId: senderId, reactions: [], teamIds: mergedTeamIds,
          createdAt: new Date().toISOString(),
        };
        setHotTakes((prev) => [newHT, ...prev]);
        sendNotification(`🔥 Hot Take — ${effectiveChatName}`, inputText.trim());
      }
    }

    setInputText('');
    setPendingTag(null);
  };

  const confirmBetSetup = async (data: BetSetupResult) => {
    const claim = data.claim;
    const senderId = (isRealId && authUser?.id) ? authUser.id : 'me';

    if (betSetupMessageId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === betSetupMessageId ? { ...m, tag: 'bet' as const } : m))
      );
    } else {
      setMessages((prev) => [
        ...prev,
        { id: `new-${Date.now()}`, chatId: effectiveChat.id, userId: senderId, content: claim, timestamp: new Date().toISOString(), tag: 'bet' as const, reactions: [] },
      ]);
      setInputText('');
      setPendingTag(null);
    }

    const detectedTeams = detectTeamIds(claim);
    const mergedBetTeamIds = Array.from(new Set([...effectiveChat.teamIds, ...detectedTeams]));
    const tempId = `b-new-${Date.now()}`;
    const newBet: Bet = {
      id: tempId, chatId: effectiveChat.id, chatName: effectiveChat.name, claim,
      participantIds: [...data.side1Ids, ...data.side2Ids],
      side1Ids: data.side1Ids, side2Ids: data.side2Ids,
      side1Label: data.side1Label, side2Label: data.side2Label,
      stakes: data.stakes, status: 'active', teamIds: mergedBetTeamIds,
      createdAt: new Date().toISOString(),
    };
    setBets((prev) => [newBet, ...prev]);
    sendNotification(`🤝 New Bet — ${effectiveChat.name}`, claim);

    if (isRealId && authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const { data: savedBet, error: betErr } = await supabase
        .from('bets')
        .insert({ claim, author_id: authUser.id, neighborhood_id: id, neighborhood_name: chatName, stakes: data.stakes || null, status: 'active', side1_label: data.side1Label || null, side2_label: data.side2Label || null, team_ids: mergedBetTeamIds })
        .select().single();
      if (betErr) {
        console.error('Bet save error:', betErr);
      } else if (savedBet) {
        setBets((prev) => prev.map((b) => b.id === tempId ? { ...b, id: savedBet.id } : b));
        const parts = [
          ...data.side1Ids.map((uid) => ({ bet_id: savedBet.id, user_id: uid, side: '1' })),
          ...data.side2Ids.map((uid) => ({ bet_id: savedBet.id, user_id: uid, side: '2' })),
        ];
        if (parts.length > 0) await supabase.from('bet_participants').insert(parts);
        await supabase.from('messages').insert({ neighborhood_id: id, user_id: authUser.id, content: claim, tag: 'bet' });
      }
    }

    setBetSetupClaim(null);
    setBetSetupMessageId(null);
  };

  const confirmDebateSetup = async (data: DebateSetupResult) => {
    const claim = data.claim;
    const senderId = (isRealId && authUser?.id) ? authUser.id : 'me';

    if (debateSetupMessageId) {
      setMessages((prev) =>
        prev.map((m) => m.id === debateSetupMessageId ? { ...m, tag: 'debate' as const } : m)
      );
    } else {
      setMessages((prev) => [
        ...prev,
        { id: `new-${Date.now()}`, chatId: effectiveChat.id, userId: senderId, content: claim, timestamp: new Date().toISOString(), tag: 'debate' as const, reactions: [] },
      ]);
      setInputText('');
      setPendingTag(null);
    }
    const detectedTeams = detectTeamIds(claim);
    const mergedTeamIds = Array.from(new Set([...effectiveChat.teamIds, ...detectedTeams]));
    const tempId = `d-new-${Date.now()}`;
    const newDebate: Debate = {
      id: tempId, chatId: effectiveChat.id, chatName: effectiveChat.name, claim,
      side1Label: data.side1Label, side2Label: data.side2Label,
      side1UserIds: [], side2UserIds: [], arguments: [], votes: [],
      status: 'active', teamIds: mergedTeamIds, createdAt: new Date().toISOString(),
    };
    setDebates((prev) => [newDebate, ...prev]);
    sendNotification(`⚔️ New Debate — ${effectiveChat.name}`, claim);

    if (isRealId && authUser && isSupabaseConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const { data: savedDebate, error: debateErr } = await supabase
        .from('debates')
        .insert({ claim, side1_label: data.side1Label || null, side2_label: data.side2Label || null, author_id: authUser.id, neighborhood_id: id, neighborhood_name: chatName, status: 'active', team_ids: mergedTeamIds })
        .select().single();
      if (debateErr) {
        console.error('Debate save error:', debateErr);
      } else if (savedDebate) {
        setDebates((prev) => prev.map((d) => d.id === tempId ? { ...d, id: savedDebate.id } : d));
        await supabase.from('messages').insert({ neighborhood_id: id, user_id: authUser.id, content: claim, tag: 'debate' });
      }
    }

    setDebateSetupClaim(null);
    setDebateSetupMessageId(null);
  };

  const tagExistingMessage = (messageId: string, tag: MessageTag) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    setTagPickerFor(null);

    if (tag === 'bet') {
      setBetSetupClaim(msg.content);
      setBetSetupMessageId(messageId);
      return;
    }

    if (tag === 'debate') {
      setDebateSetupClaim(msg.content);
      setDebateSetupMessageId(messageId);
      return;
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, tag } : m))
    );
    if (tag === 'hot-take') {
      const detectedTeams = detectTeamIds(msg.content);
      const mergedTeamIds = Array.from(new Set([...effectiveChat.teamIds, ...detectedTeams]));
      const newHT: HotTake = {
        id: `ht-tag-${Date.now()}`,
        chatId: effectiveChat.id,
        chatName: effectiveChat.name,
        content: msg.content,
        authorId: msg.userId,
        reactions: [],
        teamIds: mergedTeamIds,
        createdAt: new Date().toISOString(),
      };
      setHotTakes((prev) => [newHT, ...prev]);
    }
  };

  const voteHotTake = (htId: string, vote: '🔥' | '❄️') => {
    const opposite = vote === '🔥' ? '❄️' : '🔥';
    setHotTakes((prev) =>
      prev.map((ht) => {
        if (ht.id !== htId) return ht;
        let reactions = ht.reactions
          .map((r) => r.emoji === opposite ? { ...r, userIds: r.userIds.filter((u) => u !== 'me') } : r)
          .filter((r) => r.userIds.length > 0);
        const existing = reactions.find((r) => r.emoji === vote);
        if (existing) {
          reactions = existing.userIds.includes('me')
            ? reactions.map((r) => r.emoji === vote ? { ...r, userIds: r.userIds.filter((u) => u !== 'me') } : r).filter((r) => r.userIds.length > 0)
            : reactions.map((r) => r.emoji === vote ? { ...r, userIds: [...r.userIds, 'me'] } : r);
        } else {
          reactions = [...reactions, { emoji: vote, userIds: ['me'] }];
        }
        return { ...ht, reactions };
      })
    );
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
                  .map((r) => r.emoji === emoji ? { ...r, userIds: r.userIds.filter((u) => u !== 'me') } : r)
                  .filter((r) => r.userIds.length > 0)
              : m.reactions.map((r) => r.emoji === emoji ? { ...r, userIds: [...r.userIds, 'me'] } : r),
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
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        chatId: effectiveChat.id,
        userId: 'ai',
        content: `**Q: ${question}**\n\nBased on historical data and current stats, this is a great question for the neighborhood. The numbers suggest multiple angles worth debating — want me to break down the specifics?`,
        timestamp: new Date().toISOString(),
        reactions: [],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setAiLoading(false);
      setShowAI(false);
    }, 1200);
  };

  // ─── Debate actions ──────────────────────────────────────
  const myUid = authUser?.id ?? 'me';

  const castVote = (debateId: string, choice: VoteChoice) => {
    setDebates((prev) =>
      prev.map((d) => {
        if (d.id !== debateId || d.votes.find((v) => v.userId === myUid)) return d;
        const newVotes = [...d.votes, { userId: myUid, choice }];
        const counts = voteLeader(newVotes);
        const leading = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (leading && leading[1] > members.length / 2) {
          return { ...d, votes: newVotes, status: 'resolved' as const, resolution: leading[0] as VoteChoice, resolvedAt: new Date().toISOString() };
        }
        return { ...d, votes: newVotes };
      })
    );
  };

  // ─── Bet actions ─────────────────────────────────────────
  const proposeResolution = (betId: string, winnerId: string | null) => {
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== betId) return b;
        if (b.participantIds.length === 1) {
          return { ...b, status: 'resolved' as const, winnerId: winnerId ?? undefined, isPush: winnerId === null, resolvedAt: new Date().toISOString() };
        }
        return {
          ...b,
          status: 'awaiting-resolution' as const,
          proposal: { proposedBy: myUid, winnerId: winnerId ?? undefined, isPush: winnerId === null, agreements: [myUid], disputes: [] },
        };
      })
    );
  };

  const agreeResolution = (betId: string) => {
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== betId || !b.proposal) return b;
        const agreements = [...b.proposal.agreements, myUid];
        if (agreements.length >= b.participantIds.length) {
          return { ...b, status: 'resolved' as const, winnerId: b.proposal.winnerId, isPush: b.proposal.isPush, resolvedAt: new Date().toISOString(), proposal: undefined };
        }
        return { ...b, proposal: { ...b.proposal, agreements } };
      })
    );
  };

  const cancelProposal = (betId: string) => {
    setBets((prev) =>
      prev.map((b) =>
        b.id === betId && b.proposal?.proposedBy === myUid
          ? { ...b, status: 'active' as const, proposal: undefined }
          : b
      )
    );
  };

  const publishToStreets = (htId: string) => {
    setHotTakes((prev) =>
      prev.map((ht) => (ht.id === htId ? { ...ht, isPublic: true } : ht))
    );
  };

  const addComment = (htId: string) => {
    if (!commentText.trim()) return;
    const newComment: HotTakeComment = {
      id: `c-${Date.now()}`,
      userId: 'me',
      content: commentText.trim(),
      timestamp: new Date().toISOString(),
    };
    setHotTakes((prev) =>
      prev.map((ht) =>
        ht.id === htId ? { ...ht, comments: [...(ht.comments ?? []), newComment] } : ht
      )
    );
    setCommentText('');
    setMentionQuery('');
  };

  const handleCommentInput = (val: string) => {
    setCommentText(val);
    const lastWord = val.split(/\s/).pop() ?? '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setMentionQuery(lastWord.slice(1));
    } else {
      setMentionQuery('');
    }
  };

  const insertMention = (username: string) => {
    const words = commentText.split(/(\s)/);
    words[words.length - 1] = `@${username}`;
    setCommentText(words.join('') + ' ');
    setMentionQuery('');
    commentInputRef.current?.focus();
  };

  const mentionMatches = mentionQuery
    ? members.filter((m) => m?.username.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 4)
    : [];

  // ─── Analyst actions ─────────────────────────────────────
  const submitAnalysis = () => {
    if (!analysisTitle.trim() || !analysisBody.trim()) return;
    const newAnalysis: Analysis = {
      id: `an-new-${Date.now()}`,
      chatId: effectiveChat.id,
      chatName: effectiveChat.name,
      title: analysisTitle.trim(),
      content: analysisBody.trim(),
      authorId: 'me',
      reactions: [],
      teamIds: effectiveChat.teamIds,
      createdAt: new Date().toISOString(),
    };
    setAnalyses((prev) => [newAnalysis, ...prev]);
    setAnalysisTitle('');
    setAnalysisBody('');
    setShowAnalysisForm(false);
  };

  const addAnalystComment = (anId: string) => {
    if (!analystCommentText.trim()) return;
    const newComment: HotTakeComment = {
      id: `ac-${Date.now()}`,
      userId: 'me',
      content: analystCommentText.trim(),
      timestamp: new Date().toISOString(),
    };
    setAnalyses((prev) =>
      prev.map((a) =>
        a.id === anId ? { ...a, comments: [...(a.comments ?? []), newComment] } : a
      )
    );
    setAnalystCommentText('');
    setAnalystMentionQuery('');
  };

  const handleAnalystCommentInput = (val: string) => {
    setAnalystCommentText(val);
    const lastWord = val.split(/\s/).pop() ?? '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setAnalystMentionQuery(lastWord.slice(1));
    } else {
      setAnalystMentionQuery('');
    }
  };

  const insertAnalystMention = (username: string) => {
    const words = analystCommentText.split(/(\s)/);
    words[words.length - 1] = `@${username}`;
    setAnalystCommentText(words.join('') + ' ');
    setAnalystMentionQuery('');
    analystCommentInputRef.current?.focus();
  };

  const analystMentionMatches = analystMentionQuery
    ? members.filter((m) => m?.username.toLowerCase().startsWith(analystMentionQuery.toLowerCase())).slice(0, 4)
    : [];

  const publishAnalysisToStreets = (anId: string) => {
    setAnalyses((prev) =>
      prev.map((a) => (a.id === anId ? { ...a, isPublic: true } : a))
    );
  };

  // ─── Hot take actions ────────────────────────────────────
  const addHTReaction = (htId: string, emoji: string) => {
    setHotTakes((prev) =>
      prev.map((ht) => {
        if (ht.id !== htId) return ht;
        const existing = ht.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...ht,
            reactions: existing.userIds.includes('me')
              ? ht.reactions.map((r) => r.emoji === emoji ? { ...r, userIds: r.userIds.filter((u) => u !== 'me') } : r).filter((r) => r.userIds.length > 0)
              : ht.reactions.map((r) => r.emoji === emoji ? { ...r, userIds: [...r.userIds, 'me'] } : r),
          };
        }
        return { ...ht, reactions: [...ht.reactions, { emoji, userIds: ['me'] }] };
      })
    );
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'debates', label: 'Debates', icon: Swords },
    { id: 'bets', label: 'Bets', icon: Handshake },
    { id: 'hot-takes', label: 'Takes', icon: Flame },
    { id: 'analysis', label: 'Analysis', icon: PenLine },
    { id: 'media', label: 'Media', icon: Images },
  ];

  const TAB_ORDER: Tab[] = ['overview', 'chat', 'debates', 'bets', 'hot-takes', 'analysis', 'media'];

  const onTabSwipeStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };

  const onTabSwipeEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 50) return;
    const idx = TAB_ORDER.indexOf(activeTab);
    if (dx < 0 && idx < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[idx + 1]);
    else if (dx > 0 && idx > 0) setActiveTab(TAB_ORDER[idx - 1]);
  };

  const charsLeft = HOT_TAKE_MAX - inputText.length;
  const overLimit = pendingTag === 'hot-take' && inputText.length > HOT_TAKE_MAX;
  const unreadCount = messages.filter(
    (m) => m.userId !== authUser?.id && m.timestamp > lastSeenChat
  ).length;

  return (
    <div className="flex flex-col h-full bg-paper" onTouchStart={onTabSwipeStart} onTouchEnd={onTabSwipeEnd}>
      {/* Header */}
      <div className="shrink-0 bg-nav-bg px-4 py-3 flex items-center gap-2.5">
        <button onClick={() => router.back()} className="text-ink/60 hover:text-ink p-1 shrink-0">
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center bg-ink-muted/30 text-xl shrink-0 rounded-xl overflow-hidden">
            {chatPhoto ? (
              <img src={chatPhoto} alt={chatName} className="w-full h-full object-cover" />
            ) : (
              chatEmoji
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-ink truncate leading-tight">{chatName}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/50">{members.length} members</p>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-all ${activeTab === 'overview' ? 'bg-masthead/20 text-masthead' : 'bg-ink/10 hover:bg-ink/20 text-ink/70 hover:text-ink'}`}
          aria-label="Overview"
        >
          <Home size={14} />
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-all relative ${activeTab === 'chat' ? 'bg-masthead/20 text-masthead' : 'bg-ink/10 hover:bg-ink/20 text-ink/70 hover:text-ink'}`}
          aria-label="Chat"
        >
          <MessageCircle size={14} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full bg-press text-[8px] font-bold text-white leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setShowEditModal(true)}
          className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-ink/10 hover:bg-ink/20 text-ink/70 hover:text-ink transition-all"
          aria-label="Edit neighborhood"
        >
          <Pencil size={14} />
        </button>
      </div>

      {/* Edit Modal */}
      {showEditModal && isRealId && (
        <NeighborhoodFormModal
          mode="edit"
          neighborhoodId={id}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            const supabase = createClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            supabase.from('neighborhoods').select('name, emoji, photo_url, description').eq('id', id).single()
              .then(({ data }: { data: { name: string; emoji: string; photo_url?: string | null; description?: string | null } | null }) => {
                if (data) {
                  setChatName(data.name);
                  setChatEmoji(data.emoji);
                  setChatPhoto(data.photo_url ?? null);
                  setChatDescription(data.description ?? null);
                }
              });
          }}
        />
      )}

      {/* Description strip — above tabs, only when set */}
      {chatDescription && (
        <div className="shrink-0 bg-nav-bg px-4 py-2 border-b border-white/10">
          <p className="text-xs text-white/65 italic leading-snug">{chatDescription}</p>
        </div>
      )}

      {/* Stats strip */}
      <div className="shrink-0 bg-nav-bg px-5 py-3 border-b border-white/10">
        <div className="flex gap-6">
          {[
            { label: 'Debates',  value: debates.length },
            { label: 'Bets',     value: bets.length },
            { label: 'Hot Takes',value: hotTakes.length },
            { label: 'Analyses', value: analyses.length },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-lg font-bold text-white font-mono">{value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar — equal-width, fits all tabs without scrolling */}
      <div className="shrink-0 flex bg-paper-dark border-b border-rule">
        {tabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === tabId
                ? 'border-masthead text-masthead'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="flex-1 overflow-y-auto pb-4">
          {/* Members */}
          <div className="px-5 py-4 border-b border-rule">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink text-lg">Members</h3>
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{members.length} total</span>
            </div>
            <div className="flex flex-col gap-0">
              {members.map((m, i) => (
                <Link
                  key={m!.id}
                  href={`/users/${m!.id}`}
                  className={`flex items-center gap-3 px-1 py-2.5 border-b border-rule/50 last:border-0 ${i === 0 ? 'border-t border-rule/50' : ''} hover:bg-paper-dark transition-colors rounded`}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-dark border border-rule text-lg shrink-0 overflow-hidden"
                    onClick={m!.avatar && typeof m!.avatar === 'string' && m!.avatar.startsWith('http') ? (e) => { e.preventDefault(); e.stopPropagation(); setExpandedAvatar(m!.avatar as string); } : undefined}
                    style={m!.avatar && typeof m!.avatar === 'string' && m!.avatar.startsWith('http') ? { cursor: 'zoom-in' } : undefined}
                  >
                    {m!.avatar && typeof m!.avatar === 'string' && m!.avatar.startsWith('http')
                      ? <img src={m!.avatar} alt="" className="w-full h-full object-cover" />
                      : m!.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm">{m!.displayName}</p>
                    <p className="text-[11px] text-ink-faint">@{m!.username}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {m!.fanTeams.slice(0, 2).map((ft) => (
                      <span key={ft.team.id} title={ft.team.name}>
                        <TeamLogo team={ft.team} size={15} />
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Neighborhood teams — real data for DB hoods, mock data otherwise */}
          {(() => {
            const displayTeams = isRealId
              ? dbMemberTeams.map(({ teamId, count }) => ({ team: ALL_TEAMS.find((t) => t.id === teamId), count })).filter((x) => x.team) as { team: typeof ALL_TEAMS[0]; count: number }[]
              : topTeams;
            if (displayTeams.length === 0) return null;
            return (
              <div className="px-5 py-4 border-b border-rule">
                <h3 className="font-display font-bold text-ink text-lg mb-3">Neighborhood Teams</h3>
                <div className="flex flex-col gap-0">
                  {displayTeams.map(({ team, count }, i) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className={`flex items-center gap-3 px-4 py-2.5 border-b border-rule/50 last:border-0 hover:bg-paper-dark transition-colors ${i === 0 ? 'border-t border-rule/50' : ''}`}
                      style={{ borderLeftWidth: '3px', borderLeftColor: team.color, borderLeftStyle: 'solid' }}
                    >
                      <TeamLogo team={team} size={28} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-ink">{teamDisplayName(team)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{team.league}</p>
                      </div>
                      <span className="text-[11px] text-ink-muted">{count} fan{count !== 1 ? 's' : ''}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Quick-nav */}
          <div className="px-5 py-4 flex flex-col gap-0">
            <h3 className="font-display font-bold text-ink text-lg mb-3">Jump To</h3>
            {(['chat', 'debates', 'bets', 'hot-takes', 'analysis'] as const).map((t, i) => {
              const cfgMap = {
                chat: { label: 'Chat', icon: MessageCircle, color: 'text-ink', count: messages.length, unit: 'messages' },
                debates: { label: 'Debates', icon: Swords, color: 'text-navy', count: debates.filter((d) => d.status === 'active').length, unit: 'active' },
                bets: { label: 'Bets', icon: Handshake, color: 'text-field', count: bets.filter((b) => b.status !== 'resolved').length, unit: 'active' },
                'hot-takes': { label: 'Hot Takes', icon: Flame, color: 'text-press', count: hotTakes.length, unit: 'total' },
                analysis: { label: 'Analysis', icon: PenLine, color: 'text-ink-muted', count: analyses.length, unit: 'pieces' },
              };
              const cfg = cfgMap[t];
              const Icon = cfg.icon;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex items-center gap-3 bg-paper px-4 py-3 hover:bg-paper-dark transition-colors border-b border-rule/50 ${i === 0 ? 'border-t border-rule/50' : ''}`}
                >
                  <Icon size={15} className={cfg.color} />
                  <span className="flex-1 text-sm font-bold text-ink text-left">{cfg.label}</span>
                  <span className="text-[11px] text-ink-faint">{cfg.count} {cfg.unit}</span>
                  <span className="text-ink-faint text-xs">→</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CHAT TAB ─────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-paper">
            {messages.map((msg) => {
              const sender = resolveUser(msg.userId);
              const isMe = msg.userId === 'me' || (!!authUser && msg.userId === authUser.id);
              const isAI = msg.userId === 'ai';
              const tag = msg.tag ? tagConfig[msg.tag] : null;

              return (
                <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <Link href={isAI ? '#' : `/users/${msg.userId}`} className="shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-sm mt-1 hover:border-ink transition-all overflow-hidden">
                        {isAI ? '✦' : (
                          typeof sender?.avatar === 'string' && sender.avatar.startsWith('http')
                            ? <img src={sender.avatar} alt="" className="h-full w-full object-cover" />
                            : (sender?.avatar || '👤')
                        )}
                      </div>
                    </Link>
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <Link href={isAI ? '#' : `/users/${msg.userId}`} className="mb-1 text-[11px] font-bold text-ink-muted px-1 hover:text-masthead transition-colors uppercase tracking-wide">
                        {isAI ? 'Ask AI ✦' : sender?.displayName}
                      </Link>
                    )}
                    {tag && (
                      <div className={`mb-1 flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-ink self-start uppercase tracking-wider rounded-full ${tag.bg}`}>
                        <span>{tag.emoji}</span><span>{tag.label}</span>
                      </div>
                    )}
                    <div
                      className={`relative px-4 py-2.5 text-sm leading-relaxed cursor-pointer rounded-2xl ${
                        isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'
                      } ${
                        isAI ? 'bg-paper-dark text-ink border border-rule'
                          : isMe ? 'bg-nav-bg text-ink'
                          : msg.tag === 'hot-take' ? 'bg-press/10 text-ink msg-hot-take'
                          : msg.tag === 'debate' ? 'bg-navy/10 text-ink msg-debate'
                          : msg.tag === 'bet' ? 'bg-field/10 text-ink msg-bet'
                          : msg.tag === 'analysis' ? 'bg-rule text-ink msg-analysis'
                          : 'bg-paper-dark text-ink'
                      }`}
                      onDoubleClick={() => setShowReactionsFor(showReactionsFor === msg.id ? null : msg.id)}
                      onContextMenu={(e) => { e.preventDefault(); setTagPickerFor(tagPickerFor === msg.id ? null : msg.id); }}
                      onTouchStart={() => { longPressTimer.current = setTimeout(() => setTagPickerFor(msg.id), 500); }}
                      onTouchEnd={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                      onTouchMove={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                    >
                      {isAI ? (
                        <div>{msg.content.split('\n').map((line, i) => (
                          <p key={i} className={i === 0 ? 'font-bold text-ink mb-1' : ''}>{line}</p>
                        ))}</div>
                      ) : msg.content}
                    </div>

                    {tagPickerFor === msg.id && !isAI && (
                      <div className="mt-1 flex items-center gap-1 bg-paper border border-rule px-3 py-2 shadow-xl rounded-2xl flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted mr-1">Tag:</span>
                        {(['hot-take', 'debate', 'bet', 'analysis'] as MessageTag[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => tagExistingMessage(msg.id, t)}
                            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-ink uppercase tracking-wider rounded-full ${tagConfig[t].bg}`}
                          >
                            {tagConfig[t].emoji} {tagConfig[t].label}
                          </button>
                        ))}
                        <button onClick={() => setTagPickerFor(null)} className="ml-1 text-ink-faint hover:text-ink">
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    {showReactionsFor === msg.id && (
                      <div className="mt-1 flex items-center gap-1 bg-paper border border-rule px-3 py-1.5 shadow-xl">
                        {EMOJI_REACTIONS.map((emoji) => (
                          <button key={emoji} onClick={() => addReaction(msg.id, emoji)} className="text-lg hover:scale-125 transition-transform">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.reactions.filter((r) => r.userIds.length > 0).length > 0 && (
                      <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? 'justify-end' : ''}`}>
                        {msg.reactions.filter((r) => r.userIds.length > 0).map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => addReaction(msg.id, r.emoji)}
                            className={`flex items-center gap-0.5 px-2 py-0.5 text-xs border transition-colors ${
                              r.userIds.includes('me') ? 'border-press/50 bg-press/10 text-press' : 'border-rule bg-paper-dark text-ink-muted hover:border-rule-dark'
                            }`}
                          >
                            {r.emoji} {r.userIds.length}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="mt-0.5 text-[10px] text-ink-faint px-1 font-mono">{timeAgo(msg.timestamp)}</p>
                  </div>
                </div>
              );
            })}

            {aiLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-sm">✦</div>
                <div className="bg-paper-dark border border-rule px-4 py-2.5">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Ask AI panel */}
          {showAI && (
            <div className="shrink-0 border-t-2 border-rule bg-paper-dark px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-ink-muted" />
                <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">Ask AI — Sports Desk</span>
                <button onClick={() => setShowAI(false)} className="ml-auto text-ink-faint hover:text-ink"><X size={16} /></button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                  placeholder="Who has the most playoff wins since 2010?"
                  autoFocus
                  className="flex-1 border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors"
                />
                <button onClick={sendAIMessage} disabled={!aiQuery.trim()} className="bg-nav-bg px-4 py-2 text-xs font-bold text-ink uppercase tracking-wider hover:bg-nav-bg/80 disabled:opacity-40 transition-colors">
                  Ask
                </button>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {typingUserId && (
            <div className="shrink-0 px-4 py-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-dark border border-rule text-sm shrink-0">
                {getUserById(typingUserId)?.avatar}
              </div>
              <div className="flex items-center gap-1 bg-paper-dark border border-rule px-3 py-2 rounded-2xl rounded-tl-sm">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-ink-muted rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {pendingTag && (
            <div className="shrink-0 px-4 py-2 flex items-center gap-2 bg-paper-dark border-t border-rule">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Tagging as:</span>
              <div className={`flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-ink uppercase tracking-wider ${tagConfig[pendingTag].bg}`}>
                {tagConfig[pendingTag].emoji} {tagConfig[pendingTag].label}
              </div>
              <button onClick={() => setPendingTag(null)} className="ml-auto text-ink-faint hover:text-ink"><X size={14} /></button>
            </div>
          )}

          {/* Input area */}
          <div className="shrink-0 border-t border-rule bg-paper-dark px-3 py-3">
            <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-0.5">
              {(['hot-take', 'debate', 'bet', 'analysis'] as MessageTag[]).map((tag) => {
                const cfg = tagConfig[tag];
                const isActive = pendingTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (tag === 'debate') { setDebateSetupClaim(inputText.trim()); setDebateSetupMessageId(null); return; }
                      if (tag === 'bet')    { setBetSetupClaim(inputText.trim() || ''); setBetSetupMessageId(null); return; }
                      setPendingTag(isActive ? null : tag);
                    }}
                    className={`flex items-center gap-1 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors rounded-full shrink-0 ${
                      isActive ? `${cfg.bg} text-ink border-transparent` : 'border-rule text-ink-muted hover:border-rule-dark hover:text-ink'
                    }`}
                  >
                    {cfg.emoji} {cfg.label}
                  </button>
                );
              })}
              <div className="ml-auto shrink-0">
                <button
                  onClick={() => { setShowAI(true); setShowReactionsFor(null); }}
                  className="flex items-center gap-1 border border-rule px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:border-ink hover:text-ink transition-colors rounded-full"
                >
                  <Sparkles size={10} /> Ask AI
                </button>
              </div>
            </div>

            {/* Attachment menu */}
            {attachMenuOpen && (
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 border border-rule px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink hover:border-ink rounded-full transition-colors"
                >
                  📷 Photo
                </button>
                <button
                  onClick={() => { setPendingMediaType('link'); setAttachMenuOpen(false); }}
                  className="flex items-center gap-1.5 border border-rule px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink hover:border-ink rounded-full transition-colors"
                >
                  <Link2 size={10} /> Link
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPendingMediaUrl(URL.createObjectURL(file));
                      setPendingMediaType('photo');
                      setPendingMediaFile(file);
                      setAttachMenuOpen(false);
                    }
                  }}
                />
              </div>
            )}

            {/* Link URL input */}
            {pendingMediaType === 'link' && (
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="url"
                  value={pendingLinkUrl}
                  onChange={(e) => setPendingLinkUrl(e.target.value)}
                  placeholder="Paste link URL…"
                  className="flex-1 border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-masthead rounded-full transition-colors"
                />
                <button
                  onClick={() => { setPendingMediaUrl(pendingLinkUrl); setPendingMediaType(null); }}
                  disabled={!pendingLinkUrl.trim()}
                  className="px-3 py-2 bg-nav-bg text-ink text-[10px] font-bold uppercase tracking-wider rounded-full disabled:opacity-40 transition-colors"
                >
                  Attach
                </button>
                <button onClick={() => { setPendingMediaType(null); setPendingLinkUrl(''); }} className="text-ink-faint hover:text-ink">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Pending photo preview */}
            {pendingMediaUrl && pendingMediaType === 'photo' && (
              <div className="mb-2 relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pendingMediaUrl} alt="" className="h-16 rounded-xl object-cover border border-rule" />
                <button
                  onClick={() => { setPendingMediaUrl(null); setPendingMediaType(null); setPendingMediaFile(null); }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-nav-bg border border-rule text-ink hover:bg-paper-darker transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            )}

            {/* Pending link preview */}
            {pendingMediaUrl && pendingMediaType !== 'photo' && (
              <div className="mb-2 flex items-center gap-2 border border-rule bg-paper px-3 py-1.5 rounded-xl w-full">
                <Link2 size={12} className="text-ink-muted shrink-0" />
                <span className="text-xs text-ink-muted truncate flex-1">{pendingMediaUrl}</span>
                <button onClick={() => { setPendingMediaUrl(null); setPendingMediaType(null); setPendingMediaFile(null); setPendingLinkUrl(''); }} className="text-ink-faint hover:text-ink shrink-0">
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Attachment button */}
              <button
                onClick={() => setAttachMenuOpen((o) => !o)}
                className={`flex h-9 w-9 items-center justify-center border rounded-full transition-colors shrink-0 ${
                  attachMenuOpen ? 'border-masthead text-masthead bg-masthead/10' : 'border-rule bg-paper-dark text-ink-muted hover:text-ink hover:border-rule-dark'
                }`}
              >
                <Paperclip size={15} />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={pendingTag ? `Drop your ${tagConfig[pendingTag].label.toLowerCase()}...` : 'Message...'}
                className={`flex-1 border px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors rounded-full ${
                  overLimit ? 'border-masthead bg-masthead/5' : 'border-rule bg-paper-dark focus:border-ink'
                }`}
              />
              <button
                onClick={sendMessage}
                disabled={(!inputText.trim() && !pendingMediaUrl) || overLimit}
                className="flex h-9 w-9 items-center justify-center bg-nav-bg text-ink hover:bg-nav-bg/80 disabled:opacity-40 transition-colors rounded-full btn-3d shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
            {pendingTag === 'hot-take' && (
              <div className={`mt-1.5 text-right text-[10px] font-mono ${charsLeft < 0 ? 'text-masthead font-bold' : charsLeft < 30 ? 'text-rule-dark' : 'text-ink-faint'}`}>
                {charsLeft}/{HOT_TAKE_MAX}
              </div>
            )}
            {sendError && (
              <p className="mt-1.5 text-[10px] text-red-400 text-center">{sendError}</p>
            )}
          </div>
        </div>
      )}

      {/* ── DEBATES TAB ──────────────────────────────────────── */}
      {activeTab === 'debates' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-6 bg-paper">
          {debates.filter((d) => d.status === 'active').map((debate) => {
            const side1Users = debate.side1UserIds.map((uid) => resolveUser(uid)).filter(Boolean);
            const side2Users = debate.side2UserIds.map((uid) => resolveUser(uid)).filter(Boolean);
            const myVote = debate.votes.find((v) => v.userId === myUid);
            const counts = voteLeader(debate.votes);
            const getVotePct = (c: VoteChoice) => debate.votes.length > 0 ? Math.round(((counts[c] ?? 0) / debate.votes.length) * 100) : 0;
            const expanded = expandedDebate === debate.id;

            return (
              <div key={debate.id} className="border border-rule overflow-hidden">
                <button onClick={() => setExpandedDebate(expanded ? null : debate.id)} className="w-full text-left px-4 py-4 bg-paper hover:bg-paper-dark transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords size={12} className="text-navy" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-navy">Debate</span>
                    <span className="text-[10px] text-ink-faint font-mono">{debate.votes.length} votes · {timeAgo(debate.createdAt)}</span>
                    <Link
                      href={`/debates/${debate.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto text-[10px] font-bold uppercase tracking-wider text-masthead hover:underline"
                    >
                      Join Debate →
                    </Link>
                  </div>
                  <p className="text-sm text-ink font-medium leading-snug mb-3 italic">&ldquo;{debate.claim}&rdquo;</p>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-navy">{debate.side1Label ?? 'Side 1'}:</span>
                    {side1Users.slice(0, 2).map((u) => (
                      <Link key={u!.id} href={`/users/${u!.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-paper-dark border border-rule px-2 py-0.5 text-ink-muted hover:border-ink text-xs">
                        <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                      </Link>
                    ))}
                    <span className="text-ink-faint mx-0.5 font-bold">vs</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-field">{debate.side2Label ?? 'Side 2'}:</span>
                    {side2Users.slice(0, 2).map((u) => (
                      <Link key={u!.id} href={`/users/${u!.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-paper-dark border border-rule px-2 py-0.5 text-ink-muted hover:border-ink text-xs">
                        <span>{u!.avatar}</span><span>{u!.displayName.split(' ')[0]}</span>
                      </Link>
                    ))}
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-rule bg-paper-dark px-4 py-4">
                    {(['side1', 'side2', 'draw'] as VoteChoice[]).map((choice) => {
                      const label = choice === 'side1' ? (debate.side1Label ?? 'Side 1') : choice === 'side2' ? (debate.side2Label ?? 'Side 2') : 'Draw';
                      return (
                        <div key={choice} className="mb-3">
                          <div className="flex justify-between text-xs text-ink-muted mb-1">
                            <span className="font-bold uppercase tracking-wide">{label}{myVote?.choice === choice && <span className="text-press ml-1">(you)</span>}</span>
                            <span className="font-mono">{getVotePct(choice)}%</span>
                          </div>
                          <div className="h-2 bg-paper border border-rule/50">
                            <div className="h-full bg-masthead transition-all duration-500" style={{ width: `${getVotePct(choice)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {!myVote ? (
                      <div className="flex gap-2 mt-3">
                        {([
                          { choice: 'side1' as VoteChoice, label: debate.side1Label ?? 'Side 1' },
                          { choice: 'side2' as VoteChoice, label: debate.side2Label ?? 'Side 2' },
                          { choice: 'draw' as VoteChoice, label: 'Draw' },
                        ]).map(({ choice, label }) => (
                          <button key={choice} onClick={() => castVote(debate.id, choice)} className="flex-1 border border-rule bg-paper-dark py-2 text-[10px] font-bold text-ink uppercase tracking-wider hover:bg-nav-bg hover:border-masthead transition-colors">{label}</button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-[10px] font-bold uppercase tracking-wider text-ink-faint mt-2">Vote submitted ✓</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {debates.filter((d) => d.status === 'resolved').length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mt-2 border-b border-rule pb-1">Archived</p>
              {debates.filter((d) => d.status === 'resolved').map((debate) => {
                const winnerLabel = debate.resolution === 'side1' ? (debate.side1Label ?? 'Side 1') : debate.resolution === 'side2' ? (debate.side2Label ?? 'Side 2') : null;
                return (
                  <div key={debate.id} className="border border-rule/50 bg-paper/60 px-4 py-4 opacity-70">
                    <p className="text-sm text-ink mb-2 line-clamp-2 italic">&ldquo;{debate.claim}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <Trophy size={12} className="text-rule-dark" />
                      <span className="text-[11px] font-bold text-ink uppercase tracking-wide">{winnerLabel ?? 'Draw'} won</span>
                      <span className="ml-auto text-[10px] text-ink-faint font-mono">{timeAgo(debate.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {debates.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">⚔️</p>
              <p className="font-display font-bold text-ink text-lg">No debates yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Start one in the chat</p>
            </div>
          )}
        </div>
      )}

      {/* ── BETS TAB ─────────────────────────────────────────── */}
      {activeTab === 'bets' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-6 bg-paper">
          {bets.filter((b) => b.status !== 'resolved').map((bet) => {
            const participants = bet.participantIds.map((pid) => resolveUser(pid)).filter(Boolean);
            const isMine = bet.participantIds.includes(myUid);
            const myProposalPending = bet.status === 'awaiting-resolution' && bet.proposal?.proposedBy !== myUid && !bet.proposal?.agreements.includes(myUid);
            const expanded = expandedBet === bet.id;
            const statusIcon = { pending: Clock, active: CheckCircle, 'awaiting-resolution': AlertCircle, resolved: CheckCircle, disputed: AlertCircle }[bet.status];
            const StatusIcon = statusIcon;
            const statusColor = { pending: 'text-ink-faint', active: 'text-field', 'awaiting-resolution': 'text-rule-dark', resolved: 'text-ink-faint', disputed: 'text-masthead' }[bet.status];

            return (
              <div key={bet.id} className="border border-rule overflow-hidden">
                <button onClick={() => setExpandedBet(expanded ? null : bet.id)} className="w-full text-left px-4 py-4 bg-paper hover:bg-paper-dark transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Handshake size={12} className="text-field" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-field">Bet</span>
                    <div className={`ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${statusColor}`}><StatusIcon size={10} />{bet.status}</div>
                  </div>
                  <p className="text-sm text-ink font-medium mb-3 leading-snug italic">&ldquo;{bet.claim}&rdquo;</p>
                  {bet.side1Ids && bet.side2Ids ? (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-navy mb-1">{bet.side1Label ?? 'Side 1'}</p>
                        <div className="flex flex-wrap gap-1">
                          {bet.side1Ids.map((uid) => { const u = resolveUser(uid); return u ? (
                            <Link key={uid} href={`/users/${uid}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 border border-rule px-2 py-0.5 text-xs text-ink-muted hover:border-ink bg-paper-dark">
                              <span>{typeof u.avatar === 'string' && u.avatar.startsWith('http') ? <img src={u.avatar} alt="" className="h-4 w-4 rounded-full object-cover" /> : u.avatar}</span><span>{u.displayName.split(' ')[0]}</span>
                            </Link>
                          ) : null; })}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-field mb-1">{bet.side2Label ?? 'Side 2'}</p>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {bet.side2Ids.map((uid) => { const u = resolveUser(uid); return u ? (
                            <Link key={uid} href={`/users/${uid}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 border border-rule px-2 py-0.5 text-xs text-ink-muted hover:border-ink bg-paper-dark">
                              <span>{typeof u.avatar === 'string' && u.avatar.startsWith('http') ? <img src={u.avatar} alt="" className="h-4 w-4 rounded-full object-cover" /> : u.avatar}</span><span>{u.displayName.split(' ')[0]}</span>
                            </Link>
                          ) : null; })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      {participants.map((p, i) => (
                        <span key={p!.id} className="flex items-center gap-1">
                          {i > 0 && <span className="text-ink-faint text-xs">🤝</span>}
                          <Link href={`/users/${p!.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 border border-rule px-2 py-0.5 text-xs text-ink-muted hover:border-ink bg-paper-dark">
                            <span>{p!.avatar}</span><span>{p!.displayName.split(' ')[0]}</span>
                          </Link>
                        </span>
                      ))}
                    </div>
                  )}
                  {bet.stakes && (
                    <p className="text-[10px] text-ink-muted italic border-t border-rule/40 pt-2 mt-1">
                      Stakes: <span className="font-bold text-ink">{bet.stakes}</span>
                    </p>
                  )}
                  <p className="text-[10px] text-ink-faint font-mono mt-2">{timeAgo(bet.createdAt)}</p>
                  {bet.status === 'awaiting-resolution' && bet.proposal && (
                    <div className="mt-3 border border-rule-dark/40 bg-paper-dark px-3 py-2 rounded-lg">
                      <p className="text-xs text-ink-muted">
                        <span className="font-bold">{resolveUser(bet.proposal.proposedBy)?.displayName}</span> proposed:{' '}
                        <span className="font-bold text-ink">{bet.proposal.isPush ? 'Push' : (() => {
                          const wId = bet.proposal!.winnerId ?? '';
                          if (bet.side1Ids?.includes(wId)) return `${bet.side1Label ?? 'Side 1'} Won`;
                          if (bet.side2Ids?.includes(wId)) return `${bet.side2Label ?? 'Side 2'} Won`;
                          return `${resolveUser(wId)?.displayName} Won`;
                        })()}</span>
                      </p>
                      <p className="text-[10px] text-ink-faint mt-0.5">{bet.proposal.agreements.length}/{bet.participantIds.length} agreed</p>
                    </div>
                  )}
                </button>
                {expanded && isMine && bet.status === 'active' && (
                  <div className="border-t border-rule bg-paper-dark px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">Propose resolution — all parties must agree</p>
                    <div className="flex flex-col gap-2">
                      {bet.side1Ids && bet.side2Ids ? (
                        <>
                          <button onClick={() => proposeResolution(bet.id, bet.side1Ids![0])} className="w-full flex items-center justify-center gap-2 bg-navy px-4 py-3 text-sm font-bold text-ink hover:bg-navy/80 transition-colors rounded-lg">
                            {bet.side1Label ?? 'Side 1'} Won
                          </button>
                          <button onClick={() => proposeResolution(bet.id, bet.side2Ids![0])} className="w-full flex items-center justify-center gap-2 bg-field px-4 py-3 text-sm font-bold text-ink hover:bg-field/80 transition-colors rounded-lg">
                            {bet.side2Label ?? 'Side 2'} Won
                          </button>
                        </>
                      ) : (
                        participants.map((p) => (
                          <button key={p!.id} onClick={() => proposeResolution(bet.id, p!.id)} className="w-full flex items-center gap-2 bg-field px-4 py-3 text-sm font-bold text-ink hover:bg-field/80 transition-colors rounded-lg">
                            <span>{p!.avatar}</span><span>{p!.displayName} Won</span>
                          </button>
                        ))
                      )}
                      <button onClick={() => proposeResolution(bet.id, null)} className="w-full border border-rule bg-paper px-4 py-3 text-sm font-semibold text-ink-muted hover:bg-paper-dark transition-colors uppercase tracking-wider rounded-lg">Push — No Winner</button>
                    </div>
                  </div>
                )}
                {expanded && bet.status === 'awaiting-resolution' && bet.proposal?.proposedBy === 'me' && (
                  <div className="border-t border-rule bg-paper-dark px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">You proposed this resolution</p>
                    <button onClick={() => cancelProposal(bet.id)} className="w-full border border-masthead/40 bg-masthead/10 px-4 py-2.5 text-sm font-bold text-masthead hover:bg-masthead/20 transition-colors rounded-lg">
                      ✕ Cancel Proposal
                    </button>
                  </div>
                )}
                {expanded && myProposalPending && (
                  <div className="border-t border-rule bg-paper-dark px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">Do you agree with this resolution?</p>
                    <div className="flex gap-2">
                      <button onClick={() => agreeResolution(bet.id)} className="flex-1 bg-field py-2.5 text-sm font-bold text-ink hover:bg-field/80 transition-colors rounded-lg">✓ Agree</button>
                      <button className="flex-1 border border-masthead/40 bg-masthead/10 py-2.5 text-sm font-bold text-masthead rounded-lg">✗ Dispute</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {bets.filter((b) => b.status === 'resolved').length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mt-2 border-b border-rule pb-1">Archived</p>
              {bets.filter((b) => b.status === 'resolved').map((bet) => {
                const winner = bet.winnerId ? resolveUser(bet.winnerId) : null;
                return (
                  <div key={bet.id} className="border border-rule/50 bg-paper/60 px-4 py-4 opacity-70">
                    <p className="text-sm text-ink mb-2 line-clamp-2 italic">&ldquo;{bet.claim}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <Trophy size={12} className="text-rule-dark" />
                      <span className="text-[11px] font-bold text-ink uppercase tracking-wide">{bet.isPush ? 'Push' : `${winner?.displayName} won`}</span>
                      <span className="ml-auto text-[10px] text-ink-faint font-mono">{timeAgo(bet.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {bets.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">🤝</p>
              <p className="font-display font-bold text-ink text-lg">No bets yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Make one in the chat</p>
            </div>
          )}
        </div>
      )}

      {/* ── HOT TAKES TAB ────────────────────────────────────── */}
      {activeTab === 'hot-takes' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-6 bg-paper">
          {hotTakes.map((ht) => {
            const author = resolveUser(ht.authorId);
            const isMe = ht.authorId === 'me';
            const fireR = ht.reactions.find((r) => r.emoji === '🔥');
            const iceR  = ht.reactions.find((r) => r.emoji === '❄️');
            const fireCount = fireR?.userIds.length ?? 0;
            const iceCount  = iceR?.userIds.length  ?? 0;
            const myFire = fireR?.userIds.includes('me') ?? false;
            const myIce  = iceR?.userIds.includes('me')  ?? false;
            const total  = fireCount + iceCount;
            const hotPct = total > 0 ? Math.round((fireCount / total) * 100) : null;
            const htComments = ht.comments ?? [];
            const showingComments = showCommentsFor === ht.id;
            return (
              <div key={ht.id} className="border border-rule overflow-hidden">
                <div className="border-l-4 border-l-[#f97316] px-4 pt-4 pb-3 bg-paper">
                  <div className="flex items-center gap-2 mb-3">
                    <Link href={`/users/${ht.authorId}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base hover:border-ink transition-all">
                      {isMe ? ME.avatar : author?.avatar}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/users/${ht.authorId}`} className="text-sm font-bold text-ink hover:text-masthead transition-colors block">
                        {isMe ? 'You' : author?.displayName}
                      </Link>
                      <p className="text-[10px] text-ink-faint font-mono">{timeAgo(ht.createdAt)}</p>
                    </div>
                    {!ht.isPublic && (
                      <button
                        onClick={() => publishToStreets(ht.id)}
                        className="flex items-center gap-1 border border-rule/60 px-2.5 py-1 text-[10px] font-bold text-ink-muted hover:border-press hover:text-press transition-colors rounded-full shrink-0"
                      >
                        <Megaphone size={10} /> Streets
                      </button>
                    )}
                    {ht.isPublic && (
                      <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-press rounded-full border border-press/40 bg-press/5 shrink-0">
                        <Megaphone size={10} /> Live
                      </span>
                    )}
                  </div>
                  <p className="font-display text-base font-bold text-ink leading-snug italic">&ldquo;{ht.content}&rdquo;</p>
                </div>
                <div className="border-t border-rule/50 px-4 py-2.5 flex items-center gap-2 bg-paper-dark">
                  <button
                    onClick={() => voteHotTake(ht.id, '🔥')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all btn-3d ${
                      myFire ? 'bg-[#f97316] text-white' : 'bg-paper border border-rule text-ink-muted hover:border-[#f97316] hover:text-[#f97316]'
                    }`}
                  >
                    <Flame size={14} />
                    {fireCount > 0 && <span className="text-xs">{fireCount}</span>}
                  </button>
                  <button
                    onClick={() => voteHotTake(ht.id, '❄️')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all btn-3d ${
                      myIce ? 'bg-[#38bdf8] text-white' : 'bg-paper border border-rule text-ink-muted hover:border-[#38bdf8] hover:text-[#38bdf8]'
                    }`}
                  >
                    <Snowflake size={14} />
                    {iceCount > 0 && <span className="text-xs">{iceCount}</span>}
                  </button>
                  {hotPct !== null && (
                    <span className="text-[10px] font-bold font-mono text-ink-faint">{hotPct}% hot</span>
                  )}
                  <button
                    onClick={() => { setShowCommentsFor(showingComments ? null : ht.id); setCommentText(''); setMentionQuery(''); }}
                    className="ml-auto flex items-center gap-1 text-[10px] font-bold text-ink-muted hover:text-ink transition-colors"
                  >
                    <MessageSquare size={12} />
                    {htComments.length > 0 ? htComments.length : 'Reply'}
                    {showingComments ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>
                </div>
                {showingComments && (
                  <div className="border-t border-rule/30 bg-paper-dark px-4 py-3 flex flex-col gap-3">
                    {htComments.map((c) => {
                      const commenter = resolveUser(c.userId);
                      return (
                        <div key={c.id} className="flex gap-2">
                          <Link href={`/users/${c.userId}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-paper border border-rule text-sm shrink-0 hover:border-ink">
                            {c.userId === 'me' ? ME.avatar : commenter?.avatar}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5 mb-0.5">
                              <Link href={`/users/${c.userId}`} className="text-[11px] font-bold text-ink hover:text-masthead">
                                {c.userId === 'me' ? 'You' : commenter?.displayName}
                              </Link>
                              <span className="text-[9px] text-ink-faint font-mono">{timeAgo(c.timestamp)}</span>
                            </div>
                            <p className="text-xs text-ink leading-relaxed">{c.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="relative">
                      {mentionQuery && mentionMatches.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-1 bg-paper border border-rule shadow-xl rounded-xl overflow-hidden z-10 w-48">
                          {mentionMatches.map((u) => (
                            <button key={u!.id} onClick={() => insertMention(u!.username)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-paper-dark transition-colors text-left">
                              <span className="text-base">{u!.avatar}</span>
                              <div>
                                <p className="text-xs font-bold text-ink">{u!.displayName}</p>
                                <p className="text-[10px] text-ink-faint">@{u!.username}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper border border-rule text-sm shrink-0">
                          {ME.avatar}
                        </div>
                        <input
                          ref={commentInputRef}
                          value={showCommentsFor === ht.id ? commentText : ''}
                          onChange={(e) => handleCommentInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addComment(ht.id)}
                          placeholder="Reply… (@ to mention)"
                          className="flex-1 bg-paper border border-rule px-3 py-1.5 text-xs text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors rounded-full"
                        />
                        <button
                          onClick={() => addComment(ht.id)}
                          disabled={!commentText.trim()}
                          className="flex h-7 w-7 items-center justify-center bg-nav-bg text-ink rounded-full hover:bg-nav-bg/80 disabled:opacity-40 transition-colors shrink-0"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {hotTakes.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display text-4xl mb-2 text-ink-faint">🔥</p>
              <p className="font-display font-bold text-ink text-lg">No hot takes yet</p>
              <p className="text-sm text-ink-muted italic mt-1">Drop one in the chat</p>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYSTS TAB ─────────────────────────────────────── */}
      {activeTab === 'analysis' && (
        <div className="flex-1 overflow-y-auto flex flex-col bg-paper">
          {/* Compose button */}
          <div className="px-4 py-3 border-b border-rule bg-paper-dark flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">Fan Analysis</p>
            <button
              onClick={() => setShowAnalysisForm(!showAnalysisForm)}
              className="flex items-center gap-1.5 bg-nav-bg text-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-nav-bg/80 transition-colors"
            >
              <PenLine size={11} /> Write Piece
            </button>
          </div>

          {/* Compose form */}
          {showAnalysisForm && (
            <div className="px-4 py-4 border-b border-rule bg-paper-dark flex flex-col gap-3">
              <input
                value={analysisTitle}
                onChange={(e) => setAnalysisTitle(e.target.value)}
                placeholder="Title your analysis…"
                className="w-full border border-rule bg-paper px-4 py-2.5 text-sm font-bold text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors rounded-lg"
              />
              <textarea
                value={analysisBody}
                onChange={(e) => setAnalysisBody(e.target.value)}
                placeholder="Write your analysis here. Break down what you saw, back it up with what you know…"
                rows={5}
                className="w-full border border-rule bg-paper px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors resize-none rounded-lg leading-relaxed"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowAnalysisForm(false); setAnalysisTitle(''); setAnalysisBody(''); }}
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted border border-rule rounded-full hover:bg-paper-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAnalysis}
                  disabled={!analysisTitle.trim() || !analysisBody.trim()}
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-nav-bg text-ink rounded-full hover:bg-nav-bg/80 disabled:opacity-40 transition-colors"
                >
                  Publish
                </button>
              </div>
            </div>
          )}

          {/* Analysis cards */}
          <div className="flex flex-col gap-4 px-4 py-4 pb-6">
            {analyses.map((an) => {
              const author = resolveUser(an.authorId);
              const isMe = an.authorId === 'me';
              const anComments = an.comments ?? [];
              const showingComments = showAnalystCommentsFor === an.id;

              return (
                <div key={an.id} className="border border-rule overflow-hidden">
                  <div className="border-l-4 border-l-ink-muted px-4 pt-4 pb-3 bg-paper">
                    {/* Author row */}
                    <div className="flex items-center gap-2 mb-3">
                      <Link href={`/users/${an.authorId}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark border border-rule text-base hover:border-ink transition-all shrink-0">
                        {isMe ? ME.avatar : author?.avatar}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/users/${an.authorId}`} className="text-sm font-bold text-ink hover:text-masthead transition-colors block">
                          {isMe ? 'You' : author?.displayName}
                        </Link>
                        <p className="text-[10px] text-ink-faint font-mono">{timeAgo(an.createdAt)}</p>
                      </div>
                      {!an.isPublic && (
                        <button
                          onClick={() => publishAnalysisToStreets(an.id)}
                          className="flex items-center gap-1 border border-rule/60 px-2.5 py-1 text-[10px] font-bold text-ink-muted hover:border-press hover:text-press transition-colors rounded-full shrink-0"
                        >
                          <Megaphone size={10} /> Streets
                        </button>
                      )}
                      {an.isPublic && (
                        <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-press rounded-full border border-press/40 bg-press/5 shrink-0">
                          <Megaphone size={10} /> Live
                        </span>
                      )}
                    </div>
                    {/* Title + Content — tap to read full article */}
                    <Link href={`/analyses/${an.id}`} className="block group">
                      <h3 className="font-display text-base font-bold text-ink leading-snug mb-2 group-hover:text-masthead transition-colors">{an.title}</h3>
                      <p className="text-sm text-ink-muted leading-relaxed line-clamp-4">{an.content}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-press mt-2">Full analysis →</p>
                    </Link>
                  </div>
                  {/* Footer */}
                  <div className="border-t border-rule/50 px-4 py-2.5 flex items-center gap-2 bg-paper-dark">
                    <PenLine size={11} className="text-ink-faint" />
                    <span className="text-[10px] text-ink-faint uppercase tracking-widest font-bold">Analysis</span>
                    <button
                      onClick={() => { setShowAnalystCommentsFor(showingComments ? null : an.id); setAnalystCommentText(''); setAnalystMentionQuery(''); }}
                      className="ml-auto flex items-center gap-1 text-[10px] font-bold text-ink-muted hover:text-ink transition-colors"
                    >
                      <MessageSquare size={12} />
                      {anComments.length > 0 ? anComments.length : 'Discuss'}
                      {showingComments ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </button>
                  </div>
                  {/* Comments */}
                  {showingComments && (
                    <div className="border-t border-rule/30 bg-paper-dark px-4 py-3 flex flex-col gap-3">
                      {anComments.map((c) => {
                        const commenter = resolveUser(c.userId);
                        return (
                          <div key={c.id} className="flex gap-2">
                            <Link href={`/users/${c.userId}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-paper border border-rule text-sm shrink-0 hover:border-ink">
                              {c.userId === 'me' ? ME.avatar : commenter?.avatar}
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5 mb-0.5">
                                <Link href={`/users/${c.userId}`} className="text-[11px] font-bold text-ink hover:text-masthead">
                                  {c.userId === 'me' ? 'You' : commenter?.displayName}
                                </Link>
                                <span className="text-[9px] text-ink-faint font-mono">{timeAgo(c.timestamp)}</span>
                              </div>
                              <p className="text-xs text-ink leading-relaxed">{c.content}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div className="relative">
                        {analystMentionQuery && analystMentionMatches.length > 0 && (
                          <div className="absolute bottom-full left-0 mb-1 bg-paper border border-rule shadow-xl rounded-xl overflow-hidden z-10 w-48">
                            {analystMentionMatches.map((u) => (
                              <button key={u!.id} onClick={() => insertAnalystMention(u!.username)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-paper-dark transition-colors text-left">
                                <span className="text-base">{u!.avatar}</span>
                                <div>
                                  <p className="text-xs font-bold text-ink">{u!.displayName}</p>
                                  <p className="text-[10px] text-ink-faint">@{u!.username}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper border border-rule text-sm shrink-0">
                            {ME.avatar}
                          </div>
                          <input
                            ref={analystCommentInputRef}
                            value={showAnalystCommentsFor === an.id ? analystCommentText : ''}
                            onChange={(e) => handleAnalystCommentInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addAnalystComment(an.id)}
                            placeholder="Discuss… (@ to mention)"
                            className="flex-1 bg-paper border border-rule px-3 py-1.5 text-xs text-ink placeholder-ink-faint outline-none focus:border-ink transition-colors rounded-full"
                          />
                          <button
                            onClick={() => addAnalystComment(an.id)}
                            disabled={!analystCommentText.trim()}
                            className="flex h-7 w-7 items-center justify-center bg-nav-bg text-ink rounded-full hover:bg-nav-bg/80 disabled:opacity-40 transition-colors shrink-0"
                          >
                            <Send size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {analyses.length === 0 && !showAnalysisForm && (
              <div className="text-center py-16">
                <p className="font-display text-4xl mb-2 text-ink-faint">📊</p>
                <p className="font-display font-bold text-ink text-lg">No analyses yet</p>
                <p className="text-sm text-ink-muted italic mt-1">Be the first to write a breakdown</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BET SETUP MODAL ──────────────────────────────────── */}
      {betSetupClaim !== null && (
        <BetSetupModal
          claim={betSetupClaim}
          members={members.filter(Boolean) as NonNullable<typeof members[0]>[]}
          onConfirm={confirmBetSetup}
          onCancel={() => { setBetSetupClaim(null); setBetSetupMessageId(null); }}
        />
      )}

      {/* ── DEBATE SETUP MODAL ───────────────────────────────── */}
      {debateSetupClaim !== null && (
        <DebateSetupModal
          initialClaim={debateSetupClaim}
          onConfirm={confirmDebateSetup}
          onCancel={() => { setDebateSetupClaim(null); setDebateSetupMessageId(null); }}
        />
      )}

      {activeTab === 'media' && <MediaTab contextType="neighborhood" contextId={id} />}

      {/* ── Avatar lightbox ──────────────────────────────────── */}
      {expandedAvatar && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setExpandedAvatar(null)}
        >
          <img
            src={expandedAvatar}
            alt=""
            className="max-w-[80vw] max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
