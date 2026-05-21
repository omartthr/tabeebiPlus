'use client';
import { supabase } from '@/lib/supabase';
import { useRequireDoctor } from '@/hooks/useDoctor';
import { useState, useEffect, useMemo } from 'react';
import { IGraph, ICheck, IClock, IX, ICash } from '@/components/ui/icons';

export default function StatisticsPage() {
  const { doctor, loading } = useRequireDoctor();
  const [apts, setApts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!doctor) return;
    
    let query = supabase
      .from('appointments')
      .select('id, price, status, reason, date');

    if (doctor.doctors_id) {
      query = query.or(`doctor_registration_id.eq.${doctor.id},doctor_id.eq.${doctor.doctors_id}`);
    } else {
      query = query.eq('doctor_registration_id', doctor.id);
    }

    query.then(({ data }) => {
      setApts(data ?? []);
      setFetching(false);
    });
  }, [doctor]);

  // Calculations
  const stats = useMemo(() => {
    let revenue = 0;
    let completed = 0;
    let pending = 0;
    let cancelled = 0;
    const reasonsMap: Record<string, number> = {};
    const monthlyMap: Record<string, number> = {};

    apts.forEach(a => {
      if (a.status === 'completed') {
        revenue += a.price ?? 0;
        completed++;
      } else if (a.status === 'pending') {
        pending++;
      } else if (a.status === 'cancelled') {
        cancelled++;
      }

      // Reason frequency
      if (a.reason && a.reason.trim() !== '-') {
        reasonsMap[a.reason] = (reasonsMap[a.reason] || 0) + 1;
      }

      // Monthly grouping (from date e.g. "2026-05-21")
      if (a.date && a.date.includes('-')) {
        const parts = a.date.split('-');
        if (parts.length >= 2) {
          const monthKey = `${parts[0]}-${parts[1]}`; // e.g. "2026-05"
          monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
        }
      }
    });

    const reasonsList = Object.entries(reasonsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const monthNames: Record<string, string> = {
      '01': 'Ocak', '02': 'Şubat', '03': 'Mart', '04': 'Nisan',
      '05': 'Mayıs', '06': 'Haziran', '07': 'Temmuz', '08': 'Ağustos',
      '09': 'Eylül', '10': 'Ekim', '11': 'Kasım', '12': 'Aralık'
    };

    const monthlyList = Object.entries(monthlyMap)
      .map(([key, count]) => {
        const [year, month] = key.split('-');
        return {
          label: `${monthNames[month] ?? month} ${year}`,
          count,
          key
        };
      })
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6); // last 6 months

    return {
      revenue,
      completed,
      pending,
      cancelled,
      total: apts.length,
      reasons: reasonsList,
      monthly: monthlyList
    };
  }, [apts]);

  if (loading || !doctor) return null;

  const maxMonthCount = Math.max(...stats.monthly.map(m => m.count), 1);
  const maxReasonCount = Math.max(...stats.reasons.map(r => r.count), 1);

  return (
    <div className="statistics-page-container" style={{ padding: '0 24px 24px' }}>
      <div className="topbar">
        <div className="greet">
          <h1>İstatistikler & Performans Analizi</h1>
          <div className="sub">Kliniğinizin büyüme trendlerini ve muayene verilerini gerçek zamanlı inceleyin.</div>
        </div>
      </div>

      {fetching ? (
        <div className="panel fade-up" style={{ padding: 60, textAlign: 'center', color: 'var(--ink-400)' }}>Veriler yükleniyor...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Main Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)' }}>Toplam Gelir</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ICash size={18} />
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)' }}>{stats.revenue.toLocaleString('tr-TR')} IQD</div>
              <div style={{ fontSize: 12, color: 'var(--teal-700)', fontWeight: 600, marginTop: 4 }}>Tamamlanan muayeneler</div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)' }}>Tamamlanan Muayeneler</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ICheck size={18} />
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink-900)' }}>{stats.completed}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, marginTop: 4 }}>Toplam muayene sayısı</div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)' }}>Bekleyen Randevular</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IClock size={18} />
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink-900)' }}>{stats.pending}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, marginTop: 4 }}>Aktif onay bekleyenler</div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-500)' }}>İptal Edilen Randevular</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IX size={18} />
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink-900)' }}>{stats.cancelled}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, marginTop: 4 }}>İptal edilen muayene talepleri</div>
            </div>
          </div>

          {/* Charts Area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            
            {/* Monthly Trend Chart */}
            <div className="panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IGraph size={18} color="var(--teal-700)" /> Aylık Muayene Trendi
              </h3>

              {stats.monthly.length === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)', fontWeight: 500 }}>
                  Trend analizi için yeterli veri bulunmuyor.
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 240, padding: '0 16px', gap: 16 }}>
                  {stats.monthly.map(m => {
                    const pct = (m.count / maxMonthCount) * 100;
                    return (
                      <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-700)' }}>{m.count}</div>
                        <div style={{
                          width: '100%',
                          height: `${pct * 1.6}px`, // scaled height
                          maxHeight: 160,
                          minHeight: 12,
                          background: 'linear-gradient(180deg, var(--teal-700) 0%, var(--teal-500) 100%)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.3s ease'
                        }} />
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textAlign: 'center', whiteSpace: 'nowrap' }}>{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Patient Reasons / Complaints */}
            <div className="panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 20 }}>
                🩺 Sık Görülen Şikayet & Muayene Sebepleri
              </h3>

              {stats.reasons.length === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)', fontWeight: 500 }}>
                  Şikayet analizi için yeterli veri bulunmuyor.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {stats.reasons.map(r => {
                    const pct = (r.count / maxReasonCount) * 100;
                    return (
                      <div key={r.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--ink-800)' }}>
                          <span>{r.name}</span>
                          <span style={{ color: 'var(--teal-700)' }}>{r.count} Muayene</span>
                        </div>
                        <div style={{ width: '100%', height: 10, background: 'var(--ink-50)', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: 'var(--teal-700)',
                            borderRadius: 5,
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
