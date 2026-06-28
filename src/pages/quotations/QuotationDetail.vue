<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { quotationService, type Quotation } from '@/services/quotationService'
import { useInvoicesStore } from '@/stores/invoices'
import { notify } from '@/lib/notify'

// Icons
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

// Components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import QuotationStatusBadge from '@/components/shared/QuotationStatusBadge.vue'
import AppLoader from '@/components/shared/AppLoader.vue'
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

// State
const quotation = ref<Quotation | null>(null)
const isLoading = ref(true)
const isConverting = ref(false)
const showMobileActions = ref(false)
const mobileActionsRef = ref(null)

onClickOutside(mobileActionsRef, () => {
  showMobileActions.value = false
})

// Computed Properties for UI Logic
const canConvertToInvoice = computed(() => {
  return quotation.value?.status === 'approved' || quotation.value?.status === 'sent'
})

const canApproveOrReject = computed(() => {
  return quotation.value?.status === 'sent'
})

const canMarkAsSent = computed(() => {
  return quotation.value?.status === 'draft'
})

// Lifecycle
onMounted(async () => {
  const id = route.params.id as string
  isLoading.value = true
  const result = await quotationService.getQuotationById(id)
  
  if (result.ok && result.data) {
    quotation.value = result.data
  } else {
    notify.handleResponse(result)
    router.push('/quotations')
  }
  isLoading.value = false
})

// Utilities
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

// Actions
const handleStatusChange = async (status: Quotation['status']) => {
  if (!quotation.value?.id) return
  
  const result = await quotationService.updateStatus(quotation.value.id, status)
  notify.handleResponse(result)
  if (result.ok) {
    quotation.value.status = status
  }
}

const handleConvertToInvoice = async () => {
  if (!quotation.value) return
  
  isConverting.value = true
  const result = await invoicesStore.createFromQuotation(quotation.value as any)
  
  if (result.ok && result.data) {
    router.push(`/invoices/${result.data.id}`)
  }
  isConverting.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/quotations')">
          <ChevronLeft class="w-5 h-5" />
        </Button>
        <div v-if="quotation">
          <h2 class="text-3xl font-bold tracking-tight text-slate-900">{{ quotation.number }}</h2>
          <p v-if="quotation.title" class="text-sm text-slate-500 mt-0.5">{{ quotation.title }}</p>
          <div class="flex items-center gap-2 mt-1">
            <QuotationStatusBadge :status="quotation.status" />
            <span class="text-slate-500 text-sm">Issued on {{ formatDate(quotation.date) }}</span>
          </div>
        </div>
      </div>

      <div v-if="quotation" class="flex items-center gap-3">
        <!-- Desktop Actions -->
        <div class="hidden md:flex items-center gap-3">
          <Button 
            v-if="canConvertToInvoice"
            variant="default" 
            class="gap-2" 
            :disabled="isConverting"
            @click="handleConvertToInvoice" 
          >
            <Loader2 v-if="isConverting" class="w-4 h-4 animate-spin" />
            <CreditCard v-else class="w-4 h-4" />
            Convert to Invoice
          </Button>
          
          <Button 
            v-if="canMarkAsSent"
            variant="outline" 
            class="gap-2 bg-[#0F766E]/5 hover:bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/20" 
            @click="router.push(`/quotations/${quotation.id}/print?send=true`)" 
          >
            <Send class="w-4 h-4" />
            Send via Email
          </Button>
          
          <Button 
            v-if="canApproveOrReject"
            variant="outline" 
            class="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50" 
            @click="handleStatusChange('approved')" 
          >
            <CheckCircle class="w-4 h-4" />
            Approve
          </Button>
          
          <Button 
            v-if="canApproveOrReject"
            variant="outline" 
            class="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" 
            @click="handleStatusChange('rejected')" 
          >
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

        <!-- Mobile Actions Dropdown -->
        <div class="md:hidden relative" ref="mobileActionsRef">
          <Button variant="outline" @click="showMobileActions = !showMobileActions">
            Actions
          </Button>
          
          <div v-if="showMobileActions" class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 p-2 flex flex-col gap-1">
            <Button 
              v-if="canConvertToInvoice"
              variant="default" 
              class="w-full justify-start gap-2" 
              :disabled="isConverting"
              @click="handleConvertToInvoice" 
            >
              <Loader2 v-if="isConverting" class="w-4 h-4 animate-spin" />
              <CreditCard v-else class="w-4 h-4" />
              Convert to Invoice
            </Button>
            
            <Button 
              v-if="canMarkAsSent"
              variant="outline" 
              class="w-full justify-start gap-2 bg-[#0F766E]/5 hover:bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/20" 
              @click="router.push(`/quotations/${quotation.id}/print?send=true`)" 
            >
              <Send class="w-4 h-4" />
              Send via Email
            </Button>
            
            <Button 
              v-if="canApproveOrReject"
              variant="outline" 
              class="w-full justify-start gap-2 text-green-600" 
              @click="handleStatusChange('approved')" 
            >
              <CheckCircle class="w-4 h-4" />
              Approve
            </Button>
            
            <Button 
              v-if="canApproveOrReject"
              variant="outline" 
              class="w-full justify-start gap-2 text-red-600" 
              @click="handleStatusChange('rejected')" 
            >
              <XCircle class="w-4 h-4" />
              Reject
            </Button>

            <div class="h-px bg-slate-200 my-1"></div>
            
            <Button variant="ghost" class="w-full justify-start gap-2" @click="router.push(`/quotations/${quotation.id}/edit`)">
              <Edit class="w-4 h-4 text-slate-500" />
              Edit
            </Button>
            <Button variant="ghost" class="w-full justify-start gap-2" @click="router.push(`/quotations/${quotation.id}/print`)">
              <FileText class="w-4 h-4 text-slate-500" />
              Preview
            </Button>
            <Button variant="ghost" class="w-full justify-start gap-2" @click="router.push(`/quotations/${quotation.id}/print?print=true`)">
              <Printer class="w-4 h-4 text-slate-500" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && quotation" class="grid gap-6 lg:grid-cols-3">
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
                  <p class="text-slate-900 font-medium">{{ quotation.customers?.name || 'Unknown Customer' }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <MapPin class="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase">Billing Address</p>
                  <p class="text-slate-900 whitespace-pre-line">{{ quotation.customers?.address || 'No address provided' }}</p>
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
                  <p class="text-slate-900 font-medium">
                    {{ quotation.expiry_date ? formatDate(quotation.expiry_date) : 'No expiry date' }}
                  </p>
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
            <!-- Desktop Table -->
            <div class="hidden md:block">
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
            </div>

            <!-- Mobile Card List -->
            <div class="md:hidden divide-y">
              <div v-for="item in quotation.items" :key="item.id" class="p-4 space-y-3">
                <p class="font-medium text-slate-900">{{ item.name }}</p>
                <div class="flex justify-between text-sm text-slate-500">
                  <span>{{ item.quantity }} × {{ formatCurrency(item.price) }}</span>
                  <span class="font-bold text-slate-900">{{ formatCurrency(item.total) }}</span>
                </div>
              </div>
            </div>
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

    <div v-else-if="isLoading" class="flex items-center justify-center min-h-[500px]">
      <AppLoader message="Loading Quotation..." subtext="Retrieving quotation details and line items." />
    </div>
  </div>
</template>