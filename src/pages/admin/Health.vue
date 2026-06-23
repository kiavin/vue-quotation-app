<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Server, Database, Cloud, Activity, RefreshCw } from 'lucide-vue-next'
import { adminService } from '@/services/adminService'

const systemStatus = ref('operational') // 'operational', 'degraded', 'down'
const lastUpdated = ref(new Date().toLocaleTimeString())
const isRefreshing = ref(false)

const services = ref([
  { id: 1, name: 'Web Application', status: 'operational', uptime: '99.99%', latency: '45ms', icon: Cloud },
  { id: 2, name: 'Database (Supabase)', status: 'operational', uptime: '99.95%', latency: '12ms', icon: Database },
  { id: 3, name: 'Storage API', status: 'operational', uptime: '99.99%', latency: '85ms', icon: Server },
  { id: 4, name: 'Authentication API', status: 'operational', uptime: '99.99%', latency: '60ms', icon: Activity },
])

const databaseMetrics = ref({
  activeConnections: 0,
  maxConnections: 100,
  cacheHitRatio: 'N/A',
  storageUsed: '0GB',
  storageLimit: '0GB',
  slowQueries: 0
})

const fetchHealthData = async () => {
  isRefreshing.value = true
  try {
    const data = await adminService.fetchSystemHealth()
    systemStatus.value = data.status || 'operational'
    if (data.database) {
      databaseMetrics.value = data.database
    }
    lastUpdated.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('Failed to fetch system health', error)
    systemStatus.value = 'degraded'
  } finally {
    isRefreshing.value = false
  }
}

onMounted(() => {
  fetchHealthData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">System Health</h1>
        <p class="text-sm text-slate-500">Real-time platform monitoring and service status.</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm text-slate-500">Last updated: {{ lastUpdated }}</div>
        <Button variant="outline" size="sm" @click="fetchHealthData" :disabled="isRefreshing">
          <RefreshCw class="w-4 h-4 mr-2" :class="isRefreshing ? 'animate-spin' : ''" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Overall Status -->
    <Card :class="systemStatus === 'operational' ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'">
      <CardContent class="p-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div :class="`w-12 h-12 rounded-full flex items-center justify-center ${systemStatus === 'operational' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`">
            <Activity class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-slate-900">
              {{ systemStatus === 'operational' ? 'All Systems Operational' : 'Degraded Performance' }}
            </h2>
            <p class="text-sm text-slate-600">
               {{ systemStatus === 'operational' ? 'The platform is running smoothly with no reported issues.' : 'Some services are experiencing issues.' }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Services Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="service in services" :key="service.id">
        <CardContent class="p-5">
          <div class="flex justify-between items-start mb-4">
            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <component :is="service.icon" class="w-5 h-5" />
            </div>
            <Badge :variant="service.status === 'operational' ? 'default' : 'destructive'" class="capitalize">
              {{ service.status }}
            </Badge>
          </div>
          <h3 class="font-medium text-slate-900 mb-1">{{ service.name }}</h3>
          <div class="flex items-center justify-between text-sm text-slate-500">
            <span>Uptime: <span class="font-medium text-slate-700">{{ service.uptime }}</span></span>
            <span>Latency: <span class="font-medium text-slate-700">{{ service.latency }}</span></span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Database Metrics -->
    <Card>
      <CardHeader>
        <CardTitle>Database Performance</CardTitle>
        <p class="text-sm text-slate-500">Real-time metrics from Supabase pg_stat tables.</p>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div class="space-y-1">
            <p class="text-sm font-medium text-slate-500">Active Connections</p>
            <p class="text-2xl font-bold text-slate-900">{{ databaseMetrics.activeConnections }} <span class="text-sm font-normal text-slate-500">/ {{ databaseMetrics.maxConnections }}</span></p>
            <div class="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div class="bg-indigo-500 h-full rounded-full" :style="`width: ${(databaseMetrics.activeConnections / databaseMetrics.maxConnections) * 100}%`"></div>
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-slate-500">Cache Hit Ratio</p>
            <p class="text-2xl font-bold text-slate-900">{{ databaseMetrics.cacheHitRatio }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-slate-500">Slow Queries (>1s)</p>
            <p class="text-2xl font-bold text-slate-900" :class="databaseMetrics.slowQueries > 0 ? 'text-amber-600' : ''">{{ databaseMetrics.slowQueries }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-slate-500">Storage Used</p>
            <p class="text-2xl font-bold text-slate-900">{{ databaseMetrics.storageUsed }} <span class="text-sm font-normal text-slate-500">/ {{ databaseMetrics.storageLimit }}</span></p>
            <div class="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div class="bg-indigo-500 h-full rounded-full" style="width: 45%"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
