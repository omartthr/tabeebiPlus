'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRequireDoctor } from '@/hooks/useDoctor';
import { supabase } from '@/lib/supabase';
import {
  TODAY, TR_DAYS_SHORT, TR_DAYS_LONG, TR_MONTHS_LONG,
  fmtDateLong, dateKey, addDays,
} from '@/data';
import {
  ICal, IList, IGrid, IPlus, IBell,
  IX, IChevR,
  Avatar, StatusBadge,
} from '@/components/ui/icons';
import StatsGrid from '@/components/appointments/StatsGrid';

type AptStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

interface DbAppointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  reason: string | null;
  status: AptStatus;
  notes: string | null;
  price: number;
  patient_name: string | null;
  patient_phone: string | null;
  patients: { id: string; name: string; phone: string; avatar_hue: number } | null;
}

interface Apt {
  id: string;
  date: Date;
  dateKey: string;
  time: string;
  duration: number;
  reason: string;
  status: AptStatus;
  notes: string | null;
  price: number;
  patient: { name: string; initials: string; hue: number; phone: string };
}

function toInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}

function mapApt(row: DbAppointment): Apt {
  const patName = row.patients?.name ?? row.patient_name ?? 'Bilinmeyen';
  const patPhone = row.patients?.phone ?? row.patient_phone ?? '-';
  const hue = row.patients?.avatar_hue ?? 175;
  
  // Handle different date formats (legacy Mon Apr 27 vs new YYYY-MM-DD)
  let d: Date;
  let dk: string;
  
  if (row.date.includes('-')) {
    // Standard format "2026-04-27"
    const [y, m, dayPart] = row.date.split('-').map(Number);
    d = new Date(y, m - 1, dayPart);
    dk = row.date;
  } else if (row.date.includes('Apr') || row.date.includes('Mon')) {
    // Legacy format "Mon Apr 27" -> assume 2026
    d = new Date(row.date + ' 2026');
    dk = '2026-04-27';
  } else {
    d = new Date(row.date);
    dk = row.date;
  }

  return {
    id: row.id,
    date: d,
    dateKey: dk,
    time: row.time,
    duration: row.duration ?? 30,
    reason: row.reason ?? '-',
    status: row.status,
    notes: row.notes,
    price: row.price ?? 0,
    patient: { name: patName, initials: toInitials(patName), hue, phone: patPhone },
  };
}

const WEEK: Date[] = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i));

/* ─── DayStrip ─── */
function DayStrip({ selected, onSelect, apts }: {
  selected: Date; onSelect: (d: Date) => void; apts: Apt[];
}) {
  const todayKey = dateKey(TODAY);
  const selKey   = dateKey(selected);
  return (
    <div className="day-strip">
      {WEEK.map(day => {
        const k   = dateKey(day);
        const dow = (day.getDay() + 6) % 7;
        const cnt = apts.filter(a => a.dateKey === k).length;
        return (
          <button
            key={k}
            className={`day-pill${k === selKey ? ' active' : ''}${k === todayKey ? ' today' : ''}`}
            onClick={() => onSelect(day)}
          >
            <span className="dow">{TR_DAYS_SHORT[dow]}</span>
            <span className="date">{day.getDate()}</span>
            {cnt > 0 && <span className="count">{cnt}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ─── AppointmentList ─── */
function AppointmentList({ appointments, selected, onSelect }: {
  appointments: Apt[]; selected: Apt | null; onSelect: (a: Apt) => void;
}) {
  if (appointments.length === 0) {
    return (
      <div className="empty">
        <div className="ico"><ICal size={28} /></div>
        <div className="ttl">Bu gün randevu yok</div>
        <div className="sub">Başka bir gün seçin veya yeni randevu ekleyin.</div>
      </div>
    );
  }
  return (
    <div className="appt-list">
      {appointments.map(a => (
        <div key={a.id} className={`appt-row${selected?.id === a.id ? ' active' : ''}`} onClick={() => onSelect(a)}>
          <div className="appt-time">
            <span className="t">{a.time}</span>
            <span className="dur">{a.duration} dk</span>
          </div>
          <Avatar initials={a.patient.initials} hue={a.patient.hue} size={44} rounded={12} />
          <div className="appt-info">
            <div className="name">{a.patient.name}</div>
            <div className="reason">{a.reason}</div>
          </div>
          <StatusBadge status={a.status} />
          <IChevR size={16} color="var(--ink-400)" />
        </div>
      ))}
    </div>
  );
}

/* ─── Drawer ─── */
function AppointmentDrawer({ apt, onClose, onStatusChange }: {
  apt: Apt; onClose: () => void; onStatusChange: (id: string, status: AptStatus) => void;
}) {
  const [saving, setSaving] = useState(false);

  const changeStatus = async (s: AptStatus) => {
    setSaving(true);
    await supabase.from('appointments').update({ status: s }).eq('id', apt.id);
    onStatusChange(apt.id, s);
    setSaving(false);
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Randevu Detayı</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>
              {fmtDateLong(apt.date)} · {apt.time}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><IX size={18} /></button>
        </div>
        <div className="drawer-body">
          <div className="detail-section">
            <div className="detail-label">Hasta</div>
            <div className="detail-card">
              <Avatar initials={apt.patient.initials} hue={apt.patient.hue} size={48} rounded={14} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{apt.patient.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 2 }}>{apt.patient.phone}</div>
              </div>
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-label">Durum & Şikayet</div>
            <div className="detail-card amber">
              <StatusBadge status={apt.status} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{apt.reason}</span>
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-label">Bilgiler</div>
            <div className="kv-grid">
              <div className="kv"><div className="k">Saat</div><div className="v">{apt.time}</div></div>
              <div className="kv"><div className="k">Süre</div><div className="v">{apt.duration} dakika</div></div>
              <div className="kv"><div className="k">Ücret</div><div className="v">{apt.price.toLocaleString('tr-TR')} IQD</div></div>
            </div>
          </div>
          {apt.notes && (
            <div className="detail-section">
              <div className="detail-label">Notlar</div>
              <div className="detail-card teal">
                <p style={{ fontSize: 14, color: 'var(--ink-700)', fontWeight: 500, lineHeight: 1.6 }}>{apt.notes}</p>
              </div>
            </div>
          )}
        </div>
        <div className="drawer-foot">
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={saving || apt.status === 'confirmed'} onClick={() => changeStatus('confirmed')}>
            Onayla
          </button>
          <button className="btn btn-outline" disabled={saving || apt.status === 'completed'} onClick={() => changeStatus('completed')}>
            Tamamlandı
          </button>
          <button className="btn btn-danger" disabled={saving || apt.status === 'cancelled'} onClick={() => changeStatus('cancelled')}>
            <IX size={16} /> İptal
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Page ─── */
export default function DashboardPage() {
  const { doctor, loading } = useRequireDoctor();
  const [apts, setApts]     = useState<Apt[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date>(TODAY);
  const [view, setView]     = useState<'list' | 'cal'>('list');
  const [selectedApt, setSelectedApt] = useState<Apt | null>(null);
  const [search] = useState('');

  useEffect(() => {
    if (!doctor) return;
    
    let query = supabase
      .from('appointments')
      .select('*, patients(id, name, phone, avatar_hue)');

    if (doctor.doctors_id) {
      query = query.or(`doctor_registration_id.eq.${doctor.id},doctor_id.eq.${doctor.doctors_id}`);
    } else {
      query = query.eq('doctor_registration_id', doctor.id);
    }

    query.then(({ data }) => {
      setApts((data ?? []).map(mapApt));
      setFetching(false);
    });
  }, [doctor]);

  const handleStatusChange = (id: string, status: AptStatus) => {
    setApts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setSelectedApt(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const todayKey = dateKey(TODAY);
  const todayApts = apts.filter(a => a.dateKey === todayKey);
  const todayStats = {
    total: todayApts.length,
    pending: todayApts.filter(a => a.status === 'pending').length,
    completed: todayApts.filter(a => a.status === 'completed').length,
  };

  const dayApts = useMemo(() => {
    const k = dateKey(selectedDay);
    return apts
      .filter(a => a.dateKey === k && a.status !== 'completed')
      .filter(a => !search || a.patient.name.toLowerCase().includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [apts, selectedDay, search]);

  const todayDow = (TODAY.getDay() + 6) % 7;

  if (loading || !doctor) return null;

  const clinicName = doctor.clinic_name ?? doctor.specialty;

  return (
    <>
      <div className="topbar">
        <div className="greet">
          <h1>Günaydın, {doctor.name} Hk. 👋</h1>
          <div className="sub">
            {TR_DAYS_LONG[todayDow]}, {TODAY.getDate()} {TR_MONTHS_LONG[TODAY.getMonth()]} {TODAY.getFullYear()} · {clinicName}
          </div>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn"><IBell size={18} /><span className="dot" /></button>
          <button className="btn btn-primary"><IPlus size={16} /> Randevu Ekle</button>
        </div>
      </div>

      <StatsGrid
        totalToday={todayStats.total}
        pendingCount={todayStats.pending}
        completedCount={todayStats.completed}
      />

      <div className="panel fade-up">
        <div className="panel-head">
          <div>
            <div className="panel-title">Randevular</div>
            <div className="panel-sub">{fmtDateLong(selectedDay)} · {dayApts.length} aktif randevu</div>
          </div>
          <div className="view-toggle">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><IList size={14} /> Liste</button>
            <button className={view === 'cal' ? 'active' : ''} onClick={() => setView('cal')}><IGrid size={14} /> Takvim</button>
          </div>
        </div>

        <DayStrip selected={selectedDay} onSelect={setSelectedDay} apts={apts} />

        {fetching
          ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-400)' }}>Yükleniyor…</div>
          : <AppointmentList appointments={dayApts} selected={selectedApt} onSelect={setSelectedApt} />
        }
      </div>

      {selectedApt && (
        <AppointmentDrawer apt={selectedApt} onClose={() => setSelectedApt(null)} onStatusChange={handleStatusChange} />
      )}
    </>
  );
}
