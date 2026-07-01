<template>
  <div v-if="!loading && doctor" style="padding:0 24px 24px">
    <div class="topbar">
      <div class="greet">
        <h1>İstatistikler & Performans Analizi</h1>
        <div class="sub">Kliniğinizin büyüme trendlerini ve muayene verilerini gerçek zamanlı inceleyin.</div>
      </div>
    </div>

    <div v-if="fetching" class="panel fade-up" style="padding:60px;text-align:center;color:var(--ink-400)">Veriler yükleniyor...</div>

    <div v-else style="display:flex;flex-direction:column;gap:24px">
      <!-- Stat Cards Row -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px">
        <div v-for="card in statCards" :key="card.label" style="background:white;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,0.04);border:1px solid var(--ink-100)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span style="font-size:13px;font-weight:700;color:var(--ink-500)">{{ card.label }}</span>
            <div style="width:36px;height:36px;border-radius:10px;background:var(--teal-50);color:var(--teal-700);display:flex;align-items:center;justify-content:center">
              <component :is="card.icon" :size="18" />
            </div>
          </div>
          <div style="font-size:22px;font-weight:800;color:var(--ink-900)">{{ card.value }}</div>
          <div style="font-size:12px;font-weight:600;margin-top:4px" :style="{ color: card.subColor ?? 'var(--ink-500)' }">{{ card.sub }}</div>
        </div>
      </div>

      <!-- Charts Area -->
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:24px">
        <!-- Monthly Trend Chart -->
        <div class="panel" style="padding:24px">
          <h3 style="font-size:16px;font-weight:700;color:var(--ink-900);margin-bottom:20px;display:flex;align-items:center;gap:8px">
            <IGraph :size="18" color="var(--teal-700)" /> Aylık Muayene Trendi
          </h3>
          <div v-if="stats.monthly.length === 0" style="height:260px;display:flex;align-items:center;justify-content:center;color:var(--ink-400);font-weight:500">
            Trend analizi için yeterli veri bulunmuyor.
          </div>
          <div v-else style="display:flex;justify-content:space-between;align-items:flex-end;height:240px;padding:0 16px;gap:16px">
            <div v-for="m in stats.monthly" :key="m.key" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px">
              <div style="font-size:12px;font-weight:700;color:var(--teal-700)">{{ m.count }}</div>
              <div :style="{ width:'100%', height: `${Math.min((m.count / maxMonthCount) * 160, 160)}px`, minHeight:'12px', background:'linear-gradient(180deg, var(--teal-700) 0%, var(--teal-500) 100%)', borderRadius:'6px 6px 0 0', transition:'height 0.3s ease' }" />
              <div style="font-size:11px;font-weight:600;color:var(--ink-500);text-align:center;white-space:nowrap">{{ m.label }}</div>
            </div>
          </div>
        </div>

        <!-- Top Reasons -->
        <div class="panel" style="padding:24px">
          <h3 style="font-size:16px;font-weight:700;color:var(--ink-900);margin-bottom:20px">🩺 Sık Görülen Şikayet & Muayene Sebepleri</h3>
          <div v-if="stats.reasons.length === 0" style="height:260px;display:flex;align-items:center;justify-content:center;color:var(--ink-400);font-weight:500">
            Şikayet analizi için yeterli veri bulunmuyor.
          </div>
          <div v-else style="display:flex;flex-direction:column;gap:18px">
            <div v-for="r in stats.reasons" :key="r.name" style="display:flex;flex-direction:column;gap:6px">
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:var(--ink-800)">
                <span>{{ r.name }}</span>
                <span style="color:var(--teal-700)">{{ r.count }} Muayene</span>
              </div>
              <div style="width:100%;height:10px;background:var(--ink-50);border-radius:5px;overflow:hidden">
                <div :style="{ width: `${(r.count / maxReasonCount) * 100}%`, height:'100%', background:'var(--teal-700)', borderRadius:'5px', transition:'width 0.3s ease' }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRequireDoctor } from '@/composables/useDoctor'
import { getDoctorStatisticsAction } from '@/actions/doctorActions'
import { IGraph, ICheck, IClock, IX, ICash } from '@/components/ui/icons'

const { doctor, loading } = useRequireDoctor()
const apts    = ref<any[]>([])
const fetching = ref(true)

const MONTH_NAMES: Record<string, string> = {
  '01':'Ocak','02':'Şubat','03':'Mart','04':'Nisan','05':'Mayıs','06':'Haziran',
  '07':'Temmuz','08':'Ağustos','09':'Eylül','10':'Ekim','11':'Kasım','12':'Aralık'
}

const stats = computed(() => {
  let revenue = 0, completed = 0, pending = 0, cancelled = 0
  const reasonsMap: Record<string, number> = {}
  const monthlyMap: Record<string, number> = {}

  for (const a of apts.value) {
    if (a.status === 'completed') { revenue += a.price ?? 0; completed++ }
    else if (a.status === 'pending') pending++
    else if (a.status === 'cancelled') cancelled++
    if (a.reason && a.reason.trim() !== '-') reasonsMap[a.reason] = (reasonsMap[a.reason] || 0) + 1
    if (a.date?.includes('-')) {
      const parts = a.date.split('-')
      if (parts.length >= 2) {
        const k = `${parts[0]}-${parts[1]}`
        monthlyMap[k] = (monthlyMap[k] || 0) + 1
      }
    }
  }

  const reasons = Object.entries(reasonsMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5)
  const monthly = Object.entries(monthlyMap).map(([key, count]) => {
    const [year, month] = key.split('-')
    return { label: `${MONTH_NAMES[month] ?? month} ${year}`, count, key }
  }).sort((a, b) => a.key.localeCompare(b.key)).slice(-6)

  return { revenue, completed, pending, cancelled, total: apts.value.length, reasons, monthly }
})

const maxMonthCount  = computed(() => Math.max(...stats.value.monthly.map(m => m.count), 1))
const maxReasonCount = computed(() => Math.max(...stats.value.reasons.map(r => r.count), 1))

const statCards = computed(() => [
  { label:'Toplam Gelir', value:`${stats.value.revenue.toLocaleString('tr-TR')} IQD`, icon:ICash, sub:'Tamamlanan muayeneler', subColor:'var(--teal-700)' },
  { label:'Tamamlanan Muayeneler', value:stats.value.completed, icon:ICheck, sub:'Toplam muayene sayısı' },
  { label:'Bekleyen Randevular', value:stats.value.pending, icon:IClock, sub:'Aktif onay bekleyenler' },
  { label:'İptal Edilen Randevular', value:stats.value.cancelled, icon:IX, sub:'İptal edilen muayene talepleri' },
])

watch(doctor, async (doc) => {
  if (!doc) return
  const { data } = await getDoctorStatisticsAction(doc.id, doc.doctors_id)
  apts.value = data ?? []
  fetching.value = false
}, { immediate: true })
</script>
