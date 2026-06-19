<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customers'
import { Search, UserPlus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import CustomerTable from '@/components/forms/CustomerTable.vue'
import type { Customer } from '@/services/customerService'
import { notify } from '@/lib/notify'

const router = useRouter()
const customerStore = useCustomerStore()
const searchQuery = ref('')

onMounted(async () => {
  await customerStore.fetchCustomers()
})

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customerStore.customers
  const query = searchQuery.value.toLowerCase()
  return customerStore.customers.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.email?.toLowerCase().includes(query) ||
    c.phone?.includes(query)
  )
})

const handleEdit = (customer: Customer) => {
  router.push(`/customers/${customer.id}/edit`)
}

const handleView = (customer: Customer) => {
  router.push(`/customers/${customer.id}`)
}

const handleDelete = async (customer: Customer) => {
  const isConfirmed = await notify.confirm(
    'Delete Customer',
    `Are you sure you want to delete ${customer.name}?`,
    { confirmText: 'Yes, delete', icon: 'warning' }
  )
  if (isConfirmed) {
    await customerStore.removeCustomer(customer.id!)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Customers</h2>
        <p class="text-slate-500">Manage your catering clients and their contact details.</p>
      </div>
      <Button @click="router.push('/customers/create')" class="gap-2">
        <UserPlus class="w-4 h-4" />
        Add Customer
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div class="p-4 border-b flex items-center gap-4">
          <div class="relative flex-1 max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              v-model="searchQuery" 
              placeholder="Search customers..." 
              class="pl-9"
            />
          </div>
        </div>
        
        <div v-if="customerStore.error" class="p-8 text-center text-red-500">
          {{ customerStore.error }}
        </div>

        <div v-else>
          <CustomerTable 
            :customers="filteredCustomers" 
            :is-loading="customerStore.loading"
            @edit="handleEdit"
            @view="handleView"
            @delete="handleDelete"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
