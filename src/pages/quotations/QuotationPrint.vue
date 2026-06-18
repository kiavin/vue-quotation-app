<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { quotationService } from '@/services/quotationService'
import QuotationTemplateBasic from '@/templates/documents/QuotationTemplateBasic.vue'
import { Button } from '@/components/ui/button'
import { Printer, ChevronLeft, Download, Send } from 'lucide-vue-next'
import { pdfService } from '@/services/pdfService'
import SendEmailModal from '@/components/shared/SendEmailModal.vue'

import type { Quotation } from '@/services/quotationService'

const route = useRoute()
const router = useRouter()
const quotation = ref<Quotation | null>(null)
const isLoading = ref(true)

const isEmailModalOpen = ref(false)
const pdfElementRef = ref<HTMLElement | null>(null)
const customerEmail = ref('')
const customerName = ref('')
const defaultSubject = ref('')
const defaultMessage = ref('')

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

const openSendEmailModal = () => {
  if (!quotation.value) return
  
  const customer = (quotation.value as any).customers
  if (!customer || !customer.email) {
    alert('This quotation is assigned to a customer without an email address.')
    return
  }

  customerEmail.value = customer.email
  customerName.value = customer.name
  defaultSubject.value = `Quotation ${quotation.value.number} from CQIS`
  defaultMessage.value = `Dear ${customer.name},\n\nPlease find attached the quotation ${quotation.value.number} for your upcoming event.\n\nIf you have any questions or need adjustments, feel free to reply to this email.\n\nBest regards,\nThe CQIS Team`
  isEmailModalOpen.value = true
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
          <Button size="sm" @click="openSendEmailModal" class="gap-2 bg-[#0F766E] hover:bg-[#0F766E]/90">
            <Send class="w-4 h-4" />
            Send to Customer
          </Button>
        </div>
      </div>
    </div>

    <!-- Document Content -->
    <div v-if="!isLoading && quotation" class="py-8 print:py-0 flex justify-center overflow-x-auto">
      <div ref="pdfElementRef" class="w-[210mm] min-h-[297mm] bg-white shadow-sm print:shadow-none shrink-0">
        <QuotationTemplateBasic 
          :data="(quotation as any)" 
          :branding="(quotation as any).branding_snapshot" 
        />
      </div>
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

  <SendEmailModal
    :is-open="isEmailModalOpen"
    :customer-name="customerName"
    :customer-email="customerEmail"
    :default-subject="defaultSubject"
    :default-message="defaultMessage"
    :filename="`Quotation_${quotation?.number}.pdf`"
    :pdf-element="pdfElementRef"
    @close="isEmailModalOpen = false"
    @sent="isEmailModalOpen = false; router.push('/quotations')"
  />
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
