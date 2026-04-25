'use client';
import React, { useState, useMemo } from 'react';
import { useRequireDoctor } from '@/hooks/useDoctor';
import {
  APPOINTMENTS, DOCTOR, TODAY,
  TR_DAYS_SHORT, TR_DAYS_LONG, TR_MONTHS_LONG,
  fmtDateLong, dateKey, addDays,
  type Appointment,
} from '@/data';
import {
  ICal, IList, IGrid, IPlus, ISearch, IBell,
  IClock, IPhone, ICheck, IX, IEdit, IChevR, IChevL,
  Avatar, StatusBadge,
} from '@/components/ui/icons';
import StatsGrid from '@/components/appointments/StatsGrid';

/* ─── helpers ──────────────────────────────────────── */
const WEEK: Date[] = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i));
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 08-17

function countForDay(day: Date) {
  const k = dateKey(day);
  return APPOINTMENTS.filter(a => a.dateKey === k).length;
}

/* ─── DayStrip ─────────────────────────────────────── */
function DayStrip({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
  const todayKey = dateKey(TODAY);
  const selKey   = dateKey(selected);
  return (
    <div className="day-strip">
      {WEEK.map(day => {
        const k    = dateKey(day);
        const dow  = (day.getDay() + 6) % 7;
        const cnt  = countForDay(day);
        const isActive = k === selKey;
        const isToday  = k === todayKey;
        return (
          <button
            key={k}
            className={`day-pill${isActive ? ' active' : ''}${isToday ? ' today' : ''}`}
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

/* ─── AppointmentList ──────────────────────────────── */
function AppointmentList({
  appointments, selected, onSelect,
}: {
  appointments: Appointment[];
  selected: Appointment | null;
  onSelect: (a: Appointment) => void;
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
        <div
          key={a.id}
          className={`appt-row${selected?.id === a.id ? ' active' : ''}`}
          onClick={() => onSelect(a)}
        >
          <div className="appt-time">
            <span className="t">{a.time}</span>
            <span className="dur">{a.duration} dk</span>
          </div>
          <Avatar initials={a.patient.initials} hue={a.patient.hue} size={44} rounded={12} />
          <div className="appt-info">
            <div className="name">{a.patient.name} <span style={{ color: 'var(--teal-700)', fontSize: '12px', marginLeft: '6px' }}>{(a.patient as any).patientId}</span></div>
            <div className="reason">{a.reason}</div>
          </div>
          <StatusBadge status={a.status} />
          <IChevR size={16} color="var(--ink-400)" />
        </div>
      ))}
    </div>
  );
}

/* ─── CalendarView ─────────────────────────────────── */
function CalendarView({ onSelect }: { onSelect: (a: Appointment) => void }) {
  const todayKey = dateKey(TODAY);
  const CELL_H = 56;
  const START_H = 8;

  return (
    <div className="cal-wrap">
      <div className="cal-grid">
        {/* corner */}
        <div className="cal-corner" />
        {/* day headers */}
        {WEEK.map(day => {
          const dow = (day.getDay() + 6) % 7;
          const k   = dateKey(day);
          return (
            <div key={k} className={`cal-col-head${k === todayKey ? ' today' : ''}`}>
              <div className="cd-day">{TR_DAYS_SHORT[dow]}</div>
              <div className="cd-num">{day.getDate()}</div>
            </div>
          );
        })}

        {/* hour rows */}
        {HOURS.map(h => (
          <React.Fragment key={h}>
            <div className="cal-time">{h}:00</div>
            {WEEK.map(day => {
              const k    = dateKey(day);
              const apts = APPOINTMENTS.filter(a => {
                if (a.dateKey !== k) return false;
                const aH = parseInt(a.time.split(':')[0]);
                return aH === h;
              });
              return (
                <div key={`cell-${k}-${h}`} className="cal-cell">
                  {apts.map(a => {
                    const [aH, aM] = a.time.split(':').map(Number);
                    const top  = ((aH - START_H) * 60 + aM) / 60 * CELL_H - (h - START_H) * CELL_H;
                    const height = Math.max(a.duration / 60 * CELL_H, 28);
                    return (
                      <div
                        key={a.id}
                        className="cal-event"
                        data-status={a.status}
                        style={{ top: Math.max(0, top), height }}
                        onClick={() => onSelect(a)}
                      >
                        <div className="ev-time">{a.time}</div>
                        <div className="ev-name">{a.patient.name}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ─── AppointmentDrawer ────────────────────────────── */
function AppointmentDrawer({ apt, onClose }: { apt: Appointment; onClose: () => void }) {
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
          {/* Patient */}
          <div className="detail-section">
            <div className="detail-label">Hasta</div>
            <div className="detail-card">
              <Avatar initials={apt.patient.initials} hue={apt.patient.hue} size={48} rounded={14} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.2px' }}>{apt.patient.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>
                  {apt.patient.age} yaş · {apt.patient.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Status & reason */}
          <div className="detail-section">
            <div className="detail-label">Durum & Şikayet</div>
            <div className="detail-card amber">
              <StatusBadge status={apt.status} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{apt.reason}</span>
            </div>
          </div>

          {/* KV grid */}
          <div className="detail-section">
            <div className="detail-label">Bilgiler</div>
            <div className="kv-grid">
              <div className="kv">
                <div className="k">Saat</div>
                <div className="v">{apt.time}</div>
              </div>
              <div className="kv">
                <div className="k">Süre</div>
                <div className="v">{apt.duration} dakika</div>
              </div>
              <div className="kv">
                <div className="k">Ücret</div>
                <div className="v">{apt.price.toLocaleString('tr-TR')} IQD</div>
              </div>
              <div className="kv">
                <div className="k">Hasta Kimlik No</div>
                <div className="v">{(apt.patient as any).patientId}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {apt.notes && (
            <div className="detail-section">
              <div className="detail-label">Notlar</div>
              <div className="detail-card teal" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 0 }}>
                <p style={{ fontSize: 14, color: 'var(--ink-700)', fontWeight: 500, lineHeight: 1.6 }}>{apt.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="drawer-foot">
          <button className="btn btn-primary" style={{ flex: 1 }}><ICheck size={16} /> Onayla</button>
          <button className="btn btn-outline"><IEdit size={16} /> Düzenle</button>
          <button className="btn btn-danger"><IX size={16} /> İptal</button>
        </div>
      </div>
    </>
  );
}

/* ─── Page ─────────────────────────────────────────── */
export default function DashboardPage() {
  const { doctor, loading } = useRequireDoctor();
  const [selectedDay, setSelectedDay] = useState<Date>(TODAY);
  const [view, setView]               = useState<'list' | 'cal'>('list');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [search, setSearch]           = useState('');

  const { todayStats, dayApts } = useMemo(() => {
    const k = dateKey(selectedDay);
    const todayK = dateKey(TODAY);
    
    // Stats are always for TODAY
    const forToday = APPOINTMENTS.filter(a => a.dateKey === todayK);
    const stats = {
      total: forToday.length,
      pending: forToday.filter(a => a.status === 'pending').length,
      completed: forToday.filter(a => a.status === 'completed').length,
    };

    // List is for selectedDay, but hide completed
    const list = APPOINTMENTS
      .filter(a => a.dateKey === k)
      .filter(a => a.status !== 'completed') // Hide completed
      .filter(a => search === '' || a.patient.name.toLowerCase().includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.time.localeCompare(b.time));

    return { todayStats: stats, dayApts: list };
  }, [selectedDay, search]);

  const todayDow = (TODAY.getDay() + 6) % 7;

  if (loading || !doctor) return null;

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="greet">
          <h1>Günaydın, {DOCTOR.name.split(' ')[1]} Hk. 👋</h1>
          <div className="sub">
            {TR_DAYS_LONG[todayDow]}, {TODAY.getDate()} {TR_MONTHS_LONG[TODAY.getMonth()]} {TODAY.getFullYear()} · {DOCTOR.clinic}
          </div>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn">
            <IBell size={18} />
            <span className="dot" />
          </button>
          <button className="btn btn-primary"><IPlus size={16} /> Randevu Ekle</button>
        </div>
      </div>

      {/* Summary Stats */}
      <StatsGrid 
        totalToday={todayStats.total}
        pendingCount={todayStats.pending}
        completedCount={todayStats.completed}
      />

      {/* Main Panel */}
      <div className="panel fade-up">
        <div className="panel-head">
          <div>
            <div className="panel-title">Randevular</div>
            <div className="panel-sub">
              {fmtDateLong(selectedDay)} · {dayApts.length} aktif randevu
            </div>
          </div>
          <div className="view-toggle">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <IList size={14} /> Liste
            </button>
            <button className={view === 'cal' ? 'active' : ''} onClick={() => setView('cal')}>
              <IGrid size={14} /> Takvim
            </button>
          </div>
        </div>

        <DayStrip selected={selectedDay} onSelect={setSelectedDay} />

        {view === 'list'
          ? <AppointmentList appointments={dayApts} selected={selectedApt} onSelect={setSelectedApt} />
          : <CalendarView onSelect={setSelectedApt} />
        }
      </div>

      {selectedApt && (
        <AppointmentDrawer apt={selectedApt} onClose={() => setSelectedApt(null)} />
      )}
    </>
  );
}
