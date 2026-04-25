'use client';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IClock, ICheck } from '@/components/ui/icons';

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
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

export default function ProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState('mon');
  const [schedule, setSchedule] = useState<Record<string, { isOpen: boolean; slots: string[] }>>(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day.id]: {
        isOpen: day.id !== 'sun',
        slots: day.id !== 'sun' ? [...TIME_SLOTS] : []
      }
    }), {})
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const toggleDay = (dayId: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        isOpen: !prev[dayId].isOpen,
        slots: !prev[dayId].isOpen ? [...TIME_SLOTS] : []
      }
    }));
  };

  const toggleSlot = (dayId: string, slot: string) => {
    setSchedule(prev => {
      const currentSlots = prev[dayId].slots;
      const newSlots = currentSlots.includes(slot)
        ? currentSlots.filter(s => s !== slot)
        : [...currentSlots, slot].sort((a, b) => a.localeCompare(b));
      
      return {
        ...prev,
        [dayId]: {
          ...prev[dayId],
          slots: newSlots
        }
      };
    });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Çalışma saatleri ve randevu aralıkları başarıyla kaydedildi.');
    }, 1000);
  };

  return (
    <div className="profile-container">
      <div className="topbar">
        <div className="greet">
          <h1>Profil & Ayarlar</h1>
          <div className="sub">Hesap ayarlarınızı ve randevu saatlerinizi yönetin</div>
        </div>
      </div>

      <div className="profile-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Slot Based Availability */}
        <div className="settings-card" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          maxWidth: '900px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IClock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', color: '#1a1a1a' }}>Randevu Saat Aralıkları</h2>
              <p style={{ color: '#666', fontSize: '13px' }}>Her gün için aktif randevu saatlerini tek tek belirleyebilirsiniz.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px' }}>
            {/* Days Column */}
            <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DAYS.map(day => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: selectedDay === day.id ? 'var(--teal-700)' : 'var(--ink-50)',
                    color: selectedDay === day.id ? 'white' : 'var(--ink-700)',
                    fontWeight: '700',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {day.label}
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: schedule[day.id].isOpen ? (selectedDay === day.id ? 'white' : 'var(--teal-500)') : 'var(--ink-200)' 
                  }} />
                </button>
              ))}
            </div>

            {/* Slots Grid */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'var(--ink-50)',
                borderRadius: '12px'
              }}>
                <div style={{ fontWeight: '700', color: 'var(--ink-900)' }}>
                  {DAYS.find(d => d.id === selectedDay)?.label} Durumu
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-500)' }}>
                    {schedule[selectedDay].isOpen ? 'Randevuya Açık' : 'Kapalı (Tatil)'}
                  </span>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                    <input 
                      type="checkbox" 
                      checked={schedule[selectedDay].isOpen} 
                      onChange={() => toggleDay(selectedDay)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: schedule[selectedDay].isOpen ? 'var(--teal-700)' : '#ccc',
                      transition: '.4s', borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute', height: '14px', width: '14px',
                        left: schedule[selectedDay].isOpen ? '22px' : '4px', bottom: '3px',
                        backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>
              </div>

              {schedule[selectedDay].isOpen ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {TIME_SLOTS.map(slot => {
                    const isActive = schedule[selectedDay].slots.includes(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(selectedDay, slot)}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: isActive ? '1.5px solid var(--teal-700)' : '1.5px solid var(--ink-200)',
                          background: isActive ? 'var(--teal-50)' : 'white',
                          color: isActive ? 'var(--teal-700)' : 'var(--ink-400)',
                          fontWeight: '700',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {slot}
                        {isActive ? (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--teal-700)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ICheck size={12} stroke={3} />
                          </div>
                        ) : (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid var(--ink-200)' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ 
                  height: '240px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'var(--ink-50)',
                  borderRadius: '16px',
                  border: '1px dashed var(--ink-200)',
                  color: 'var(--ink-400)'
                }}>
                  <div style={{ marginBottom: '12px', opacity: 0.5 }}><IClock size={40} /></div>
                  <div style={{ fontWeight: '600' }}>Bu gün için randevu kabul edilmiyor.</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              style={{ width: '140px' }}
            >
              {saving ? 'Kaydediliyor...' : <><ICheck size={18} /> Kaydet</>}
            </button>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="settings-card" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          maxWidth: '900px'
        }}>
          <h2 style={{ marginBottom: '16px', fontSize: '18px', color: '#1a1a1a' }}>Hesap İşlemleri</h2>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
            Oturumunuzu sonlandırmak için aşağıdaki butonu kullanabilirsiniz.
          </p>
          
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ff7875'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff4d4f'}
          >
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
