<template>
  <div v-if="!loading && doctor" class="schedule-page-container" style="padding:0 24px 24px">
    <div class="topbar">
      <div class="greet">
        <h1>Randevu Takvimi & Çalışma Saatleri</h1>
        <div class="sub">Haftalık çalışma planınızı ve aktif muayene saatlerinizi yönetin.</div>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:12px;margin-bottom:24px;border-bottom:1px solid var(--ink-100);padding-bottom:12px">
      <button @click="activeTab='appointments'" :style="{ padding:'10px 20px', borderRadius:'10px', border:'none', fontSize:'14px', fontWeight:700, cursor:'pointer', background: activeTab==='appointments'?'var(--teal-700)':'transparent', color: activeTab==='appointments'?'white':'var(--ink-500)', transition:'all 0.2s' }">📅 Haftalık Plan</button>
      <button @click="activeTab='settings'" :style="{ padding:'10px 20px', borderRadius:'10px', border:'none', fontSize:'14px', fontWeight:700, cursor:'pointer', background: activeTab==='settings'?'var(--teal-700)':'transparent', color: activeTab==='settings'?'white':'var(--ink-500)', transition:'all 0.2s' }">⚙️ Çalışma Saatlerini Düzenle</button>
    </div>

    <!-- Weekly Planner -->
    <div v-if="activeTab === 'appointments'" class="panel fade-up" style="padding:24px">
      <h2 style="font-size:18px;color:#1a1a1a;margin-bottom:20px">Önümüzdeki 7 Günlük Plan</h2>
      <div v-if="fetchingApts" style="padding:40px;text-align:center;color:var(--ink-400)">Yükleniyor...</div>
      <div v-else style="display:flex;flex-direction:column;gap:16px">
        <div v-for="day in weekDays" :key="day.key" style="display:flex;gap:16px;border-bottom:1px solid var(--ink-50);padding-bottom:16px">
          <div style="width:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--ink-50);border-radius:12px;padding:12px;flex-shrink:0">
            <span style="font-size:12px;font-weight:600;color:var(--ink-500);text-transform:uppercase">{{ day.shortLabel }}</span>
            <span style="font-size:28px;font-weight:800;color:var(--ink-900);margin:4px 0">{{ day.date.getDate() }}</span>
            <span style="font-size:12px;font-weight:700;color:var(--teal-700)">{{ day.apts.length > 0 ? `${day.apts.length} Randevu` : 'Boş Gün' }}</span>
          </div>
          <div style="flex:1;display:flex;flex-wrap:wrap;gap:12px;align-content:center">
            <div v-if="day.apts.length === 0" style="font-size:13px;color:var(--ink-400);display:flex;align-items:center;font-weight:500">Bu gün için planlanmış randevu bulunmuyor.</div>
            <div v-else v-for="a in day.apts" :key="a.id" style="padding:12px 16px;border-radius:12px;border:1.5px solid var(--ink-100);background:white;display:flex;flex-direction:column;gap:6px;min-width:200px;max-width:280px">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
                <span style="font-size:13px;font-weight:800;color:var(--ink-900)">⏰ {{ a.time }}</span>
                <StatusBadge :status="a.status" />
              </div>
              <div style="font-size:14px;font-weight:700;color:var(--teal-700)">{{ a.patients?.name ?? a.patient_name ?? 'Bilinmeyen' }}</div>
              <div style="font-size:12px;color:var(--ink-500);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🩺 {{ a.reason ?? '-' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Working Hours Settings -->
    <div v-else class="panel fade-up" style="padding:24px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--teal-50);color:var(--teal-700);display:flex;align-items:center;justify-content:center">
          <IClock :size="20" />
        </div>
        <div>
          <h2 style="font-size:18px;color:#1a1a1a;margin:0">Çalışma Saat Dilimleri</h2>
          <p style="color:#666;font-size:13px;margin:2px 0 0 0">Her gün için aktif randevu saat aralıklarını seçin.</p>
        </div>
      </div>

      <div style="display:flex;gap:32px">
        <!-- Days menu -->
        <div style="width:220px;display:flex;flex-direction:column;gap:8px;flex-shrink:0">
          <button v-for="day in DAYS_OF_WEEK" :key="day.id" @click="selectedDay = day.id"
            :style="{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderRadius:'12px', border:'none', background: selectedDay===day.id?'var(--teal-700)':'var(--ink-50)', color: selectedDay===day.id?'white':'var(--ink-700)', fontWeight:700, fontSize:'14px', cursor:'pointer', transition:'all 0.2s' }">
            {{ day.label }}
            <div :style="{ width:'8px', height:'8px', borderRadius:'50%', background: schedule[day.id]?.isOpen ? (selectedDay===day.id?'white':'var(--teal-500)') : 'var(--ink-200)' }" />
          </button>
        </div>

        <!-- Slots grid -->
        <div style="flex:1">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding:12px 16px;background:var(--ink-50);border-radius:12px">
            <div style="font-weight:700;color:var(--ink-900)">{{ DAYS_OF_WEEK.find(d => d.id === selectedDay)?.label }} Durumu</div>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:13px;font-weight:600;color:var(--ink-500)">{{ schedule[selectedDay]?.isOpen ? 'Randevuya Açık' : 'Kapalı (Tatil)' }}</span>
              <label style="position:relative;display:inline-block;width:40px;height:20px">
                <input type="checkbox" :checked="schedule[selectedDay]?.isOpen ?? false" @change="toggleDay(selectedDay)" style="opacity:0;width:0;height:0" />
                <span :style="{ position:'absolute', cursor:'pointer', top:0, left:0, right:0, bottom:0, backgroundColor: schedule[selectedDay]?.isOpen?'var(--teal-700)':'#ccc', transition:'.4s', borderRadius:'34px' }">
                  <span :style="{ position:'absolute', height:'14px', width:'14px', left: schedule[selectedDay]?.isOpen?'22px':'4px', bottom:'3px', backgroundColor:'white', transition:'.4s', borderRadius:'50%' }" />
                </span>
              </label>
            </div>
          </div>

          <div v-if="schedule[selectedDay]?.isOpen" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <button v-for="slot in TIME_SLOTS" :key="slot" @click="toggleSlot(selectedDay, slot)"
              :style="{ padding:'16px', borderRadius:'12px', border: `1.5px solid ${schedule[selectedDay]?.slots.includes(slot)?'var(--teal-700)':'var(--ink-200)'}`, background: schedule[selectedDay]?.slots.includes(slot)?'var(--teal-50)':'white', color: schedule[selectedDay]?.slots.includes(slot)?'var(--teal-700)':'var(--ink-400)', fontWeight:700, fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', transition:'all 0.15s' }">
              {{ slot }}
              <div v-if="schedule[selectedDay]?.slots.includes(slot)" style="width:20px;height:20px;border-radius:50%;background:var(--teal-700);color:white;display:flex;align-items:center;justify-content:center"><ICheck :size="12" :stroke="3" /></div>
              <div v-else style="width:20px;height:20px;border-radius:50%;border:1.5px solid var(--ink-200)" />
            </button>
          </div>
          <div v-else style="height:240px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--ink-50);border-radius:16px;border:1px dashed var(--ink-200);color:var(--ink-400)">
            <div style="margin-bottom:12px;opacity:0.5"><ICal :size="40" /></div>
            <div style="font-weight:600">Bu gün için randevu kabul edilmiyor.</div>
          </div>
        </div>
      </div>

      <div style="display:flex;margin-top:32px">
        <button @click="handleSave" :disabled="saving" class="btn btn-primary" style="width:100%;height:54px;font-size:16px;gap:10px;box-shadow:0 10px 30px rgba(13,115,119,0.2)">
          {{ saving ? 'Kaydediliyor...' : '' }}<ICheck v-if="!saving" :size="20" />{{ saving ? '' : ' Çalışma Saatlerini Kaydet' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRequireDoctor } from '@/composables/useDoctor'
import { getDoctorScheduleAction, getDashboardAppointments, updateDoctorScheduleAction } from '@/actions/doctorActions'
import { TODAY, TR_DAYS_LONG, TR_DAYS_SHORT, TR_MONTHS_LONG, dateKey, addDays } from '@/data'
import { IClock, ICheck, ICal } from '@/components/ui/icons'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Pazartesi' }, { id: 'tue', label: 'Salı' }, { id: 'wed', label: 'Çarşamba' },
  { id: 'thu', label: 'Perşembe' }, { id: 'fri', label: 'Cuma' }, { id: 'sat', label: 'Cumartesi' }, { id: 'sun', label: 'Pazar' },
]

const TIME_SLOTS = ['09:00 - 10:00','10:00 - 11:00','11:00 - 12:00','12:00 - 13:00','13:00 - 14:00','14:00 - 15:00','15:00 - 16:00','16:00 - 17:00']

const DEFAULT_SCHEDULE = DAYS_OF_WEEK.reduce((acc, day) => ({
  ...acc, [day.id]: { isOpen: day.id !== 'sun', slots: day.id !== 'sun' ? [...TIME_SLOTS] : [] }
}), {} as Record<string, { isOpen: boolean; slots: string[] }>)

const { doctor, loading } = useRequireDoctor()
const activeTab   = ref<'appointments' | 'settings'>('appointments')
const schedule    = ref<Record<string, { isOpen: boolean; slots: string[] }>>({ ...DEFAULT_SCHEDULE })
const selectedDay = ref('mon')
const saving      = ref(false)
const apts        = ref<any[]>([])
const fetchingApts = ref(true)

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = addDays(TODAY, i)
    const k = dateKey(d)
    return {
      date: d, key: k,
      label: TR_DAYS_LONG[(d.getDay() + 6) % 7],
      shortLabel: TR_DAYS_SHORT[(d.getDay() + 6) % 7],
      apts: apts.value.filter(a => a.date === k && a.status !== 'cancelled').sort((a: any, b: any) => a.time.localeCompare(b.time)),
    }
  })
)

function toggleDay(dayId: string) {
  const cur = schedule.value[dayId]
  schedule.value[dayId] = { isOpen: !cur.isOpen, slots: !cur.isOpen ? [...TIME_SLOTS] : [] }
}

function toggleSlot(dayId: string, slot: string) {
  const cur = schedule.value[dayId].slots
  schedule.value[dayId].slots = cur.includes(slot) ? cur.filter(s => s !== slot) : [...cur, slot].sort()
}

async function handleSave() {
  if (!doctor.value) return
  saving.value = true
  const { error } = await updateDoctorScheduleAction(doctor.value.id, schedule.value)
  saving.value = false
  if (error) { alert('Hata: ' + error); return }
  alert('Mesai saatleriniz başarıyla güncellendi.')
}

watch(doctor, async (doc) => {
  if (!doc) return
  const [schedRes, aptsRes] = await Promise.all([
    getDoctorScheduleAction(doc.id),
    getDashboardAppointments(doc.id, doc.doctors_id)
  ])
  if (schedRes.data?.schedule) schedule.value = schedRes.data.schedule as any
  apts.value = (aptsRes.data ?? []).filter((a: any) => a.status !== 'cancelled')
  fetchingApts.value = false
}, { immediate: true })
</script>
