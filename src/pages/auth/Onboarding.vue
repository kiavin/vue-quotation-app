<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { organizationService } from '@/services/organizationService'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const form = ref({
  name: '',
  email: '',
  phone: '',
  currency: 'USD'
})

const handleSetup = async () => {
  if (!authStore.user) return

  isLoading.value = true
  try {
    await organizationService.setupOrganization(form.value)
    await authStore.fetchProfileAndOrganization()
    router.push('/')
  } catch (error) {
    alert('Failed to setup organization')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl text-center">Welcome to CQIS</CardTitle>
        <p class="text-sm text-muted-foreground text-center">Let's set up your catering business account.</p>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSetup" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Business Name</Label>
            <Input id="name" v-model="form.name" required placeholder="Acme Catering" />
          </div>
          <div class="space-y-2">
            <Label for="email">Business Email</Label>
            <Input id="email" type="email" v-model="form.email" required placeholder="billing@acmecatering.com" />
          </div>
          <div class="space-y-2">
            <Label for="phone">Business Phone</Label>
            <Input id="phone" type="tel" v-model="form.phone" placeholder="+1 (555) 123-4567" />
          </div>
          <div class="space-y-2">
            <Label for="currency">Default Currency</Label>
            <Input id="currency" v-model="form.currency" required placeholder="USD" />
          </div>
          <Button type="submit" class="w-full mt-6" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
            Complete Setup
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
