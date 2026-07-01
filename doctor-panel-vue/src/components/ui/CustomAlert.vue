<template>
  <div v-if="visible" class="alert-overlay">
    <div class="alert-card">
      <div style="width:64px;height:64px;border-radius:18px;background:var(--red-100);color:var(--red-500);display:flex;align-items:center;justify-content:center;margin-bottom:24px">
        <IAlert :size="32" />
      </div>
      <h3 style="font-size:20px;font-weight:700;color:var(--ink-900);margin-bottom:10px">{{ title }}</h3>
      <p style="font-size:14px;color:var(--ink-500);font-weight:500;line-height:1.6;margin-bottom:32px">{{ message }}</p>
      <button class="btn btn-primary" style="width:100%;height:48px" @click="$emit('close')">Tamam</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IAlert } from './icons'
defineProps<{ visible: boolean; title: string; message: string }>()
defineEmits<{ close: [] }>()
</script>
