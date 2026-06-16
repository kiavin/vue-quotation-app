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
import QuotationStatusBadge from '@/components/shared/QuotationStatusBadge.vue'
import { quotationService } from '@/services/quotationService'

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
    q.customers?.name.toLowerCase().includes(query)
  )
})

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
  if (confirm('Are you sure you want to delete this quotation?')) {
    try {
      await quotationService.deleteQuotation(id)
      await quotationStore.fetchQuotations()
    } catch (error) {
      alert('Failed to delete quotation')
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
              placeholder="Search by number or customer..." 
              class="pl-9"
            />
          </div>
        </div>

        <div v-if="quotationStore.loading && quotationStore.quotations.length === 0" class="p-12 text-center">
          <p class="text-slate-500">Loading quotations...</p>
        </div>

        <div v-else>
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
              <TableRow v-for="quo in filteredQuotations" :key="quo.id">
                <TableCell class="font-medium">{{ quo.number }}</TableCell>
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
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
