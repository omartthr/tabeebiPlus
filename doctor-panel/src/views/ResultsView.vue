<template>
  <div v-if="!loading && doctor" class="results-container">
    <div class="topbar">
      <div class="greet">
        <h1>Sonuçlar & Raporlar</h1>
        <div class="sub">Sonuç yüklenmesi beklenen {{ filtered.length }} muayene</div>
      </div>
      <div class="topbar-actions">
        <div class="search-wrap">
          <span class="search-icon"><ISearch :size="16" /></span>
          <input class="search-input" placeholder="İsim veya ID ile ara…" v-model="search" />
        </div>
      </div>
    </div>

    <div class="panel fade-up" style="padding:0">
      <div class="results-list">
        <div style="display:grid;grid-template-columns:1.2fr 1.5fr 1fr 1.2fr;padding:16px 24px;border-bottom:1px solid var(--ink-100);font-size:13px;font-weight:700;color:var(--ink-500);letter-spacing:0.5px">
          <div>HASTA</div><div>MUAYENE TÜRÜ</div><div>DURUM</div><div style="text-align:right">İŞLEM</div>
        </div>

        <div v-if="fetching" style="padding:60px 40px;text-align:center;color:var(--ink-400)">Yükleniyor…</div>

        <div v-else-if="filtered.length === 0" style="padding:80px 40px;text-align:center">
          <div style="width:64px;height:64px;border-radius:20px;background:var(--ink-50);color:var(--ink-300);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
            <ICheck :size="32" />
          </div>
          <div style="font-size:16px;font-weight:700;color:var(--ink-900)">Bekleyen Sonuç Yok</div>
          <div style="font-size:14px;color:var(--ink-500);margin-top:4px">Tüm tamamlanan muayenelerin raporları yüklendi.</div>
        </div>

        <div v-else v-for="r in filtered" :key="r.id" class="result-row"
          style="display:grid;grid-template-columns:1.2fr 1.5fr 1fr 1.2fr;align-items:center;padding:16px 24px;border-bottom:1px solid var(--ink-50);transition:background 0.2s">
          <div style="display:flex;align-items:center;gap:12px">
            <AvatarComp :initials="r.patient.initials" :hue="r.patient.hue" :size="40" :rounded="12" />
            <div>
              <div style="font-weight:700;color:var(--ink-900)">
                {{ r.patient.name }}
                <span v-if="r.patient.code" style="color:var(--teal-700);font-size:12px;margin-left:6px">#{{ r.patient.code }}</span>
              </div>
              <div style="font-size:12px;color:var(--ink-400);font-weight:500">{{ r.patient.phone }}</div>
            </div>
          </div>
          <div style="color:var(--ink-700);font-size:14px;font-weight:600">{{ r.reason ?? '-' }}</div>
          <div><StatusBadge status="completed" /></div>
          <div style="display:flex;justify-content:flex-end;gap:8px">
            <button @click="handleUpload(r.id)" :disabled="uploadingId === r.id || savingNoReport === r.id"
              class="btn btn-sm btn-primary"
              :style="{ height:'36px', padding:'0 14px', fontSize:'13px', backgroundColor: uploadingId===r.id?'var(--ink-200)':'var(--teal-700)' }">
              {{ uploadingId === r.id ? 'Yükleniyor...' : '' }}<IDoc v-if="uploadingId !== r.id" :size="14" />{{ uploadingId === r.id ? '' : ' PDF Rapor Yükle' }}
            </button>
            <button @click="handleNoReportRequired(r.id)" :disabled="uploadingId === r.id || savingNoReport === r.id"
              class="btn btn-sm btn-outline"
              style="height:36px;padding:0 14px;font-size:13px;border-color:var(--ink-300);color:var(--ink-600);background:transparent;cursor:pointer">
              {{ savingNoReport === r.id ? 'Kapatılıyor...' : 'Rapor Gerekmiyor' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <CustomConfirm
      :visible="confirmData.visible"
      title="Rapor Gerekmiyor mu?"
      message="Bu randevu için rapor gerekmediğini onaylıyor musunuz? Bu işlem randevuyu sonuçlar listesinden kaldıracaktır."
      @confirm="executeNoReportRequired"
      @cancel="confirmData.visible = false; confirmData.appointmentId = null"
    />

  </div>
</template>

<style scoped>
.result-row:hover { background-color: var(--ink-50); }
.result-row:last-child { border-bottom: none; }
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRequireDoctor } from '@/composables/useDoctor'
import { getPendingResultsAction, markReportUploadedAction } from '@/actions/doctorActions'
import { ISearch, IDoc, ICheck } from '@/components/ui/icons'
import AvatarComp from '@/components/ui/AvatarComp.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import CustomConfirm from '@/components/ui/CustomConfirm.vue'

interface ResultRow {
  id: string; date: string; time: string; reason: string | null; price: number
  patient: { name: string; phone: string; initials: string; hue: number; code: string | null }
}

function toInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

const { doctor, loading } = useRequireDoctor()
const rows         = ref<ResultRow[]>([])
const fetching     = ref(true)
const uploadingId  = ref<string | null>(null)
const savingNoReport = ref<string | null>(null)
const search       = ref('')
const confirmData  = ref<{ visible: boolean; appointmentId: string | null }>({ visible: false, appointmentId: null })

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  const seen = new Set<string>()
  return rows.value
    .filter(r => { const k = r.patient.phone; if (seen.has(k)) return false; seen.add(k); return true })
    .filter(r => !s || r.patient.name.toLowerCase().includes(s) || (r.patient.code ?? '').includes(s))
})

function handleUpload(id: string) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/pdf'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    uploadingId.value = id
    const formData = new FormData()
    formData.append('file', file)
    formData.append('appointmentId', id)
    const res = await fetch('/api/analyze-report', { method: 'POST', body: formData })
    const data = await res.json()
    uploadingId.value = null
    if (!res.ok) { alert('Yükleme başarısız:\n' + data.error); return }
    rows.value = rows.value.filter(r => r.id !== id)
  }
  input.click()
}

function handleNoReportRequired(id: string) {
  confirmData.value = { visible: true, appointmentId: id }
}

async function executeNoReportRequired() {
  const id = confirmData.value.appointmentId
  if (!id) return
  confirmData.value = { visible: false, appointmentId: null }
  savingNoReport.value = id
  const { error } = await markReportUploadedAction(id)
  savingNoReport.value = null
  if (error) { alert('İşlem başarısız: ' + error); return }
  rows.value = rows.value.filter(r => r.id !== id)
}

watch(doctor, async (doc) => {
  if (!doc) return
  const { data } = await getPendingResultsAction(doc.id, doc.doctors_id)
  rows.value = (data ?? []).map((a: any) => {
    const patName = a.patients?.name ?? a.patient_name ?? 'Bilinmeyen'
    return {
      id: a.id, date: a.date, time: a.time, reason: a.reason, price: a.price ?? 0,
      patient: { name: patName, phone: a.patients?.phone ?? a.patient_phone ?? '-', initials: toInitials(patName), hue: a.patients?.avatar_hue ?? 175, code: a.patients?.patient_code ?? null },
    }
  })
  fetching.value = false
}, { immediate: true })
</script>
