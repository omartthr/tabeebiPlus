<template>
  <aside v-if="visible" class="sidebar">
    <div class="sb-brand">
      <div class="sb-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>
      <div>
        <div class="sb-name">tabeebi<span>+</span></div>
        <div class="sb-role">Doktor Paneli</div>
      </div>
    </div>

    <div class="sb-section-label">Menü</div>
    <nav class="sb-nav">
      <a v-for="item in NAV" :key="item.href" :href="item.href" style="text-decoration:none">
        <button :class="['sb-item', { active: isActive(item.href) }]">
          <component :is="item.icon" :size="18" color="currentColor" />
          {{ item.label }}
          <span v-if="item.badgeKey === 'pending' && pendingBadge" class="badge-count">{{ pendingBadge }}</span>
        </button>
      </a>
    </nav>

    <div class="sb-doctor">
      <AvatarComp :initials="initials" :hue="175" :size="38" :rounded="10" />
      <div style="overflow:hidden">
        <div class="name">{{ fullName }}</div>
        <div class="sub">{{ specialty }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IDash, ICal, IUsers, IDoc, IGraph, ISet } from '@/components/ui/icons'
import AvatarComp from '@/components/ui/AvatarComp.vue'
import { getDoctorSession, type DoctorSession } from '@/composables/useDoctor'
import { getPendingCountAction } from '@/actions/doctorActions'

const NAV = [
  { href: '/dashboard', icon: IDash,  label: 'Gösterge Paneli', badgeKey: 'pending' },
  { href: '/patients',  icon: IUsers, label: 'Hastalar' },
  { href: '/results',   icon: IDoc,   label: 'Sonuçlar' },
  { href: '/profile',   icon: ISet,   label: 'Ayarlar' },
]

const visible      = ref(false)
const doctor       = ref<DoctorSession | null>(null)
const pendingBadge = ref<number | null>(null)
const activePath   = ref('')

function isActive(href: string) {
  if (href === '/dashboard') return activePath.value === href
  return activePath.value.startsWith(href)
}

const initials = () => {
  if (!doctor.value) return '?'
  return ((doctor.value.name?.[0] ?? '') + (doctor.value.surname?.[0] ?? '')).toUpperCase()
}
const fullName  = () => doctor.value ? `Dr. ${doctor.value.name} ${doctor.value.surname}` : ''
const specialty = () => doctor.value?.specialty ?? ''

onMounted(() => {
  const path = window.location.pathname
  activePath.value = path
  const isPanel = !path.startsWith('/auth') && path !== '/'
  visible.value = isPanel
  if (isPanel) {
    const doc = getDoctorSession()
    doctor.value = doc
    if (doc) {
      getPendingCountAction(doc.id, doc.doctors_id).then(({ count }) => {
        if (count > 0) pendingBadge.value = count
      })
    }
  }
})
</script>
