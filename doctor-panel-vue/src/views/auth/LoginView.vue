<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="auth-logo-name">tabeebi<span>+</span></div>
      </div>

      <div class="step-dots">
        <div :class="['step-dot', step === 'phone' ? 'active' : 'done']" />
        <div :class="['step-dot', step === 'otp' ? 'active' : '']" />
      </div>

      <div v-if="error" class="auth-error">{{ error }}</div>

      <!-- Phone step -->
      <div v-if="step === 'phone'" class="fade-up">
        <div class="auth-title">Doktor Girişi</div>
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
          <span style="font-size:14px;color:var(--ink-500)">Hesabınız yok mu? </span>
          <button class="auth-link" @click="$router.push('/auth/register')">Kayıt Olun</button>
        </div>
      </div>

      <!-- OTP step -->
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
          {{ loading ? 'Doğrulanıyor…' : 'Giriş Yap' }}
        </button>
        <div style="text-align:center;margin-top:16px">
          <button class="auth-link" @click="otp=['','','','']; step='phone'">← Numarayı Değiştir</button>
          <span style="color:var(--ink-300);margin:0 10px">·</span>
          <button class="auth-link" @click="sendOtp" :disabled="loading">Tekrar Gönder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { checkDoctorExists, sendOtpAction, verifyOtpAction, getDoctorByPhone } from '@/actions/doctorActions'
import { setDoctorSession } from '@/composables/useDoctor'

const router = useRouter()

type Step = 'phone' | 'otp'
const step        = ref<Step>('phone')
const countryCode = ref('964')
const phone       = ref('')
const otp         = ref(['', '', '', ''])
const loading     = ref(false)
const error       = ref('')
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
  const doc = await checkDoctorExists(fullPhone)
  if (!doc) {
    loading.value = false
    error.value = 'Bu numaraya ait bir doktor kaydı bulunamadı. Lütfen önce kayıt olun.'
    return
  }
  const { error: fnErr } = await sendOtpAction(fullPhone, countryCode.value)
  loading.value = false
  if (fnErr) { error.value = 'Kod gönderilemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'; return }
  phone.value = fullPhone
  step.value = 'otp'
}

async function verifyOtp() {
  error.value = ''
  const code = otp.value.join('')
  if (code.length < 4) { error.value = '4 haneli kodu girin.'; return }
  loading.value = true
  const { data: verifyData, error: verifyErr } = await verifyOtpAction(phone.value, code)
  if (verifyErr || !verifyData?.valid) {
    loading.value = false; error.value = 'Kod hatalı veya süresi dolmuş.'; return
  }
  let doc = verifyData?.doctor
  if (!doc) doc = await getDoctorByPhone(phone.value)
  if (!doc) { router.replace('/auth/register'); return }
  setDoctorSession({ id: doc.id, phone: phone.value, name: doc.name, surname: doc.surname, specialty: doc.specialty, status: doc.status })
  if (doc.status === 'approved') router.replace('/dashboard')
  else router.replace('/auth/pending')
}
</script>
