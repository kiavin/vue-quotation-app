import { defineStore } from 'pinia'
import { ref } from 'vue'
import { customerService, type Customer } from '@/services/customerService'
import { useAuthStore } from '@/stores/auth'

export const useCustomerStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  async function fetchCustomers() {
    if (!authStore.organizationId) return
    loading.value = true
    error.value = null
    try {
      customers.value = await customerService.getCustomers(authStore.organizationId)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addCustomer(customer: Customer) {
    loading.value = true
    try {
      const newCustomer = await customerService.createCustomer(customer)
      customers.value.push(newCustomer)
      return newCustomer
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCustomer(id: string, updates: Partial<Customer>) {
    loading.value = true
    try {
      const updated = await customerService.updateCustomer(id, updates)
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeCustomer(id: string) {
    loading.value = true
    try {
      await customerService.deleteCustomer(id)
      customers.value = customers.value.filter(c => c.id !== id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    removeCustomer
  }
})
