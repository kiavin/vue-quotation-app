<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminService } from '@/services/adminService'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const loading = ref(true)
const stats = ref([
  { 
    name: 'Total Organizations', 
    value: '0', 
    change: '+12%', 
    trend: 'up',
    icon: Building2,
    description: 'vs last month'
  },
  { 
    name: 'Active Users', 
    value: '0', 
    change: '+5.4%', 
    trend: 'up',
    icon: Users,
    description: 'vs last month'
  },
  { 
    name: 'Total Processed Revenue', 
    value: '$0', 
    change: '+15%', 
    trend: 'up',
    icon: CreditCard,
    description: 'vs last month'
  },
  { 
    name: 'Total Documents', 
    value: '0', 
    change: '-4.2%', 
    trend: 'down',
    icon: Activity,
    description: 'vs last month'
  },
])

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
}

const revenueData = ref({
  labels: [] as string[],
  datasets: [{
    label: 'Revenue ($)',
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    data: [] as number[],
    tension: 0.4
  }]
})

const documentData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Quotations',
      backgroundColor: '#0ea5e9',
      data: [] as number[]
    },
    {
      label: 'Invoices',
      backgroundColor: '#0f766e',
      data: [] as number[]
    }
  ]
})

onMounted(async () => {
  try {
    const [metricsData, timeSeries] = await Promise.all([
      adminService.fetchPlatformMetrics(),
      adminService.fetchTimeSeriesMetrics()
    ])

    stats.value[0].value = metricsData.total_organizations?.toLocaleString() || '0'
    stats.value[1].value = metricsData.active_users?.toLocaleString() || '0'
    stats.value[2].value = `$${metricsData.total_revenue?.toLocaleString() || '0'}`
    stats.value[3].value = ((metricsData.total_quotes || 0) + (metricsData.total_invoices || 0)).toLocaleString()

    if (timeSeries && timeSeries.length > 0) {
      const labels = timeSeries.map(t => t.month)
      revenueData.value.labels = labels
      revenueData.value.datasets[0].data = timeSeries.map(t => t.revenue)
      
      documentData.value.labels = labels
      documentData.value.datasets[0].data = timeSeries.map(t => t.quotes)
      documentData.value.datasets[1].data = timeSeries.map(t => t.invoices)
    }

  } catch (error) {
    console.error('Failed to load metrics', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Platform Overview</h1>
      <p class="text-sm text-slate-500 mt-1">Monitor the overall health and metrics of the CQIS platform.</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="stat in stats" :key="stat.name">
        <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle class="text-sm font-medium text-slate-600">
            {{ stat.name }}
          </CardTitle>
          <component :is="stat.icon" class="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div v-if="!loading" class="text-2xl font-bold text-slate-900">{{ stat.value }}</div>
          <div v-else class="h-8 w-24 bg-slate-100 rounded animate-pulse"></div>
          
          <div class="flex items-center mt-1 text-xs">
            <span 
              :class="[
                'flex items-center font-medium',
                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600',
              ]"
            >
              <ArrowUpRight v-if="stat.trend === 'up'" class="w-3 h-3 mr-1" />
              <ArrowDownRight v-if="stat.trend === 'down'" class="w-3 h-3 mr-1" />
              {{ stat.change }}
            </span>
            <span class="text-slate-500 ml-1.5">{{ stat.description }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card class="h-[400px]">
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
        </CardHeader>
        <CardContent class="h-[300px]">
          <Line v-if="!loading" :data="revenueData" :options="chartOptions" />
          <div v-else class="h-full w-full bg-slate-50 rounded animate-pulse"></div>
        </CardContent>
      </Card>
      
      <Card class="h-[400px]">
        <CardHeader>
          <CardTitle>Documents Generated</CardTitle>
        </CardHeader>
        <CardContent class="h-[300px]">
          <Bar v-if="!loading && documentData.labels.length > 0" :data="documentData" :options="chartOptions" />
          <div v-else class="h-full w-full bg-slate-50 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
