<script setup lang="ts">
import { FileText } from 'lucide-vue-next'

const props = defineProps<{
  message?: string
  subtext?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[400px] w-full p-8">
    <div class="relative w-24 h-24 mb-6">
      <!-- Printer Body -->
      <div class="absolute bottom-0 w-full h-8 bg-slate-800 rounded-lg z-20 flex justify-center shadow-lg">
        <div class="w-16 h-1 bg-slate-900 mt-2 rounded-full"></div>
        <div class="absolute -bottom-2 w-20 h-4 bg-slate-700 rounded-b-lg"></div>
      </div>
      
      <!-- Receipt Paper -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 bg-white shadow-sm border border-slate-200 overflow-hidden z-10 animate-print flex flex-col items-center pt-2 gap-1.5 origin-bottom">
        <div class="w-10 h-1 bg-slate-200 rounded-full"></div>
        <div class="w-12 h-1 bg-slate-200 rounded-full"></div>
        <div class="w-8 h-1 bg-slate-200 rounded-full"></div>
        <div class="w-10 h-1 bg-primary/30 rounded-full mt-1"></div>
        <FileText class="w-6 h-6 text-primary mt-2 opacity-50" />
      </div>
    </div>
    
    <div class="flex flex-col items-center gap-2">
      <h3 class="text-lg font-semibold text-slate-800 animate-pulse">
        {{ message || 'Processing...' }}
      </h3>
      <p class="text-sm text-slate-500">
        {{ subtext || 'Please wait while we gather your documents.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes print {
  0% {
    height: 0;
    transform: translateX(-50%) translateY(10px);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    height: 72px;
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  100% {
    height: 72px;
    transform: translateX(-50%) translateY(-5px);
    opacity: 0;
  }
}

.animate-print {
  animation: print 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>
