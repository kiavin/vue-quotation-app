<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, Save } from 'lucide-vue-next'

const settingsStore = useSettingsStore()
const isSaving = ref(false)

const form = ref({
  name: '',
  primary_color: '#0F766E',
  secondary_color: '#0EA5E9',
  accent_color: '#F59E0B',
  address: '',
  phone: '',
  email: ''
})

onMounted(async () => {
  await settingsStore.fetchOrganization()
  if (settingsStore.organization) {
    form.value = {
      name: settingsStore.organization.name || '',
      primary_color: settingsStore.organization.primary_color || '#0F766E',
      secondary_color: settingsStore.organization.secondary_color || '#0EA5E9',
      accent_color: settingsStore.organization.accent_color || '#F59E0B',
      address: settingsStore.organization.address || '',
      phone: settingsStore.organization.phone || '',
      email: settingsStore.organization.email || ''
    }
  }
})

async function handleSave() {
  isSaving.value = true
  try {
    await settingsStore.updateOrganization(form.value)
  } finally {
    isSaving.value = false
  }
}

async function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    await settingsStore.uploadLogo(target.files[0])
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Branding</h1>
        <p class="text-muted-foreground">Customize your organization's visual identity and profile.</p>
      </div>
      <Button @click="handleSave" :disabled="isSaving" class="w-full sm:w-auto">
        <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
        <Save v-else class="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Branding Form -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-2">
              <Label for="name">Business Name</Label>
              <Input id="name" v-model="form.name" placeholder="Acme Catering" />
            </div>

            <div class="grid gap-2">
              <Label>Logo</Label>
              <div class="flex items-center gap-4">
                <div class="h-20 w-20 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                  <img v-if="settingsStore.organization?.logo_url" :src="settingsStore.organization.logo_url" alt="Logo" class="h-full w-full object-contain" />
                  <Upload v-else class="h-8 w-8 text-muted-foreground" />
                </div>
                <div class="flex-1">
                  <Input type="file" accept="image/*" @change="handleLogoUpload" class="hidden" id="logo-upload" />
                  <Label for="logo-upload" class="cursor-pointer">
                    <Button variant="outline" type="button" as-child>
                      <span>Change Logo</span>
                    </Button>
                  </Label>
                  <p class="text-xs text-muted-foreground mt-2">Recommended: Square SVG or PNG. Max 2MB.</p>
                </div>
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="email">Public Email</Label>
              <Input id="email" v-model="form.email" placeholder="contact@acme.com" />
            </div>

            <div class="grid gap-2">
              <Label for="phone">Phone Number</Label>
              <Input id="phone" v-model="form.phone" placeholder="+1 (555) 000-0000" />
            </div>

            <div class="grid gap-2">
              <Label for="address">Address</Label>
              <Input id="address" v-model="form.address" placeholder="123 Main St, City, Country" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colors & Theme</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-4 sm:grid-cols-3">
            <div class="grid gap-2">
              <Label for="primary">Primary</Label>
              <div class="flex gap-2">
                <Input id="primary" type="color" v-model="form.primary_color" class="w-12 h-10 p-1" />
                <Input v-model="form.primary_color" class="font-mono text-xs" />
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="secondary">Secondary</Label>
              <div class="flex gap-2">
                <Input id="secondary" type="color" v-model="form.secondary_color" class="w-12 h-10 p-1" />
                <Input v-model="form.secondary_color" class="font-mono text-xs" />
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="accent">Accent</Label>
              <div class="flex gap-2">
                <Input id="accent" type="color" v-model="form.accent_color" class="w-12 h-10 p-1" />
                <Input v-model="form.accent_color" class="font-mono text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Live Preview -->
      <div class="space-y-6">
        <h2 class="text-lg font-semibold">Live Document Preview</h2>
        <Card class="overflow-hidden border-2 shadow-xl">
          <div :style="{ borderTopColor: form.primary_color }" class="border-t-8 p-8 space-y-8 bg-white text-slate-900 min-h-[500px]">
            <!-- Preview Header -->
            <div class="flex justify-between items-start">
              <div>
                <div v-if="settingsStore.organization?.logo_url" class="h-12 mb-4">
                  <img :src="settingsStore.organization.logo_url" alt="Logo" class="h-full object-contain object-left" />
                </div>
                <h3 class="text-2xl font-bold">{{ form.name || 'Your Business Name' }}</h3>
                <p class="text-sm text-slate-500 whitespace-pre-line">{{ form.address || 'Business Address' }}</p>
              </div>
              <div class="text-right">
                <Badge :style="{ backgroundColor: form.primary_color }" class="mb-4">QUOTATION</Badge>
                <p class="text-sm font-semibold">QUO-2024-001</p>
                <p class="text-xs text-slate-500">June 2, 2026</p>
              </div>
            </div>

            <!-- Preview Content Placeholder -->
            <div class="space-y-4 pt-8">
              <div class="h-4 w-1/3 bg-slate-100 rounded"></div>
              <div class="space-y-2">
                <div class="h-10 w-full bg-slate-50 border-b flex items-center px-4">
                  <div class="h-2 w-1/2 bg-slate-200 rounded"></div>
                </div>
                <div class="h-10 w-full bg-white border-b flex items-center px-4">
                  <div class="h-2 w-1/3 bg-slate-100 rounded"></div>
                </div>
                <div class="h-10 w-full bg-white border-b flex items-center px-4">
                  <div class="h-2 w-1/4 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>

            <!-- Preview Footer -->
            <div class="pt-8 mt-auto border-t">
              <div class="grid grid-cols-2 gap-8">
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Contact</h4>
                  <p class="text-sm">{{ form.email || 'email@example.com' }}</p>
                  <p class="text-sm">{{ form.phone || '+1 (555) 000-0000' }}</p>
                </div>
                <div class="text-right">
                  <div class="flex justify-end gap-4 mb-1">
                    <span class="text-sm text-slate-500">Subtotal</span>
                    <span class="text-sm font-semibold">$1,200.00</span>
                  </div>
                  <div class="flex justify-end gap-4 mb-1">
                    <span class="text-sm text-slate-500">Tax (10%)</span>
                    <span class="text-sm font-semibold">$120.00</span>
                  </div>
                  <div class="flex justify-end gap-4 pt-2 border-t">
                    <span class="text-lg font-bold">Total</span>
                    <span class="text-lg font-bold" :style="{ color: form.primary_color }">$1,320.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <p class="text-center text-xs text-muted-foreground italic">This is a representation of how your documents will look.</p>
      </div>
    </div>
  </div>
</template>
