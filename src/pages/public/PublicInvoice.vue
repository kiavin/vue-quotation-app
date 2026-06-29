<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { TEMPLATE_VARIANTS, DEFAULT_TEMPLATE } from '@/templates/documents'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-vue-next'
import { pdfService } from '@/services/pdfService'
import { notify } from '@/lib/notify'

const route = useRoute()
const documentData = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  try {
    const { data, error } = await supabase.rpc('get_public_invoice', { doc_id: id })
    
    if (error) throw error
    if (!data) throw new Error('Invoice not found')
    
    documentData.value = data
  } catch (error: any) {
    console.error('Failed to load public invoice:', error)
    notify.toast('error', 'Load Failed', 'Could not load the document. It may have been deleted.')
  } finally {
    isLoading.value = false
  }
})

// Always use the default modern template for public views
const activeTemplateComponent = computed(() => {
  return TEMPLATE_VARIANTS[DEFAULT_TEMPLATE].invoice
})

const handlePrint = () => {
  pdfService.print()
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 print:bg-white pb-12">
    <!-- Public Action Bar (Hidden on Print) -->
    <div class="bg-white border-b sticky top-0 z-10 print:hidden shadow-sm">
      <div class="max-w-[210mm] mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-sky-600 text-white rounded-md flex items-center justify-center font-bold text-lg">
            I
          </div>
          <div>
            <h1 class="font-bold text-slate-900 leading-tight">Invoice</h1>
            <p class="text-xs text-slate-500 font-medium">{{ documentData?.number || 'Loading...' }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <Button variant="outline" size="sm" @click="handlePrint" :disabled="isLoading || !documentData">
            <Printer class="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button size="sm" @click="handlePrint" :disabled="isLoading || !documentData" class="gap-2 bg-sky-600 hover:bg-sky-700">
            <Download class="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>

    <!-- Document Content -->
    <div v-if="!isLoading && documentData" class="py-8 print:py-0 flex justify-center overflow-x-auto">
      <div class="w-[210mm] min-h-[297mm] bg-white shadow-md print:shadow-none shrink-0 relative">
        <component 
          :is="activeTemplateComponent"
          :data="documentData" 
          :branding="documentData.branding_snapshot" 
        />
      </div>
    </div>
    
    <div v-else-if="isLoading" class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      <p class="mt-4 text-slate-500 font-medium">Loading document securely...</p>
    </div>
    
    <div v-else class="text-center py-20">
      <div class="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
      </div>
      <h2 class="text-xl font-semibold text-slate-900 mb-2">Document Not Found</h2>
      <p class="text-slate-500 max-w-sm mx-auto">This invoice could not be loaded. It may have been deleted or the link is invalid.</p>
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
