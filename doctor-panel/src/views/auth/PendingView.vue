<template>
  <div class="auth-page">
    <div class="auth-card" style="text-align:center">
      <div class="auth-logo" style="justify-content:center">
        <div class="auth-logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="auth-logo-name">tabeebi<span>+</span></div>
      </div>

      <div class="pending-icon">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
        </svg>
      </div>

      <div class="auth-title" style="margin-bottom:8px">Başvurunuz İnceleniyor</div>
      <div class="auth-sub" style="margin-bottom:24px">
        {{ name ? `Merhaba Dr. ${name},` : 'Merhaba,' }} başvurunuz alındı.<br />
        Ekibimiz bilgilerinizi inceledikten sonra<br />
        <strong>WhatsApp üzerinden bildirim gönderilecektir.</strong>
      </div>

      <ul class="pending-steps" style="text-align:left;margin-bottom:28px">
        <li><div class="step-circle done">✓</div>WhatsApp ile doğrulama yapıldı</li>
        <li><div class="step-circle done">✓</div>Başvuru formu gönderildi</li>
        <li><div class="step-circle wait">⏳</div>Ekibimiz başvurunuzu inceliyor</li>
        <li><div class="step-circle next">4</div>Onay bildirimi WhatsApp'a gelecek</li>
      </ul>

      <button class="btn btn-primary" style="width:100%;height:48px" @click="reCheck" :disabled="checking">
        {{ checking ? 'Kontrol ediliyor…' : 'Onay Durumumu Kontrol Et' }}
      </button>
      <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:10px" @click="logout">Farklı Hesapla Giriş Yap</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDoctorSession, clearDoctorSession } from '@/composables/useDoctor'
import { getDoctorById } from '@/actions/doctorActions'

const router  = useRouter()
const name    = ref('')
const checking = ref(false)

onMounted(() => {
  const s = getDoctorSession()
  if (!s) { router.replace('/auth/register'); return }
  name.value = s.name
})

async function reCheck() {
  const s = getDoctorSession()
  if (!s) return
  checking.value = true
  const { data } = await getDoctorById(s.id)
  checking.value = false
  if (data?.status === 'approved') {
    const updated = { ...s, status: 'approved' as const }
    localStorage.setItem('tabeebi_doctor_session', JSON.stringify(updated))
    router.replace('/dashboard')
  }
}

function logout() {
  clearDoctorSession()
  router.replace('/auth/login')
}
</script>
