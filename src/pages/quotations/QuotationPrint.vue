<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { quotationService } from '@/services/quotationService'
import QuotationTemplateBasic from '@/templates/documents/QuotationTemplateBasic.vue'
import { Button } from '@/components/ui/button'
import { Printer, ChevronLeft, Download } from 'lucide-vue-next'
import { pdfService } from '@/services/pdfService'

import type { Quotation } from '@/services/quotationService'

const route = useRoute()
const router = useRouter()
const quotation = ref<Quotation | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  try {
    quotation.value = await quotationService.getQuotationById(id)
    // If the URL has ?print=true, trigger print after loading
    if (route.query.print === 'true') {
      setTimeout(() => {
        pdfService.print()
      }, 500)
    }
  } catch (error) {
    console.error('Failed to load quotation:', error)
  } finally {
    isLoading.value = false
  }
})

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
          <span class="font-semibold text-slate-700">Document Preview</span>
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
    <div v-if="!isLoading && quotation" class="py-8 print:py-0">
      <QuotationTemplateBasic 
        :data="(quotation as any)" 
        :branding="(quotation as any).branding_snapshot" 
      />
    </div>
    
    <div v-else-if="isLoading" class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p class="mt-4 text-slate-500 font-medium">Preparing document...</p>
    </div>
    
    <div v-else class="text-center py-20">
      <p class="text-red-500 font-medium">Failed to load quotation. It may have been deleted.</p>
      <Button variant="link" @click="router.push('/quotations')">Return to List</Button>
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
