'use client';
import { useRequireDoctor } from '@/hooks/useDoctor';
import { supabase } from '@/lib/supabase';
import { IDoc, ICheck, ISearch, Avatar, StatusBadge } from '@/components/ui/icons';
import { useState, useEffect, useMemo } from 'react';

interface ResultRow {
  id: string;
  date: string;
  time: string;
  reason: string | null;
  price: number;
  patient: {
    name: string;
    phone: string;
    initials: string;
    hue: number;
    code: string | null;
  };
}

function toInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}

export default function ResultsPage() {
  const { doctor, loading } = useRequireDoctor();
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!doctor) return;

    let query = supabase
      .from('appointments')
      .select('id, date, time, reason, price, patients(name, phone, avatar_hue, patient_code)')
      .eq('status', 'completed');

    if (doctor.doctors_id) {
      query = query.or(`doctor_registration_id.eq.${doctor.id},doctor_id.eq.${doctor.doctors_id}`);
    } else {
      query = query.eq('doctor_registration_id', doctor.id);
    }

    query.or('report_uploaded.eq.false,report_uploaded.is.null').order('date', { ascending: false }).then(({ data }) => {
      const mapped: ResultRow[] = (data ?? []).map((a: any) => {
        const patName = a.patients?.name ?? 'Bilinmeyen';
        return {
          id: a.id,
          date: a.date,
          time: a.time,
          reason: a.reason,
          price: a.price ?? 0,
          patient: {
            name: patName,
            phone: a.patients?.phone ?? '-',
            initials: toInitials(patName),
            hue: a.patients?.avatar_hue ?? 175,
            code: a.patients?.patient_code ?? null,
          },
        };
      });
      setRows(mapped);
      setFetching(false);
    });
  }, [doctor]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    const seen = new Set<string>();
    return rows
      .filter(r => {
        const key = r.patient.phone;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .filter(r =>
        !s ||
        r.patient.name.toLowerCase().includes(s) ||
        (r.patient.code ?? '').includes(s)
      );
  }, [rows, search]);

  const handleUpload = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingId(id);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appointmentId', id);
      const res = await fetch('/api/analyze-report', { method: 'POST', body: formData });
      const data = await res.json();
      setUploadingId(null);
      if (!res.ok) {
        console.error('Upload error:', data.error);
        alert('Yükleme başarısız:\n' + data.error);
        return;
      }
      setRows(prev => prev.filter(r => r.id !== id));
      window.location.href = '/patients';
    };
    input.click();
  };

  if (loading || !doctor) return null;

  return (
    <div className="results-container">
      <div className="topbar">
        <div className="greet">
          <h1>Sonuçlar & Raporlar</h1>
          <div className="sub">Sonuç yüklenmesi beklenen {filtered.length} muayene</div>
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
            letterSpacing: '0.5px',
          }}>
            <div>HASTA</div>
            <div>MUAYENE TÜRÜ</div>
            <div>DURUM</div>
            <div style={{ textAlign: 'right' }}>İŞLEM</div>
          </div>

          {fetching ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--ink-400)' }}>Yükleniyor…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: 'var(--ink-50)', color: 'var(--ink-300)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <ICheck size={32} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink-900)' }}>Bekleyen Sonuç Yok</div>
              <div style={{ fontSize: '14px', color: 'var(--ink-500)', marginTop: '4px' }}>
                Tüm tamamlanan muayenelerin raporları yüklendi.
              </div>
            </div>
          ) : filtered.map(r => (
            <div key={r.id} className="result-row" style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.5fr 1fr 1.2fr',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--ink-50)',
              transition: 'background 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar initials={r.patient.initials} hue={r.patient.hue} size={40} rounded={12} />
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--ink-900)' }}>
                    {r.patient.name}
                    {r.patient.code && (
                      <span style={{ color: 'var(--teal-700)', fontSize: '12px', marginLeft: '6px' }}>#{r.patient.code}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-400)', fontWeight: '500' }}>{r.patient.phone}</div>
                </div>
              </div>

              <div style={{ color: 'var(--ink-700)', fontSize: '14px', fontWeight: '600' }}>
                {r.reason ?? '-'}
              </div>

              <div><StatusBadge status="completed" /></div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleUpload(r.id)}
                  disabled={uploadingId === r.id}
                  className="btn btn-sm btn-primary"
                  style={{
                    height: '36px', padding: '0 14px', fontSize: '13px',
                    backgroundColor: uploadingId === r.id ? 'var(--ink-200)' : 'var(--teal-700)',
                  }}
                >
                  {uploadingId === r.id ? 'Yükleniyor...' : <><IDoc size={14} /> PDF Rapor Yükle</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .result-row:hover { background-color: var(--ink-50); }
        .result-row:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
}
