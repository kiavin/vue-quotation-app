<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-vue-next'

const settings = ref({
  platformName: 'CQIS Catering SaaS',
  supportEmail: 'support@cqis.com',
  maxUploadSize: 10, // MB
  maintenanceMode: false,
  defaultTrialDays: 14,
})

const isSaving = ref(false)

const saveSettings = () => {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
  }, 800)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
      <p class="text-sm text-slate-500">Global configuration and platform-wide defaults.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-1 space-y-4">
        <h3 class="text-lg font-medium text-slate-900">General Information</h3>
        <p class="text-sm text-slate-500">Update the platform's core identity and support contacts used in outgoing communications.</p>
      </div>
      
      <Card class="md:col-span-2">
        <CardContent class="p-6 space-y-4">
          <div class="space-y-2">
            <Label for="platformName">Platform Name</Label>
            <Input id="platformName" v-model="settings.platformName" />
          </div>
          <div class="space-y-2">
            <Label for="supportEmail">Global Support Email</Label>
            <Input id="supportEmail" type="email" v-model="settings.supportEmail" />
          </div>
        </CardContent>
        <div class="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end rounded-b-lg">
          <Button @click="saveSettings" :disabled="isSaving">
            <Save class="w-4 h-4 mr-2" />
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </Button>
        </div>
      </Card>
    </div>

    <div class="h-px bg-slate-200 my-8"></div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-1 space-y-4">
        <h3 class="text-lg font-medium text-slate-900">System Defaults</h3>
        <p class="text-sm text-slate-500">Configure default limits and settings applied to new organizations.</p>
      </div>
      
      <Card class="md:col-span-2">
        <CardContent class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="maxUploadSize">Max Upload Size (MB)</Label>
              <Input id="maxUploadSize" type="number" v-model="settings.maxUploadSize" />
            </div>
            <div class="space-y-2">
              <Label for="defaultTrialDays">Default Trial Period (Days)</Label>
              <Input id="defaultTrialDays" type="number" v-model="settings.defaultTrialDays" />
            </div>
          </div>
          
          <div class="pt-4 border-t border-slate-100 mt-4">
            <div class="flex items-center justify-between">
              <div>
                <Label class="text-base">Maintenance Mode</Label>
                <p class="text-sm text-slate-500 mt-1">Prevent non-admin users from accessing the platform. An under-maintenance page will be displayed.</p>
              </div>
              <div>
                <!-- Simulated Switch -->
                <button 
                  type="button"
                  @click="settings.maintenanceMode = !settings.maintenanceMode"
                  :class="settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-200'"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                >
                  <span 
                    :class="settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
        <div class="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end rounded-b-lg">
          <Button @click="saveSettings" :disabled="isSaving">
            <Save class="w-4 h-4 mr-2" />
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>
