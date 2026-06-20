<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { invoiceService } from '@/services/invoiceService'
import { TEMPLATE_VARIANTS, DEFAULT_TEMPLATE, type TemplateVariantId } from '@/templates/documents'
import { Button } from '@/components/ui/button'
import { pdfService } from '@/services/pdfService'
import { notify } from '@/lib/notify'
import { Printer, ChevronLeft, Download } from 'lucide-vue-next'

import type { Invoice } from '@/services/invoiceService'

const route = useRoute()
const router = useRouter()
const invoice = ref<(Invoice & { items?: any[], customers?: any }) | null>(null)
const isLoading = ref(true)

// Template Selection Logic
const selectedVariantId = ref<TemplateVariantId>(DEFAULT_TEMPLATE)

onMounted(async () => {
  // Load saved preference
  const saved = localStorage.getItem('document_template_variant') as TemplateVariantId
  if (saved && Object.keys(TEMPLATE_VARIANTS).includes(saved)) {
    selectedVariantId.value = saved
  }

  const id = route.params.id as string
  const result = await invoiceService.getInvoiceById(id)
  
  if (result.ok && result.data) {
    invoice.value = result.data
    if (route.query.print === 'true') {
      setTimeout(() => {
        pdfService.print()
      }, 500)
    }
  } else {
    notify.handleResponse(result)
  }
  
  isLoading.value = false
})

const activeTemplateComponent = computed(() => {
  return TEMPLATE_VARIANTS[selectedVariantId.value].invoice
})

const handleTemplateChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const val = target.value as TemplateVariantId
  selectedVariantId.value = val
  localStorage.setItem('document_template_variant', val)
}

const handlePrint = () => {
  pdfService.print()
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 print:bg-white pb-12">
    <!-- Action Bar (Hidden on Print) -->
    <div class="bg-white border-b sticky top-0 z-10 print:hidden">
      <div class="max-w-[210mm] mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="sm" @click="router.back()">
            <ChevronLeft class="w-4 h-4 mr-2" />
            Back
          </Button>
          <div class="h-4 w-px bg-slate-200"></div>
          <span class="font-semibold text-slate-700">Invoice Preview</span>
          
          <div class="ml-4 flex items-center gap-2">
            <label for="template-select" class="text-xs font-medium text-slate-500 uppercase tracking-wider">Template:</label>
            <select 
              id="template-select"
              :value="selectedVariantId"
              @change="handleTemplateChange"
              class="text-sm border-slate-200 rounded-md py-1 pl-2 pr-8 focus:ring-primary focus:border-primary"
            >
              <option v-for="(config, id) in TEMPLATE_VARIANTS" :key="id" :value="id">
                {{ config.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <Button variant="outline" size="sm" @click="handlePrint">
            <Printer class="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button size="sm" @click="handlePrint">
            <Download class="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>

    <!-- Document Content -->
    <div v-if="!isLoading && invoice" class="py-8 print:py-0 flex justify-center overflow-x-auto">
      <div class="w-[210mm] min-h-[297mm] bg-white shadow-sm print:shadow-none shrink-0 relative">
        <component 
          :is="activeTemplateComponent"
          :data="(invoice as any)" 
          :branding="(invoice as any).branding_snapshot" 
        />
      </div>
    </div>
    
    <div v-else-if="isLoading" class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p class="mt-4 text-slate-500 font-medium">Preparing document...</p>
    </div>
    
    <div v-else class="text-center py-20">
      <p class="text-red-500 font-medium">Failed to load invoice. It may have been deleted.</p>
      <Button variant="link" @click="router.push('/invoices')">Return to List</Button>
    </div>
  </div>
</template>

<style>
@page {
  size: A4;
  margin: 0;
}

@media print {
  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
