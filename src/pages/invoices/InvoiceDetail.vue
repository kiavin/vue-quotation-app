<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import type { Invoice } from '@/services/invoiceService'
import { 
  ChevronLeft, 
  Printer, 
  Send, 
  CheckCircle, 
  FileText,
  User,
  MapPin,
  Calendar,
  Clock,
  CreditCard
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import InvoiceStatusBadge from '@/components/shared/InvoiceStatusBadge.vue'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table'

const router = useRouter()
const route = useRoute()
const invoicesStore = useInvoicesStore()
const isLoading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  try {
    await invoicesStore.loadInvoice(id)
  } catch (error) {
    alert('Failed to load invoice')
    router.push('/invoices')
  } finally {
    isLoading.value = false
  }
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const formatDate = (date?: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const handleStatusChange = async (status: Invoice['status']) => {
  if (!invoicesStore.currentInvoice?.id) return
  try {
    await invoicesStore.updateStatus(invoicesStore.currentInvoice.id, status)
  } catch (error) {
    alert('Failed to update status')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4" v-if="invoicesStore.currentInvoice">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/invoices')">
          <ChevronLeft class="w-5 h-5" />
        </Button>
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900">{{ invoicesStore.currentInvoice.number }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <InvoiceStatusBadge :status="invoicesStore.currentInvoice.status" />
            <span class="text-slate-500 text-sm">Issued on {{ formatDate(invoicesStore.currentInvoice.issue_date) }}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="outline" class="gap-2" @click="handleStatusChange('sent')" v-if="invoicesStore.currentInvoice.status === 'draft'">
          <Send class="w-4 h-4" />
          Mark as Sent
        </Button>
        <Button variant="outline" class="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50" @click="handleStatusChange('paid')" v-if="invoicesStore.currentInvoice.status === 'sent' || invoicesStore.currentInvoice.status === 'overdue'">
          <CheckCircle class="w-4 h-4" />
          Mark as Paid
        </Button>
        <div class="w-px h-8 bg-slate-200 mx-1"></div>
        <Button variant="outline" class="gap-2" @click="router.push(`/invoices/${invoicesStore.currentInvoice.id}/print`)">
          <FileText class="w-4 h-4" />
          Preview
        </Button>
        <Button class="gap-2" @click="router.push(`/invoices/${invoicesStore.currentInvoice.id}/print?print=true`)">
          <Printer class="w-4 h-4" />
          Export PDF
        </Button>
      </div>
    </div>

    <div v-if="!isLoading && invoicesStore.currentInvoice" class="grid gap-6 lg:grid-cols-3">
      <!-- Details & Items -->
      <div class="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <User class="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase">Customer</p>
                  <p class="text-slate-900 font-medium">{{ invoicesStore.currentInvoice.customers?.name }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <MapPin class="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase">Billing Address</p>
                  <p class="text-slate-900 whitespace-pre-line">{{ invoicesStore.currentInvoice.customers?.address || 'No address' }}</p>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <Calendar class="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase">Issue Date</p>
                  <p class="text-slate-900 font-medium">{{ formatDate(invoicesStore.currentInvoice.issue_date) }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Clock class="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase">Due Date</p>
                  <p class="text-slate-900 font-medium">{{ formatDate(invoicesStore.currentInvoice.due_date) }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead class="w-24 text-center">Qty</TableHead>
                  <TableHead class="w-32 text-right">Price</TableHead>
                  <TableHead class="w-32 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in invoicesStore.currentInvoice.items" :key="item.id">
                  <TableCell class="font-medium">{{ item.name }}</TableCell>
                  <TableCell class="text-center">{{ item.quantity }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.price) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.total) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card v-if="invoicesStore.currentInvoice.notes">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-slate-600 whitespace-pre-line">{{ invoicesStore.currentInvoice.notes }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Summary -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Subtotal</span>
              <span>{{ formatCurrency(invoicesStore.currentInvoice.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Transport Charge</span>
              <span>{{ formatCurrency(invoicesStore.currentInvoice.transport_charge) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Tax ({{ invoicesStore.currentInvoice.tax_rate }}%)</span>
              <span>{{ formatCurrency(invoicesStore.currentInvoice.tax_amount) }}</span>
            </div>
            <div class="border-t pt-4 mt-4 flex justify-between items-center">
              <span class="font-bold text-lg text-slate-900">Total</span>
              <span class="font-bold text-2xl text-primary">{{ formatCurrency(invoicesStore.currentInvoice.total) }}</span>
            </div>
            
            <div class="pt-4 border-t" v-if="invoicesStore.currentInvoice.status === 'paid'">
              <div class="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2">
                <CheckCircle class="w-5 h-5" />
                <span class="font-semibold">Paid in Full</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card v-if="invoicesStore.currentInvoice.status !== 'paid' && invoicesStore.currentInvoice.status !== 'void'">
          <CardHeader>
            <CardTitle>Payment Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <Button class="w-full gap-2" variant="default" @click="handleStatusChange('paid')">
              <CreditCard class="w-4 h-4" />
              Record Payment
            </Button>
            <p class="text-xs text-slate-500 text-center">Mark this invoice as paid after receiving payment from the customer.</p>
          </CardContent>
        </Card>
      </div>
    </div>

    <div v-else-if="isLoading" class="text-center p-12">
      <p class="text-slate-500">Loading invoice details...</p>
    </div>
  </div>
</template>
