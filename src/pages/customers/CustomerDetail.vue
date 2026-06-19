<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { customerService, type Customer } from '@/services/customerService'
import { notify } from '@/lib/notify'
import { ChevronLeft, Edit, Mail, Phone, MapPin, Hash } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AppLoader from '@/components/shared/AppLoader.vue'

const router = useRouter()
const route = useRoute()
const customer = ref<Customer | null>(null)
const isLoading = ref(true)

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
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/customers')">
          <ChevronLeft class="w-5 h-5" />
        </Button>
        <div v-if="customer">
          <h2 class="text-3xl font-bold tracking-tight text-slate-900">{{ customer.name }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <Badge :variant="customer.is_active !== false ? 'success' : 'outline'">
              {{ customer.is_active !== false ? 'Active' : 'Inactive' }}
            </Badge>
            <span class="text-slate-500 text-sm">Customer since {{ new Date(customer.created_at!).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
      <Button v-if="customer" @click="router.push(`/customers/${customer.id}/edit`)" variant="outline" class="gap-2">
        <Edit class="w-4 h-4" />
        Edit Customer
      </Button>
    </div>

    <div v-if="!isLoading && customer" class="grid gap-6 md:grid-cols-3">
      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-start gap-3">
            <Mail class="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-slate-500">Email Address</p>
              <p class="text-slate-900">{{ customer.email || 'No email provided' }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Phone class="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-slate-500">Phone Number</p>
              <p class="text-slate-900">{{ customer.phone || 'No phone number provided' }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <MapPin class="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-slate-500">Billing Address</p>
              <p class="text-slate-900 whitespace-pre-line">{{ customer.address || 'No address provided' }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Hash class="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-slate-500">Tax / VAT Number</p>
              <p class="text-slate-900">{{ customer.tax_number || 'No tax number provided' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-slate-500 italic text-center py-4">No recent activity found.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Total Quotations</span>
              <span class="font-medium">0</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Total Invoiced</span>
              <span class="font-medium">$0.00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
    <div v-else-if="isLoading" class="flex items-center justify-center min-h-[500px]">
      <AppLoader message="Loading Customer..." subtext="Retrieving customer details." />
    </div>
  </div>
</template>
