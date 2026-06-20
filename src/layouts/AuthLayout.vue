<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
    <div class="w-full max-w-md">
      <div class="flex flex-col items-center mb-8">
        <div class="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
          <span class="text-white font-bold text-2xl">C</span>
        </div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">CQIS</h1>
        <p class="text-slate-500 mt-2 text-center">Catering Quotations & Invoicing System</p>
      </div>
      
      <div class="bg-white p-8 rounded-xl border shadow-sm">
        <div v-if="authStore.loading" class="flex flex-col items-center justify-center py-8 text-slate-500">
          <Loader2 class="w-8 h-8 animate-spin text-primary mb-4" />
          <p>Verifying session...</p>
        </div>
        <RouterView v-else />
      </div>
    </div>
  </div>
</template>
