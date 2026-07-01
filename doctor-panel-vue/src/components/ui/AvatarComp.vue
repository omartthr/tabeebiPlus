<template>
  <div
    class="avatar"
    :style="{
      width: size + 'px',
      height: size + 'px',
      borderRadius: rounded + 'px',
      background: `linear-gradient(135deg, hsl(${hue} 40% 90%) 0%, hsl(${hue} 35% 78%) 100%)`,
      color: `hsl(${hue} 45% 28%)`,
      fontSize: size * 0.36 + 'px',
    }"
  >{{ initials }}</div>
</template>

<script setup lang="ts">
defineProps<{
  initials: string
  hue?: number
  size?: number
  rounded?: number
}>()
</script>
