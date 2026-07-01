<template>
  <div class="drawer-overlay" @click="$emit('close')" />
  <div class="drawer">
    <div class="drawer-head">
      <div>
        <div style="font-size:18px;font-weight:700;letter-spacing:-0.3px">Randevu Ekle</div>
        <div style="font-size:13px;color:var(--ink-500);font-weight:500;margin-top:2px">Yeni hasta randevusu oluştur</div>
      </div>
      <button class="icon-btn" @click="$emit('close')"><IX :size="18" /></button>
    </div>

    <div class="drawer-body">
      <div v-if="errorMsg" style="margin:0 24px 16px;padding:12px 16px;background:#FEF2F2;border:1px solid #FCA5A5;border-radius:12px;color:#991B1B;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px">
        <IX :size="16" /><span>{{ errorMsg }}</span>
      </div>

      <div class="detail-section">
        <div class="detail-label">Hasta Bilgileri</div>
        <input :style="inp" placeholder="Telefon numarası" v-model="phone" @blur="lookupPatient" @input="existingPatient = null" />
        <div v-if="existingPatient" style="margin-top:8px;padding:8px 12px;background:var(--teal-50);border-radius:10px;font-size:13px;color:var(--teal-700);font-weight:600">
          ✓ Kayıtlı hasta: {{ existingPatient.name }}
        </div>
        <input :style="{ ...inp, marginTop: '8px' }" placeholder="Ad Soyad" v-model="name" :readonly="!!existingPatient" />
      </div>

      <div class="detail-section">
        <div class="detail-label">Tarih & Saat</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <input :style="inp" type="date" v-model="date" :min="initialDate" />
          <!-- Time Picker -->
          <div style="position:relative">
            <button type="button" @click="timeOpen = !timeOpen" :style="{ ...inp, cursor: 'pointer', textAlign: 'left', display: 'block', lineHeight: '1.5' }">{{ time }}</button>
            <div v-if="timeOpen" style="position:absolute;top:110%;left:0;right:0;z-index:100;background:var(--surface);border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.12);border:1px solid var(--ink-100);display:flex;overflow:hidden">
              <div style="flex:1;max-height:200px;overflow-y:auto;border-right:1px solid var(--ink-100)">
                <div v-for="h in filteredHours" :key="h"
                  @click="() => { if(!isHourFullyOccupied(h)) selectHour(h) }"
                  :style="{ padding:'9px 14px', fontSize:'14px', fontWeight:600, cursor: isHourFullyOccupied(h)?'not-allowed':'pointer', background: h===selH?'var(--teal-50)':'transparent', color: isHourFullyOccupied(h)?'var(--ink-300)':(h===selH?'var(--teal-700)':'var(--ink-700)'), textDecoration: isHourFullyOccupied(h)?'line-through':'none', display:'flex', alignItems:'center', justifyContent:'space-between' }"
                >
                  <span>{{ h }}:00</span>
                  <span v-if="isHourFullyOccupied(h)" style="font-size:10px;font-weight:500;color:var(--red-500);background:#FEF2F2;padding:2px 6px;border-radius:4px">Dolu</span>
                </div>
              </div>
              <div style="flex:1;max-height:200px;overflow-y:auto">
                <div v-for="m in filteredMins" :key="m"
                  @click="() => { const t=`${selH}:${m}`; if(!occupiedTimes.includes(t)) { time=t; timeOpen=false } }"
                  :style="{ padding:'9px 14px', fontSize:'14px', fontWeight:600, cursor: occupiedTimes.includes(`${selH}:${m}`)?'not-allowed':'pointer', background: m===selM?'var(--teal-50)':'transparent', color: occupiedTimes.includes(`${selH}:${m}`)?'var(--ink-300)':(m===selM?'var(--teal-700)':'var(--ink-700)'), textDecoration: occupiedTimes.includes(`${selH}:${m}`)?'line-through':'none', display:'flex', alignItems:'center', justifyContent:'space-between' }"
                >
                  <span>:{{ m }}</span>
                  <span v-if="occupiedTimes.includes(`${selH}:${m}`)" style="font-size:10px;font-weight:500;color:var(--red-500);background:#FEF2F2;padding:2px 6px;border-radius:4px">Dolu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">Muayene Detayları</div>
        <input :style="inp" placeholder="Şikayet / Muayene türü" v-model="reason" />
        <div :style="{ ...inp, marginTop:'8px', color:'var(--ink-500)', cursor:'default', display:'block', lineHeight:'1.5' }">
          {{ price !== null ? `${price.toLocaleString('tr-TR')} IQD` : 'Ücret yükleniyor…' }}
        </div>
        <textarea :style="{ ...inp, marginTop:'8px', resize:'vertical', minHeight:'72px', display:'block' }" placeholder="Notlar (isteğe bağlı)" v-model="notes" />
      </div>
    </div>

    <div class="drawer-foot">
      <button class="btn btn-outline" @click="$emit('close')">İptal</button>
      <button class="btn btn-primary" style="flex:1" :disabled="saving || !phone || !name || !date || !time" @click="handleSubmit">
        {{ saving ? 'Kaydediliyor…' : 'Randevu Oluştur' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { dateKey, addDays, TODAY } from '@/data'
import { getDoctorScheduleAction, getDoctorPriceAction, lookupPatientAction, checkAppointmentCollisionAction, createTemporaryPatientAction, createAppointmentAction } from '@/actions/doctorActions'
import { IX } from '@/components/ui/icons'

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 8).padStart(2, '0'))
const MINS  = ['00', '10', '20', '30', '40', '50']

const props = defineProps<{
  doctor: any
  existingApts?: any[]
  preselectedTime?: string
}>()

const emit = defineEmits<{ close: []; added: [apt: any] }>()

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: '12px',
  border: '1.5px solid var(--ink-100)', fontSize: '14px',
  fontWeight: '500', color: 'var(--ink-900)', outline: 'none',
  background: 'var(--bg)', boxSizing: 'border-box' as const,
}

const now = new Date()
const isTodayPast = now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() > 50)
const initialDate = isTodayPast ? dateKey(addDays(TODAY, 1)) : dateKey(TODAY)

const phone = ref('')
const name  = ref('')
const date  = ref(initialDate)
const time  = ref(props.preselectedTime || '09:00')
const reason  = ref('')
const price   = ref<number | null>(null)
const notes   = ref('')
const saving  = ref(false)
const existingPatient = ref<any>(null)
const errorMsg = ref('')
const allowedHours = ref<string[]>([])
const timeOpen = ref(false)
const lastDate = ref('')

const selH = computed(() => time.value.split(':')[0])
const selM = computed(() => time.value.split(':')[1])

const occupiedTimes = computed(() =>
  (props.existingApts ?? [])
    .filter(a => dateKey(a.date) === date.value && a.status !== 'cancelled')
    .map(a => a.time)
)

const filteredHours = computed(() => {
  const base = allowedHours.value.length > 0 ? allowedHours.value : HOURS
  if (date.value !== dateKey(TODAY)) return base
  return base.filter(h => parseInt(h) >= now.getHours())
})

const filteredMins = computed(() => {
  if (date.value !== dateKey(TODAY)) return MINS
  if (parseInt(selH.value) > now.getHours()) return MINS
  return MINS.filter(m => parseInt(m) >= now.getMinutes())
})

function isHourFullyOccupied(h: string) {
  const hNum = parseInt(h)
  const validMins = date.value === dateKey(TODAY) && hNum === now.getHours()
    ? MINS.filter(m => parseInt(m) >= now.getMinutes()) : MINS
  return validMins.every(m => occupiedTimes.value.includes(`${h}:${m}`))
}

function selectHour(h: string) {
  const nextM = filteredMins.value.includes(selM.value) ? selM.value : filteredMins.value[0] ?? '00'
  time.value = `${h}:${nextM}`
}

function getFirstValid(selDate: string, hours: string[], occupied: string[]) {
  const isToday = selDate === dateKey(TODAY)
  const active = hours.length > 0 ? hours : ['09','10','11','12','13','14','15','16','17']
  for (const h of active) {
    const hNum = parseInt(h)
    if (isToday && hNum < now.getHours()) continue
    for (const m of MINS) {
      if (isToday && hNum === now.getHours() && parseInt(m) < now.getMinutes()) continue
      if (!occupied.includes(`${h}:${m}`)) return `${h}:${m}`
    }
  }
  return active[0] ? `${active[0]}:00` : '09:00'
}

async function fetchSchedule() {
  if (!props.doctor) return
  const { data } = await getDoctorScheduleAction(props.doctor.id)
  let uniqueHours: string[] = []
  if (data?.schedule) {
    const sched = data.schedule as any
    const dayIndex = new Date(date.value).getDay()
    const dayKeys = ['sun','mon','tue','wed','thu','fri','sat']
    const daySched = sched[dayKeys[dayIndex]]
    if (daySched?.isOpen) {
      uniqueHours = Array.from(new Set(daySched.slots.map((s: string) => s.split(' - ')[0].split(':')[0]))).sort() as string[]
    }
  }
  if (uniqueHours.length === 0) uniqueHours = ['09','10','11','12','13','14','15','16','17']
  allowedHours.value = uniqueHours
  if (lastDate.value !== date.value || !time.value || time.value === '09:00') {
    time.value = props.preselectedTime || getFirstValid(date.value, uniqueHours, occupiedTimes.value)
    lastDate.value = date.value
  }
}

onMounted(async () => {
  await fetchSchedule()
  if (props.doctor?.doctors_id) {
    const { data } = await getDoctorPriceAction(props.doctor.doctors_id)
    if (data?.price) price.value = data.price
  }
})

watch(() => date.value, fetchSchedule)

async function lookupPatient() {
  const clean = phone.value.replace(/\D/g, '')
  if (clean.length < 7) return
  const { data } = await lookupPatientAction(clean)
  if (data) { existingPatient.value = data; name.value = data.name }
  else existingPatient.value = null
}

async function handleSubmit() {
  if (!phone.value || !name.value || !date.value || !time.value) return
  saving.value = true
  errorMsg.value = ''

  const { data: col } = await checkAppointmentCollisionAction(date.value, time.value, props.doctor.id, props.doctor.doctors_id)
  if (col) {
    errorMsg.value = 'Bu tarih ve saatte zaten dolu bir randevu var. Lütfen farklı bir saat seçin.'
    saving.value = false
    return
  }

  let patientId = existingPatient.value?.id
  if (!patientId) {
    const { data: np } = await createTemporaryPatientAction(name.value, phone.value.replace(/\D/g, ''))
    patientId = np?.id
  }

  const { data: apt, error } = await createAppointmentAction({
    date: date.value, time: time.value, duration: 30,
    reason: reason.value || null, price: price.value ?? 0,
    notes: notes.value || null, status: 'confirmed',
    patient_id: patientId || null,
    patient_name: name.value,
    patient_phone: phone.value.replace(/\D/g, ''),
    doctor_registration_id: props.doctor.id,
    doctor_id: props.doctor.doctors_id || null,
  })

  saving.value = false
  if (error || !apt) { errorMsg.value = 'Randevu oluşturulurken bir hata oluştu.'; return }

  const isRegistered = existingPatient.value?.is_registered ?? false
  if (!isRegistered) {
    const phoneToSend = phone.value.replace(/\D/g, '')
    fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneToSend, appointmentId: apt.id, type: 'created',
        date: date.value, time: time.value,
        doctorName: `${props.doctor.name} ${props.doctor.surname || ''}`
      })
    }).catch(() => {})
  }

  function toInitials(n: string) { return n.split(' ').map((w: string) => w[0]??'').join('').slice(0,2).toUpperCase() }
  const patName = apt.patients?.name ?? apt.patient_name ?? 'Bilinmeyen'
  const mapped = {
    id: apt.id,
    date: new Date(apt.date),
    dateKey: apt.date,
    time: apt.time,
    duration: apt.duration ?? 30,
    reason: apt.reason ?? '-',
    status: apt.status,
    notes: apt.notes,
    price: apt.price ?? 0,
    patient: { id: apt.patients?.id ?? patientId ?? null, name: patName, initials: toInitials(patName), hue: apt.patients?.avatar_hue ?? 175, phone: apt.patients?.phone ?? phone.value, code: apt.patients?.patient_code ?? null },
  }
  emit('added', mapped)
  emit('close')
}
</script>
