const AVATAR_GRADIENTS: Array<[string, string]> = [
  ['#8B5CF6', '#EC4899'],
  ['#0EA5E9', '#6366F1'],
  ['#F59E0B', '#EF4444'],
  ['#10B981', '#0EA5E9'],
  ['#EC4899', '#F97316'],
  ['#6366F1', '#A855F7'],
];

export function getAvatarStyle(name: string): { background: string; initials: string } {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const [c1, c2] = AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
  const safe = name && name.trim().length > 0 ? name : '?';
  const initials = safe
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
  return { background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`, initials };
}

interface AvatarProps {
  name: string;
  size?: 'row' | 'detail';
}

export function Avatar({ name, size = 'row' }: AvatarProps) {
  const { background, initials } = getAvatarStyle(name);
  const cls = size === 'detail' ? 'au-detail-av' : 'au-client-av';
  return (
    <div className={cls} style={{ background }}>
      {initials}
    </div>
  );
}
