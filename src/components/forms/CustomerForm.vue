<script setup lang="ts">
import { reactive } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Customer } from '@/services/customerService'

const props = defineProps<{
  initialValues?: Partial<Customer>
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', values: Customer): void
  (e: 'cancel'): void
}>()

const form = reactive({
  name: props.initialValues?.name || '',
  email: props.initialValues?.email || '',
  phone: props.initialValues?.phone || '',
  address: props.initialValues?.address || '',
  tax_number: props.initialValues?.tax_number || '',
  is_active: props.initialValues?.is_active ?? true
})

const handleSubmit = () => {
  emit('submit', { ...form } as Customer)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="name">Customer Name *</Label>
        <Input id="name" v-model="form.name" placeholder="Full name or company name" required />
      </div>
      <div class="space-y-2">
        <Label for="email">Email Address</Label>
        <Input id="email" v-model="form.email" type="email" inputmode="email" autocomplete="email" placeholder="email@example.com" />
      </div>
      <div class="space-y-2">
        <Label for="phone">Phone Number</Label>
        <Input id="phone" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+1 (555) 000-0000" />
      </div>
      <div class="space-y-2">
        <Label for="tax_number">Tax / VAT Number</Label>
        <Input id="tax_number" v-model="form.tax_number" placeholder="TRN-123456" />
      </div>
    </div>

    <div class="space-y-2">
      <Label for="address">Billing Address</Label>
      <textarea
        id="address"
        v-model="form.address"
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="123 Street, City, Country"
      ></textarea>
    </div>

    <div class="flex items-center gap-2">
      <input id="is_active" v-model="form.is_active" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
      <Label for="is_active">Active Customer</Label>
    </div>

    <div class="flex justify-end gap-4 pt-4 border-t">
      <Button type="button" variant="outline" @click="emit('cancel')" :disabled="loading">
        Cancel
      </Button>
      <Button type="submit" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Customer' }}
      </Button>
    </div>
  </form>
</template>
