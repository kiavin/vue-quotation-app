<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-3xl font-bold tracking-tight">{{ title }}</h2>
      <p v-if="description" class="text-slate-500">{{ description }}</p>
    </div>
    
    <div class="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl bg-white">
      <div class="text-center p-8">
        <h3 class="mt-2 text-lg font-semibold text-slate-900">Module under construction</h3>
        <p class="mt-1 text-sm text-slate-500">We're working hard to bring you the {{ title.toLowerCase() }} module.</p>
      </div>
    </div>
  </div>
</template>
