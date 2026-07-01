<template>
  <div class="drawer-overlay" @click="$emit('close')" />
  <div class="drawer">
    <div class="drawer-head">
      <div>
        <div style="font-size:18px;font-weight:700;letter-spacing:-0.3px">Randevu Detayı</div>
        <div style="font-size:13px;color:var(--ink-500);font-weight:500;margin-top:2px">
          {{ fmtDateLong(apt.date) }} · {{ apt.time }}
        </div>
      </div>
      <button class="icon-btn" @click="$emit('close')"><IX :size="18" /></button>
    </div>

    <div class="drawer-body">
      <div class="detail-section">
        <div class="detail-label">Hasta</div>
        <div class="detail-card">
          <AvatarComp :initials="apt.patient.initials" :hue="apt.patient.hue" :size="48" :rounded="14" />
          <div style="flex:1">
            <div style="font-size:16px;font-weight:700">{{ apt.patient.name }}</div>
            <div style="font-size:13px;color:var(--ink-500);margin-top:2px">{{ apt.patient.phone }}</div>
            <div v-if="apt.patient.code" style="margin-top:4px;display:inline-block;background:var(--teal-50);border-radius:6px;padding:2px 8px">
              <span style="font-size:11px;font-weight:700;color:var(--teal-700);letter-spacing:0.5px">#{{ apt.patient.code }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">Bilgiler</div>
        <div class="kv-grid">
          <div class="kv"><div class="k">Saat</div><div class="v">{{ apt.time }}</div></div>
          <div class="kv"><div class="k">Durum</div><div class="v"><StatusBadge :status="apt.status" /></div></div>
          <div class="kv"><div class="k">Ücret</div><div class="v">{{ apt.price.toLocaleString('tr-TR') }} IQD</div></div>
        </div>
      </div>

      <div v-if="apt.notes" class="detail-section">
        <div class="detail-label">Notlar</div>
        <div class="detail-card teal">
          <p style="font-size:14px;color:var(--ink-700);font-weight:500;line-height:1.6">{{ apt.notes }}</p>
        </div>
      </div>
    </div>

    <div class="drawer-foot">
      <template v-if="apt.status === 'cancelled'">
        <button class="btn btn-danger" style="flex:1" @click="$emit('report', apt); $emit('close')">Şikayet Et</button>
      </template>
      <template v-else>
        <button class="btn btn-primary" style="flex:1" :disabled="saving || apt.status === 'confirmed'" @click="changeStatus('confirmed')">Onayla</button>
        <button class="btn btn-danger" :disabled="saving" @click="changeStatus('cancelled')"><IX :size="16" /> İptal</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fmtDateLong } from '@/data'
import { updateAppointmentStatus, insertNotificationAction } from '@/actions/doctorActions'
import { IX } from '@/components/ui/icons'
import AvatarComp from '@/components/ui/AvatarComp.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

type AptStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

interface Apt {
  id: string; date: Date; time: string; duration: number; reason: string
  status: AptStatus; notes: string | null; price: number
  patient: { id: string | null; name: string; initials: string; hue: number; phone: string; code: string | null }
}

const props = defineProps<{ apt: Apt; doctorName?: string }>()
const emit  = defineEmits<{ close: []; statusChange: [id: string, status: AptStatus]; report: [apt: Apt] }>()

const saving = ref(false)

async function changeStatus(s: AptStatus) {
  saving.value = true
  await updateAppointmentStatus(props.apt.id, s)

  if (s === 'completed' && props.apt.patient.id) {
    await insertNotificationAction({
      patient_id: props.apt.patient.id,
      unread: true,
      title: 'Muayeneniz Tamamlandı! ⭐',
      body: `${props.doctorName || 'Doktorunuz'} ile olan randevunuz tamamlandı. Doktorunuzu değerlendirmek ister misiniz?`,
      type: 'rating',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString()
    })
  }

  emit('statusChange', props.apt.id, s)
  saving.value = false
  emit('close')
}
</script>
