<script setup lang="ts">
import type { BrandingSnapshot } from '@/types/organization'
import type { Quotation, QuotationItem } from '@/services/quotationService'
import { ref } from 'vue'
import SendEmailModal from '@/components/SendEmailModal.vue'
// @ts-ignore - html2pdf.js does not provide native TS declarations
import html2pdf from 'html2pdf.js'

export interface Props {
  data: Quotation & { items: QuotationItem[], customer: any }
  branding: BrandingSnapshot
  isPreview?: boolean
}

const props = defineProps<Props>()

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (props.branding as any).currency || 'USD'
  }).format(amount)
}

const documentRef = ref<HTMLElement | null>(null)
const isModalOpen = ref(false)
const isGeneratingPdf = ref(false)
const generatedPdfBlob = ref<Blob | null>(null)

const prepareEmail = async () => {
  if (!documentRef.value) return
  isGeneratingPdf.value = true
  try {
    const opt = {
      margin: 0,
      filename: `Quotation_${props.data.number}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    }
    generatedPdfBlob.value = await html2pdf().set(opt).from(documentRef.value).output('blob')
    isModalOpen.value = true
  } catch (error) {
    console.error('Failed to generate PDF', error)
    alert('Failed to generate PDF')
  } finally {
    isGeneratingPdf.value = false
  }
}

const onEmailSent = () => {
  alert('Email sent successfully!')
}
</script>

<template>
  <div class="relative">
    <div class="flex justify-end max-w-[210mm] mx-auto mb-4 print:hidden" v-if="!isPreview">
      <button @click="prepareEmail" :disabled="isGeneratingPdf" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm font-medium transition-colors disabled:opacity-50 flex items-center">
        <span v-if="isGeneratingPdf" class="mr-2">
          <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </span>
        {{ isGeneratingPdf ? 'Preparing...' : 'Email to Customer' }}
      </button>
    </div>

    <div ref="documentRef" class="document-container bg-white text-slate-900 p-12 min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-sm print:shadow-none">
      <!-- Header -->
      <div class="flex justify-between items-start mb-8">
        <div>
          <div v-if="branding.logo_url" class="h-16 mb-2">
            <img :src="branding.logo_url" alt="Logo" class="h-full object-contain object-left" />
          </div>
          <h1 class="text-3xl font-bold mb-2">{{ branding.name }}</h1>
          <div class="text-sm text-slate-500 whitespace-pre-line leading-relaxed">
            {{ branding.address }}
            <br v-if="branding.phone" />{{ branding.phone }}
            <br v-if="branding.email" />{{ branding.email }}
          </div>
        </div>
        <div class="text-right">
          <div class="inline-block px-4 py-1 rounded text-white font-bold mb-4" :style="{ backgroundColor: branding.primary_color }">
            QUOTATION
          </div>
          <div class="space-y-1">
            <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold">Number</p>
            <p class="font-bold">{{ data.number }}</p>
            <div class="pt-2">
              <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold">Date</p>
              <p>{{ formatDate(data.date) }}</p>
            </div>
            <div class="pt-2">
              <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold">Valid Until</p>
              <p>{{ formatDate(data.expiry_date) }}</p>
            </div>
          </div>
        </div>
      </div>

      <hr class="border-slate-100 mb-2" />

      <!-- Client Info -->
      <div class="grid grid-cols-2 gap-12 mb-2 print:break-inside-avoid">
        <div>
          <h2 class="text-xs font-bold uppercase tracking-widest text-slate-400 ">Quotation For</h2>
          <div class="space-y-1">
            <p class="font-bold text-lg">{{ data.customer?.name }}</p>
            <p class="text-slate-600">{{ data.customer?.email }}</p>
            <p class="text-slate-600">{{ data.customer?.phone }}</p>
            <p class="text-slate-600 whitespace-pre-line">{{ data.customer?.address }}</p>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <table class="w-full mb-12">
        <thead>
          <tr class="border-b-2 border-slate-200 text-left">
            <th class="py-2 font-bold text-sm uppercase tracking-wider">Description</th>
            <th class="py-2 font-bold text-sm uppercase tracking-wider text-right">Qty</th>
            <th class="py-2 font-bold text-sm uppercase tracking-wider text-right">Price</th>
            <th class="py-2 font-bold text-sm uppercase tracking-wider text-right">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
        <tr v-for="item in data.items" :key="item.id" class="print:break-inside-avoid">
            <td class="py-2">
              <p class="font-normal">{{ item.name }}</p>
              <p class="text-sm text-slate-500" v-if="item.description">{{ item.description }}</p>
            </td>
            <td class="py-2 text-right">{{ item.quantity }}</td>
            <td class="py-2 text-right">{{ formatCurrency(item.price) }}</td>
            <td class="py-2 text-right font-semibold">{{ formatCurrency(item.total) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals -->
      <div class="flex justify-end mb-4 print:break-inside-avoid">
        <div class="w-1/3 space-y-3">
          <div class="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>{{ formatCurrency(data.subtotal) }}</span>
          </div>
          <div v-if="data.transport_charge > 0" class="flex justify-between text-sm text-slate-500">
            <span>Transport</span>
            <span>{{ formatCurrency(data.transport_charge) }}</span>
          </div>
          <div class="flex justify-between text-sm text-slate-500">
            <span>Tax ({{ data.tax_rate }}%)</span>
            <span>{{ formatCurrency(data.tax_amount) }}</span>
          </div>
          <div class="flex justify-between border-t-2 border-slate-900 pt-3">
            <span class="text-lg font-bold">Total</span>
            <span class="text-lg font-bold" :style="{ color: branding.primary_color }">
              {{ formatCurrency(data.total) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="data.notes" class="mb-4 print:break-inside-avoid">
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Notes & Terms</h3>
        <p class="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{{ data.notes }}</p>
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-12 border-t border-slate-100 text-center text-xs text-slate-400">
        <p>Thank you for your business!</p>
        <p class="mt-1">{{ branding.name }} &bull; {{ branding.email }} &bull; {{ branding.phone }}</p>
      </div>
    </div>

    <SendEmailModal
      :isOpen="isModalOpen"
      :customerEmail="data.customer?.email || ''"
      :quotationNumber="data.number"
      :pdfBlob="generatedPdfBlob"
      @close="isModalOpen = false"
      @sent="onEmailSent"
    />
  </div>
</template>

<style scoped>
@media print {
  .document-container {
    width: 100% !important;
    max-width: none !important;
    box-shadow: none !important;
    margin: 0 !important;
  }
}
</style>
