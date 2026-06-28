<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Activity, Search, Filter, Download } from 'lucide-vue-next'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import DataTablePagination from '@/components/shared/DataTablePagination.vue'
import { usePagination } from '@/composables/usePagination'

const logs = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')

onMounted(async () => {
  try {
    const data = await adminService.fetchAuditLogs()
    logs.value = data
  } catch (error) {
    console.error('Failed to load audit logs', error)
  } finally {
    loading.value = false
  }
})

const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value
  const query = searchQuery.value.toLowerCase()
  return logs.value.filter(log => 
    log.actor.toLowerCase().includes(query) ||
    log.action.toLowerCase().includes(query) ||
    log.organization.toLowerCase().includes(query)
  )
})

const {
  currentPage,
  itemsPerPage,
  totalItems,
  paginatedItems
} = usePagination(filteredLogs)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity class="w-6 h-6 text-slate-400" />
          Global Audit Logs
        </h1>
        <p class="text-sm text-slate-500 mt-1">Immutable record of all platform-level actions.</p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline">
          <Download class="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>

    <!-- Data Table Area -->
    <div class="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div class="relative w-full max-w-md">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            v-model="searchQuery"
            placeholder="Search by actor, action, or organization..." 
            class="pl-9 bg-white" 
          />
        </div>
        <Button variant="outline" class="hidden sm:flex shrink-0">
          <Filter class="w-4 h-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow class="bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Organization</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="5" class="h-24 text-center text-slate-500">Loading audit logs...</TableCell>
          </TableRow>
          <TableRow v-else-if="filteredLogs.length === 0">
            <TableCell colspan="5" class="h-24 text-center text-slate-500">No logs match your search.</TableCell>
          </TableRow>
          <TableRow v-for="log in paginatedItems" :key="log.id" v-else>
            <TableCell class="text-slate-500 whitespace-nowrap">
              {{ new Date(log.timestamp).toLocaleString() }}
            </TableCell>
            <TableCell class="font-medium text-slate-900">{{ log.actor }}</TableCell>
            <TableCell>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700">
                {{ log.action }}
              </span>
            </TableCell>
            <TableCell class="font-mono text-xs text-slate-500">{{ log.resource }}</TableCell>
            <TableCell class="text-slate-600">{{ log.organization }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <DataTablePagination 
        v-if="!loading && totalItems > 0"
        :total-items="totalItems"
        v-model:current-page="currentPage"
        v-model:items-per-page="itemsPerPage"
      />
    </div>
  </div>
</template>
