<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div class="auth-logo-name">tabeebi<span>+</span></div>
      </div>

      <div class="step-dots">
        <div v-for="(s, i) in STEP_ORDER" :key="s"
          :class="['step-dot', i < stepIdx ? 'done' : '', i === stepIdx ? 'active' : '']" />
      </div>

      <div v-if="error" class="auth-error">{{ error }}</div>

      <!-- Step 1: Phone -->
      <div v-if="step === 'phone'" class="fade-up">
        <div class="auth-title">Doktor Kaydı</div>
        <div class="auth-sub" style="margin-bottom:24px">WhatsApp numaranıza doğrulama kodu göndereceğiz.</div>
        <div class="field">
          <label>Telefon Numarası</label>
          <div class="phone-wrap">
            <select class="phone-prefix-select" v-model="countryCode">
              <option value="964">🇮🇶 +964</option>
              <option value="90">🇹🇷 +90</option>
            </select>
            <input class="phone-input" :placeholder="countryCode === '90' ? '532 123 4567' : '750 123 4567'"
              v-model="phone" @keydown.enter="sendOtp" maxlength="13" inputmode="tel" />
          </div>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:20px;height:48px" @click="sendOtp" :disabled="loading">
          {{ loading ? 'Gönderiliyor…' : 'WhatsApp Kodu Gönder' }}
        </button>
        <div class="auth-divider"><span>veya</span></div>
        <div style="text-align:center">
          <span style="font-size:14px;color:var(--ink-500)">Hesabınız var mı? </span>
          <button class="auth-link" @click="$router.push('/auth/login')">Giriş Yapın</button>
        </div>
      </div>

      <!-- Step 2: OTP -->
      <div v-if="step === 'otp'" class="fade-up">
        <div class="auth-title">Kodu Girin</div>
        <div class="auth-sub" style="margin-bottom:8px">WhatsApp'a gönderilen 4 haneli kodu girin.</div>
        <div style="font-size:13px;color:var(--teal-700);font-weight:600;margin-bottom:4px">+{{ phone }}</div>
        <div class="otp-row" @paste="handleOtpPaste">
          <input v-for="(_, i) in otp" :key="i" :ref="el => { if (el) otpRefs[i] = el as HTMLInputElement }"
            :class="['otp-input', { filled: otp[i] }]" maxlength="1" inputmode="numeric" :value="otp[i]"
            @input="handleOtpChange(i, ($event.target as HTMLInputElement).value)"
            @keydown="(e) => handleOtpKey(i, e)" />
        </div>
        <button class="btn btn-primary" style="width:100%;height:48px" @click="verifyOtp" :disabled="loading">
          {{ loading ? 'Doğrulanıyor…' : 'Doğrula ve Devam Et' }}
        </button>
        <div style="text-align:center;margin-top:16px">
          <button class="auth-link" @click="otp=['','','','']; step='phone'">← Numarayı Değiştir</button>
          <span style="color:var(--ink-300);margin:0 10px">·</span>
          <button class="auth-link" @click="sendOtp" :disabled="loading">Tekrar Gönder</button>
        </div>
      </div>

      <!-- Step 3: Info -->
      <div v-if="step === 'info'" class="fade-up">
        <div class="auth-title">Bilgileriniz</div>
        <div class="auth-sub" style="margin-bottom:4px">Başvurunuz için kişisel bilgilerinizi girin.</div>
        <div class="fields-grid">
          <div class="fields-row">
            <div class="field"><label>Ad *</label><input class="field-input" placeholder="Ahmet" v-model="name" /></div>
            <div class="field"><label>Soyad *</label><input class="field-input" placeholder="Yılmaz" v-model="surname" /></div>
          </div>
          <div class="fields-row">
            <div class="field"><label>Doğum Tarihi</label><input class="field-input" type="date" v-model="birthDate" /></div>
            <div class="field"><label>Klinik Adı</label><input class="field-input" placeholder="Al-Mansour Polikliniği" v-model="clinic" /></div>
          </div>
          <div class="field">
            <label>Uzmanlık Alanı *</label>
            <select class="field-select" v-model="specialty">
              <option value="">Seçiniz…</option>
              <optgroup v-for="(list, cat) in SPECIALTIES" :key="cat" :label="cat">
                <option v-for="s in list" :key="s" :value="s">{{ s }} ({{ (cat as string).split(' ')[0] }})</option>
              </optgroup>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:22px;height:48px" @click="goToLocation">İlerle: Konumu Belirle →</button>
      </div>

      <!-- Step 4: Location -->
      <div v-if="step === 'location'" class="fade-up">
        <div class="auth-title">Klinik Konumu</div>
        <div class="auth-sub" style="margin-bottom:16px">Haritada kliniğinizin bulunduğu yere tıklayın.</div>
        <div class="map-label">Harita</div>
        <MapPicker :onChange="handleMapChange" />
        <button class="btn btn-primary" style="width:100%;margin-top:20px;height:48px" @click="submit" :disabled="loading || !locLat">
          {{ loading ? 'Kaydediliyor…' : 'Başvuruyu Gönder' }}
        </button>
        <button class="btn btn-outline btn-sm" style="width:100%;margin-top:8px" @click="step='info'">← Geri Dön</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { sendOtpAction, verifyOtpAction, getDoctorByPhone, registerDoctor, notifyDoctorAction } from '@/actions/doctorActions'
import { setDoctorSession } from '@/composables/useDoctor'
import MapPicker from '@/components/MapPicker.vue'

const router = useRouter()

const SPECIALTIES: Record<string, string[]> = {
  'Dental (Diş Hekimliği)': ['Ortodonti','Genel Diş Hekimliği','Cerrahi Diş Hekimliği','Periodontoloji','Endodonti'],
  'Laboratories (Laboratuvar & Klinikler)': ['Laboratuvar','Tıbbi Laboratuvar','Tıbbi Analiz','Genel Cerrahi','İç Hastalıkları (Dahiliye)','Acil Tıp','Radyoloji'],
}

type Step = 'phone' | 'otp' | 'info' | 'location'
const STEP_ORDER: Step[] = ['phone', 'otp', 'info', 'location']

const step        = ref<Step>('phone')
const stepIdx     = computed(() => STEP_ORDER.indexOf(step.value))
const countryCode = ref('964')
const phone       = ref('')
const otp         = ref(['', '', '', ''])
const loading     = ref(false)
const error       = ref('')
const name        = ref('')
const surname     = ref('')
const birthDate   = ref('')
const specialty   = ref('')
const clinic      = ref('')
const locLat      = ref<number | null>(null)
const locLng      = ref<number | null>(null)
const locAddr     = ref('')
const otpRefs     = ref<HTMLInputElement[]>([])

function handleOtpChange(i: number, val: string) {
  const d = val.replace(/\D/g, '').slice(-1)
  otp.value[i] = d
  if (d && i < 3) otpRefs.value[i + 1]?.focus()
}
function handleOtpKey(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !otp.value[i] && i > 0) otpRefs.value[i - 1]?.focus()
}
function handleOtpPaste(e: ClipboardEvent) {
  const digits = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 4) ?? ''
  if (digits.length === 4) { otp.value = digits.split(''); otpRefs.value[3]?.focus() }
}

async function sendOtp() {
  error.value = ''
  const clean = phone.value.replace(/\D/g, '').replace(/^0/, '')
  if (clean.length < 9) { error.value = 'Geçerli bir telefon numarası girin.'; return }
  const fullPhone = countryCode.value + clean
  loading.value = true
  const { error: fnErr } = await sendOtpAction(fullPhone, countryCode.value)
  loading.value = false
  if (fnErr) { error.value = 'Kod gönderilemedi. Tekrar deneyin.'; return }
  phone.value = fullPhone
  step.value = 'otp'
}

async function verifyOtp() {
  error.value = ''
  const code = otp.value.join('')
  if (code.length < 4) { error.value = '4 haneli kodu girin.'; return }
  loading.value = true
  const { data, error: fnErr } = await verifyOtpAction(phone.value, code)
  if (fnErr || !data?.valid) {
    loading.value = false; error.value = 'Kod hatalı veya süresi dolmuş.'; return
  }
  let existing = data?.doctor
  if (!existing && data?.valid) existing = await getDoctorByPhone(phone.value)
  loading.value = false
  if (existing) {
    if (existing.status === 'approved') { router.replace('/auth/login'); return }
    setDoctorSession({ id: existing.id, phone: phone.value, name: '', surname: '', specialty: '', status: existing.status })
    router.replace('/auth/pending'); return
  }
  step.value = 'info'
}

function goToLocation() {
  if (!name.value.trim() || !surname.value.trim() || !specialty.value) {
    error.value = 'Ad, Soyad ve Uzmanlık alanı zorunludur.'; return
  }
  error.value = ''
  step.value = 'location'
}

function handleMapChange(lat: number, lng: number, addr: string) {
  locLat.value = lat; locLng.value = lng; locAddr.value = addr
}

async function submit() {
  if (!locLat.value || !locLng.value) { error.value = 'Lütfen haritadan konumunuzu seçin.'; return }
  error.value = ''
  loading.value = true
  const { data: inserted, error: dbErr } = await registerDoctor({
    phone: phone.value, name: name.value.trim(), surname: surname.value.trim(),
    birth_date: birthDate.value || null, specialty: specialty.value,
    clinic_name: clinic.value.trim() || null, location_address: locAddr.value,
    location_lat: locLat.value, location_lng: locLng.value, status: 'pending',
  })
  if (dbErr || !inserted) {
    loading.value = false; error.value = 'Kayıt sırasında bir hata oluştu: ' + dbErr; return
  }
  notifyDoctorAction(phone.value, name.value.trim(), 'received')
  loading.value = false
  setDoctorSession({ id: inserted.id, phone: phone.value, name: name.value.trim(), surname: surname.value.trim(), specialty: specialty.value, status: 'pending' })
  router.replace('/auth/pending')
}
</script>
