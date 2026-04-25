'use client';
import { ICal, IClock, ICheck, ICash, IUp, IGraph } from '@/components/ui/icons';

export default function StatsGrid({ 
  todayCount = 3, 
  pendingCount = 1, 
  completedCount = 0,
  totalToday = 3 
}: { 
  todayCount?: number; 
  pendingCount?: number; 
  completedCount?: number;
  totalToday?: number;
}) {
  const completionRate = totalToday > 0 ? Math.round((completedCount / totalToday) * 100) : 0;

  const stats = [
    {
      title: 'BUGÜNKÜ RANDEVULAR',
      value: totalToday.toString(),
      trend: '3 dünden fazla',
      icon: ICal,
      color: '#0d7377',
      bg: '#e6f4f1',
      trendUp: true
    },
    {
      title: 'ONAY BEKLEYEN',
      value: pendingCount.toString(),
      trend: '2 saat içinde yanıtlayın',
      icon: IClock,
      color: '#d59528',
      bg: '#fff8e6',
      isWait: true
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
      value: (totalToday * 35).toString() + 'K',
      trend: 'IQD · %12 ↑ haftalık',
      icon: ICash,
      color: '#5e35b1',
      bg: '#f3e5f5',
      trendUp: true
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
