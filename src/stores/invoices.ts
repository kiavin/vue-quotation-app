import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { invoiceService, type Invoice } from '@/services/invoiceService'
import type { Quotation } from '@/services/quotationService'
import { useAuthStore } from '@/stores/auth'
import { notify } from '@/lib/notify'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<(Invoice & { customers?: any })[]>([])
  const currentInvoice = ref<(Invoice & { items?: any[], customers?: any }) | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  // Getters for totals of currentInvoice
  const subtotal = computed(() => currentInvoice.value?.subtotal || 0)
  const taxAmount = computed(() => currentInvoice.value?.tax_amount || 0)
  const grandTotal = computed(() => currentInvoice.value?.total || 0)

  async function fetchInvoices() {
    if (!authStore.organizationId) return
    loading.value = true
    error.value = null
    const result = await invoiceService.getInvoices(authStore.organizationId)
    if (result.ok) {
      invoices.value = result.data!
    } else {
      error.value = result.error
      notify.handleResponse(result)
    }
    loading.value = false
  }

  async function loadInvoice(id: string) {
    loading.value = true
    error.value = null
    const result = await invoiceService.getInvoiceById(id)
    if (result.ok) {
      currentInvoice.value = result.data
    } else {
      error.value = result.error
      notify.handleResponse(result)
    }
    loading.value = false
    return result
  }

  async function createFromQuotation(quotation: Quotation & { items: any[] }) {
    loading.value = true
    error.value = null
    const result = await invoiceService.createFromQuotation(quotation as any)
    notify.handleResponse(result)
    if (result.ok) {
      await fetchInvoices()
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function updateStatus(id: string, status: Invoice['status']) {
    loading.value = true
    const result = await invoiceService.updateStatus(id, status)
    notify.handleResponse(result)
    if (result.ok) {
      if (currentInvoice.value?.id === id) {
        currentInvoice.value.status = status
      }
      await fetchInvoices()
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function deleteInvoice(id: string) {
    loading.value = true
    const result = await invoiceService.deleteInvoice(id)
    notify.handleResponse(result)
    if (result.ok) {
      await fetchInvoices()
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  return {
    invoices,
    currentInvoice,
    loading,
    error,
    subtotal,
    taxAmount,
    grandTotal,
    fetchInvoices,
    loadInvoice,
    createFromQuotation,
    updateStatus,
    deleteInvoice
  }
})
