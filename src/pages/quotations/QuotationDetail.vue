<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { quotationService } from '@/services/quotationService'
import { 
  ChevronLeft, 
  Edit, 
  Calendar, 
  User, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Printer,
  CreditCard,
  Loader2
  } from 'lucide-vue-next'
  import { Button } from '@/components/ui/button'
  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
  import QuotationStatusBadge from '@/components/shared/QuotationStatusBadge.vue'
  import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
  } from '@/components/ui/table'
  import { useInvoicesStore } from '@/stores/invoices'

  const router = useRouter()
  const route = useRoute()
  const invoicesStore = useInvoicesStore()
  const quotation = ref<Quotation | null>(null)
  const isLoading = ref(true)
  const isConverting = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  try {
    quotation.value = await quotationService.getQuotationById(id)
  } catch (error) {
    alert('Failed to load quotation')
    router.push('/quotations')
  } finally {
    isLoading.value = false
  }
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const handleStatusChange = async (status: Quotation['status']) => {
  if (!quotation.value) return
  try {
    await quotationService.updateStatus(quotation.value.id, status)
    quotation.value.status = status
  } catch (error) {
    alert('Failed to update status')
  }
}

const handleConvertToInvoice = async () => {
  if (!quotation.value) return
  isConverting.value = true
  try {
    const invoice = await invoicesStore.createFromQuotation(quotation.value)
    router.push(`/invoices/${invoice.id}`)
  } catch (error) {
    alert('Failed to convert to invoice')
  } finally {
    isConverting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/quotations')">
          <ChevronLeft class="w-5 h-5" />
        </Button>
        <div v-if="quotation">
          <h2 class="text-3xl font-bold tracking-tight text-slate-900">{{ quotation.number }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <QuotationStatusBadge :status="quotation.status" />
            <span class="text-slate-500 text-sm">Issued on {{ formatDate(quotation.date) }}</span>
          </div>
        </div>
      </div>
      <div v-if="quotation" class="flex items-center gap-3">
        <Button variant="default" class="gap-2" @click="handleConvertToInvoice" v-if="quotation.status === 'approved' || quotation.status === 'sent'" :disabled="isConverting">
          <Loader2 v-if="isConverting" class="w-4 h-4 animate-spin" />
          <CreditCard v-else class="w-4 h-4" />
          Convert to Invoice
        </Button>
        <Button variant="outline" class="gap-2" @click="handleStatusChange('sent')" v-if="quotation.status === 'draft'">
          <Send class="w-4 h-4" />
          Mark as Sent
        </Button>
        <Button variant="outline" class="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50" @click="handleStatusChange('approved')" v-if="quotation.status === 'sent'">
          <CheckCircle class="w-4 h-4" />
          Approve
        </Button>
        <Button variant="outline" class="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" @click="handleStatusChange('rejected')" v-if="quotation.status === 'sent'">
          <XCircle class="w-4 h-4" />
          Reject
        </Button>
        <div class="w-px h-8 bg-slate-200 mx-1"></div>
        <Button variant="outline" class="gap-2" @click="router.push(`/quotations/${quotation.id}/edit`)">
          <Edit class="w-4 h-4" />
          Edit
        </Button>
        <Button variant="outline" class="gap-2" @click="router.push(`/quotations/${quotation.id}/print`)">
          <FileText class="w-4 h-4" />
          Preview
        </Button>
        <Button class="gap-2" @click="router.push(`/quotations/${quotation.id}/print?print=true`)">
          <Printer class="w-4 h-4" />
          Export PDF
        </Button>
      </div>
    </div>

    <div v-if="!isLoading && quotation" class="grid gap-6 lg:grid-cols-3">
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
                  <p class="text-slate-900 font-medium">{{ quotation.customers?.name }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <MapPin class="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase">Billing Address</p>
                  <p class="text-slate-900 whitespace-pre-line">{{ quotation.customers?.address || 'No address' }}</p>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <Calendar class="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase">Issue Date</p>
                  <p class="text-slate-900 font-medium">{{ formatDate(quotation.date) }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Clock class="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase">Valid Until</p>
                  <p class="text-slate-900 font-medium">{{ quotation.expiry_date ? formatDate(quotation.expiry_date) : 'No expiry date' }}</p>
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
                <TableRow v-for="item in quotation.items" :key="item.id">
                  <TableCell class="font-medium">{{ item.name }}</TableCell>
                  <TableCell class="text-center">{{ item.quantity }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.price) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.total) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card v-if="quotation.notes">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-slate-600 whitespace-pre-line">{{ quotation.notes }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Summary -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Subtotal</span>
              <span>{{ formatCurrency(quotation.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Transport Charge</span>
              <span>{{ formatCurrency(quotation.transport_charge) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Tax ({{ quotation.tax_rate * 100 }}%)</span>
              <span>{{ formatCurrency(quotation.tax_amount) }}</span>
            </div>
            <div class="border-t pt-4 mt-4 flex justify-between items-center">
              <span class="font-bold text-lg text-slate-900">Total</span>
              <span class="font-bold text-2xl text-primary">{{ formatCurrency(quotation.total) }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <div v-else-if="isLoading" class="text-center p-12">
      <p class="text-slate-500">Loading quotation details...</p>
    </div>
  </div>
</template>
