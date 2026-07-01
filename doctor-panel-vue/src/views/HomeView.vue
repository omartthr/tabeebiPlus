<template><div /></template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDoctorSession } from '@/composables/useDoctor'

const router = useRouter()

onMounted(() => {
  const s = getDoctorSession()
  if (!s) {
    router.replace('/auth/register')
  } else if (s.status === 'approved') {
    router.replace('/dashboard')
  } else {
    router.replace('/auth/pending')
  }
})
</script>
