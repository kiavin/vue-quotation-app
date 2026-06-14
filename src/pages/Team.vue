<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  Shield
} from 'lucide-vue-next'
import TeamManagement from '@/components/forms/TeamManagement.vue'

const authStore = useAuthStore()
const isLoading = ref(true)

onMounted(async () => {
  if (!authStore.organization) {
    await authStore.fetchProfileAndOrganization()
  }
  isLoading.value = false
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Organization & Team</h2>
        <p class="text-slate-500">Manage your business profile and team members.</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Organization Profile Summary -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Building class="w-5 h-5 text-primary" />
              Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                <img v-if="authStore.organization?.logo_url" :src="authStore.organization.logo_url" alt="Logo" class="h-full w-full object-contain" />
                <Building v-else class="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-900">{{ authStore.organization?.name || 'Loading...' }}</h3>
                <p class="text-sm text-slate-500">ID: <code class="bg-slate-100 px-1 rounded">{{ authStore.organizationId }}</code></p>
                <p class="text-sm text-slate-500">Slug: {{ authStore.organization?.slug }}</p>
              </div>
            </div>

            <div class="space-y-3 pt-4 border-t">
              <div class="flex items-center gap-3 text-sm">
                <Mail class="w-4 h-4 text-slate-400" />
                <span>{{ authStore.organization?.email || 'No email set' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <Phone class="w-4 h-4 text-slate-400" />
                <span>{{ authStore.organization?.phone || 'No phone set' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <Globe class="w-4 h-4 text-slate-400" />
                <span>{{ authStore.organization?.currency }} (Default)</span>
              </div>
            </div>

            <Button variant="outline" class="w-full mt-4" @click="$router.push('/branding')">
              Edit Branding
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="w-5 h-5 text-primary" />
              Your Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between">
              <span class="text-slate-600">Access Level:</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-primary/10 text-primary">
                {{ authStore.profile?.role || 'Member' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-4 leading-relaxed italic">
              Your role determines your permissions across the organization's data and settings.
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Team Management -->
      <div class="lg:col-span-2">
        <TeamManagement />
      </div>
    </div>
  </div>
</template>
