<template>
  <div v-if="visible" class="alert-overlay">
    <div class="alert-card" style="max-width:440px">
      <div style="width:64px;height:64px;border-radius:18px;background:var(--teal-50);color:var(--teal-700);display:flex;align-items:center;justify-content:center;margin-bottom:24px">
        <IAlert :size="32" color="currentColor" />
      </div>
      <h3 style="font-size:20px;font-weight:700;color:var(--ink-900);margin-bottom:10px">{{ title }}</h3>
      <p style="font-size:14px;color:var(--ink-500);font-weight:500;line-height:1.6;margin-bottom:32px">{{ message }}</p>
      <div style="display:flex;gap:12px;width:100%">
        <button
          class="btn btn-outline"
          style="flex:1;height:48px;border-color:var(--ink-200);color:var(--ink-600);font-size:14px;font-weight:600"
          @click="$emit('cancel')"
        >{{ cancelText }}</button>
        <button
          class="btn btn-primary"
          style="flex:1;height:48px;font-size:14px;font-weight:600"
          @click="$emit('confirm')"
        >{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IAlert } from './icons'
withDefaults(defineProps<{
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}>(), {
  confirmText: 'Evet, Onayla',
  cancelText: 'Vazgeç',
})
defineEmits<{ confirm: []; cancel: [] }>()
</script>
