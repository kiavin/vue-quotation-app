<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { organizationService } from '@/services/organizationService'
import { ChevronLeft, Loader2, Upload } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const route = useRoute()
const orgId = route.params.id as string
const isSaving = ref(false)
const isLoading = ref(true)

const form = ref({
  name: '',
  email: '',
  phone: '',
  currency: 'USD',
  default_tax_rate: 0,
  primary_color: '#0F766E',
  secondary_color: '#0EA5E9',
  accent_color: '#F59E0B'
})

const logoUrl = ref<string | null>(null)

onMounted(async () => {
  try {
    const org = await organizationService.getOrganization(orgId)
    logoUrl.value = org.logo_url || null
    form.value = {
      name: org.name || '',
      email: org.email || '',
      phone: org.phone || '',
      currency: org.currency || 'USD',
      default_tax_rate: org.default_tax_rate || 0,
      primary_color: org.primary_color || '#0F766E',
      secondary_color: org.secondary_color || '#0EA5E9',
      accent_color: org.accent_color || '#F59E0B'
    }
  } catch (error) {
    alert('Failed to load organization')
    router.push('/organizations')
  } finally {
    isLoading.value = false
  }
})

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    try {
      const url = await organizationService.uploadLogo(orgId, target.files[0])
      logoUrl.value = url
      await organizationService.updateOrganization(orgId, { logo_url: url })
    } catch (error) {
      alert('Failed to upload logo')
    }
  }
}

const handleSave = async () => {
  isSaving.value = true
  try {
    await organizationService.updateOrganization(orgId, form.value)
    router.push(`/organizations/${orgId}`)
  } catch (error) {
    alert('Failed to update organization')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ChevronLeft class="w-5 h-5" />
      </Button>
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Edit Organization</h2>
        <p class="text-slate-500">Update organization details and branding.</p>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <form v-else @submit.prevent="handleSave" class="space-y-6 max-w-4xl">
      <div class="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="space-y-2">
              <Label for="name">Business Name</Label>
              <Input id="name" v-model="form.name" required />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="email">Billing Email</Label>
                <Input id="email" type="email" v-model="form.email" />
              </div>
              <div class="space-y-2">
                <Label for="phone">Phone Number</Label>
                <Input id="phone" type="tel" v-model="form.phone" />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="currency">Currency Code</Label>
                <Input id="currency" v-model="form.currency" required placeholder="USD" />
              </div>
              <div class="space-y-2">
                <Label for="tax">Default Tax Rate (%)</Label>
                <Input id="tax" type="number" step="0.01" v-model.number="form.default_tax_rate" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="space-y-2">
              <Label>Logo</Label>
              <div class="flex items-center gap-4">
                <div class="h-20 w-20 rounded-md border bg-slate-50 flex items-center justify-center overflow-hidden">
                  <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="h-full w-full object-contain" />
                  <Upload v-else class="h-8 w-8 text-slate-400" />
                </div>
                <div class="flex-1">
                  <Input type="file" accept="image/*" @change="handleLogoUpload" class="hidden" id="logo-upload" />
                  <Label for="logo-upload" class="cursor-pointer">
                    <Button variant="outline" type="button" as-child>
                      <span>Change Logo</span>
                    </Button>
                  </Label>
                  <p class="text-xs text-slate-500 mt-2">Recommended: Square SVG or PNG.</p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <Label>Colors & Theme</Label>
              <div class="grid grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label for="primary" class="text-xs">Primary</Label>
                  <div class="flex gap-2">
                    <Input id="primary" type="color" v-model="form.primary_color" class="w-10 h-10 p-1" />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="secondary" class="text-xs">Secondary</Label>
                  <div class="flex gap-2">
                    <Input id="secondary" type="color" v-model="form.secondary_color" class="w-10 h-10 p-1" />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label for="accent" class="text-xs">Accent</Label>
                  <div class="flex gap-2">
                    <Input id="accent" type="color" v-model="form.accent_color" class="w-10 h-10 p-1" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" @click="router.back()">Cancel</Button>
        <Button type="submit" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          Save Changes
        </Button>
      </div>
    </form>
  </div>
</template>