'use client';
import { useRequireDoctor } from '@/hooks/useDoctor';
import { APPOINTMENTS, type Appointment } from '@/data';
import { IDoc, IPlus, ICheck, IChevR, Avatar, StatusBadge, ISearch } from '@/components/ui/icons';
import { useState, useMemo } from 'react';

export default function ResultsPage() {
  const { doctor, loading } = useRequireDoctor();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [completedUploads, setCompletedUploads] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Filter completed appointments that haven't been "processed" (uploaded) yet
  const resultNeeded = useMemo(() => {
    return APPOINTMENTS
      .filter(a => a.status === 'completed')
      .filter(a => !completedUploads.includes(a.id))
      .filter(a => 
        a.patient.name.toLowerCase().includes(search.toLowerCase()) || 
        (a.patient as any).patientId.replace('#', '').includes(search)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [completedUploads, search]);

  const handleUpload = (id: string) => {
    setUploadingId(id);
    // Simulate upload delay
    setTimeout(() => {
      setUploadingId(null);
      setCompletedUploads(prev => [...prev, id]);
      alert('Sonuç başarıyla yüklendi ve hastaya iletildi.');
    }, 1500);
  };

  if (loading || !doctor) return null;

  return (
    <div className="results-container">
      <div className="topbar">
        <div className="greet">
          <h1>Sonuçlar & Raporlar</h1>
          <div className="sub">Sonuç yüklenmesi beklenen {resultNeeded.length} muayene</div>
        </div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon"><ISearch size={16} /></span>
            <input
              className="search-input"
              placeholder="İsim veya ID ile ara…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="panel fade-up" style={{ padding: '0' }}>
        <div className="results-list">
          <div className="list-header" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1.5fr 1fr 1.2fr',
            padding: '16px 24px',
            borderBottom: '1px solid var(--ink-100)',
            fontSize: '13px',
            fontWeight: '700',
            color: 'var(--ink-500)',
            letterSpacing: '0.5px'
          }}>
            <div>HASTA</div>
            <div>MUAYENE TÜRÜ</div>
            <div>DURUM</div>
            <div style={{ textAlign: 'right' }}>İŞLEM</div>
          </div>

          {resultNeeded.map(a => (
            <div key={a.id} className="result-row" style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.5fr 1fr 1.2fr',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--ink-50)',
              transition: 'background 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar initials={a.patient.initials} hue={a.patient.hue} size={40} rounded={12} />
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--ink-900)' }}>
                    {a.patient.name} <span style={{ color: 'var(--teal-700)', fontSize: '12px', marginLeft: '6px' }}>{(a.patient as any).patientId}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-400)', fontWeight: '500' }}>{a.patient.phone}</div>
                </div>
              </div>
              
              <div style={{ color: 'var(--ink-700)', fontSize: '14px', fontWeight: '600' }}>
                {a.reason}
              </div>

              <div>
                <StatusBadge status="completed" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleUpload(a.id)}
                  disabled={uploadingId === a.id}
                  className="btn btn-sm btn-primary"
                  style={{ 
                    height: '36px', 
                    padding: '0 14px', 
                    fontSize: '13px',
                    backgroundColor: uploadingId === a.id ? 'var(--ink-200)' : 'var(--teal-700)'
                  }}
                >
                  {uploadingId === a.id ? (
                    'Yükleniyor...'
                  ) : (
                    <>
                      <IDoc size={14} />
                      PDF Rapor Yükle
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {resultNeeded.length === 0 && (
            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                background: 'var(--ink-50)', 
                color: 'var(--ink-300)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <ICheck size={32} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink-900)' }}>Bekleyen Sonuç Yok</div>
              <div style={{ fontSize: '14px', color: 'var(--ink-500)', marginTop: '4px' }}>
                Tüm tamamlanan muayenelerin raporları yüklendi veya işlem süresi doldu.
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .result-row:hover {
          background-color: var(--ink-50);
        }
        .result-row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
