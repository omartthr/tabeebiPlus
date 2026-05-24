'use client';
import { useEffect, useState } from 'react';
import { IDash, ICal, IUsers, IDoc, IGraph, ISet, Avatar } from '@/components/ui/icons';
import { getDoctorSession, type DoctorSession } from '@/hooks/useDoctor';
import { getPendingCountAction } from '@/actions/doctorActions';

const NAV = [
  { href: '/dashboard',    icon: IDash,  label: 'Gösterge Paneli', badgeKey: 'pending' },
  { href: '/patients',     icon: IUsers, label: 'Hastalar' },
  { href: '/results',      icon: IDoc,   label: 'Sonuçlar' },
  { href: '/profile',      icon: ISet,   label: 'Ayarlar' },
];

function getInitials(name: string, surname: string) {
  return ((name?.[0] ?? '') + (surname?.[0] ?? '')).toUpperCase();
}

export default function Sidebar() {
  const [activePath, setActivePath] = useState('');
  const [visible, setVisible] = useState(false);
  const [doctor, setDoctor] = useState<DoctorSession | null>(null);
  const [pendingBadge, setPendingBadge] = useState<number | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    setActivePath(path);
    const isPanel = !path.startsWith('/auth') && path !== '/';
    setVisible(isPanel);
    if (isPanel) {
      const doc = getDoctorSession();
      setDoctor(doc);
      if (doc) {
        // Fetch pending count
        getPendingCountAction(doc.id, doc.doctors_id).then(({ count }) => {
          if (count > 0) setPendingBadge(count);
        });
      }
    }
  }, []);

  if (!visible) return null;

  const initials = doctor ? getInitials(doctor.name, doctor.surname) : '?';
  const fullName = doctor ? `Dr. ${doctor.name} ${doctor.surname}` : '';
  const specialty = doctor?.specialty ?? '';

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
        {NAV.map(({ href, icon: Icon, label, badgeKey }) => {
          const isActive = activePath === href || (href !== '/dashboard' && activePath.startsWith(href));
          const displayBadge = badgeKey === 'pending' ? pendingBadge : null;
          return (
            <a key={href} href={href} style={{ textDecoration: 'none' }}>
              <button className={`sb-item${isActive ? ' active' : ''}`}>
                <Icon size={18} color="currentColor" />
                {label}
                {displayBadge && <span className="badge-count">{displayBadge}</span>}
              </button>
            </a>
          );
        })}
      </nav>

      <div className="sb-doctor">
        <Avatar initials={initials} hue={175} size={38} rounded={10} />
        <div style={{ overflow: 'hidden' }}>
          <div className="name">{fullName}</div>
          <div className="sub">{specialty}</div>
        </div>
      </div>
    </aside>
  );
}
