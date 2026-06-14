<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { 
  Users, 
  Quote, 
  FileText, 
  TrendingUp,
  ArrowUpRight,
  Plus,
  Loader2
} from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dashboardService } from '@/services/dashboardService'
import { quotationService, type Quotation } from '@/services/quotationService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoading = ref(true)
const stats = ref([
  { name: 'Total Customers', value: '0', icon: Users, change: '0%', changeType: 'neutral' },
  { name: 'Catalog Items', value: '0', icon: Plus, change: '0%', changeType: 'neutral' },
  { name: 'Active Quotations', value: '0', icon: Quote, change: '0%', changeType: 'neutral' },
  { name: 'Pending Invoices', value: '0', icon: FileText, change: '0%', changeType: 'neutral' },
  { name: 'Revenue (MTD)', value: '$0', icon: TrendingUp, change: '0%', changeType: 'neutral' },
  { name: 'Outstanding', value: '$0', icon: TrendingUp, change: '0%', changeType: 'neutral' },
])

const recentQuotations = ref<Quotation[]>([])

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.organization?.currency || 'USD'
  }).format(amount)
}

onMounted(async () => {
  if (!authStore.organizationId) return
  
  try {
    const [aggregatedStats, quotations] = await Promise.all([
      dashboardService.getAggregatedStats(authStore.organizationId),
      quotationService.getQuotations(authStore.organizationId)
    ])

    stats.value = [
      { name: 'Total Customers', value: aggregatedStats.customersCount.toString(), icon: Users, change: '--', changeType: 'neutral' },
      { name: 'Catalog Items', value: aggregatedStats.itemsCount.toString(), icon: Plus, change: '--', changeType: 'neutral' },
      { name: 'Active Quotations', value: aggregatedStats.quotationsCount.toString(), icon: Quote, change: '--', changeType: 'neutral' },
      { name: 'Pending Invoices', value: aggregatedStats.invoicesCount.toString(), icon: FileText, change: '--', changeType: 'neutral' },
      { name: 'Revenue (MTD)', value: formatCurrency(aggregatedStats.totalRevenue), icon: TrendingUp, change: '--', changeType: 'neutral' },
      { name: 'Outstanding', value: formatCurrency(aggregatedStats.outstandingAmount), icon: TrendingUp, change: '--', changeType: 'neutral' },
    ]

    recentQuotations.value = (quotations || []).slice(0, 5)
  } catch (error) {
    console.error('Failed to load dashboard data', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p class="text-slate-500">Welcome back, here's what's happening today.</p>
      </div>
      <div class="flex items-center gap-4">
        <Button variant="outline" as-child>
          <router-link to="/reports">View Reports</router-link>
        </Button>
        <Button class="flex items-center gap-2" as-child>
          <router-link to="/quotations/new">
            <Plus class="w-4 h-4" />
            Create Quotation
          </router-link>
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
      <p class="text-slate-500 font-medium">Loading your dashboard...</p>
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card v-for="stat in stats" :key="stat.name">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">{{ stat.name }}</CardTitle>
            <component :is="stat.icon" class="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stat.value }}</div>
            <p class="text-xs text-slate-500 mt-1">
              <span v-if="stat.change !== '--'" :class="stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'">
                {{ stat.change }}
              </span>
              <span v-else>No comparison data</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Main Grid -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <!-- Recent Quotations -->
        <Card class="col-span-4">
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-if="recentQuotations.length === 0" class="text-center py-12 text-slate-500">
                <p>No quotations found yet.</p>
                <Button variant="link" as-child class="mt-2">
                  <router-link to="/quotations/new">Create your first quotation</router-link>
                </Button>
              </div>
              <router-link 
                v-for="quo in recentQuotations" 
                :key="quo.id" 
                :to="`/quotations/${quo.id}`"
                class="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Quote class="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{{ quo.customers?.name || 'Unknown Customer' }}</p>
                    <p class="text-sm text-slate-500">{{ quo.number }} • {{ new Date(quo.date).toLocaleDateString() }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right mr-4">
                    <p class="font-bold text-slate-900">{{ formatCurrency(quo.total) }}</p>
                    <p class="text-xs capitalize text-slate-500">{{ quo.status }}</p>
                  </div>
                  <ArrowUpRight class="w-4 h-4 text-slate-400" />
                </div>
              </router-link>
              <Button v-if="recentQuotations.length > 0" variant="link" class="w-full text-slate-500" as-child>
                <router-link to="/quotations">View all quotations</router-link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Actions -->
        <Card class="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-2 gap-4">
            <Button variant="outline" class="h-24 flex-col gap-2" as-child>
              <router-link to="/customers/create">
                <Users class="w-6 h-6" />
                Add Customer
              </router-link>
            </Button>
            <Button variant="outline" class="h-24 flex-col gap-2" as-child>
              <router-link to="/catalog/create">
                <Plus class="w-6 h-6" />
                Add Item
              </router-link>
            </Button>
            <Button variant="outline" class="h-24 flex-col gap-2" as-child>
              <router-link to="/invoices">
                <FileText class="w-6 h-6" />
                View Invoices
              </router-link>
            </Button>
            <Button variant="outline" class="h-24 flex-col gap-2" as-child>
              <router-link to="/settings">
                <Plus class="w-6 h-6" />
                App Settings
              </router-link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>
