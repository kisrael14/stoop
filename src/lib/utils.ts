import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function voteLeader(votes: { choice: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  votes.forEach((v) => {
    counts[v.choice] = (counts[v.choice] || 0) + 1;
  });
  return counts;
}

export function totalReactions(reactions: { userIds: string[] }[]): number {
  return reactions.reduce((sum, r) => sum + r.userIds.length, 0);
}

const EURO_SOCCER_LEAGUES = new Set(['EPL', 'LaLiga', 'SerieA', 'Ligue1', 'Bundesliga']);

export function teamDisplayName(team: { city: string; name: string; league: string }): string {
  return EURO_SOCCER_LEAGUES.has(team.league) ? team.name : `${team.city} ${team.name}`;
}

/** Crop a photo to a square using canvas, respecting a drag-position offset (0–100%). */
export function cropImageToSquare(src: string, posX: number, posY: number, size = 400): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const aspect = img.naturalWidth / img.naturalHeight;
      let srcX: number, srcY: number, srcSize: number;
      if (aspect >= 1) {
        srcSize = img.naturalHeight;
        srcX = (img.naturalWidth - srcSize) * (posX / 100);
        srcY = 0;
      } else {
        srcSize = img.naturalWidth;
        srcX = 0;
        srcY = (img.naturalHeight - srcSize) * (posY / 100);
      }
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], 'avatar.jpg', { type: 'image/jpeg' })),
        'image/jpeg',
        0.92,
      );
    };
    img.src = src;
  });
}
