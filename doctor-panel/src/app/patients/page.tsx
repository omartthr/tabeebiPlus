'use client';
import { useRequireDoctor } from '@/hooks/useDoctor';
import { supabase } from '@/lib/supabase';
import { ISearch, IPhone, IChevR, Avatar, IX, StatusBadge } from '@/components/ui/icons';
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

function PatientDrawer({ patient, doctor, onClose }: { patient: Patient; doctor: any; onClose: () => void }) {
  const [apts, setApts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = supabase
      .from('appointments')
      .select('id, date, time, reason, status, notes, pdf_url')
      .eq('patient_phone', patient.phone)
      .order('date', { ascending: false });

    q.then(({ data }) => {
      setApts(data ?? []);
      setLoading(false);
    });
  }, [patient.phone]);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Hasta Detayı</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>Tıbbi geçmiş ve randevu kayıtları</div>
          </div>
          <button className="icon-btn" onClick={onClose}><IX size={18} /></button>
        </div>
        <div className="drawer-body" style={{ padding: '0 24px 24px' }}>
          <div className="detail-section">
            <div className="detail-label">Hasta Kartı</div>
            <div className="detail-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--ink-50)', padding: '16px', borderRadius: '14px' }}>
              <Avatar initials={toInitials(patient.name)} hue={patient.avatar_hue} size={48} rounded={14} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}>{patient.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 2, fontWeight: 500 }}>
                  📞 {patient.phone}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-label">Randevu Geçmişi</div>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-400)', fontWeight: 600 }}>Yükleniyor...</div>
            ) : apts.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-400)', fontWeight: 600 }}>Kayıt bulunamadı.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {apts.map(a => (
                  <div key={a.id} className="detail-card" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px', border: '1.5px solid var(--ink-100)', borderRadius: '14px', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-700)' }}>
                        📅 {a.date.includes('-') ? new Date(a.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : a.date} · {a.time}
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>
                      🩺 Şikayet: {a.reason ?? '-'}
                    </div>
                    {a.notes && (
                      <div style={{ fontSize: 12, color: 'var(--ink-600)', background: 'var(--ink-50)', padding: '10px 12px', borderRadius: '10px', fontWeight: 500, lineHeight: 1.5 }}>
                        Not: {a.notes}
                      </div>
                    )}
                    {a.pdf_url && (
                      <a href={a.pdf_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ marginTop: 4, height: 36, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', textDecoration: 'none' }}>
                        📄 Tıbbi Raporu Görüntüle (PDF)
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function PatientsPage() {
  const { doctor, loading } = useRequireDoctor();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!doctor) return;

    let q = supabase
      .from('appointments')
      .select('reason, date, time, patient_name, patient_phone, patients(id, name, phone, avatar_hue)')
      .eq('report_uploaded', true)
      .order('date', { ascending: false });

    if (doctor.doctors_id) {
      q = q.or(`doctor_registration_id.eq.${doctor.id},doctor_id.eq.${doctor.doctors_id}`);
    } else {
      q = q.eq('doctor_registration_id', doctor.id);
    }

    q
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
            <div key={p.id} className="patient-row" onClick={() => setSelectedPatient(p)} style={{
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
              <div style={{ color: 'var(--ink-500)', fontSize: 13 }}>
                {p.lastDate && p.lastDate.includes('-')
                  ? new Date(p.lastDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : p.lastDate}
              </div>

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

      {selectedPatient && (
        <PatientDrawer
          patient={selectedPatient}
          doctor={doctor}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      <style jsx>{`
        .patient-row:hover { background-color: var(--ink-50); }
        .patient-row:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
}
