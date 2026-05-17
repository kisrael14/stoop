'use client';

/**
 * SQL required:
 *   CREATE TABLE IF NOT EXISTS media_posts (
 *     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *     context_type TEXT NOT NULL CHECK (context_type IN ('neighborhood','team','league')),
 *     context_id TEXT NOT NULL,
 *     type TEXT NOT NULL CHECK (type IN ('photo','link')),
 *     url TEXT NOT NULL,
 *     caption TEXT,
 *     title TEXT,
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   CREATE INDEX IF NOT EXISTS media_posts_context ON media_posts(context_type, context_id);
 *   ALTER TABLE media_posts ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "read media" ON media_posts FOR SELECT USING (true);
 *   CREATE POLICY "insert media" ON media_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
 *
 * Storage: create a public Supabase bucket named "media-posts".
 */

import { useState, useEffect, useRef } from 'react';
import { Camera, Link as LinkIcon } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { timeAgo } from '@/lib/utils';

type MediaPost = {
  id: string;
  author_id: string;
  type: 'photo' | 'link';
  url: string;
  caption: string | null;
  title: string | null;
  created_at: string;
  author?: {
    display_name: string | null;
    username: string | null;
    avatar: string | null;
  };
};

interface Props {
  contextType: 'neighborhood' | 'team' | 'league';
  contextId: string;
}

export default function MediaTab({ contextType, contextId }: Props) {
  const { user: authUser } = useAuth();
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postMode, setPostMode] = useState<'photo' | 'link' | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    supabase
      .from('media_posts')
      .select('*, author:profiles(display_name, username, avatar)')
      .eq('context_type', contextType)
      .eq('context_id', contextId)
      .order('created_at', { ascending: false })
      .then(({ data }: { data: MediaPost[] | null }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, [contextType, contextId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submitPhoto = async () => {
    if (!photoFile || !authUser || !isSupabaseConfigured()) return;
    setUploading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    const ext = photoFile.name.split('.').pop() ?? 'jpg';
    const path = `${contextType}/${contextId}/${Date.now()}.${ext}`;
    const { data: up, error: upErr } = await supabase.storage
      .from('media-posts')
      .upload(path, photoFile, { upsert: false });
    if (upErr || !up) { setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('media-posts').getPublicUrl(up.path);
    const url = urlData?.publicUrl;
    if (!url) { setUploading(false); return; }
    const { data: post } = await supabase
      .from('media_posts')
      .insert({ author_id: authUser.id, context_type: contextType, context_id: contextId, type: 'photo', url, caption: caption.trim() || null, title: null })
      .select('*, author:profiles(display_name, username, avatar)')
      .single();
    if (post) setPosts((prev) => [post, ...prev]);
    setPhotoFile(null);
    setPhotoPreview(null);
    setCaption('');
    setPostMode(null);
    setUploading(false);
  };

  const submitLink = async () => {
    if (!linkUrl.trim() || !authUser || !isSupabaseConfigured()) return;
    setUploading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;
    const { data: post } = await supabase
      .from('media_posts')
      .insert({ author_id: authUser.id, context_type: contextType, context_id: contextId, type: 'link', url: linkUrl.trim(), caption: caption.trim() || null, title: linkTitle.trim() || null })
      .select('*, author:profiles(display_name, username, avatar)')
      .single();
    if (post) setPosts((prev) => [post, ...prev]);
    setLinkUrl('');
    setLinkTitle('');
    setCaption('');
    setPostMode(null);
    setUploading(false);
  };

  const cancelPost = () => {
    setPostMode(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setLinkUrl('');
    setLinkTitle('');
    setCaption('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-paper flex flex-col">

      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-rule bg-paper-dark flex items-center gap-2 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint flex-1">Media</p>
        <button
          type="button"
          onClick={() => setPostMode(postMode === 'photo' ? null : 'photo')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-colors ${
            postMode === 'photo'
              ? 'border-masthead text-masthead bg-masthead/10'
              : 'border-rule text-ink-faint hover:border-ink-muted hover:text-ink'
          }`}
        >
          <Camera size={11} /> Photo
        </button>
        <button
          type="button"
          onClick={() => setPostMode(postMode === 'link' ? null : 'link')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-colors ${
            postMode === 'link'
              ? 'border-field text-field bg-field/10'
              : 'border-rule text-ink-faint hover:border-ink-muted hover:text-ink'
          }`}
        >
          <LinkIcon size={11} /> Link
        </button>
      </div>

      {/* Photo upload form */}
      {postMode === 'photo' && (
        <div className="px-4 py-4 border-b border-rule bg-paper-dark flex flex-col gap-3 shrink-0">
          <label className="block cursor-pointer">
            <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
              photoPreview ? 'border-masthead/40 h-52' : 'border-rule hover:border-masthead h-28'
            }`}>
              {photoPreview
                ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                : <><Camera size={22} className="text-ink-faint" /><span className="text-xs text-ink-faint">Tap to select a photo</span></>
              }
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
          {photoPreview && (
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption…"
              className="w-full border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-masthead rounded-lg transition-colors"
            />
          )}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={cancelPost} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted border border-rule rounded-full hover:bg-paper transition-colors">Cancel</button>
            <button type="button" onClick={submitPhoto} disabled={!photoFile || uploading}
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-masthead text-[#12111a] rounded-full disabled:opacity-40 transition-colors btn-3d">
              {uploading ? 'Uploading…' : 'Post Photo'}
            </button>
          </div>
        </div>
      )}

      {/* Link post form */}
      {postMode === 'link' && (
        <div className="px-4 py-4 border-b border-rule bg-paper-dark flex flex-col gap-3 shrink-0">
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste URL…"
            type="url"
            className="w-full border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-field rounded-lg transition-colors"
          />
          <input
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Title (optional)…"
            className="w-full border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-field rounded-lg transition-colors"
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Comment (optional)…"
            className="w-full border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-field rounded-lg transition-colors"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={cancelPost} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted border border-rule rounded-full hover:bg-paper transition-colors">Cancel</button>
            <button type="button" onClick={submitLink} disabled={!linkUrl.trim() || uploading}
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-field text-[#12111a] rounded-full disabled:opacity-40 transition-colors btn-3d">
              {uploading ? 'Posting…' : 'Post Link'}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-ink-faint text-sm italic">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-4xl mb-2 text-ink-faint">📸</p>
          <p className="font-display font-bold text-ink text-lg">No media yet</p>
          <p className="text-sm text-ink-muted italic mt-1">Share photos and links</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {posts.map((post) => {
            const authorName = post.author?.display_name ?? post.author?.username ?? 'Unknown';
            const av = post.author?.avatar;
            const avatarEl = av && av.startsWith('http')
              ? <img src={av} alt="" className="w-full h-full object-cover" />
              : <span className="text-xs">{av ?? authorName.slice(0, 1).toUpperCase()}</span>;

            if (post.type === 'photo') {
              return (
                <div key={post.id} className="border border-rule rounded-lg overflow-hidden">
                  <img src={post.url} alt={post.caption ?? ''} className="w-full object-cover max-h-80" />
                  <div className="px-3 py-2.5 bg-paper-dark flex flex-col gap-1">
                    {post.caption && <p className="text-xs text-ink leading-relaxed">{post.caption}</p>}
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-paper border border-rule overflow-hidden shrink-0">{avatarEl}</div>
                      <span className="text-[10px] font-semibold text-ink-faint">{authorName}</span>
                      <span className="text-[10px] text-ink-faint font-mono ml-auto">{timeAgo(post.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-rule rounded-lg overflow-hidden block hover:bg-paper-dark transition-colors"
              >
                <div className="px-4 py-3 border-l-4 border-l-field bg-paper">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <LinkIcon size={10} className="text-field shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-field">Link</span>
                    <span className="text-[10px] text-ink-faint font-mono ml-auto">{timeAgo(post.created_at)}</span>
                  </div>
                  {post.title && <p className="text-sm font-bold text-ink mb-0.5 leading-tight">{post.title}</p>}
                  <p className="text-[11px] text-field/70 truncate">{post.url}</p>
                  {post.caption && <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">{post.caption}</p>}
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-rule/40">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-paper-dark border border-rule overflow-hidden shrink-0">{avatarEl}</div>
                    <span className="text-[10px] text-ink-faint">{authorName}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
