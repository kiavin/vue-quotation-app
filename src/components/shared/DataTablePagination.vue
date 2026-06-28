<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

const props = defineProps<{
  totalItems: number
  currentPage: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void
  (e: 'update:itemsPerPage', value: number): void
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage)))

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return ((props.currentPage - 1) * props.itemsPerPage) + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})

const handlePageSizeChange = (event: Event) => {
  const value = parseInt((event.target as HTMLSelectElement).value, 10)
  emit('update:itemsPerPage', value)
  emit('update:currentPage', 1)
}

const goToPage = (page: number) => {
  emit('update:currentPage', page)
}
</script>

<template>
  <div class="flex items-center justify-between px-2 py-4 border-t">
    <div class="flex items-center gap-2">
      <p class="text-sm text-slate-500 font-medium">Rows per page</p>
      <select 
        :value="itemsPerPage" 
        @change="handlePageSizeChange"
        class="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </div>
    <div class="flex items-center gap-4 lg:gap-6">
      <div class="flex text-sm font-medium text-slate-500">
        {{ startItem }} - {{ endItem }} of {{ totalItems }}
      </div>
      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="currentPage <= 1"
          @click="goToPage(1)"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="currentPage >= totalPages"
          @click="goToPage(totalPages)"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
