'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRequireDoctor } from '@/hooks/useDoctor';
import { getDashboardAppointments, updateAppointmentStatus, insertNotificationAction, getDoctorScheduleAction, getDoctorPriceAction, lookupPatientAction, checkAppointmentCollisionAction, createTemporaryPatientAction, createAppointmentAction } from '@/actions/doctorActions';
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
import CustomAlert from '@/components/ui/CustomAlert';

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
  patient_id?: string;
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
  patient: { id: string | null; name: string; initials: string; hue: number; phone: string; code: string | null };
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
    patient: { id: row.patients?.id ?? row.patient_id ?? null, name: patName, initials: toInitials(patName), hue, phone: patPhone, code: row.patients?.patient_code ?? null },
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

/* ─── CalendarGrid ─── */
const CAL_HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

function CalendarGrid({ appointments, selectedDay, onSelect, onAddClick }: {
  appointments: Apt[]; selectedDay: Date; onSelect: (a: Apt) => void; onAddClick: (time: string) => void;
}) {
  const now = new Date();
  const isToday = dateKey(selectedDay) === dateKey(TODAY);
  const curHour = now.getHours();

  return (
    <div className="calendar-grid" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
      {CAL_HOURS.map(hourStr => {
        const hourNum = parseInt(hourStr);
        const slotApts = appointments.filter(a => a.time.startsWith(hourStr.split(':')[0] + ':'));
        const isPast = isToday && hourNum < curHour;

        return (
          <div key={hourStr} style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px dashed var(--ink-100)', paddingBottom: 12 }}>
            <div style={{ width: 60, fontSize: 13, fontWeight: 700, color: 'var(--ink-500)' }}>
              {hourStr}
            </div>

            <div style={{ flex: 1, display: 'flex', gap: 12 }}>
              {slotApts.length > 0 ? (
                slotApts.map(a => (
                  <div
                    key={a.id}
                    onClick={() => onSelect(a)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                      background: 'white', border: `1.5px solid ${a.status === 'pending' ? '#d59528' : '#0d7377'}`,
                      borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    <Avatar initials={a.patient.initials} hue={a.patient.hue} size={36} rounded={10} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>{a.patient.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 500 }}>{a.reason}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))
              ) : (
                <button
                  disabled={isPast}
                  onClick={() => onAddClick(hourStr)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    height: 48, background: isPast ? 'var(--ink-50)' : 'white',
                    border: '1.5px dashed var(--ink-200)', borderRadius: 12,
                    fontSize: 12, fontWeight: 700, color: isPast ? 'var(--ink-300)' : 'var(--ink-400)',
                    cursor: isPast ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {isPast ? (
                    'Mesai Saati Geçti'
                  ) : (
                    <>
                      <IPlus size={14} /> Randevu Planla
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Drawer ─── */
function AppointmentDrawer({ apt, onClose, onStatusChange, onReport, doctorName }: {
  apt: Apt; onClose: () => void; onStatusChange: (id: string, status: AptStatus) => void;
  onReport: (apt: Apt) => void; doctorName?: string;
}) {
  const [saving, setSaving] = useState(false);

  const changeStatus = async (s: AptStatus) => {
    setSaving(true);
    await updateAppointmentStatus(apt.id, s);
    
    if (s === 'completed') {
      if (apt.patient.id) {
        console.log('Inserting rating notification for patient:', apt.patient.id);
        const { error: notifErr } = await insertNotificationAction({
          patient_id: apt.patient.id,
          unread: true,
          title: 'Muayeneniz Tamamlandı! ⭐',
          body: `${doctorName || 'Doktorunuz'} ile olan randevunuz tamamlandı. Doktorunuzu değerlendirmek ister misiniz?`,
          type: 'rating',
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          created_at: new Date().toISOString()
        });
        if (notifErr) {
          console.error('Rating notification insert error:', notifErr);
        } else {
          console.log('Rating notification inserted successfully!');
        }
      } else {
        console.warn('Cannot insert notification: patient.id is null. This is likely a manual appointment without a registered patient.');
      }
    }

    onStatusChange(apt.id, s);
    setSaving(false);
    onClose();
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
          {apt.status === 'cancelled' ? (
            <button 
              className="btn btn-danger" 
              style={{ flex: 1 }} 
              onClick={() => {
                onReport(apt);
                onClose();
              }}
            >
              Şikayet Et
            </button>
          ) : (
            <>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={saving || apt.status === 'confirmed'} onClick={() => changeStatus('confirmed')}>
                Onayla
              </button>
              <button className="btn btn-danger" disabled={saving} onClick={() => changeStatus('cancelled')}>
                <IX size={16} /> İptal
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Add Appointment Modal ─── */
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 8).padStart(2, '0'));
const MINS  = ['00', '10', '20', '30', '40', '50'];

function TimePicker({ 
  value, 
  onChange, 
  selectedDate, 
  occupiedTimes = [], 
  allowedHours = [] 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  selectedDate: string; 
  occupiedTimes?: string[];
  allowedHours?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selH, selM] = value.split(':');

  const now = new Date();
  const isToday = selectedDate === dateKey(TODAY);
  const curHour = now.getHours();
  const curMin = now.getMinutes();

  const filteredHours = useMemo(() => {
    const baseHours = allowedHours.length > 0 ? allowedHours : HOURS;
    if (!isToday) return baseHours;
    return baseHours.filter(h => parseInt(h) >= curHour);
  }, [isToday, curHour, allowedHours]);

  const filteredMins = useMemo(() => {
    if (!isToday) return MINS;
    if (parseInt(selH) > curHour) return MINS;
    return MINS.filter(m => parseInt(m) >= curMin);
  }, [isToday, selH, curHour, curMin]);

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
            {filteredHours.map(h => {
              const hNum = parseInt(h);
              const validMinsForH = isToday && hNum === curHour ? MINS.filter(m => parseInt(m) >= curMin) : MINS;
              const allMinsOccupied = validMinsForH.every(m => occupiedTimes.includes(`${h}:${m}`));
              const nextMin = validMinsForH.includes(selM) ? selM : validMinsForH[0];
              return (
                <div key={h} onClick={() => { if (!allMinsOccupied) onChange(`${h}:${nextMin}`); }}
                  style={{
                    padding: '9px 14px', fontSize: 14, fontWeight: 600, 
                    cursor: allMinsOccupied ? 'not-allowed' : 'pointer',
                    background: h === selH ? 'var(--teal-50)' : 'transparent',
                    color: allMinsOccupied ? 'var(--ink-300)' : (h === selH ? 'var(--teal-700)' : 'var(--ink-700)'),
                    textDecoration: allMinsOccupied ? 'line-through' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                  <span>{h}:00</span>
                  {allMinsOccupied && <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--red-500)', background: '#FEF2F2', padding: '2px 6px', borderRadius: 4 }}>Dolu</span>}
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1, maxHeight: 200, overflowY: 'auto' }}>
            {filteredMins.map(m => {
              const isOccupied = occupiedTimes.includes(`${selH}:${m}`);
              return (
                <div key={m} onClick={() => { if (!isOccupied) { onChange(`${selH}:${m}`); setOpen(false); } }}
                  style={{
                    padding: '9px 14px', fontSize: 14, fontWeight: 600, 
                    cursor: isOccupied ? 'not-allowed' : 'pointer',
                    background: m === selM ? 'var(--teal-50)' : 'transparent',
                    color: isOccupied ? 'var(--ink-300)' : (m === selM ? 'var(--teal-700)' : 'var(--ink-700)'),
                    textDecoration: isOccupied ? 'line-through' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                  <span>:{m}</span>
                  {isOccupied && <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--red-500)', background: '#FEF2F2', padding: '2px 6px', borderRadius: 4 }}>Dolu</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AddAppointmentModal({ doctor, existingApts = [], onClose, onAdded, preselectedTime }: {
  doctor: any; existingApts?: Apt[]; onClose: () => void; onAdded: (apt: Apt) => void; preselectedTime?: string;
}) {
  const now = new Date();
  const isTodayPast = now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() > 50);
  const initialDate = isTodayPast ? dateKey(addDays(TODAY, 1)) : dateKey(TODAY);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(initialDate);
  const [allowedHours, setAllowedHours] = useState<string[]>([]);
  const lastSelectedDateRef = useRef('');
  
  const occupiedTimes = useMemo(() => {
    return (existingApts ?? [])
      .filter(a => dateKey(a.date) === date && a.status !== 'cancelled')
      .map(a => a.time);
  }, [existingApts, date]);

  const getFirstValidTime = (selDate: string, hoursList: string[], occupied: string[]) => {
    const isToday = selDate === dateKey(TODAY);
    const activeHours = hoursList.length > 0 ? hoursList : ['09', '10', '11', '12', '13', '14', '15', '16', '17'];
    const curHour = now.getHours();
    const curMin = now.getMinutes();

    for (const h of activeHours) {
      const hNum = parseInt(h);
      if (isToday && hNum < curHour) continue;
      
      for (const m of MINS) {
        if (isToday && hNum === curHour && parseInt(m) < curMin) continue;
        const timeStr = `${h}:${m}`;
        if (!occupied.includes(timeStr)) {
          return timeStr;
        }
      }
    }
    
    return activeHours[0] ? `${activeHours[0]}:00` : '09:00';
  };

  const [time, setTime] = useState(preselectedTime || '09:00');
  const [reason, setReason] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingPatient, setExistingPatient] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!doctor) return;
    
    getDoctorScheduleAction(doctor.id)
      .then(({ data }) => {
        let uniqueHours: string[] = [];
        if (data?.schedule) {
          const sched = data.schedule as any;
          const dateObj = new Date(date);
          const dayIndex = dateObj.getDay(); 
          const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
          const dayKeyStr = dayKeys[dayIndex];
          const daySched = sched[dayKeyStr];
          
          if (daySched && daySched.isOpen) {
            const startHours = daySched.slots.map((s: string) => {
              const start = s.split(' - ')[0]; 
              return start.split(':')[0]; 
            });
            uniqueHours = Array.from(new Set(startHours)).sort() as string[];
          }
        }
        
        if (uniqueHours.length === 0) {
          uniqueHours = ['09', '10', '11', '12', '13', '14', '15', '16', '17'];
        }
        
        setAllowedHours(uniqueHours);
        
        // ONLY reset the time to first valid time if the date has changed,
        // or if we don't have a time selected yet!
        if (lastSelectedDateRef.current !== date || !time || time === '09:00') {
          const validTime = getFirstValidTime(date, uniqueHours, occupiedTimes);
          setTime(preselectedTime || validTime);
          lastSelectedDateRef.current = date;
        }
      });
  }, [doctor, date]);

  useEffect(() => {
    if (!doctor.doctors_id) return;
    getDoctorPriceAction(doctor.doctors_id)
      .then(({ data }) => { if (data?.price) setPrice(data.price); });
  }, [doctor.doctors_id]);

  const lookupPatient = async () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 7) return;
    const { data } = await lookupPatientAction(clean);
    if (data) { setExistingPatient(data); setName(data.name); }
    else setExistingPatient(null);
  };

  const handleSubmit = async () => {
    if (!phone || !name || !date || !time) return;
    setSaving(true);
    setErrorMsg('');

    // Çift randevu kontrolü
    const { data: existingApt } = await checkAppointmentCollisionAction(date, time, doctor.id, doctor.doctors_id);

    if (existingApt) {
      setErrorMsg('Bu tarih ve saatte zaten dolu bir randevu var. Lütfen farklı bir saat seçin.');
      setSaving(false);
      return;
    }

    let patientId = existingPatient?.id;
    if (!patientId) {
      const { data: np, error: npError } = await createTemporaryPatientAction(name, phone.replace(/\D/g, ''));
      
      if (npError) {
        console.warn('Geçici hasta oluşturulamadı (RLS engeli olabilir), randevuya isim kaydedilecek:', npError);
      } else {
        patientId = np?.id;
      }
    }

    const { data: apt, error } = await createAppointmentAction({
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
      });

    setSaving(false);
    if (error) {
      setErrorMsg('Randevu oluşturulurken bir hata oluştu.');
      console.error(error);
      return;
    }
    if (apt) { 
      const isRegistered = existingPatient?.is_registered ?? false;
      if (!isRegistered) {
        const phoneToSend = phone.replace(/\D/g, '');
        console.log(`[WhatsApp] Kayıt dışı hastaya yeni randevu bildirimi gönderiliyor: ${phoneToSend}`);
        fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phoneToSend,
            appointmentId: apt.id,
            type: 'created',
            date: date,
            time: time,
            doctorName: `${doctor.name} ${doctor.surname || ''}`
          })
        }).then(async res => {
          const data = await res.json();
          if (!res.ok) console.error('WhatsApp gönderim hatası:', data.error);
          else console.log('WhatsApp randevu bildirimi başarıyla gönderildi.');
        }).catch(err => {
          console.warn('[WhatsApp] Server API çağrısı başarısız oldu:', err.message || err);
        });
      }

      onAdded(mapApt(apt as any)); 
      onClose(); 
    }
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
          {errorMsg && (
            <div style={{
              margin: '0 24px 16px', padding: '12px 16px', 
              background: '#FEF2F2', border: '1px solid #FCA5A5',
              borderRadius: '12px', color: '#991B1B',
              fontSize: '13px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <IX size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
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
              <input 
                style={inp} 
                type="date" 
                value={date} 
                min={initialDate}
                onChange={e => {
                  setDate(e.target.value);
                }} 
              />
              <TimePicker value={time} onChange={setTime} selectedDate={date} occupiedTimes={occupiedTimes} allowedHours={allowedHours} />
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
  const [showAddModal, setShowAddModal] = useState<boolean | string>(false);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string) => {
    setAlert({ visible: true, title, message });
  };

  useEffect(() => {
    if (!doctor) return;
    
    const checkAndProcessAutoCompletion = async (rows: any[]) => {
      const now = new Date();
      const updatedRows = [...rows];
      
      for (let i = 0; i < updatedRows.length; i++) {
        const row = updatedRows[i];
        if (row.status === 'confirmed' || row.status === 'pending') {
          const dateStr = row.date; 
          const timeStr = row.time; 
          
          let aptDateTime: Date;
          if (dateStr.includes('-')) {
            const [y, m, d] = dateStr.split('-').map(Number);
            const [h, min] = timeStr.split(':').map(Number);
            aptDateTime = new Date(y, m - 1, d, h, min);
          } else {
            aptDateTime = new Date(dateStr + ' ' + timeStr);
          }

          if (aptDateTime.getTime() < now.getTime()) {
            row.status = 'completed'; 

            updateAppointmentStatus(row.id, 'completed')
              .then(({ error }) => {
                if (error) console.error('Auto complete error for id:', row.id, error);
                else console.log('Appointment auto-completed:', row.id);
              });

            const patientId = row.patients?.id || row.patient_id;
            if (patientId) {
              const docName = doctor ? `Dr. ${doctor.name} ${doctor.surname || ''}` : 'Doktorunuz';
              insertNotificationAction({
                  patient_id: patientId,
                  unread: true,
                  title: 'Muayeneniz Tamamlandı! ⭐',
                  body: `${docName} ile olan randevunuz tamamlandı. Doktorunuzu değerlendirmek ister misiniz?`,
                  type: 'rating',
                  time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                  created_at: new Date().toISOString()
                })
                .then(({ error }) => {
                  if (error) console.error('Auto complete notification error:', error);
                  else console.log('Auto complete notification sent for patient:', patientId);
                });
            }
          }
        }
      }
      return updatedRows;
    };

    const fetchData = () => {
      getDashboardAppointments(doctor.id, doctor.doctors_id)
      .then(async ({ data }) => {
        const rowsToProcess = data ?? [];
        const processedRows = await checkAndProcessAutoCompletion(rowsToProcess);
        setApts(processedRows.map(mapApt));
        setFetching(false);
      });
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [doctor]);

  const handleStatusChange = (id: string, status: AptStatus) => {
    setApts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setSelectedApt(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const todayKey = dateKey(TODAY);
  const yesterdayKey = dateKey(addDays(TODAY, -1));
  const todayApts = apts.filter(a => a.dateKey === todayKey);
  const yesterdayApts = apts.filter(a => a.dateKey === yesterdayKey);
  const todayStats = {
    total: todayApts.length,
    pending: todayApts.filter(a => a.status === 'pending').length,
    completed: todayApts.filter(a => a.status === 'completed').length,
    earnings: todayApts.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.price, 0),
    yesterdayCount: yesterdayApts.length,
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
        todayEarnings={todayStats.earnings}
        yesterdayCount={todayStats.yesterdayCount}
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

        {fetching ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-400)' }}>Yükleniyor…</div>
        ) : view === 'list' ? (
          <AppointmentList appointments={dayApts} selected={selectedApt} onSelect={setSelectedApt} />
        ) : (
          <CalendarGrid 
            appointments={dayApts} 
            selectedDay={selectedDay} 
            onSelect={setSelectedApt} 
            onAddClick={(timeStr) => setShowAddModal(timeStr)} 
          />
        )}
      </div>

      {selectedApt && (
        <AppointmentDrawer 
          apt={selectedApt} 
          onClose={() => setSelectedApt(null)} 
          onStatusChange={handleStatusChange} 
          doctorName={doctor ? `Dr. ${doctor.name} ${doctor.surname || ''}` : undefined}
          onReport={async (a) => {
            showAlert('Şikayetiniz iletildi', 'Gereksiz veya asılsız şikayetlerin hesabınızın incelenmesine neden olabileceğini lütfen unutmayın.');
            if (a.patient.id) {
              const docName = doctor ? `Dr. ${doctor.name} ${doctor.surname || ''}` : 'Doktorunuz';
              await insertNotificationAction({
                patient_id: a.patient.id,
                unread: true,
                title: 'Hesabınız Hakkında Uyarı ⚠️',
                body: `${docName}, randevunuza katılımınız veya davranışınızla ilgili bir şikayet bildiriminde bulundu. Lütfen klinik kurallarına uyunuz.`,
                type: 'block',
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                created_at: new Date().toISOString()
              });
            }
          }}
        />
      )}

      <CustomAlert 
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert(p => ({ ...p, visible: false }))}
      />

      {showAddModal && (
        <AddAppointmentModal
          doctor={doctor}
          existingApts={apts}
          onClose={() => setShowAddModal(false)}
          onAdded={(apt) => { setApts(prev => [...prev, apt]); setSelectedDay(apt.date); }}
          preselectedTime={typeof showAddModal === 'string' ? showAddModal : undefined}
        />
      )}
    </>
  );
}
