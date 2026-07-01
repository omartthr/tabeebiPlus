<template>
  <span :class="['badge', `badge-${status}`]">
    <span class="badge-dot" :style="{ background: dot }" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()

const MAP: Record<string, { label: string; dot: string }> = {
  confirmed: { label: 'Onaylandı',  dot: '#17a673' },
  pending:   { label: 'Beklemede',  dot: '#d59528' },
  cancelled: { label: 'İptal',      dot: '#d9534a' },
  completed: { label: 'Tamamlandı', dot: '#0d7377' },
}

const label = computed(() => MAP[props.status]?.label ?? props.status)
const dot   = computed(() => MAP[props.status]?.dot   ?? '#8a9a9e')
</script>
