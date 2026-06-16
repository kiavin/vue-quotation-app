<script setup lang="ts">
import type { BrandingSnapshot } from '@/types/organization'
import type { Invoice, InvoiceItem } from '@/services/invoiceService'

export interface Props {
  data: Invoice & { items: InvoiceItem[], customers: any }
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
</script>

<template>
  <div class="document-container bg-white text-slate-900 p-12 min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-sm print:shadow-none print:p-0">
    <!-- Header -->
    <div class="flex justify-between items-start mb-12">
      <div>
        <div v-if="branding.logo_url" class="h-16 mb-6">
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
          INVOICE
        </div>
        <div class="space-y-1">
          <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold">Number</p>
          <p class="font-bold">{{ data.number }}</p>
          <div class="pt-2">
            <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold">Issue Date</p>
            <p>{{ formatDate(data.issue_date) }}</p>
          </div>
          <div class="pt-2">
            <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold">Due Date</p>
            <p>{{ formatDate(data.due_date) }}</p>
          </div>
        </div>
      </div>
    </div>

    <hr class="border-slate-100 mb-12" />

    <!-- Client Info -->
    <div class="grid grid-cols-2 gap-12 mb-12">
      <div>
        <h2 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Invoice To</h2>
        <div class="space-y-1">
          <p class="font-bold text-lg">{{ data.customers?.name }}</p>
          <p class="text-slate-600">{{ data.customers?.email }}</p>
          <p class="text-slate-600">{{ data.customers?.phone }}</p>
          <p class="text-slate-600 whitespace-pre-line">{{ data.customers?.address }}</p>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="w-full mb-12">
      <thead>
        <tr class="border-b-2 border-slate-900 text-left">
          <th class="py-4 font-bold text-sm uppercase tracking-wider">Description</th>
          <th class="py-4 font-bold text-sm uppercase tracking-wider text-right">Qty</th>
          <th class="py-4 font-bold text-sm uppercase tracking-wider text-right">Price</th>
          <th class="py-4 font-bold text-sm uppercase tracking-wider text-right">Total</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="item in data.items" :key="item.id">
          <td class="py-4">
            <p class="font-bold">{{ item.name }}</p>
            <p class="text-sm text-slate-500" v-if="item.description">{{ item.description }}</p>
          </td>
          <td class="py-4 text-right">{{ item.quantity }}</td>
          <td class="py-4 text-right">{{ formatCurrency(item.price) }}</td>
          <td class="py-4 text-right font-semibold">{{ formatCurrency(item.total) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="flex justify-end mb-12">
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
    <div v-if="data.notes" class="mb-12">
      <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Notes & Terms</h3>
      <p class="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{{ data.notes }}</p>
    </div>

    <!-- Footer -->
    <div class="mt-auto pt-12 border-t border-slate-100 text-center text-xs text-slate-400">
      <p>Please pay by the due date mentioned above.</p>
      <p class="mt-1">{{ branding.name }} &bull; {{ branding.email }} &bull; {{ branding.phone }}</p>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .document-container {
    width: 100% !important;
    max-width: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}
</style>
