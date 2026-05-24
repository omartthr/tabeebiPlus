'use client';
import { getDoctorScheduleAction, getDashboardAppointments, updateDoctorScheduleAction } from '@/actions/doctorActions';
import { useRequireDoctor } from '@/hooks/useDoctor';
import { useState, useEffect, useMemo } from 'react';
import { IClock, ICheck, ICal, IX, StatusBadge } from '@/components/ui/icons';
import { TODAY, TR_DAYS_LONG, TR_DAYS_SHORT, TR_MONTHS_LONG, dateKey, addDays } from '@/data';

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Pazartesi' },
  { id: 'tue', label: 'Salı' },
  { id: 'wed', label: 'Çarşamba' },
  { id: 'thu', label: 'Perşembe' },
  { id: 'fri', label: 'Cuma' },
  { id: 'sat', label: 'Cumartesi' },
  { id: 'sun', label: 'Pazar' },
];

const TIME_SLOTS = [
  '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
  '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00',
];

const DEFAULT_SCHEDULE = DAYS_OF_WEEK.reduce((acc, day) => ({
  ...acc,
  [day.id]: { isOpen: day.id !== 'sun', slots: day.id !== 'sun' ? [...TIME_SLOTS] : [] }
}), {} as Record<string, { isOpen: boolean; slots: string[] }>);

export default function SchedulePage() {
  const { doctor, loading } = useRequireDoctor();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings'>('appointments');
  const [schedule, setSchedule] = useState<Record<string, { isOpen: boolean; slots: string[] }>>(DEFAULT_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState('mon');
  const [saving, setSaving] = useState(false);
  const [apts, setApts] = useState<any[]>([]);
  const [fetchingApts, setFetchingApts] = useState(true);

  // Fetch Schedule and Appointments
  useEffect(() => {
    if (!doctor) return;
    let cancelled = false;

    // Fetch schedule
    getDoctorScheduleAction(doctor.id)
      .then(({ data }) => {
        if (!cancelled && data?.schedule) {
          setSchedule(data.schedule as any);
        }
      });

    // Fetch appointments
    getDashboardAppointments(doctor.id, doctor.doctors_id)
      .then(({ data }) => {
        if (!cancelled) {
          const activeApts = (data ?? []).filter((a: any) => a.status !== 'cancelled');
          setApts(activeApts);
          setFetchingApts(false);
        }
      });

    return () => { cancelled = true; };
  }, [doctor]);

  // Working Hours logic
  const toggleDay = (dayId: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        isOpen: !prev[dayId].isOpen,
        slots: !prev[dayId].isOpen ? [...TIME_SLOTS] : [],
      }
    }));
  };

  const toggleSlot = (dayId: string, slot: string) => {
    setSchedule(prev => {
      const cur = prev[dayId].slots;
      const next = cur.includes(slot) ? cur.filter(s => s !== slot) : [...cur, slot].sort();
      return { ...prev, [dayId]: { ...prev[dayId], slots: next } };
    });
  };

  const handleSaveSchedule = async () => {
    if (!doctor) return;
    setSaving(true);

    const { error: schedErr } = await updateDoctorScheduleAction(doctor.id, schedule);

    if (schedErr) {
      setSaving(false);
      alert('Hata: ' + schedErr);
      return;
    }

    setSaving(false);
    alert('Mesai saatleriniz başarıyla güncellendi.');
  };

  // Appointments filter & group by day for the weekly planner
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(TODAY, i);
      const k = dateKey(d);
      const dayApts = apts.filter(a => a.date === k).sort((a, b) => a.time.localeCompare(b.time));
      return {
        date: d,
        key: k,
        label: TR_DAYS_LONG[(d.getDay() + 6) % 7],
        shortLabel: TR_DAYS_SHORT[(d.getDay() + 6) % 7],
        apts: dayApts,
      };
    });
  }, [apts]);

  if (loading || !doctor) return null;

  return (
    <div className="schedule-page-container" style={{ padding: '0 24px 24px' }}>
      <div className="topbar">
        <div className="greet">
          <h1>Randevu Takvimi & Çalışma Saatleri</h1>
          <div className="sub">Haftalık çalışma planınızı ve aktif muayene saatlerinizi yönetin.</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--ink-100)', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'appointments' ? 'var(--teal-700)' : 'transparent',
            color: activeTab === 'appointments' ? 'white' : 'var(--ink-500)',
            transition: 'all 0.2s',
          }}
        >
          📅 Haftalık Plan
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'settings' ? 'var(--teal-700)' : 'transparent',
            color: activeTab === 'settings' ? 'white' : 'var(--ink-500)',
            transition: 'all 0.2s',
          }}
        >
          ⚙️ Çalışma Saatlerini Düzenle
        </button>
      </div>

      {activeTab === 'appointments' ? (
        /* WEEKLY PLANNER VIEW */
        <div className="panel fade-up" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, color: '#1a1a1a', marginBottom: 20 }}>Önümüzdeki 7 Günlük Plan</h2>
          
          {fetchingApts ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-400)' }}>Yükleniyor...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {weekDays.map(day => (
                <div key={day.key} style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--ink-50)', paddingBottom: 16 }}>
                  {/* Day Column Card */}
                  <div style={{
                    width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--ink-50)', borderRadius: 12, padding: 12, flexShrink: 0
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase' }}>{day.shortLabel}</span>
                    <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink-900)', margin: '4px 0' }}>{day.date.getDate()}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-700)' }}>
                      {day.apts.length > 0 ? `${day.apts.length} Randevu` : 'Boş Gün'}
                    </span>
                  </div>

                  {/* Appointments for Day */}
                  <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 12, alignContent: 'center' }}>
                    {day.apts.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--ink-400)', display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                        Bu gün için planlanmış randevu bulunmuyor.
                      </div>
                    ) : (
                      day.apts.map(a => {
                        const patientName = a.patients?.name ?? a.patient_name ?? 'Bilinmeyen';
                        return (
                          <div key={a.id} style={{
                            padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--ink-100)',
                            background: 'white', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200, maxWidth: 280
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-900)' }}>⏰ {a.time}</span>
                              <StatusBadge status={a.status} />
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-700)' }}>{patientName}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              🩺 {a.reason ?? '-'}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* WORKING HOURS SETTINGS VIEW */
        <div className="panel fade-up" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IClock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, color: '#1a1a1a', margin: 0 }}>Çalışma Saat Dilimleri</h2>
              <p style={{ color: '#666', fontSize: 13, margin: '2px 0 0 0' }}>Her gün için aktif randevu saat aralıklarını seçin.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 32 }}>
            {/* Days Selection Menu */}
            <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', borderRadius: 12, border: 'none',
                    background: selectedDay === day.id ? 'var(--teal-700)' : 'var(--ink-50)',
                    color: selectedDay === day.id ? 'white' : 'var(--ink-700)',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {day.label}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: schedule[day.id]?.isOpen
                      ? (selectedDay === day.id ? 'white' : 'var(--teal-500)')
                      : 'var(--ink-200)',
                  }} />
                </button>
              ))}
            </div>

            {/* Slots Selection Grid */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '12px 16px', background: 'var(--ink-50)', borderRadius: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>
                  {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.label} Durumu
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-500)' }}>
                    {schedule[selectedDay]?.isOpen ? 'Randevuya Açık' : 'Kapalı (Tatil)'}
                  </span>
                  <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 20 }}>
                    <input type="checkbox" checked={schedule[selectedDay]?.isOpen ?? false} onChange={() => toggleDay(selectedDay)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: schedule[selectedDay]?.isOpen ? 'var(--teal-700)' : '#ccc',
                      transition: '.4s', borderRadius: 34,
                    }}>
                      <span style={{
                        position: 'absolute', height: 14, width: 14,
                        left: schedule[selectedDay]?.isOpen ? 22 : 4, bottom: 3,
                        backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                      }} />
                    </span>
                  </label>
                </div>
              </div>

              {schedule[selectedDay]?.isOpen ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {TIME_SLOTS.map(slot => {
                    const isActive = schedule[selectedDay]?.slots.includes(slot);
                    return (
                      <button key={slot} onClick={() => toggleSlot(selectedDay, slot)} style={{
                        padding: 16, borderRadius: 12,
                        border: `1.5px solid ${isActive ? 'var(--teal-700)' : 'var(--ink-200)'}`,
                        background: isActive ? 'var(--teal-50)' : 'white',
                        color: isActive ? 'var(--teal-700)' : 'var(--ink-400)',
                        fontWeight: 700, fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                        {slot}
                        {isActive
                          ? <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--teal-700)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ICheck size={12} stroke={3} /></div>
                          : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid var(--ink-200)' }} />
                        }
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--ink-50)', borderRadius: 16, border: '1px dashed var(--ink-200)', color: 'var(--ink-400)' }}>
                  <div style={{ marginBottom: 12, opacity: 0.5 }}><ICal size={40} /></div>
                  <div style={{ fontWeight: 600 }}>Bu gün için randevu kabul edilmiyor.</div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', marginTop: 32 }}>
            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: 54,
                fontSize: 16,
                gap: 10,
                boxShadow: '0 10px 30px rgba(13, 115, 119, 0.2)'
              }}
            >
              {saving ? 'Kaydediliyor...' : <><ICheck size={20} /> Çalışma Saatlerini Kaydet</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
