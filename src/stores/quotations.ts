import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { quotationService, type Quotation, type QuotationItem } from '@/services/quotationService'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'

export const useQuotationStore = defineStore('quotations', () => {
  const settingsStore = useSettingsStore()
  const authStore = useAuthStore()
  const quotations = ref<Quotation[]>([])
  const currentQuotation = ref<Quotation | null>(null)
  const currentItems = ref<QuotationItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Builder State
  const transportCharge = ref(0)
  const taxRate = ref(settingsStore.organization?.default_tax_rate || 0.15)

  const subtotal = computed(() => {
    return currentItems.value.reduce((acc, item) => acc + (item.quantity * item.price), 0)
  })

  const taxAmount = computed(() => {
    return (subtotal.value + transportCharge.value) * (taxRate.value / 100)
  })

  const grandTotal = computed(() => {
    return subtotal.value + transportCharge.value + taxAmount.value
  })

  // Actions
  async function fetchQuotations() {
    if (!authStore.organizationId) return
    loading.value = true
    error.value = null
    try {
      quotations.value = await quotationService.getQuotations(authStore.organizationId)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadQuotation(id: string) {
    loading.value = true
    error.value = null
    try {
      const data = await quotationService.getQuotationById(id)
      currentQuotation.value = data
      currentItems.value = data.items
      transportCharge.value = data.transport_charge
      taxRate.value = data.tax_rate
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function addItem(item: QuotationItem) {
    const existing = item.item_id
      ? currentItems.value.find(i => i.item_id === item.item_id)
      : null
    if (existing) {
      existing.quantity += 1
    } else {
      currentItems.value.push(item)
    }
  }

  function removeItem(index: number) {
    currentItems.value.splice(index, 1)
  }

  function updateItem(index: number, updates: Partial<QuotationItem>) {
    currentItems.value[index] = { ...currentItems.value[index], ...updates }
  }

  async function saveQuotation(quotation: Quotation) {
    loading.value = true
    try {
      // Create branding snapshot
      if (!settingsStore.organization) {
        await settingsStore.fetchOrganization()
      }

      const branding = settingsStore.organization
      const snapshot = branding ? {
        name: branding.name,
        logo_url: branding.logo_url,
        primary_color: branding.primary_color,
        secondary_color: branding.secondary_color,
        accent_color: branding.accent_color,
        address: branding.address,
        phone: branding.phone,
        email: branding.email
      } : null

      const quotationData = {
        ...quotation,
        branding_snapshot: snapshot
      }

      if (quotation.id) {
        await quotationService.updateQuotation(quotation.id, quotationData, currentItems.value)
      } else {
        await quotationService.createQuotation(quotationData, currentItems.value)
      }
      await fetchQuotations()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetBuilder() {
    currentQuotation.value = null
    currentItems.value = []
    transportCharge.value = 0
  }

  return {
    quotations,
    currentQuotation,
    currentItems,
    loading,
    error,
    transportCharge,
    taxRate,
    subtotal,
    taxAmount,
    grandTotal,
    fetchQuotations,
    loadQuotation,
    addItem,
    removeItem,
    updateItem,
    saveQuotation,
    resetBuilder
  }
})
