'use client';
import { useRequireDoctor } from '@/hooks/useDoctor';
import { PATIENTS, APPOINTMENTS, type Appointment } from '@/data';
import { ISearch, IPlus, IPhone, ICal, IChevR, Avatar } from '@/components/ui/icons';
import { useState, useMemo } from 'react';

export default function PatientsPage() {
  const { doctor, loading } = useRequireDoctor();
  const [search, setSearch] = useState('');

  const patientData = useMemo(() => {
    return PATIENTS.map(p => {
      // Find latest appointment for this patient
      const latest = [...APPOINTMENTS]
        .filter(a => a.patient.id === p.id)
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      
      return {
        ...p,
        lastComplaint: latest?.reason || 'Kayıtlı randevu yok',
        lastDate: latest?.date ? latest.date.toLocaleDateString('tr-TR') : '-'
      };
    }).filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.phone.includes(search) ||
      (p as any).patientId.replace('#', '').includes(search)
    );
  }, [search]);

  if (loading || !doctor) return null;

  return (
    <div className="patients-container">
      <div className="topbar">
        <div className="greet">
          <h1>Hastalar</h1>
          <div className="sub">Toplam {PATIENTS.length} kayıtlı hasta</div>
        </div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon"><ISearch size={16} /></span>
            <input
              className="search-input"
              placeholder="İsim, telefon veya ID ile ara…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="panel fade-up" style={{ padding: '0' }}>
        <div className="patient-list">
          <div className="list-header" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1.2fr 1.5fr 1.2fr 1fr 40px',
            padding: '16px 24px',
            borderBottom: '1px solid var(--ink-100)',
            fontSize: '13px',
            fontWeight: '700',
            color: 'var(--ink-500)',
            letterSpacing: '0.5px'
          }}>
            <div>KİMLİK</div>
            <div>HASTA</div>
            <div>İLETİŞİM</div>
            <div>SON ŞİKAYET</div>
            <div>SONUÇLAR</div>
            <div />
          </div>

          {patientData.map(p => (
            <div key={p.id} className="patient-row" style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.2fr 1.5fr 1.2fr 1fr 40px',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--ink-50)',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}>
              <div style={{ color: 'var(--teal-700)', fontWeight: '700', fontSize: '14px' }}>
                {(p as any).patientId}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar initials={p.initials} hue={p.hue} size={40} rounded={12} />
                <div style={{ fontWeight: '700', color: 'var(--ink-900)' }}>{p.name}</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-600)', fontSize: '14px', fontWeight: '500' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--ink-50)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}>
                  <IPhone size={14} />
                </div>
                {p.phone}
              </div>

              <div style={{ color: 'var(--ink-700)', fontSize: '14px', fontWeight: '600' }}>
                {p.lastComplaint}
              </div>

              <div>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '100px', 
                  background: 'var(--teal-50)', 
                  color: 'var(--teal-700)', 
                  fontSize: '12px', 
                  fontWeight: '700' 
                }}>
                  3 Sonuç
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--ink-300)' }}>
                <IChevR size={18} />
              </div>
            </div>
          ))}

          {patientData.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-400)' }}>
              Arama kriterlerine uygun hasta bulunamadı.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .patient-row:hover {
          background-color: var(--ink-50);
        }
        .patient-row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
