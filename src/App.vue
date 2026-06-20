<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Analytics } from '@vercel/analytics/vue'
import GlobalAppLoader from '@/components/shared/GlobalAppLoader.vue'
</script>

<template>
  <Analytics />
  <GlobalAppLoader />
  <RouterView />
</template>
