<template>
  <div v-if="!loading && doctor" class="patients-container">
    <div class="topbar">
      <div class="greet">
        <h1>Hastalar</h1>
        <div class="sub">Toplam {{ patients.length }} kayıtlı hasta</div>
      </div>
      <div class="topbar-actions">
        <div class="search-wrap">
          <span class="search-icon"><ISearch :size="16" /></span>
          <input class="search-input" placeholder="İsim veya telefon ile ara…" v-model="search" />
        </div>
      </div>
    </div>

    <div class="panel fade-up" style="padding:0">
      <div class="patient-list">
        <div class="list-header" style="display:grid;grid-template-columns:1.5fr 1.5fr 1.5fr 1.2fr 40px;padding:16px 24px;border-bottom:1px solid var(--ink-100);font-size:13px;font-weight:700;color:var(--ink-500);letter-spacing:0.5px">
          <div>HASTA</div><div>İLETİŞİM</div><div>SON ŞİKAYET</div><div>SON TARİH</div><div />
        </div>

        <div v-if="fetching" style="padding:40px;text-align:center;color:var(--ink-400)">Yükleniyor…</div>

        <div v-for="p in filtered" :key="p.id" class="patient-row" @click="selectedPatient = p"
          style="display:grid;grid-template-columns:1.5fr 1.5fr 1.5fr 1.2fr 40px;align-items:center;padding:16px 24px;border-bottom:1px solid var(--ink-50);cursor:pointer">
          <div style="display:flex;align-items:center;gap:12px">
            <AvatarComp :initials="toInitials(p.name)" :hue="p.avatar_hue" :size="40" :rounded="12" />
            <div style="font-weight:700;color:var(--ink-900)">{{ p.name }}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;color:var(--ink-600);font-size:14px;font-weight:500">
            <div style="width:32px;height:32px;border-radius:8px;background:var(--ink-50);display:flex;align-items:center;justify-content:center;color:var(--ink-400)">
              <IPhone :size="14" />
            </div>
            {{ p.phone }}
          </div>
          <div style="color:var(--ink-700);font-size:14px;font-weight:600">{{ p.lastComplaint }}</div>
          <div style="color:var(--ink-500);font-size:13px">
            {{ p.lastDate && p.lastDate.includes('-') ? new Date(p.lastDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : p.lastDate }}
          </div>
          <div style="display:flex;justify-content:flex-end;color:var(--ink-300)"><IChevR :size="18" /></div>
        </div>

        <div v-if="!fetching && filtered.length === 0" style="padding:60px;text-align:center;color:var(--ink-400)">
          {{ search ? 'Arama kriterlerine uygun hasta bulunamadı.' : 'Henüz hasta kaydı yok.' }}
        </div>
      </div>
    </div>

    <!-- Patient Drawer -->
    <template v-if="selectedPatient">
      <div class="drawer-overlay" @click="selectedPatient = null" />
      <div class="drawer">
        <div class="drawer-head">
          <div>
            <div style="font-size:18px;font-weight:700;letter-spacing:-0.3px">Hasta Detayı</div>
            <div style="font-size:13px;color:var(--ink-500);font-weight:500;margin-top:2px">Tıbbi geçmiş ve randevu kayıtları</div>
          </div>
          <button class="icon-btn" @click="selectedPatient = null"><IX :size="18" /></button>
        </div>
        <div class="drawer-body" style="padding:0 24px 24px">
          <div class="detail-section">
            <div class="detail-label">Hasta Kartı</div>
            <div style="display:flex;align-items:center;gap:14px;background:var(--ink-50);padding:16px;border-radius:14px">
              <AvatarComp :initials="toInitials(selectedPatient.name)" :hue="selectedPatient.avatar_hue" :size="48" :rounded="14" />
              <div style="flex:1">
                <div style="font-size:16px;font-weight:700;color:var(--ink-900)">{{ selectedPatient.name }}</div>
                <div style="font-size:13px;color:var(--ink-500);margin-top:2px;font-weight:500">📞 {{ selectedPatient.phone }}</div>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-label">Randevu Geçmişi</div>
            <div v-if="historyLoading" style="padding:20px;text-align:center;color:var(--ink-400);font-weight:600">Yükleniyor...</div>
            <div v-else-if="history.length === 0" style="padding:20px;text-align:center;color:var(--ink-400);font-weight:600">Kayıt bulunamadı.</div>
            <div v-else style="display:flex;flex-direction:column;gap:12px">
              <div v-for="a in history" :key="a.id" style="display:flex;flex-direction:column;gap:10px;padding:16px;border:1.5px solid var(--ink-100);border-radius:14px;background:white">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <div style="font-size:13px;font-weight:700;color:var(--ink-700)">
                    📅 {{ a.date && a.date.includes('-') ? new Date(a.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : a.date }} · {{ a.time }}
                  </div>
                  <StatusBadge :status="a.status" />
                </div>
                <div style="font-size:14px;font-weight:600;color:var(--ink-900)">🩺 Şikayet: {{ a.reason ?? '-' }}</div>
                <div v-if="a.notes" style="font-size:12px;color:var(--ink-600);background:var(--ink-50);padding:10px 12px;border-radius:10px;font-weight:500;line-height:1.5">Not: {{ a.notes }}</div>
                <a v-if="a.pdf_url" :href="a.pdf_url" target="_blank" rel="noreferrer" class="btn btn-sm btn-outline" style="margin-top:4px;height:36px;font-size:12px;display:inline-flex;align-items:center;gap:6px;justify-content:center;text-decoration:none">📄 Tıbbi Raporu Görüntüle (PDF)</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <style>
    .patient-row:hover { background-color: var(--ink-50); }
    .patient-row:last-child { border-bottom: none; }
    </style>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRequireDoctor } from '@/composables/useDoctor'
import { getDoctorPatientsAction, getPatientHistoryAction } from '@/actions/doctorActions'
import { ISearch, IPhone, IChevR, IX } from '@/components/ui/icons'
import AvatarComp from '@/components/ui/AvatarComp.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

interface Patient { id: string; name: string; phone: string; avatar_hue: number; lastComplaint: string; lastDate: string }

const { doctor, loading } = useRequireDoctor()
const patients = ref<Patient[]>([])
const fetching = ref(true)
const search   = ref('')
const selectedPatient = ref<Patient | null>(null)
const history  = ref<any[]>([])
const historyLoading = ref(false)

const filtered = computed(() =>
  patients.value.filter(p =>
    !search.value || p.name.toLowerCase().includes(search.value.toLowerCase()) || p.phone.includes(search.value)
  )
)

function toInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

watch(doctor, async (doc) => {
  if (!doc) return
  const { data } = await getDoctorPatientsAction(doc.id, doc.doctors_id)
  if (!data) { fetching.value = false; return }
  const seen = new Map<string, Patient>()
  for (const row of data) {
    const p = (row as any).patients as any
    const key = p?.id ?? (row as any).patient_phone ?? (row as any).patient_name ?? 'unknown'
    if (!seen.has(key)) {
      seen.set(key, {
        id: key,
        name: p?.name ?? (row as any).patient_name ?? 'Bilinmeyen',
        phone: p?.phone ?? (row as any).patient_phone ?? '-',
        avatar_hue: p?.avatar_hue ?? 175,
        lastComplaint: (row as any).reason ?? '-',
        lastDate: (row as any).date ?? '-',
      })
    }
  }
  patients.value = Array.from(seen.values())
  fetching.value = false
}, { immediate: true })

watch(selectedPatient, async (p) => {
  if (!p) return
  historyLoading.value = true
  const { data } = await getPatientHistoryAction(p.phone)
  history.value = data ?? []
  historyLoading.value = false
})
</script>
