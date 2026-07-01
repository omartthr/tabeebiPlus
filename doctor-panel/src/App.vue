<template>
  <template v-if="isAuthRoute">
    <router-view />
  </template>
  <template v-else>
    <div class="app">
      <Sidebar />
      <main class="main" id="page-main">
        <router-view />
      </main>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'

const route = useRoute()
const isAuthRoute = computed(() =>
  route.path.startsWith('/auth') || route.path === '/'
)
</script>
