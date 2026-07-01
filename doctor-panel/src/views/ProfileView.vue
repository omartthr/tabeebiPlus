<template>
  <div v-if="!loading && doctor && profileLoaded" class="profile-container">
    <div class="topbar">
      <div class="greet">
        <h1>Profil & Ayarlar</h1>
        <div class="sub">Hesap ayarlarınızı ve randevu saatlerinizi yönetin</div>
      </div>
    </div>

    <div style="padding:24px;display:flex;flex-direction:column;gap:24px;max-width:948px">

      <!-- Doctor Rating -->
      <div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:space-between">
        <div>
          <h2 style="font-size:18px;color:#1a1a1a;margin-bottom:4px">Doktor Puanı</h2>
          <p style="color:#666;font-size:13px;margin:0">Hastalarınızdan aldığınız ortalama puan.</p>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end">
          <div style="display:flex;gap:4px;margin-bottom:4px">
            <svg v-for="i in 5" :key="i" width="20" height="20" viewBox="0 0 24 24"
              :fill="i <= Math.round(rating) ? '#e6a63b' : 'none'"
              :stroke="i <= Math.round(rating) ? '#e6a63b' : '#ddd'"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div style="font-size:16px;font-weight:800;color:var(--ink-900)">
            {{ rating > 0 ? rating.toFixed(1) : '0.0' }}
            <span style="font-weight:500;color:var(--ink-400);font-size:12px;margin-left:6px">
              ({{ reviewsCount > 0 ? `${reviewsCount} değerlendirme` : 'Henüz puan verilmedi' }})
            </span>
          </div>
        </div>
      </div>

      <!-- Profile Info -->
      <div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.05)">
        <h2 style="font-size:18px;color:#1a1a1a;margin-bottom:20px">Profil Bilgileri</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <label style="font-size:13px;font-weight:700;color:var(--ink-500);display:block;margin-bottom:6px">Ad Soyad</label>
            <input style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--ink-200);font-size:14px;font-weight:600;color:var(--ink-900);background:var(--ink-50);box-sizing:border-box"
              :value="`Dr. ${doctor.name} ${doctor.surname}`" disabled />
          </div>
          <div>
            <label style="font-size:13px;font-weight:700;color:var(--ink-500);display:block;margin-bottom:6px">Uzmanlık</label>
            <input style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--ink-200);font-size:14px;font-weight:600;color:var(--ink-900);background:var(--ink-50);box-sizing:border-box"
              :value="doctor.specialty" disabled />
          </div>
          <div>
            <label style="font-size:13px;font-weight:700;color:var(--ink-500);display:block;margin-bottom:6px">Muayene Ücreti (IQD)</label>
            <input style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--ink-200);font-size:14px;font-weight:600;box-sizing:border-box"
              type="number" v-model="price" placeholder="50000" />
          </div>
          <div>
            <label style="font-size:13px;font-weight:700;color:var(--ink-500);display:block;margin-bottom:6px">Deneyim (Yıl)</label>
            <input style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--ink-200);font-size:14px;font-weight:600;box-sizing:border-box"
              type="number" v-model="expYears" placeholder="1" min="1" max="50" />
          </div>
        </div>

        <!-- Location Info -->
        <div style="margin-top:24px;padding-top:20px;border-top:1.5px solid var(--ink-100)">
          <label style="font-size:13px;font-weight:700;color:var(--ink-500);display:block;margin-bottom:12px">Klinik Konumu</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div>
              <p style="font-size:13px;color:var(--ink-500);margin-bottom:12px">Haritada kliniğinizin bulunduğu yere tıklayarak konumu güncelleyebilirsiniz.</p>
              <component v-if="MapPickerComp" :is="MapPickerComp" :onChange="handleMapChange" :initialLat="locLat" :initialLng="locLng" />
              <div v-else style="height:240px;background:var(--ink-50);border-radius:14px;display:flex;align-items:center;justify-content:center;color:var(--ink-400);font-size:14px">Harita yükleniyor...</div>
            </div>
            <div>
              <label style="font-size:13px;font-weight:700;color:var(--ink-500);display:block;margin-bottom:6px">Açık Adres</label>
              <textarea v-model="locAddr"
                style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--ink-200);font-size:14px;font-weight:600;height:120px;resize:none;box-sizing:border-box"
                placeholder="Örn: Mansour Mah. 14. Sokak, No: 5, Bağdat" />
              <div style="margin-top:12px;padding:12px;background:var(--teal-50);border-radius:10px;font-size:12px;color:var(--teal-700);font-weight:500">
                📍 Seçilen Koordinatlar: {{ locLat ? locLat.toFixed(5) : '??' }}, {{ locLng ? locLng.toFixed(5) : '??' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule -->
      <div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.05)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--teal-50);color:var(--teal-700);display:flex;align-items:center;justify-content:center">
            <IClock :size="20" />
          </div>
          <div>
            <h2 style="font-size:18px;color:#1a1a1a;margin:0">Randevu Saat Aralıkları</h2>
            <p style="color:#666;font-size:13px;margin:2px 0 0 0">Her gün için aktif randevu saatlerini belirleyin. Mobil uygulamada görünür.</p>
          </div>
        </div>

        <div style="display:flex;gap:32px">
          <!-- Days list -->
          <div style="width:200px;display:flex;flex-direction:column;gap:8px;flex-shrink:0">
            <button v-for="day in DAYS" :key="day.id" @click="selectedDay = day.id"
              :style="{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:'10px', border:'none', background: selectedDay===day.id?'var(--teal-700)':'var(--ink-50)', color: selectedDay===day.id?'white':'var(--ink-700)', fontWeight:700, fontSize:'14px', cursor:'pointer', transition:'all 0.2s' }">
              {{ day.label }}
              <div :style="{ width:'8px', height:'8px', borderRadius:'50%', background: schedule[day.id]?.isOpen ? (selectedDay===day.id?'white':'var(--teal-500)') : 'var(--ink-200)' }" />
            </button>
          </div>

          <!-- Slot grid -->
          <div style="flex:1">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding:12px 16px;background:var(--ink-50);border-radius:12px">
              <div style="font-weight:700;color:var(--ink-900)">{{ DAYS.find(d => d.id === selectedDay)?.label }} Durumu</div>
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
              <div style="margin-bottom:12px;opacity:0.5"><IClock :size="40" /></div>
              <div style="font-weight:600">Bu gün için randevu kabul edilmiyor.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div style="display:flex;margin:8px 0">
        <button @click="handleSave" :disabled="saving" class="btn btn-primary"
          style="width:100%;height:54px;font-size:16px;gap:10px;box-shadow:0 10px 30px rgba(13,115,119,0.2)">
          {{ saving ? 'Kaydediliyor...' : '' }}<ICheck v-if="!saving" :size="20" />{{ saving ? '' : ' Tüm Değişiklikleri Kaydet' }}
        </button>
      </div>

      <!-- Logout -->
      <div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.05)">
        <h2 style="margin-bottom:8px;font-size:18px;color:#1a1a1a">Hesap İşlemleri</h2>
        <p style="color:#666;margin-bottom:20px;font-size:14px">Oturumunuzu sonlandırmak için aşağıdaki butonu kullanabilirsiniz.</p>
        <button @click="handleLogout" style="background-color:#ff4d4f;color:white;border:none;padding:12px 24px;border-radius:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Çıkış Yap
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRequireDoctor, clearDoctorSession, setDoctorSession } from '@/composables/useDoctor'
import { getDoctorScheduleAction, getDoctorRegistrationAction, getDoctorInfoAction, updateDoctorProfileAction } from '@/actions/doctorActions'
import { IClock, ICheck } from '@/components/ui/icons'

const DAYS = [
  { id:'mon', label:'Pazartesi' }, { id:'tue', label:'Salı' }, { id:'wed', label:'Çarşamba' },
  { id:'thu', label:'Perşembe' }, { id:'fri', label:'Cuma' }, { id:'sat', label:'Cumartesi' }, { id:'sun', label:'Pazar' },
]
const TIME_SLOTS = ['09:00 - 10:00','10:00 - 11:00','11:00 - 12:00','12:00 - 13:00','13:00 - 14:00','14:00 - 15:00','15:00 - 16:00','16:00 - 17:00']
const DEFAULT_SCHEDULE = DAYS.reduce((acc, day) => ({
  ...acc, [day.id]: { isOpen: day.id !== 'sun', slots: day.id !== 'sun' ? [...TIME_SLOTS] : [] }
}), {} as Record<string, { isOpen: boolean; slots: string[] }>)

const router  = useRouter()
const { doctor, loading } = useRequireDoctor()
const saving       = ref(false)
const selectedDay  = ref('mon')
const schedule     = ref<Record<string, { isOpen: boolean; slots: string[] }>>({ ...DEFAULT_SCHEDULE })
const price        = ref('50000')
const expYears     = ref('1')
const locLat       = ref<number | null>(null)
const locLng       = ref<number | null>(null)
const locAddr      = ref('')
const profileLoaded = ref(false)
const rating       = ref(0)
const reviewsCount = ref(0)
const MapPickerComp = shallowRef<any>(null)

onMounted(() => {
  import('@/components/MapPicker.vue').then(m => { MapPickerComp.value = m.default })
})

function toggleDay(dayId: string) {
  const cur = schedule.value[dayId]
  schedule.value[dayId] = { isOpen: !cur.isOpen, slots: !cur.isOpen ? [...TIME_SLOTS] : [] }
}
function toggleSlot(dayId: string, slot: string) {
  const cur = schedule.value[dayId].slots
  schedule.value[dayId].slots = cur.includes(slot) ? cur.filter(s => s !== slot) : [...cur, slot].sort()
}
function handleMapChange(lat: number, lng: number, addr: string) {
  locLat.value = lat; locLng.value = lng; locAddr.value = addr
}

async function handleSave() {
  if (!doctor.value) return
  saving.value = true
  const priceNum = parseInt(price.value) || 0
  const expNum   = parseInt(expYears.value) || 1
  const { error, regData } = await updateDoctorProfileAction(
    doctor.value.id,
    { price: priceNum, exp_years: expNum, location_address: locAddr.value, location_lat: locLat.value, location_lng: locLng.value },
    schedule.value
  )
  saving.value = false
  if (error) { alert('Hata: ' + error); return }
  if (regData) {
    setDoctorSession({ ...doctor.value, price: priceNum, exp_years: expNum, location_address: locAddr.value, location_lat: locLat.value, location_lng: locLng.value, clinic_name: regData.clinic_name } as any)
  }
  alert('Tüm değişiklikler başarıyla kaydedildi.')
}

function handleLogout() {
  clearDoctorSession()
  router.replace('/auth/login')
}

watch(doctor, async (doc) => {
  if (!doc) return
  let cancelled = false
  const [schedRes, profRes] = await Promise.all([
    getDoctorScheduleAction(doc.id),
    getDoctorRegistrationAction(doc.id),
  ])
  if (cancelled) return
  if (schedRes.data?.schedule) schedule.value = schedRes.data.schedule as any
  if (profRes.data?.price) price.value = String(profRes.data.price)
  if (profRes.data?.exp_years) expYears.value = String(profRes.data.exp_years)
  if (profRes.data?.location_address) locAddr.value = profRes.data.location_address
  if (profRes.data?.location_lat) locLat.value = profRes.data.location_lat
  if (profRes.data?.location_lng) locLng.value = profRes.data.location_lng
  if (profRes.data?.doctors_id) {
    const { data: docData } = await getDoctorInfoAction(profRes.data.doctors_id)
    if (!cancelled && docData) {
      rating.value = Number(docData.rating) || 0
      reviewsCount.value = docData.reviews || 0
    }
  }
  profileLoaded.value = true
  return () => { cancelled = true }
}, { immediate: true })
</script>
