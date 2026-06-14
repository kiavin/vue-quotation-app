import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { invoiceService, type Invoice } from '@/services/invoiceService'
import type { Quotation } from '@/services/quotationService'
import { useAuthStore } from '@/stores/auth'

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
    try {
      invoices.value = await invoiceService.getInvoices(authStore.organizationId)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadInvoice(id: string) {
    loading.value = true
    error.value = null
    try {
      const data = await invoiceService.getInvoiceById(id)
      currentInvoice.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createFromQuotation(quotation: Quotation & { items: any[] }) {
    loading.value = true
    error.value = null
    try {
      const newInvoice = await invoiceService.createFromQuotation(quotation as any)
      await fetchInvoices()
      return newInvoice
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id: string, status: Invoice['status']) {
    loading.value = true
    try {
      await invoiceService.updateStatus(id, status)
      if (currentInvoice.value?.id === id) {
        currentInvoice.value.status = status
      }
      await fetchInvoices()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteInvoice(id: string) {
    loading.value = true
    try {
      await invoiceService.deleteInvoice(id)
      await fetchInvoices()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
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
