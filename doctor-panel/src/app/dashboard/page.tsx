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
  patients: { id: string; name: string; phone: string; avatar_hue: number; patient_code: string | null } | null;
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
  patient: { name: string; initials: string; hue: number; phone: string; code: string | null };
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
    patient: { name: patName, initials: toInitials(patName), hue, phone: patPhone, code: row.patients?.patient_code ?? null },
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
        const cnt = apts.filter(a => a.dateKey === k && a.status !== 'completed' && a.status !== 'cancelled').length;
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
    if (s === 'completed') {
      window.location.href = '/results';
    }
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
                {apt.patient.code && (
                  <div style={{ marginTop: 4, display: 'inline-block', background: 'var(--teal-50)', borderRadius: 6, padding: '2px 8px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal-700)', letterSpacing: '0.5px' }}>#{apt.patient.code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-label">Bilgiler</div>
            <div className="kv-grid">
              <div className="kv"><div className="k">Saat</div><div className="v">{apt.time}</div></div>
              <div className="kv"><div className="k">Durum</div><div className="v"><StatusBadge status={apt.status} /></div></div>
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

/* ─── Add Appointment Modal ─── */
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 8).padStart(2, '0'));
const MINS  = ['00', '10', '20', '30', '40', '50'];

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [selH, selM] = value.split(':');

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 12,
          border: '1.5px solid var(--ink-100)', fontSize: 14, fontWeight: 600,
          color: 'var(--ink-900)', background: 'var(--bg)', cursor: 'pointer',
          textAlign: 'left', boxSizing: 'border-box',
        }}
      >
        {value}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100,
          background: 'var(--surface)', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid var(--ink-100)', display: 'flex', overflow: 'hidden',
        }}>
          <div style={{ flex: 1, maxHeight: 200, overflowY: 'auto', borderRight: '1px solid var(--ink-100)' }}>
            {HOURS.map(h => (
              <div key={h} onClick={() => { onChange(`${h}:${selM}`); }}
                style={{
                  padding: '9px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: h === selH ? 'var(--teal-50)' : 'transparent',
                  color: h === selH ? 'var(--teal-700)' : 'var(--ink-700)',
                }}>
                {h}:00
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {MINS.map(m => (
              <div key={m} onClick={() => { onChange(`${selH}:${m}`); setOpen(false); }}
                style={{
                  padding: '9px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: m === selM ? 'var(--teal-50)' : 'transparent',
                  color: m === selM ? 'var(--teal-700)' : 'var(--ink-700)',
                }}>
                :{m}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AddAppointmentModal({ doctor, onClose, onAdded }: {
  doctor: any; onClose: () => void; onAdded: (apt: Apt) => void;
}) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(dateKey(TODAY));
  const [time, setTime] = useState('09:00');
  const [reason, setReason] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingPatient, setExistingPatient] = useState<any>(null);

  useEffect(() => {
    if (!doctor.doctors_id) return;
    supabase.from('doctors').select('price').eq('id', doctor.doctors_id).maybeSingle()
      .then(({ data }) => { if (data?.price) setPrice(data.price); });
  }, [doctor.doctors_id]);

  const lookupPatient = async () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 7) return;
    const { data } = await supabase.from('patients').select('*').eq('phone', clean).maybeSingle();
    if (data) { setExistingPatient(data); setName(data.name); }
    else setExistingPatient(null);
  };

  const handleSubmit = async () => {
    if (!phone || !name || !date || !time) return;
    setSaving(true);

    // Çift randevu kontrolü
    const { data: existingApt } = await supabase
      .from('appointments')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .neq('status', 'cancelled') // iptal edilenler HARİÇ tüm randevuları (bekleyen, onaylanan, tamamlanan) sayalım
      .or(`doctor_registration_id.eq.${doctor.id}${doctor.doctors_id ? `,doctor_id.eq.${doctor.doctors_id}` : ''}`)
      .maybeSingle();

    if (existingApt) {
      alert('Bu tarih ve saatte zaten dolu bir randevu var. Lütfen farklı bir saat seçin.');
      setSaving(false);
      return;
    }

    let patientId = existingPatient?.id;
    if (!patientId) {
      const { data: np, error: npError } = await supabase
        .from('patients')
        .insert({ name, phone: phone.replace(/\D/g, ''), avatar_hue: 175, is_registered: false })
        .select('*').single();
      
      if (npError) {
        console.warn('Geçici hasta oluşturulamadı (RLS engeli olabilir), randevuya isim kaydedilecek:', npError.message);
      } else {
        patientId = np?.id;
      }
    }

    const { data: apt, error } = await supabase
      .from('appointments')
      .insert({
        date, time, duration: 30,
        reason: reason || null,
        price: price ?? 0,
        notes: notes || null,
        status: 'confirmed',
        patient_id: patientId || null,
        patient_name: name, // RLS fail olursa diye yedek isim
        patient_phone: phone.replace(/\D/g, ''), // RLS fail olursa diye yedek numara
        doctor_registration_id: doctor.id,
        doctor_id: doctor.doctors_id || null,
      })
      .select('*, patients(id, name, phone, avatar_hue, patient_code)')
      .single();

    setSaving(false);
    if (error) {
      alert('Randevu oluşturulurken bir hata oluştu.');
      console.error(error);
      return;
    }
    if (apt) { onAdded(mapApt(apt as any)); onClose(); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: '1.5px solid var(--ink-100)', fontSize: 14,
    fontWeight: 500, color: 'var(--ink-900)', outline: 'none',
    background: 'var(--bg)', boxSizing: 'border-box',
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Randevu Ekle</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>Yeni hasta randevusu oluştur</div>
          </div>
          <button className="icon-btn" onClick={onClose}><IX size={18} /></button>
        </div>
        <div className="drawer-body">
          <div className="detail-section">
            <div className="detail-label">Hasta Bilgileri</div>
            <input style={inp} placeholder="Telefon numarası" value={phone}
              onChange={e => { setPhone(e.target.value); setExistingPatient(null); }}
              onBlur={lookupPatient} />
            {existingPatient && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--teal-50)', borderRadius: 10, fontSize: 13, color: 'var(--teal-700)', fontWeight: 600 }}>
                ✓ Kayıtlı hasta: {existingPatient.name}
              </div>
            )}
            <input style={{ ...inp, marginTop: 8 }} placeholder="Ad Soyad"
              value={name} onChange={e => setName(e.target.value)}
              readOnly={!!existingPatient} />
          </div>
          <div className="detail-section">
            <div className="detail-label">Tarih & Saat</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} />
              <TimePicker value={time} onChange={setTime} />
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-label">Muayene Detayları</div>
            <input style={inp} placeholder="Şikayet / Muayene türü" value={reason} onChange={e => setReason(e.target.value)} />
            <div style={{ ...inp, marginTop: 8, color: 'var(--ink-500)', cursor: 'default' }}>
              {price !== null ? `${price.toLocaleString('tr-TR')} IQD` : 'Ücret yükleniyor…'}
            </div>
            <textarea style={{ ...inp, marginTop: 8, resize: 'vertical', minHeight: 72 } as any}
              placeholder="Notlar (isteğe bağlı)" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-outline" onClick={onClose}>İptal</button>
          <button className="btn btn-primary" style={{ flex: 1 }}
            disabled={saving || !phone || !name || !date || !time}
            onClick={handleSubmit}>
            {saving ? 'Kaydediliyor…' : 'Randevu Oluştur'}
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [search] = useState('');

  useEffect(() => {
    if (!doctor) return;
    
    let query = supabase
      .from('appointments')
      .select('*, patients(id, name, phone, avatar_hue, patient_code)');

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
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><IPlus size={16} /> Randevu Ekle</button>
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

      {showAddModal && (
        <AddAppointmentModal
          doctor={doctor}
          onClose={() => setShowAddModal(false)}
          onAdded={(apt) => { setApts(prev => [...prev, apt]); setSelectedDay(apt.date); }}
        />
      )}
    </>
  );
}
