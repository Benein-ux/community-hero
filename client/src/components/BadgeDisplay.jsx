import { Award, Star, Trophy, Crown, Shield } from 'lucide-react';

const BADGE_CONFIG = {
  "First Step": { icon: Award, color: "#22C55E", bg: "#22C55E10" },
  "Active Citizen": { icon: Star, color: "#FF8A4C", bg: "#FF8A4C10" },
  "Community Champion": { icon: Trophy, color: "#F59E0B", bg: "#F59E0B10" },
  "Civic Hero": { icon: Crown, color: "#A855F7", bg: "#A855F710" },
  "Trusted Voice": { icon: Shield, color: "#7DD4C0", bg: "#7DD4C010" },
};

export default function BadgeDisplay({ badges = [], size = 20, showEmpty = false }) {
  if (!badges.length && !showEmpty) return null;

  return (
    <div className="flex items-center gap-1.5">
      {badges.map((badge) => {
        const config = BADGE_CONFIG[badge];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <span
            key={badge}
            className="inline-flex items-center justify-center rounded-full"
            style={{ width: size, height: size, backgroundColor: config.bg, color: config.color }}
            title={badge}
          >
            <Icon size={size * 0.6} />
          </span>
        );
      })}
    </div>
  );
}
