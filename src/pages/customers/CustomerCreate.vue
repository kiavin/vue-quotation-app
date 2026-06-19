<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import CustomerForm from '@/components/forms/CustomerForm.vue'
import type { Customer } from '@/services/customerService'

const router = useRouter()
const customerStore = useCustomerStore()
const authStore = useAuthStore()
const isSaving = ref(false)

const handleSave = async (values: Customer) => {
  isSaving.value = true
  const result = await customerStore.addCustomer({
    ...values,
    organization_id: authStore.organizationId
  })
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
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">New Customer</h2>
        <p class="text-slate-500">Add a new client to your database.</p>
      </div>
    </div>

    <Card class="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomerForm 
          :loading="isSaving" 
          @submit="handleSave" 
          @cancel="router.back()" 
        />
      </CardContent>
    </Card>
  </div>
</template>
