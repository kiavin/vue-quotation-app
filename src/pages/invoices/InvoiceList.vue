<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import { Plus, Search, Eye } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
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
import InvoiceStatusBadge from '@/components/shared/InvoiceStatusBadge.vue'

const router = useRouter()
const invoicesStore = useInvoicesStore()

onMounted(async () => {
  await invoicesStore.fetchInvoices()
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const formatDate = (date?: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const handleView = (id?: string) => {
  if (!id) return
  router.push(`/invoices/${id}`)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
        <p class="text-slate-500">Manage and track your customer payments.</p>
      </div>
      <Button @click="router.push('/quotations')" variant="outline" class="gap-2">
        <Plus class="w-4 h-4" />
        New from Quotation
      </Button>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search invoices..." class="pl-10" />
      </div>
    </div>

    <div class="border rounded-lg bg-white overflow-hidden">
      <div class="hidden md:block">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="invoicesStore.loading && invoicesStore.invoices.length === 0">
            <TableRow v-for="i in 5" :key="i">
              <TableCell><Skeleton class="h-5 w-24" /></TableCell>
              <TableCell><Skeleton class="h-5 w-32" /></TableCell>
              <TableCell><Skeleton class="h-5 w-24" /></TableCell>
              <TableCell><Skeleton class="h-5 w-24" /></TableCell>
              <TableCell><Skeleton class="h-5 w-20" /></TableCell>
              <TableCell><Skeleton class="h-6 w-16 rounded-full" /></TableCell>
              <TableCell class="text-right"><Skeleton class="h-8 w-8 ml-auto" /></TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow v-for="invoice in invoicesStore.invoices" :key="invoice.id" class="cursor-pointer hover:bg-slate-50" @click="handleView(invoice.id)">
              <TableCell class="font-medium">{{ invoice.number }}</TableCell>
              <TableCell>{{ invoice.customers?.name }}</TableCell>
              <TableCell>{{ formatDate(invoice.issue_date) }}</TableCell>
              <TableCell>{{ formatDate(invoice.due_date) }}</TableCell>
              <TableCell>{{ formatCurrency(invoice.total) }}</TableCell>
              <TableCell>
                <InvoiceStatusBadge :status="invoice.status" />
              </TableCell>
              <TableCell class="text-right" @click.stop>
                <div class="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" @click="handleView(invoice.id)">
                    <Eye class="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="invoicesStore.invoices.length === 0">
              <TableCell colspan="7" class="h-32 text-center text-slate-500">
                No invoices found. Convert a quotation to get started.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      </div>

      <!-- Mobile Card List -->
      <div class="md:hidden divide-y">
        <template v-if="invoicesStore.loading && invoicesStore.invoices.length === 0">
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
              <Skeleton class="h-8 w-8" />
            </div>
          </div>
        </template>
        <template v-else>
          <div 
            v-for="invoice in invoicesStore.invoices" 
            :key="invoice.id" 
            class="p-4 space-y-3 cursor-pointer hover:bg-slate-50 transition-colors"
            @click="handleView(invoice.id)"
          >
            <div class="flex justify-between items-start gap-4">
              <p class="font-medium text-slate-900">{{ invoice.number }}</p>
              <InvoiceStatusBadge :status="invoice.status" />
            </div>
            
            <div class="text-sm text-slate-500 space-y-1">
              <p class="font-medium text-slate-700">{{ invoice.customers?.name }}</p>
              <p>Due: {{ formatDate(invoice.due_date) }}</p>
            </div>

            <div class="flex justify-between items-center pt-2 border-t">
              <p class="font-bold text-slate-900">{{ formatCurrency(invoice.total) }}</p>
              <div class="flex gap-1" @click.stop>
                <Button variant="ghost" size="icon" class="h-8 w-8" @click="handleView(invoice.id)">
                  <Eye class="w-4 h-4 text-slate-600" />
                </Button>
              </div>
            </div>
          </div>
          <div v-if="invoicesStore.invoices.length === 0" class="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <p>No invoices found. Convert a quotation to get started.</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
