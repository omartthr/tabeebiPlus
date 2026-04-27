'use client';
import { supabase } from '@/lib/supabase';
import { useRequireDoctor, clearDoctorSession } from '@/hooks/useDoctor';
import { useState, useEffect, useCallback } from 'react';
import { IClock, ICheck } from '@/components/ui/icons';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => <div style={{ height: 240, background: 'var(--ink-50)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Harita yükleniyor...</div>
});

const DAYS = [
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

const DEFAULT_SCHEDULE = DAYS.reduce((acc, day) => ({
  ...acc,
  [day.id]: { isOpen: day.id !== 'sun', slots: day.id !== 'sun' ? [...TIME_SLOTS] : [] }
}), {} as Record<string, { isOpen: boolean; slots: string[] }>);

export default function ProfilePage() {
  const { doctor, loading } = useRequireDoctor();
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState('mon');
  const [schedule, setSchedule] = useState<Record<string, { isOpen: boolean; slots: string[] }>>(DEFAULT_SCHEDULE);
  const [price, setPrice] = useState('50000');
  const [expYears, setExpYears] = useState('1');
  const [locLat, setLocLat] = useState<number | null>(null);
  const [locLng, setLocLng] = useState<number | null>(null);
  const [locAddr, setLocAddr] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);

  const doctorId = doctor?.id;

  useEffect(() => {
    if (!doctorId) return;
    let cancelled = false;

    (async () => {
      const { data: schedData } = await supabase
        .from('doctor_schedules')
        .select('schedule')
        .eq('doctor_registration_id', doctorId)
        .maybeSingle();

      const { data: profData } = await supabase
        .from('doctor_registrations')
        .select('price, exp_years, location_address, location_lat, location_lng')
        .eq('id', doctorId)
        .maybeSingle();

      if (cancelled) return;
      if (schedData?.schedule) setSchedule(schedData.schedule as typeof DEFAULT_SCHEDULE);
      if (profData?.price) setPrice(String(profData.price));
      if (profData?.exp_years) setExpYears(String(profData.exp_years));
      if (profData?.location_address) setLocAddr(profData.location_address);
      if (profData?.location_lat) setLocLat(profData.location_lat);
      if (profData?.location_lng) setLocLng(profData.location_lng);
      setProfileLoaded(true);
    })();

    return () => { cancelled = true; };
  }, [doctorId]);

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

  const handleMapChange = useCallback((lat: number, lng: number, addr: string) => {
    setLocLat(lat);
    setLocLng(lng);
    setLocAddr(addr);
  }, []);

  const handleSave = async () => {
    if (!doctor) return;
    setSaving(true);
    const priceNum = parseInt(price) || 0;
    const expNum = parseInt(expYears) || 1;

    const { error: schedErr } = await supabase
      .from('doctor_schedules')
      .upsert({ doctor_registration_id: doctor.id, schedule, updated_at: new Date().toISOString() });

    if (schedErr) {
      setSaving(false);
      alert('Hata: ' + schedErr.message);
      return;
    }

    const { error: regErr } = await supabase
      .from('doctor_registrations')
      .update({
        price: priceNum,
        exp_years: expNum,
        location_address: locAddr,
        location_lat: locLat,
        location_lng: locLng
      })
      .eq('id', doctor.id);

    if (regErr) {
      setSaving(false);
      alert('Hata (Profil): ' + regErr.message);
      return;
    }

    // Sync to doctors table if linked
    const { data: reg } = await supabase
      .from('doctor_registrations')
      .select('*')
      .eq('id', doctor.id)
      .maybeSingle();

    if (reg) {
      // Update local session
      const { setDoctorSession } = await import('@/hooks/useDoctor');
      setDoctorSession({
        ...doctor,
        price: priceNum,
        exp_years: expNum,
        location_address: locAddr,
        location_lat: locLat,
        location_lng: locLng,
        clinic_name: reg.clinic_name
      } as any);

      if (reg.doctors_id) {
        const { error: docErr } = await supabase
          .from('doctors')
          .update({
            name: `Dr. ${reg.name} ${reg.surname}`,
            specialty: reg.specialty,
            price: priceNum,
            exp: expNum + ' yrs',
            loc: reg.clinic_name || 'Bağdat',
            registration_id: reg.id,
            location_address: locAddr,
            location_lat: locLat,
            location_lng: locLng,
            schedule,
          })
          .eq('id', reg.doctors_id);

        if (docErr) {
          console.error('doctors table sync error:', docErr.message);
        }
      }
    }

    setSaving(false);
    alert('Tüm değişiklikler başarıyla kaydedildi.');
  };

  const handleLogout = () => {
    clearDoctorSession();
    window.location.replace('/auth/login');
  };

  if (loading || !doctor || !profileLoaded) return null;

  return (
    <div className="profile-container">
      <div className="topbar">
        <div className="greet">
          <h1>Profil & Ayarlar</h1>
          <div className="sub">Hesap ayarlarınızı ve randevu saatlerinizi yönetin</div>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Profile Info */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: 900 }}>
          <h2 style={{ fontSize: 18, color: '#1a1a1a', marginBottom: 20 }}>Profil Bilgileri</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', display: 'block', marginBottom: 6 }}>Ad Soyad</label>
              <input
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--ink-200)', fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', background: 'var(--ink-50)' }}
                value={`Dr. ${doctor.name} ${doctor.surname}`}
                disabled
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', display: 'block', marginBottom: 6 }}>Uzmanlık</label>
              <input
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--ink-200)', fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', background: 'var(--ink-50)' }}
                value={doctor.specialty}
                disabled
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', display: 'block', marginBottom: 6 }}>Muayene Ücreti (IQD)</label>
              <input
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--ink-200)', fontSize: 14, fontWeight: 600 }}
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="50000"
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', display: 'block', marginBottom: 6 }}>Deneyim (Yıl)</label>
              <input
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--ink-200)', fontSize: 14, fontWeight: 600 }}
                type="number"
                value={expYears}
                onChange={e => setExpYears(e.target.value)}
                placeholder="1"
                min="1"
                max="50"
              />
            </div>
          </div>

          {/* Location Info */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1.5px solid var(--ink-100)' }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', display: 'block', marginBottom: 12 }}>Klinik Konumu</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 12 }}>Haritada kliniğinizin bulunduğu yere tıklayarak konumu güncelleyebilirsiniz.</p>
                <MapPicker onChange={handleMapChange} initialLat={locLat} initialLng={locLng} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', display: 'block', marginBottom: 6 }}>Açık Adres</label>
                <textarea
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--ink-200)', fontSize: 14, fontWeight: 600, height: 120, resize: 'none' }}
                  value={locAddr}
                  onChange={e => setLocAddr(e.target.value)}
                  placeholder="Örn: Mansour Mah. 14. Sokak, No: 5, Bağdat"
                />
                <div style={{ marginTop: 12, padding: 12, background: 'var(--teal-50)', borderRadius: 10, fontSize: 12, color: 'var(--teal-700)', fontWeight: 500 }}>
                  📍 Seçilen Koordinatlar: {locLat?.toFixed(5) || '??'}, {locLng?.toFixed(5) || '??'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IClock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, color: '#1a1a1a' }}>Randevu Saat Aralıkları</h2>
              <p style={{ color: '#666', fontSize: 13 }}>Her gün için aktif randevu saatlerini belirleyin. Mobil uygulamada görünür.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DAYS.map(day => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10, border: 'none',
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

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '12px 16px', background: 'var(--ink-50)', borderRadius: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>
                  {DAYS.find(d => d.id === selectedDay)?.label} Durumu
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
                  <div style={{ marginBottom: 12, opacity: 0.5 }}><IClock size={40} /></div>
                  <div style={{ fontWeight: 600 }}>Bu gün için randevu kabul edilmiyor.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unified Save Button */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              maxWidth: 900, 
              height: 54, 
              fontSize: 16, 
              gap: 10,
              boxShadow: '0 10px 30px rgba(13, 115, 119, 0.2)'
            }}
          >
            {saving ? 'Kaydediliyor...' : <><ICheck size={20} /> Tüm Değişiklikleri Kaydet</>}
          </button>
        </div>

        {/* Logout */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: 900 }}>
          <h2 style={{ marginBottom: 8, fontSize: 18, color: '#1a1a1a' }}>Hesap İşlemleri</h2>
          <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Oturumunuzu sonlandırmak için aşağıdaki butonu kullanabilirsiniz.</p>
          <button onClick={handleLogout} style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıkış Yap
          </button>
        </div>

      </div>
    </div>
  );
}
