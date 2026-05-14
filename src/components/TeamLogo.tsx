// Logo data is preserved in src/lib/team-logos.ts — re-enable by restoring the logoUrl branch below.
import type { Team } from '@/lib/types';

interface Props {
  team: Team;
  size?: number;
  className?: string;
}

export default function TeamLogo({ team, size = 40, className = '' }: Props) {
  return (
    <span
      className={`flex items-center justify-center ${className}`}
      style={{ fontSize: size * 0.6, lineHeight: 1 }}
    >
      {team.emoji}
    </span>
  );
}
