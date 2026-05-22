'use client';
import { ICal, IClock, ICheck, ICash, IUp, IGraph } from '@/components/ui/icons';

export default function StatsGrid({ 
  pendingCount = 0, 
  completedCount = 0,
  totalToday = 0,
  todayEarnings = 0,
  yesterdayCount = 0
}: { 
  pendingCount?: number; 
  completedCount?: number;
  totalToday?: number;
  todayEarnings?: number;
  yesterdayCount?: number;
}) {
  const completionRate = totalToday > 0 ? Math.round((completedCount / totalToday) * 100) : 0;
  const aptDiff = totalToday - yesterdayCount;
  
  let aptTrend = 'Dün ile aynı';
  let aptTrendUp = true;
  if (aptDiff > 0) {
    aptTrend = `${aptDiff} dünden fazla`;
    aptTrendUp = true;
  } else if (aptDiff < 0) {
    aptTrend = `${Math.abs(aptDiff)} dünden az`;
    aptTrendUp = false;
  }

  const stats = [
    {
      title: 'BUGÜNKÜ RANDEVULAR',
      value: totalToday.toString(),
      trend: aptTrend,
      icon: ICal,
      color: '#0d7377',
      bg: '#e6f4f1',
      trendUp: aptTrendUp
    },
    {
      title: 'ONAY BEKLEYEN',
      value: pendingCount.toString(),
      trend: pendingCount > 0 ? `${pendingCount} bekleyen randevu` : 'Tüm randevular yanıtlandı',
      icon: IClock,
      color: '#d59528',
      bg: '#fff8e6',
      isWait: pendingCount === 0
    },
    {
      title: 'TAMAMLANAN',
      value: `${completedCount}/${totalToday}`,
      trend: `%${completionRate} tamamlanma`,
      icon: ICheck,
      color: '#17a673',
      bg: '#e8f7f0',
      trendUp: true
    },
    {
      title: 'BUGÜNKÜ KAZANÇ',
      value: todayEarnings > 0 
        ? (todayEarnings >= 1000 
            ? `${Math.round(todayEarnings / 1000)}K IQD` 
            : `${todayEarnings} IQD`) 
        : '0 IQD',
      trend: todayEarnings > 0 ? 'Gerçekleşen net kazanç' : 'Henüz kazanç oluşmadı',
      icon: ICash,
      color: '#5e35b1',
      bg: '#f3e5f5',
      trendUp: todayEarnings > 0
    }
  ];

  return (
    <div className="stats-grid fade-up" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '20px',
      marginBottom: '24px'
    }}>
      {stats.map((s, i) => (
        <div key={i} className="stat-card" style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '14px', 
              background: s.bg, 
              color: s.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <s.icon size={22} color="currentColor" stroke={2} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>
              {s.title}
            </div>
          </div>
          
          <div style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
            {s.value}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: s.isWait ? '#64748b' : '#17a673' }}>
            {s.isWait ? <IGraph size={16} /> : <IUp size={16} />}
            {s.trend}
          </div>
        </div>
      ))}
    </div>
  );
}
