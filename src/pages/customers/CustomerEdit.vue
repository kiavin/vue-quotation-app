<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomerStore } from '@/stores/customers'
import { customerService, type Customer } from '@/services/customerService'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import CustomerForm from '@/components/forms/CustomerForm.vue'
import { notify } from '@/lib/notify'

const router = useRouter()
const route = useRoute()
const customerStore = useCustomerStore()
const customer = ref<Customer | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  isLoading.value = true
  const result = await customerService.getCustomerById(id)
  if (result.ok && result.data) {
    customer.value = result.data
  } else {
    notify.handleResponse(result)
    router.push('/customers')
  }
  isLoading.value = false
})

const handleSave = async (values: Customer) => {
  if (!customer.value?.id) return
  isSaving.value = true
  const result = await customerStore.updateCustomer(customer.value.id, values)
  if (result.ok) {
    router.push('/customers')
  }
  isSaving.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ChevronLeft class="w-5 h-5" />
      </Button>
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Edit Customer</h2>
        <p class="text-slate-500">Update client details.</p>
      </div>
    </div>

    <Card v-if="!isLoading" class="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomerForm 
          :initialValues="customer!"
          :loading="isSaving" 
          @submit="handleSave" 
          @cancel="router.back()" 
        />
      </CardContent>
    </Card>
    
    <div v-else class="text-center p-12">
      <p class="text-slate-500">Loading customer details...</p>
    </div>
  </div>
</template>
