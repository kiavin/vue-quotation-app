<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { CreditCard, DollarSign, AlertCircle } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const subscriptions = ref<any[]>([])
const loading = ref(true)

const stats = ref([
  { name: 'Monthly Recurring Revenue', value: '$0', icon: DollarSign },
  { name: 'Active Subscriptions', value: '0', icon: CreditCard },
  { name: 'Past Due', value: '0', icon: AlertCircle },
])

onMounted(async () => {
  try {
    const data = await adminService.fetchSubscriptions()
    subscriptions.value = data
    
    // Calculate simple stats
    const mrr = data.reduce((sum, sub) => sum + sub.mrr, 0)
    const active = data.filter(s => s.status === 'active').length
    const pastDue = data.filter(s => s.status === 'past_due').length

    stats.value[0].value = `$${mrr.toLocaleString()}`
    stats.value[1].value = active.toString()
    stats.value[2].value = pastDue.toString()
  } catch (error) {
    console.error('Failed to load subscriptions', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <CreditCard class="w-6 h-6 text-slate-400" />
        Subscriptions & Billing
      </h1>
      <p class="text-sm text-slate-500 mt-1">Manage platform billing and tenant subscriptions.</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card v-for="stat in stats" :key="stat.name">
        <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle class="text-sm font-medium text-slate-600">
            {{ stat.name }}
          </CardTitle>
          <component :is="stat.icon" class="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-slate-900" v-if="!loading">{{ stat.value }}</div>
          <div v-else class="h-8 w-24 bg-slate-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    </div>

    <!-- Subscriptions Table -->
    <div class="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-4 border-b border-slate-200 bg-slate-50/50">
        <h2 class="text-sm font-semibold text-slate-800">All Subscriptions</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow class="bg-slate-50/50">
            <TableHead>Organization</TableHead>
            <TableHead>Plan Tier</TableHead>
            <TableHead>MRR</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="5" class="text-center py-8 text-slate-500">Loading subscriptions...</TableCell>
          </TableRow>
          <TableRow v-else-if="subscriptions.length === 0">
            <TableCell colspan="5" class="text-center py-8 text-slate-500">No subscriptions found.</TableCell>
          </TableRow>
          <TableRow v-for="sub in subscriptions" :key="sub.id" v-else>
            <TableCell class="font-medium text-slate-900">{{ sub.orgName }}</TableCell>
            <TableCell>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                {{ sub.plan }}
              </span>
            </TableCell>
            <TableCell class="text-slate-600">${{ sub.mrr }}/mo</TableCell>
            <TableCell>
              <span :class="[
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              ]">
                {{ sub.status.replace('_', ' ') }}
              </span>
            </TableCell>
            <TableCell class="text-right">
              <button class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View Details</button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
