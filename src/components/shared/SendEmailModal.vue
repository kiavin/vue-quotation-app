<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Send, Eye } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notify } from '@/lib/notify'
import html2pdf from 'html2pdf.js'

const props = defineProps<{
  isOpen: boolean
  customerName: string
  customerEmail: string
  defaultSubject: string
  defaultMessage: string
  filename: string
  pdfElement?: HTMLElement | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'sent'): void
}>()

const emailTo = ref('')
const subject = ref('')
const message = ref('')
const isSending = ref(false)
const isPreviewing = ref(false)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    emailTo.value = props.customerEmail
    subject.value = props.defaultSubject
    message.value = props.defaultMessage
  }
})

const handlePreview = async () => {
  if (!props.pdfElement) {
    notify.toast('error', 'Preview Error', 'Document element not found for PDF preview.')
    return
  }
  
  isPreviewing.value = true
  try {
    const opt = {
      margin: 0,
      filename: props.filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    }
    const pdfBlobUrl = await html2pdf().set(opt).from(props.pdfElement).output('bloburl')
    window.open(pdfBlobUrl, '_blank')
  } catch (error: any) {
    console.error('PDF preview error:', error)
    notify.toast('error', 'Preview Failed', `Failed to preview PDF: ${error.message}`)
  } finally {
    isPreviewing.value = false
  }
}

const handleSend = async () => {
  if (!props.pdfElement) {
    notify.toast('error', 'Send Error', 'Document element not found for PDF generation.')
    return
  }
  
  isSending.value = true
  try {
    // Generate the PDF from the provided HTML Element
    const opt = {
      margin: 0,
      filename: props.filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    }
    
    const pdfBase64DataUri = await html2pdf().set(opt).from(props.pdfElement).output('datauristring')
    const attachmentBase64 = pdfBase64DataUri.split('base64,')[1]

    // Send to Supabase Edge Function
    const emailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-quotation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: emailTo.value,
        subject: subject.value,
        message: message.value,
        attachmentBase64,
        filename: props.filename
      })
    })

    if (!emailResponse.ok) {
      const errData = await emailResponse.json()
      throw new Error(errData.error || 'Failed to send email')
    }
    
    emit('sent')
    notify.toast('success', 'Email Sent', `Quotation successfully sent to ${emailTo.value}`)
  } catch (error: any) {
    console.error('Email sending error:', error)
    notify.toast('error', 'Send Failed', `Failed to send email: ${error.message}`)
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
      <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-slate-100">Send Document</h3>
        <button @click="emit('close')" class="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-md transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>
      <div class="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
        <div class="space-y-2">
          <Label>To</Label>
          <Input v-model="emailTo" type="email" placeholder="client@example.com" />
        </div>
        <div class="space-y-2">
          <Label>Subject</Label>
          <Input v-model="subject" placeholder="Email Subject" />
        </div>
        <div class="space-y-2">
          <Label>Message</Label>
          <textarea 
            v-model="message"
            placeholder="Type your message here..."
            class="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          ></textarea>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-3 rounded-md text-sm flex items-center justify-between gap-4">
          <div class="flex items-start gap-2 text-blue-700 dark:text-blue-400">
            <span class="text-lg leading-none mt-0.5">📎</span>
            <p>A PDF copy of <strong>{{ filename }}</strong> will be generated and attached.</p>
          </div>
          <Button variant="ghost" size="sm" class="shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 h-8 px-3" @click="handlePreview" :disabled="isPreviewing || isSending">
            <Eye class="w-4 h-4 mr-1.5" />
            {{ isPreviewing ? 'Loading...' : 'Preview' }}
          </Button>
        </div>
      </div>
      <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
        <Button variant="outline" @click="emit('close')" :disabled="isSending">Cancel</Button>
        <Button @click="handleSend" :disabled="isSending" class="gap-2 bg-[#0F766E] hover:bg-[#0F766E]/90 text-white">
          <Send class="w-4 h-4" />
          {{ isSending ? 'Sending...' : 'Send Email' }}
        </Button>
      </div>
    </div>
  </div>
</template>