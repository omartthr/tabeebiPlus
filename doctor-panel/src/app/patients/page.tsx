'use client';
import { useRequireDoctor } from '@/hooks/useDoctor';
import { supabase } from '@/lib/supabase';
import { ISearch, IPhone, IChevR, Avatar } from '@/components/ui/icons';
import { useState, useEffect, useMemo } from 'react';

interface Patient {
  id: string;
  name: string;
  phone: string;
  avatar_hue: number;
  lastComplaint: string;
  lastDate: string;
}

function toInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}

export default function PatientsPage() {
  const { doctor, loading } = useRequireDoctor();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!doctor) return;

    supabase
      .from('appointments')
      .select('reason, date, time, patient_name, patient_phone, patients(id, name, phone, avatar_hue)')
      .eq('doctor_registration_id', doctor.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (!data) { setFetching(false); return; }

        // Deduplicate patients — keep latest appointment per patient
        const seen = new Map<string, Patient>();
        for (const row of data) {
          const p = row.patients as any;
          const key = p?.id ?? row.patient_phone ?? row.patient_name ?? 'unknown';
          if (!seen.has(key)) {
            seen.set(key, {
              id: key,
              name: p?.name ?? row.patient_name ?? 'Bilinmeyen',
              phone: p?.phone ?? row.patient_phone ?? '-',
              avatar_hue: p?.avatar_hue ?? 175,
              lastComplaint: row.reason ?? '-',
              lastDate: row.date ?? '-',
            });
          }
        }
        setPatients(Array.from(seen.values()));
        setFetching(false);
      });
  }, [doctor]);

  const filtered = useMemo(() =>
    patients.filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
    ), [patients, search]);

  if (loading || !doctor) return null;

  return (
    <div className="patients-container">
      <div className="topbar">
        <div className="greet">
          <h1>Hastalar</h1>
          <div className="sub">Toplam {patients.length} kayıtlı hasta</div>
        </div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon"><ISearch size={16} /></span>
            <input
              className="search-input"
              placeholder="İsim veya telefon ile ara…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="panel fade-up" style={{ padding: 0 }}>
        <div className="patient-list">
          <div className="list-header" style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1.2fr 40px',
            padding: '16px 24px',
            borderBottom: '1px solid var(--ink-100)',
            fontSize: 13, fontWeight: 700, color: 'var(--ink-500)', letterSpacing: '0.5px',
          }}>
            <div>HASTA</div>
            <div>İLETİŞİM</div>
            <div>SON ŞİKAYET</div>
            <div>SON TARİH</div>
            <div />
          </div>

          {fetching && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-400)' }}>Yükleniyor…</div>
          )}

          {!fetching && filtered.map(p => (
            <div key={p.id} className="patient-row" style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1.2fr 40px',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--ink-50)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar initials={toInitials(p.name)} hue={p.avatar_hue} size={40} rounded={12} />
                <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{p.name}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-600)', fontSize: 14, fontWeight: 500 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ink-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}>
                  <IPhone size={14} />
                </div>
                {p.phone}
              </div>

              <div style={{ color: 'var(--ink-700)', fontSize: 14, fontWeight: 600 }}>{p.lastComplaint}</div>
              <div style={{ color: 'var(--ink-500)', fontSize: 13 }}>{p.lastDate}</div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--ink-300)' }}>
                <IChevR size={18} />
              </div>
            </div>
          ))}

          {!fetching && filtered.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-400)' }}>
              {search ? 'Arama kriterlerine uygun hasta bulunamadı.' : 'Henüz hasta kaydı yok.'}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .patient-row:hover { background-color: var(--ink-50); }
        .patient-row:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
}
