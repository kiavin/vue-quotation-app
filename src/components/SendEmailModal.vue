<script setup lang="ts">
import { ref, watch } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { notify } from '@/lib/notify'

// Initialize supabase client locally if not provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const props = defineProps<{
  isOpen: boolean
  customerEmail: string
  quotationNumber: string
  pdfBlob?: Blob | null
}>()

const emit = defineEmits(['close', 'sent'])

const subject = ref(`Quotation ${props.quotationNumber}`)
const message = ref('Dear Customer,\n\nPlease find attached the quotation as requested.\n\nBest regards,')
const isSending = ref(false)

watch(() => props.quotationNumber, (newVal) => {
  subject.value = `Quotation ${newVal}`
})

const sendEmail = async () => {
  if (!props.pdfBlob) return
  
  isSending.value = true
  try {
    // Convert Blob to Base64 string
    const base64Pdf = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(props.pdfBlob!)
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1]
        resolve(base64data)
      }
      reader.onerror = reject
    })

    // Invoke Supabase Edge Function
    const { error } = await supabase.functions.invoke('send-quotation', {
      body: {
        to: props.customerEmail,
        subject: subject.value,
        message: message.value,
        attachmentBase64: base64Pdf,
        filename: `Quotation_${props.quotationNumber}.pdf`
      }
    })

    if (error) throw error

    emit('sent')
    emit('close')
  } catch (err) {
    console.error('Error sending email:', err)
    notify.toast('error', 'Send Failed', 'Failed to send email.')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
      <h2 class="text-xl font-bold mb-4">Send Quotation</h2>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-700 mb-1">Subject</label>
        <input 
          v-model="subject" 
          type="text" 
          class="w-full border border-slate-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-slate-700 mb-1">Message</label>
        <textarea 
          v-model="message" 
          rows="5"
          class="w-full border border-slate-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="emit('close')" class="px-4 py-2 text-slate-700 border border-slate-300 rounded hover:bg-slate-50" :disabled="isSending">
          Cancel
        </button>
        <button @click="sendEmail" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center" :disabled="isSending || !pdfBlob">
          <svg v-if="isSending" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Send Email
        </button>
      </div>
    </div>
  </div>
</template>