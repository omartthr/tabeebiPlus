<template>
  <div v-if="!loading && doctor">
    <!-- Topbar -->
    <div class="topbar">
      <div class="greet">
        <h1>Günaydın, {{ doctor.name }} Hk. 👋</h1>
        <div class="sub">{{ TR_DAYS_LONG[todayDow] }}, {{ TODAY.getDate() }} {{ TR_MONTHS_LONG[TODAY.getMonth()] }} {{ TODAY.getFullYear() }} · {{ clinicName }}</div>
      </div>
      <div class="topbar-actions">
        <button class="icon-btn"><IBell :size="18" /><span class="dot" /></button>
        <button class="btn btn-primary" @click="showAddModal = true"><IPlus :size="16" /> Randevu Ekle</button>
      </div>
    </div>

    <StatsGrid
      :totalToday="todayStats.total"
      :pendingCount="todayStats.pending"
      :completedCount="todayStats.completed"
      :todayEarnings="todayStats.earnings"
      :yesterdayCount="todayStats.yesterdayCount"
    />

    <div class="panel fade-up">
      <div class="panel-head">
        <div>
          <div class="panel-title">Randevular</div>
          <div class="panel-sub">{{ fmtDateLong(selectedDay) }} · {{ dayApts.length }} aktif randevu</div>
        </div>
        <div class="view-toggle">
          <button :class="{ active: view === 'list' }" @click="view = 'list'"><IList :size="14" /> Liste</button>
          <button :class="{ active: view === 'cal' }" @click="view = 'cal'"><IGrid :size="14" /> Takvim</button>
        </div>
      </div>

      <!-- Day Strip -->
      <div class="day-strip">
        <button v-for="day in WEEK" :key="dateKey(day)"
          :class="['day-pill', { active: dateKey(day) === dateKey(selectedDay), today: dateKey(day) === dateKey(TODAY) }]"
          @click="selectedDay = day">
          <span class="dow">{{ TR_DAYS_SHORT[(day.getDay() + 6) % 7] }}</span>
          <span class="date">{{ day.getDate() }}</span>
          <span v-if="getDayCount(day) > 0" class="count">{{ getDayCount(day) }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="fetching" style="padding:40px;text-align:center;color:var(--ink-400)">Yükleniyor…</div>

      <!-- List View -->
      <template v-else-if="view === 'list'">
        <div v-if="dayApts.length === 0" class="empty">
          <div class="ico"><ICal :size="28" /></div>
          <div class="ttl">Bu gün randevu yok</div>
          <div class="sub">Başka bir gün seçin veya yeni randevu ekleyin.</div>
        </div>
        <div v-else class="appt-list">
          <div v-for="a in dayApts" :key="a.id"
            :class="['appt-row', { active: selectedApt?.id === a.id }]"
            @click="selectedApt = a">
            <div class="appt-time">
              <span class="t">{{ a.time }}</span>
              <span class="dur">{{ a.duration }} dk</span>
            </div>
            <AvatarComp :initials="a.patient.initials" :hue="a.patient.hue" :size="44" :rounded="12" />
            <div class="appt-info">
              <div class="name">{{ a.patient.name }}</div>
              <div class="reason">{{ a.reason && a.reason !== '-' ? a.reason : a.patient.phone }}</div>
            </div>
            <StatusBadge :status="a.status" />
            <IChevR :size="16" color="var(--ink-400)" />
          </div>
        </div>
      </template>

      <!-- Calendar View -->
      <div v-else style="display:flex;flex-direction:column;gap:12px;margin-top:16px;padding:0 16px 16px">
        <div v-for="hourStr in CAL_HOURS" :key="hourStr"
          style="display:flex;align-items:center;gap:16px;border-bottom:1px dashed var(--ink-100);padding-bottom:12px">
          <div style="width:60px;font-size:13px;font-weight:700;color:var(--ink-500)">{{ hourStr }}</div>
          <div style="flex:1;display:flex;gap:12px">
            <template v-if="getSlotApts(hourStr).length > 0">
              <div v-for="a in getSlotApts(hourStr)" :key="a.id"
                @click="selectedApt = a"
                :style="{ flex:1, display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', background:'white', border:`1.5px solid ${a.status === 'pending' ? '#d59528' : '#0d7377'}`, borderRadius:'12px', cursor:'pointer' }">
                <AvatarComp :initials="a.patient.initials" :hue="a.patient.hue" :size="36" :rounded="10" />
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:700;color:var(--ink-900)">{{ a.patient.name }}</div>
                  <div style="font-size:11px;color:var(--ink-400);font-weight:500">{{ a.reason && a.reason !== '-' ? a.reason : a.patient.phone }}</div>
                </div>
                <StatusBadge :status="a.status" />
              </div>
            </template>
            <button v-else :disabled="isSlotPast(hourStr)" @click="openAddWithTime(hourStr)"
              :style="{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', height:'48px', background: isSlotPast(hourStr) ? 'var(--ink-50)' : 'white', border:'1.5px dashed var(--ink-200)', borderRadius:'12px', fontSize:'12px', fontWeight:700, color: isSlotPast(hourStr) ? 'var(--ink-300)' : 'var(--ink-400)', cursor: isSlotPast(hourStr) ? 'not-allowed' : 'pointer' }">
              <template v-if="isSlotPast(hourStr)">Mesai Saati Geçti</template>
              <template v-else><IPlus :size="14" /> Randevu Planla</template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Drawer -->
    <AppointmentDrawer
      v-if="selectedApt"
      :apt="selectedApt"
      :doctorName="doctor ? `Dr. ${doctor.name} ${doctor.surname || ''}` : undefined"
      @close="selectedApt = null"
      @statusChange="handleStatusChange"
      @report="handleReport"
    />

    <!-- Add Appointment Modal -->
    <AddAppointmentModal
      v-if="showAddModal"
      :doctor="doctor"
      :existingApts="apts"
      :preselectedTime="preselectedTime"
      @close="showAddModal = false; preselectedTime = undefined"
      @added="handleAptAdded"
    />

    <CustomAlert :visible="alert.visible" :title="alert.title" :message="alert.message" @close="alert.visible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRequireDoctor } from '@/composables/useDoctor'
import { getDashboardAppointments, updateAppointmentStatus, insertNotificationAction } from '@/actions/doctorActions'
import { TODAY, TR_DAYS_SHORT, TR_DAYS_LONG, TR_MONTHS_LONG, fmtDateLong, dateKey, addDays } from '@/data'
import { IBell, IPlus, IList, IGrid, ICal, IChevR } from '@/components/ui/icons'
import AvatarComp from '@/components/ui/AvatarComp.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import StatsGrid from '@/components/appointments/StatsGrid.vue'
import AppointmentDrawer from '@/components/appointments/AppointmentDrawer.vue'
import AddAppointmentModal from '@/components/appointments/AddAppointmentModal.vue'
import CustomAlert from '@/components/ui/CustomAlert.vue'

type AptStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

interface Apt {
  id: string; date: Date; dateKey: string; time: string; duration: number
  reason: string; status: AptStatus; notes: string | null; price: number
  patient: { id: string | null; name: string; initials: string; hue: number; phone: string; code: string | null }
}

const { doctor, loading } = useRequireDoctor()

const apts        = ref<Apt[]>([])
const fetching    = ref(true)
const selectedDay = ref<Date>(TODAY)
const view        = ref<'list' | 'cal'>('list')
const selectedApt = ref<Apt | null>(null)
const showAddModal  = ref(false)
const preselectedTime = ref<string | undefined>(undefined)
const alert       = ref({ visible: false, title: '', message: '' })

const WEEK       = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i))
const CAL_HOURS  = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00']
const todayDow   = (TODAY.getDay() + 6) % 7
const clinicName = computed(() => doctor.value?.clinic_name ?? doctor.value?.specialty ?? '')

function toInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

function mapApt(row: any): Apt {
  const patName = row.patients?.name ?? row.patient_name ?? 'Bilinmeyen'
  const hue     = row.patients?.avatar_hue ?? 175
  let d: Date; let dk: string
  if (row.date.includes('-')) {
    const [y, m, day] = row.date.split('-').map(Number)
    d = new Date(y, m - 1, day); dk = row.date
  } else { d = new Date(row.date); dk = row.date }
  return {
    id: row.id, date: d, dateKey: dk, time: row.time, duration: row.duration ?? 30,
    reason: row.reason ?? '-', status: row.status, notes: row.notes, price: Number(row.price ?? 0),
    patient: { id: row.patients?.id ?? row.patient_id ?? null, name: patName, initials: toInitials(patName), hue, phone: row.patients?.phone ?? row.patient_phone ?? '-', code: row.patients?.patient_code ?? null },
  }
}

const todayKey     = dateKey(TODAY)
const yesterdayKey = dateKey(addDays(TODAY, -1))

const todayStats = computed(() => {
  const todayApts     = apts.value.filter(a => a.dateKey === todayKey)
  const yesterdayApts = apts.value.filter(a => a.dateKey === yesterdayKey)
  return {
    total:          todayApts.length,
    pending:        todayApts.filter(a => a.status === 'pending').length,
    completed:      todayApts.filter(a => a.status === 'completed').length,
    earnings:       todayApts.filter(a => a.status === 'completed').reduce((s, a) => s + Number(a.price || 0), 0),
    yesterdayCount: yesterdayApts.length,
  }
})

const dayApts = computed(() => {
  const k = dateKey(selectedDay.value)
  return apts.value
    .filter(a => a.dateKey === k && a.status !== 'completed')
    .sort((a, b) => a.time.localeCompare(b.time))
})

function getDayCount(day: Date) {
  const k = dateKey(day)
  return apts.value.filter(a => a.dateKey === k && a.status !== 'completed' && a.status !== 'cancelled').length
}

function getSlotApts(hourStr: string) {
  return dayApts.value.filter(a => a.time.startsWith(hourStr.split(':')[0] + ':'))
}

function isSlotPast(hourStr: string) {
  if (dateKey(selectedDay.value) !== dateKey(TODAY)) return false
  return parseInt(hourStr) < new Date().getHours()
}

function openAddWithTime(t: string) {
  preselectedTime.value = t
  showAddModal.value = true
}

function handleStatusChange(id: string, status: AptStatus) {
  apts.value = apts.value.map(a => a.id === id ? { ...a, status } : a)
  if (selectedApt.value?.id === id) selectedApt.value = { ...selectedApt.value, status }
}

function handleAptAdded(apt: Apt) {
  apts.value = [...apts.value, apt]
  selectedDay.value = apt.date
}

async function handleReport(a: Apt) {
  alert.value = { visible: true, title: 'Şikayetiniz iletildi', message: 'Gereksiz veya asılsız şikayetlerin hesabınızın incelenmesine neden olabileceğini lütfen unutmayın.' }
  if (a.patient.id && doctor.value) {
    const docName = `Dr. ${doctor.value.name} ${doctor.value.surname || ''}`
    await insertNotificationAction({
      patient_id: a.patient.id, unread: true, title: 'Hesabınız Hakkında Uyarı ⚠️',
      body: `${docName}, randevunuza katılımınız veya davranışınızla ilgili bir şikayet bildiriminde bulundu. Lütfen klinik kurallarına uyunuz.`,
      type: 'block', time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), created_at: new Date().toISOString()
    })
  }
}

async function checkAndAutoComplete(rows: any[]) {
  const now = new Date()
  const updated = [...rows]
  for (let i = 0; i < updated.length; i++) {
    const row = updated[i]
    if (row.status === 'confirmed' || row.status === 'pending') {
      const [y, m, d] = row.date.split('-').map(Number)
      const [h, min]  = row.time.split(':').map(Number)
      const aptDt = new Date(y, m - 1, d, h, min)
      if (aptDt.getTime() < now.getTime()) {
        row.status = 'completed'
        updateAppointmentStatus(row.id, 'completed')
        const patientId = row.patients?.id || row.patient_id
        if (patientId && doctor.value) {
          const docName = `Dr. ${doctor.value.name} ${doctor.value.surname || ''}`
          insertNotificationAction({
            patient_id: patientId, unread: true, title: 'Muayeneniz Tamamlandı! ⭐',
            body: `${docName} ile olan randevunuz tamamlandı. Doktorunuzu değerlendirmek ister misiniz?`,
            type: 'rating', time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), created_at: new Date().toISOString()
          })
        }
      }
    }
  }
  return updated
}

let intervalId: ReturnType<typeof setInterval> | null = null

async function fetchData() {
  if (!doctor.value) return
  const { data } = await getDashboardAppointments(doctor.value.id, doctor.value.doctors_id)
  const processed = await checkAndAutoComplete(data ?? [])
  apts.value = processed.map(mapApt)
  fetching.value = false
}

onMounted(async () => {
  await fetchData()
  intervalId = setInterval(fetchData, 5000)
})

onUnmounted(() => { if (intervalId) clearInterval(intervalId) })
</script>
