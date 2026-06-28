<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuotationStore } from '@/stores/quotations'
import { Plus, Search, Quote, Eye, Edit, Trash2, Calendar } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import QuotationStatusBadge from '@/components/shared/QuotationStatusBadge.vue'
import DataTablePagination from '@/components/shared/DataTablePagination.vue'
import { usePagination } from '@/composables/usePagination'
import { quotationService } from '@/services/quotationService'
import { notify } from '@/lib/notify'

const router = useRouter()
const quotationStore = useQuotationStore()
const searchQuery = ref('')

onMounted(async () => {
  await quotationStore.fetchQuotations()
})

const filteredQuotations = computed(() => {
  if (!searchQuery.value) return quotationStore.quotations
  const query = searchQuery.value.toLowerCase()
  return quotationStore.quotations.filter(q => 
    q.number.toLowerCase().includes(query) || 
    q.customers?.name.toLowerCase().includes(query) ||
    (q.title && q.title.toLowerCase().includes(query))
  )
})

const {
  currentPage,
  itemsPerPage,
  totalItems,
  paginatedItems
} = usePagination(filteredQuotations)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const handleView = (id?: string) => {
  if (!id) return
  router.push(`/quotations/${id}`)
}

const handleEdit = (id?: string) => {
  if (!id) return
  router.push(`/quotations/${id}/edit`)
}

const handleDelete = async (id?: string) => {
  if (!id) return
  
  const isConfirmed = await notify.confirm(
    'Delete Quotation',
    'Are you sure you want to delete this quotation? This action cannot be undone.',
    { confirmText: 'Yes, delete', icon: 'warning' }
  )

  if (isConfirmed) {
    const result = await quotationService.deleteQuotation(id)
    notify.handleResponse(result)
    if (result.ok) {
      await quotationStore.fetchQuotations()
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Quotations</h2>
        <p class="text-slate-500">View and manage all your catering quotations.</p>
      </div>
      <Button @click="router.push('/quotations/new')" class="gap-2">
        <Plus class="w-4 h-4" />
        New Quotation
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div class="p-4 border-b">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              v-model="searchQuery" 
              placeholder="Search by number, title, or customer..." 
              class="pl-9"
            />
          </div>
        </div>

        <div class="border rounded-lg overflow-hidden bg-white">
          <div class="hidden md:block">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="quotationStore.loading && quotationStore.quotations.length === 0">
                <TableRow v-for="i in 5" :key="i">
                  <TableCell><Skeleton class="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton class="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton class="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton class="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton class="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Skeleton class="h-8 w-8" />
                      <Skeleton class="h-8 w-8" />
                      <Skeleton class="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              </template>
              <template v-else>
                <TableRow v-for="quo in paginatedItems" :key="quo.id">
                <TableCell class="font-medium">
                  <div>
                    <span>{{ quo.number }}</span>
                    <p v-if="quo.title" class="text-xs text-slate-400 font-normal truncate max-w-[200px]">{{ quo.title }}</p>
                  </div>
                </TableCell>
                <TableCell>{{ quo.customers?.name }}</TableCell>
                <TableCell>
                  <div class="flex items-center gap-1.5 text-slate-500">
                    <Calendar class="w-3.5 h-3.5" />
                    {{ formatDate(quo.date) }}
                  </div>
                </TableCell>
                <TableCell>{{ formatCurrency(quo.total) }}</TableCell>
                <TableCell>
                  <QuotationStatusBadge :status="quo.status" />
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" @click="handleView(quo.id)">
                      <Eye class="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="icon" @click="handleEdit(quo.id)">
                      <Edit class="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="icon" @click="handleDelete(quo.id)">
                      <Trash2 class="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="filteredQuotations.length === 0">
                <TableCell colspan="6" class="h-32 text-center text-slate-500">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <Quote class="w-8 h-8 text-slate-200" />
                    <p>No quotations found.</p>
                  </div>
                </TableCell>
              </TableRow>
              </template>
              </TableBody>
            </Table>
            <DataTablePagination 
              v-if="!quotationStore.loading && totalItems > 0"
              :total-items="totalItems"
              v-model:current-page="currentPage"
              v-model:items-per-page="itemsPerPage"
            />
          </div>

          <!-- Mobile Card List -->
          <div class="md:hidden divide-y">
            <template v-if="quotationStore.loading && quotationStore.quotations.length === 0">
              <div v-for="i in 5" :key="i" class="p-4 space-y-3">
                <div class="flex justify-between items-start">
                  <Skeleton class="h-5 w-24" />
                  <Skeleton class="h-6 w-20 rounded-full" />
                </div>
                <div class="space-y-2">
                  <Skeleton class="h-4 w-32" />
                  <Skeleton class="h-4 w-24" />
                </div>
                <div class="flex justify-between items-center pt-2">
                  <Skeleton class="h-5 w-20" />
                  <div class="flex gap-2">
                    <Skeleton class="h-8 w-8" />
                    <Skeleton class="h-8 w-8" />
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div 
                v-for="quo in paginatedItems" 
                :key="quo.id" 
                class="p-4 space-y-3 cursor-pointer hover:bg-slate-50 transition-colors"
                @click="handleView(quo.id)"
              >
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <p class="font-medium text-slate-900">{{ quo.number }}</p>
                    <p v-if="quo.title" class="text-xs text-slate-400 font-normal line-clamp-1 mt-0.5">{{ quo.title }}</p>
                  </div>
                  <QuotationStatusBadge :status="quo.status" />
                </div>
                
                <div class="text-sm text-slate-500 space-y-1">
                  <p class="font-medium text-slate-700">{{ quo.customers?.name }}</p>
                  <div class="flex items-center gap-1.5">
                    <Calendar class="w-3.5 h-3.5" />
                    {{ formatDate(quo.date) }}
                  </div>
                </div>

                <div class="flex justify-between items-center pt-2 border-t">
                  <p class="font-bold text-slate-900">{{ formatCurrency(quo.total) }}</p>
                  <div class="flex gap-1" @click.stop>
                    <Button variant="ghost" size="icon" class="h-8 w-8" @click="handleEdit(quo.id)">
                      <Edit class="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="icon" class="h-8 w-8" @click="handleDelete(quo.id)">
                      <Trash2 class="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
              <div v-if="filteredQuotations.length === 0" class="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Quote class="w-8 h-8 text-slate-200" />
                <p>No quotations found.</p>
              </div>
            </template>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
