<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, UserCog, AlertTriangle } from 'lucide-vue-next'
import { adminService } from '@/services/adminService'
import iziToast from 'izitoast'

const searchEmail = ref('')
const searchResult = ref<any>(null)
const loading = ref(false)

const performSearch = async () => {
  if (!searchEmail.value) return
  loading.value = true
  searchResult.value = null
  try {
    const user = await adminService.fetchUserByEmail(searchEmail.value)
    if (user) {
      searchResult.value = {
        id: user.id,
        email: user.email,
        name: user.name || 'Unnamed',
        organization: user.organization || 'None',
        status: user.status || 'active',
        lastLogin: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'
      }
    } else {
      iziToast.error({ title: 'Not Found', message: 'No user found with that email' })
    }
  } catch (error) {
    iziToast.error({ title: 'Error', message: 'Failed to search for user' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Support Tools</h1>
      <p class="text-sm text-slate-500">Utilities for customer support and troubleshooting.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- User Troubleshooting -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <UserCog class="w-5 h-5 text-indigo-600" />
            User Troubleshooting
          </CardTitle>
          <p class="text-sm text-slate-500">Find a user to reset password or check their session status.</p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-2">
            <Input v-model="searchEmail" placeholder="Enter user email address..." @keyup.enter="performSearch" />
            <Button @click="performSearch" :disabled="loading">
              <Search class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
            </Button>
          </div>
          
          <div v-if="searchResult" class="p-4 border rounded-md bg-slate-50 mt-4 space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium text-slate-900">{{ searchResult.name }}</div>
                <div class="text-sm text-slate-500">{{ searchResult.email }}</div>
              </div>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">Active</span>
            </div>
            <div class="text-sm text-slate-600">
              <span class="font-medium">Organization:</span> {{ searchResult.organization }}
            </div>
            <div class="text-sm text-slate-600">
              <span class="font-medium">Last Login:</span> {{ searchResult.lastLogin }}
            </div>
            <div class="pt-3 flex items-center gap-2 mt-2 border-t">
              <Button variant="outline" size="sm">Send Reset Email</Button>
              <Button variant="outline" size="sm" class="text-red-600 hover:text-red-700 hover:bg-red-50">Revoke Sessions</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- System Actions -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-amber-600" />
            Platform Actions
          </CardTitle>
          <p class="text-sm text-slate-500">High-privilege actions for maintaining the system.</p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between p-3 border rounded-md border-slate-200">
            <div>
              <div class="font-medium text-slate-900 text-sm">Clear Application Cache</div>
              <div class="text-xs text-slate-500">Forces all clients to fetch fresh data on next load.</div>
            </div>
            <Button variant="outline" size="sm">Clear Cache</Button>
          </div>
          
          <div class="flex items-center justify-between p-3 border rounded-md border-slate-200">
            <div>
              <div class="font-medium text-slate-900 text-sm">Re-sync Search Index</div>
              <div class="text-xs text-slate-500">Rebuilds full-text search indexes for all organizations.</div>
            </div>
            <Button variant="outline" size="sm">Sync Index</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
