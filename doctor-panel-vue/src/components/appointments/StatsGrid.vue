<template>
  <div class="stats-grid fade-up" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:24px">
    <div v-for="(s, i) in stats" :key="i" class="stat-card" style="background:white;border-radius:24px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;gap:12px">
        <div :style="{width:'44px',height:'44px',borderRadius:'14px',background:s.bg,color:s.color,display:'flex',alignItems:'center',justifyContent:'center'}">
          <component :is="s.icon" :size="22" color="currentColor" :stroke="2" />
        </div>
        <div style="font-size:13px;font-weight:700;color:#64748b;letter-spacing:0.5px">{{ s.title }}</div>
      </div>
      <div style="font-size:42px;font-weight:800;color:#0f172a;line-height:1.1">{{ s.value }}</div>
      <div style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600" :style="{color: s.isWait ? '#64748b' : '#17a673'}">
        <IGraph v-if="s.isWait" :size="16" />
        <IUp v-else :size="16" />
        {{ s.trend }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ICal, IClock, ICheck, ICash, IUp, IGraph } from '@/components/ui/icons'

const props = withDefaults(defineProps<{
  pendingCount?: number
  completedCount?: number
  totalToday?: number
  todayEarnings?: number
  yesterdayCount?: number
}>(), {
  pendingCount: 0, completedCount: 0, totalToday: 0, todayEarnings: 0, yesterdayCount: 0
})

const stats = computed(() => {
  const completionRate = props.totalToday > 0 ? Math.round((props.completedCount / props.totalToday) * 100) : 0
  const aptDiff = props.totalToday - props.yesterdayCount
  let aptTrend = 'Dün ile aynı'
  let aptTrendUp = true
  if (aptDiff > 0) { aptTrend = `${aptDiff} dünden fazla`; aptTrendUp = true }
  else if (aptDiff < 0) { aptTrend = `${Math.abs(aptDiff)} dünden az`; aptTrendUp = false }

  return [
    { title: 'BUGÜNKÜ RANDEVULAR', value: props.totalToday.toString(), trend: aptTrend, icon: ICal, color: '#0d7377', bg: '#e6f4f1', trendUp: aptTrendUp },
    { title: 'ONAY BEKLEYEN', value: props.pendingCount.toString(), trend: props.pendingCount > 0 ? `${props.pendingCount} bekleyen randevu` : 'Tüm randevular yanıtlandı', icon: IClock, color: '#d59528', bg: '#fff8e6', isWait: props.pendingCount === 0 },
    { title: 'TAMAMLANAN', value: `${props.completedCount}/${props.totalToday}`, trend: `%${completionRate} tamamlanma`, icon: ICheck, color: '#17a673', bg: '#e8f7f0', trendUp: true },
    { title: 'BUGÜNKÜ KAZANÇ', value: props.todayEarnings > 0 ? (props.todayEarnings >= 1000 ? `${Math.round(props.todayEarnings/1000)}K IQD` : `${props.todayEarnings} IQD`) : '0 IQD', trend: props.todayEarnings > 0 ? 'Gerçekleşen net kazanç' : 'Henüz kazanç oluşmadı', icon: ICash, color: '#5e35b1', bg: '#f3e5f5', trendUp: props.todayEarnings > 0 },
  ]
})
</script>
