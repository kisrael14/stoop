import { getTeamLogoUrl } from '@/lib/team-logos';
import type { Team } from '@/lib/types';

interface Props {
  team: Team;
  size?: number;
  className?: string;
}

export default function TeamLogo({ team, size = 40, className = '' }: Props) {
  const logoUrl = getTeamLogoUrl(team.id);

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${team.city} ${team.name}`}
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  // Fallback to emoji for MLS and any unmapped teams
  return (
    <span
      className={`flex items-center justify-center ${className}`}
      style={{ fontSize: size * 0.6, lineHeight: 1 }}
    >
      {team.emoji}
    </span>
  );
}
