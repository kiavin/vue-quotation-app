import { defineStore } from 'pinia'
import { ref } from 'vue'
import { customerService, type Customer } from '@/services/customerService'
import { useAuthStore } from '@/stores/auth'
import { notify } from '@/lib/notify'

export const useCustomerStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  async function fetchCustomers() {
    if (!authStore.organizationId) return
    loading.value = true
    error.value = null
    const result = await customerService.getCustomers(authStore.organizationId)
    if (result.ok) {
      customers.value = result.data!
    } else {
      error.value = result.error
      notify.handleResponse(result)
    }
    loading.value = false
  }

  async function addCustomer(customer: Customer) {
    loading.value = true
    const result = await customerService.createCustomer(customer)
    notify.handleResponse(result)
    if (result.ok) {
      customers.value.push(result.data!)
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function updateCustomer(id: string, updates: Partial<Customer>) {
    loading.value = true
    const result = await customerService.updateCustomer(id, updates)
    notify.handleResponse(result)
    if (result.ok) {
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = result.data!
      }
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function removeCustomer(id: string) {
    loading.value = true
    const result = await customerService.deleteCustomer(id)
    notify.handleResponse(result)
    if (result.ok) {
      customers.value = customers.value.filter(c => c.id !== id)
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
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
