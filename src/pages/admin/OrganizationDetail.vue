<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  ShieldAlert
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminService } from '@/services/adminService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const orgId = route.params.id as string

const loading = ref(true)
const isSuspending = ref(false)

const org = ref<any>(null)
const orgUsers = ref<any[]>([])
const auditLogs = ref<any[]>([])

onMounted(async () => {
  try {
    const data = await adminService.fetchOrganizationDetails(orgId)
    org.value = data
    orgUsers.value = data.organization_members?.map((m: any) => m.profiles) || []
    auditLogs.value = data.audit_logs || []
  } catch (error) {
    console.error('Failed to load organization details', error)
  } finally {
    loading.value = false
  }
})

const toggleSuspension = async () => {
  if (!org.value) return
  isSuspending.value = true
  try {
    const isCurrentlyActive = org.value.status === 'active'
    await adminService.suspendOrganization(orgId, isCurrentlyActive)
    org.value.status = isCurrentlyActive ? 'suspended' : 'active'
  } catch (error) {
    console.error('Failed to toggle suspension', error)
  } finally {
    isSuspending.value = false
  }
}

const handleImpersonate = async () => {
  if (!org.value) return
  await authStore.startImpersonating(org.value.id)
  router.push('/dashboard')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between" v-if="org">
      <div class="flex items-center gap-4">
        <router-link to="/admin/organizations">
          <Button variant="outline" size="icon">
            <ArrowLeft class="w-4 h-4" />
          </Button>
        </router-link>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-slate-900">{{ org.name }}</h1>
            <span 
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                org.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              ]"
            >
              {{ org.status }}
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-1">ID: {{ org.id }} • Created on {{ new Date(org.created_at).toLocaleDateString() }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <Button variant="outline" class="text-amber-600 border-amber-200 hover:bg-amber-50" @click="handleImpersonate">
          <ShieldAlert class="w-4 h-4 mr-2" />
          Impersonate Org
        </Button>
        <Button 
          :variant="org.status === 'active' ? 'destructive' : 'default'"
          :disabled="isSuspending"
          @click="toggleSuspension"
        >
          <XCircle v-if="org.status === 'active'" class="w-4 h-4 mr-2" />
          <CheckCircle2 v-else class="w-4 h-4 mr-2" />
          {{ org.status === 'active' ? 'Suspend Organization' : 'Activate Organization' }}
        </Button>
      </div>
    </div>
    
    <div v-else-if="loading" class="h-20 flex items-center justify-center">
      <p class="text-slate-500">Loading organization...</p>
    </div>

    <!-- Tabs Content -->
    <Tabs defaultValue="overview" class="w-full" v-if="org">
      <TabsList class="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users ({{ orgUsers.length }})</TabsTrigger>
        <TabsTrigger value="billing">Billing & Plan</TabsTrigger>
        <TabsTrigger value="logs">Audit Logs</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" class="space-y-6">
        <!-- KPI Cards for the specific org -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle class="text-sm font-medium text-slate-600">Total Users</CardTitle>
              <Users class="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-slate-900">{{ orgUsers.length }}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle class="text-sm font-medium text-slate-600">Quotations</CardTitle>
              <Activity class="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-slate-900">--</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle class="text-sm font-medium text-slate-600">Invoices</CardTitle>
              <Activity class="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-slate-900">--</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle class="text-sm font-medium text-slate-600">Storage Used</CardTitle>
              <Activity class="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-slate-900">--</div>
            </CardContent>
          </Card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Activity</CardTitle>
              <p class="text-sm text-slate-500">Activity metrics over the last 30 days.</p>
            </CardHeader>
            <CardContent class="h-[250px] flex items-center justify-center text-slate-400 border border-dashed rounded-md mx-6 mb-6">
              Chart Placeholder
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Events</CardTitle>
              <p class="text-sm text-slate-500">Latest actions performed within this organization.</p>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex items-start gap-4 text-sm" v-for="log in auditLogs.slice(0, 5)" :key="log.id">
                  <div class="w-2 h-2 mt-1.5 rounded-full bg-indigo-400"></div>
                  <div>
                    <p class="font-medium text-slate-900 capitalize">{{ log.action.replace(/_/g, ' ') }}</p>
                    <p class="text-slate-500">Resource: {{ log.resource }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ new Date(log.created_at).toLocaleString() }}</p>
                  </div>
                </div>
                <div v-if="auditLogs.length === 0" class="text-sm text-slate-500">No recent audit events.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>Organization Users</CardTitle>
            <p class="text-sm text-slate-500">Members belonging to this organization.</p>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg" v-for="user in orgUsers" :key="user.id">
                <div>
                  <p class="font-medium text-slate-900">{{ user.full_name || 'Unnamed User' }}</p>
                  <p class="text-sm text-slate-500">ID: {{ user.id }}</p>
                </div>
                <Button variant="ghost" size="sm">View Profile</Button>
              </div>
              <div v-if="orgUsers.length === 0" class="text-slate-500 text-center py-4">No users found.</div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="billing">
        <Card>
          <CardHeader>
            <CardTitle>Subscription & Billing</CardTitle>
            <p class="text-sm text-slate-500">Manage the active plan and limits.</p>
          </CardHeader>
          <CardContent class="h-[200px] flex items-center justify-center text-slate-500">
            Billing Data Placeholder
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="logs">
        <Card>
          <CardHeader>
            <CardTitle>Complete Audit Trail</CardTitle>
            <p class="text-sm text-slate-500">Detailed logs for compliance and security.</p>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-start gap-4 text-sm" v-for="log in auditLogs" :key="log.id">
                <div class="w-2 h-2 mt-1.5 rounded-full bg-slate-300"></div>
                <div>
                  <p class="font-medium text-slate-900">{{ log.action }}</p>
                  <p class="text-slate-500">Resource: {{ log.resource }}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ new Date(log.created_at).toLocaleString() }}</p>
                </div>
              </div>
              <div v-if="auditLogs.length === 0" class="text-slate-500 text-center py-4">No logs found.</div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <p class="text-sm text-slate-500">Platform-level overrides and settings for this tenant.</p>
          </CardHeader>
          <CardContent class="h-[200px] flex items-center justify-center text-slate-500">
            Settings Form Placeholder
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
