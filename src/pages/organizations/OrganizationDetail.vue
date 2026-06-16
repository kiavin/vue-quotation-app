<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { organizationService } from '@/services/organizationService'
import { ChevronLeft, Loader2, Building, Mail, Phone, Calendar } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Organization } from '@/types/organization'
import TeamManagement from '@/components/forms/TeamManagement.vue'

const router = useRouter()
const route = useRoute()
const orgId = route.params.id as string
const organization = ref<Organization | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    organization.value = await organizationService.getOrganization(orgId)
  } catch (error) {
    alert('Failed to load organization')
    router.push('/organizations')
  } finally {
    isLoading.value = false
  }
})

const formatDate = (date: string) => new Date(date).toLocaleDateString()
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/organizations')">
          <ChevronLeft class="w-5 h-5" />
        </Button>
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900">Organization Details</h2>
          <p class="text-slate-500">View and manage organization profile.</p>
        </div>
      </div>
      <Button @click="router.push(`/organizations/${orgId}/edit`)" variant="outline">
        Edit Organization
      </Button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="organization" class="space-y-6">
      <div class="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-4 border-b pb-4">
               <div class="w-16 h-16 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img v-if="organization.logo_url" :src="organization.logo_url" class="w-full h-full object-contain" />
                  <Building v-else class="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 class="text-xl font-bold">{{ organization.name }}</h3>
                  <p class="text-sm text-slate-500">Slug: {{ organization.slug }}</p>
                </div>
            </div>
            
            <div class="space-y-3 pt-2">
              <div class="flex items-center gap-3 text-slate-600">
                <Mail class="w-4 h-4 text-slate-400" />
                <span>{{ organization.email || 'No email set' }}</span>
              </div>
              <div class="flex items-center gap-3 text-slate-600">
                <Phone class="w-4 h-4 text-slate-400" />
                <span>{{ organization.phone || 'No phone set' }}</span>
              </div>
              <div class="flex items-center gap-3 text-slate-600">
                <Calendar class="w-4 h-4 text-slate-400" />
                <span>Created {{ formatDate(organization.created_at || '') }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Settings & Theme</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-slate-500 mb-1">Currency</p>
                <p class="font-bold">{{ organization.currency || 'USD' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-500 mb-1">Default Tax Rate</p>
                <p class="font-bold">{{ organization.default_tax_rate || 0 }}%</p>
              </div>
            </div>
            
            <div>
              <p class="text-sm font-medium text-slate-500 mb-3">Brand Colors</p>
              <div class="flex gap-4">
                <div class="text-center">
                  <div class="w-10 h-10 rounded-full mb-1 shadow-sm border" :style="{ backgroundColor: organization.primary_color || '#0F766E' }"></div>
                  <span class="text-xs text-slate-500">Primary</span>
                </div>
                <div class="text-center">
                  <div class="w-10 h-10 rounded-full mb-1 shadow-sm border" :style="{ backgroundColor: organization.secondary_color || '#0EA5E9' }"></div>
                  <span class="text-xs text-slate-500">Secondary</span>
                </div>
                <div class="text-center">
                  <div class="w-10 h-10 rounded-full mb-1 shadow-sm border" :style="{ backgroundColor: organization.accent_color || '#F59E0B' }"></div>
                  <span class="text-xs text-slate-500">Accent</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <!-- Team Management -->
      <TeamManagement :organizationId="organization.id" />
    </div>
  </div>
</template>