import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  stroke?: number;
}

const Icon = ({ children, size = 20, color = 'currentColor', stroke = 1.7 }: IconProps & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);

export const IDash    = (p: IconProps) => <Icon {...p}><rect x="3" y="3" width="8" height="10" rx="2"/><rect x="13" y="3" width="8" height="6" rx="2"/><rect x="13" y="11" width="8" height="10" rx="2"/><rect x="3" y="15" width="8" height="6" rx="2"/></Icon>;
export const ICal     = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></Icon>;
export const IUsers   = (p: IconProps) => <Icon {...p}><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="8" r="2.5"/><path d="M21 18c0-2-1.5-3.5-4-3.5"/></Icon>;
export const IDoc     = (p: IconProps) => <Icon {...p}><path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4M8 13h8M8 17h5"/></Icon>;
export const IChat    = (p: IconProps) => <Icon {...p}><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></Icon>;
export const ICash    = (p: IconProps) => <Icon {...p}><rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="12" cy="12" r="2"/></Icon>;
export const ISet     = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.9c.6.5 1.3.9 2 1.2L10 21h4l.5-2.5c.7-.3 1.4-.7 2-1.2l2.4.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/></Icon>;
export const ISearch  = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></Icon>;
export const IBell    = (p: IconProps) => <Icon {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></Icon>;
export const IPlus    = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const IList    = (p: IconProps) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16"/></Icon>;
export const IGrid    = (p: IconProps) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></Icon>;
export const IChevR   = (p: IconProps) => <Icon {...p}><path d="M9 5l7 7-7 7"/></Icon>;
export const IChevL   = (p: IconProps) => <Icon {...p}><path d="M15 5l-7 7 7 7"/></Icon>;
export const IClock   = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
export const IPhone   = (p: IconProps) => <Icon {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></Icon>;
export const ICheck   = (p: IconProps) => <Icon {...p}><path d="M4 12l5 5L20 6"/></Icon>;
export const IX       = (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>;
export const IEdit    = (p: IconProps) => <Icon {...p}><path d="M4 20h4l10-10-4-4L4 16z"/></Icon>;
export const IUp      = (p: IconProps) => <Icon {...p}><path d="M7 17l10-10M7 7h10v10"/></Icon>;
export const IDown    = (p: IconProps) => <Icon {...p}><path d="M7 7l10 10M17 7v10H7"/></Icon>;
export const IGraph   = (p: IconProps) => <Icon {...p}><path d="M3 17l6-6 4 4 8-8M17 7h4v4"/></Icon>;


export function Avatar({ initials, hue = 175, size = 44, rounded = 12 }: { initials: string; hue?: number; size?: number; rounded?: number }) {
  const bg = `linear-gradient(135deg, hsl(${hue} 40% 90%) 0%, hsl(${hue} 35% 78%) 100%)`;
  const fg = `hsl(${hue} 45% 28%)`;
  return (
    <div className="avatar" style={{ width: size, height: size, borderRadius: rounded, background: bg, color: fg, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { label: string; dot: string }> = {
    confirmed: { label: 'Onaylandı', dot: '#17a673' },
    pending:   { label: 'Beklemede', dot: '#d59528' },
    cancelled: { label: 'İptal', dot: '#d9534a' },
    completed: { label: 'Tamamlandı', dot: '#0d7377' },
  };
  const { label, dot } = m[status] || { label: status, dot: '#8a9a9e' };
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" style={{ background: dot }} />
      {label}
    </span>
  );
}
