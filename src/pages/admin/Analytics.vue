<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BarChart3, Activity, FileText, Download } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Line } from 'vue-chartjs'
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
const analytics = ref<any>(null)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
}

const usageData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Quotations',
      backgroundColor: '#0ea5e9',
      borderColor: '#0ea5e9',
      data: [] as number[],
      tension: 0.4
    },
    {
      label: 'Invoices',
      backgroundColor: '#0f766e',
      borderColor: '#0f766e',
      data: [] as number[],
      tension: 0.4
    }
  ]
})

onMounted(async () => {
  try {
    const [data, timeSeries] = await Promise.all([
      adminService.fetchAnalytics(),
      adminService.fetchTimeSeriesMetrics()
    ])
    analytics.value = data

    if (timeSeries && timeSeries.length > 0) {
      const labels = timeSeries.map(t => t.month)
      usageData.value.labels = labels
      usageData.value.datasets[0].data = timeSeries.map(t => t.quotes)
      usageData.value.datasets[1].data = timeSeries.map(t => t.invoices)
    }
  } catch (error) {
    console.error('Failed to load analytics', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 class="w-6 h-6 text-slate-400" />
          Traffic & Analytics
        </h1>
        <p class="text-sm text-slate-500 mt-1">Platform usage statistics and network traffic logs.</p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline">
          <Download class="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>

    <Tabs defaultValue="platform" class="space-y-6">
      <TabsList>
        <TabsTrigger value="platform">Platform Usage</TabsTrigger>
      </TabsList>

      <TabsContent value="platform" class="space-y-6">
        <!-- Platform KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle class="text-sm font-medium text-slate-600">Total Quotes Generated</CardTitle>
              <FileText class="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-slate-900" v-if="!loading">{{ analytics?.platform?.totalQuotes.toLocaleString() }}</div>
              <div v-else class="h-8 w-24 bg-slate-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle class="text-sm font-medium text-slate-600">Total Invoices Sent</CardTitle>
              <FileText class="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-slate-900" v-if="!loading">{{ analytics?.platform?.totalInvoices.toLocaleString() }}</div>
              <div v-else class="h-8 w-24 bg-slate-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle class="text-sm font-medium text-slate-600">Platform Revenue Processed</CardTitle>
              <Activity class="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-emerald-600" v-if="!loading">${{ analytics?.platform?.totalRevenue.toLocaleString() }}</div>
              <div v-else class="h-8 w-24 bg-slate-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>

        <Card class="h-[400px]">
          <CardHeader>
            <CardTitle>Documents Generated Over Time</CardTitle>
          </CardHeader>
          <CardContent class="h-[300px]">
            <Line v-if="!loading && usageData.labels.length > 0" :data="usageData" :options="chartOptions" />
            <div v-else class="h-full w-full bg-slate-50 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
