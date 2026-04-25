'use client';
import { useEffect, useState } from 'react';
import { IDash, ICal, IUsers, IDoc, IChat, ICash, ISet, Avatar } from '@/components/ui/icons';
import { DOCTOR } from '@/data';

const NAV = [
  { href: '/dashboard',    icon: IDash,  label: 'Gösterge Paneli', badge: 3 },
  { href: '/patients',     icon: IUsers, label: 'Hastalar' },
  { href: '/results',      icon: IDoc,   label: 'Sonuçlar' },
  { href: '/profile',      icon: ISet,   label: 'Ayarlar' },
];

export default function Sidebar() {
  const [activePath, setActivePath] = useState('');
  useEffect(() => { setActivePath(window.location.pathname); }, []);

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div>
          <div className="sb-name">tabeebi<span>+</span></div>
          <div className="sb-role">Doktor Paneli</div>
        </div>
      </div>

      <div className="sb-section-label">Menü</div>
      <nav className="sb-nav">
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const isActive = activePath === href || (href !== '/dashboard' && activePath.startsWith(href));
          return (
            <a key={href} href={href} style={{ textDecoration: 'none' }}>
              <button className={`sb-item${isActive ? ' active' : ''}`}>
                <Icon size={18} color="currentColor" />
                {label}
                {badge && <span className="badge-count">{badge}</span>}
              </button>
            </a>
          );
        })}
      </nav>

      <div className="sb-doctor">
        <Avatar initials={DOCTOR.initials} hue={DOCTOR.hue} size={38} rounded={10} />
        <div style={{ overflow: 'hidden' }}>
          <div className="name">{DOCTOR.name}</div>
          <div className="sub">{DOCTOR.specialty}</div>
        </div>
      </div>
    </aside>
  );
}
