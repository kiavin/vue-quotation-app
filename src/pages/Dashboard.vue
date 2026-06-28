<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  Users,
  Quote,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-vue-next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboardService";
import { quotationService, type Quotation } from "@/services/quotationService";
import { useAuthStore } from "@/stores/auth";
import { useCurrency } from "@/composables/useCurrency";

const authStore = useAuthStore();
const { formatGlobalCurrency } = useCurrency();
const isLoading = ref(true);
const stats = ref([
  {
    name: "Total Customers",
    value: "0",
    icon: Users,
    change: "0%",
    changeType: "neutral",
  },
  {
    name: "Catalog Items",
    value: "0",
    icon: Plus,
    change: "0%",
    changeType: "neutral",
  },
  {
    name: "Active Quotations",
    value: "0",
    icon: Quote,
    change: "0%",
    changeType: "neutral",
  },
  {
    name: "Pending Invoices",
    value: "0",
    icon: FileText,
    change: "0%",
    changeType: "neutral",
  },
  {
    name: "Revenue (MTD)",
    value: formatGlobalCurrency(0),
    icon: TrendingUp,
    change: "0%",
    changeType: "neutral",
  },
  {
    name: "Outstanding",
    value: formatGlobalCurrency(0),
    icon: TrendingUp,
    change: "0%",
    changeType: "neutral",
  },
]);

const recentQuotations = ref<Quotation[]>([]);

onMounted(async () => {
  if (!authStore.organizationId) return;

  try {
    const [statsResult, quotationsResult] = await Promise.all([
      dashboardService.getAggregatedStats(authStore.organizationId),
      quotationService.getQuotations(authStore.organizationId),
    ]);

    if (statsResult.ok && statsResult.data) {
      const aggregatedStats = statsResult.data;
      stats.value = [
        {
          name: "Total Customers",
          value: aggregatedStats.customersCount.toString(),
          icon: Users,
          change: "--",
          changeType: "neutral",
        },
        {
          name: "Catalog Items",
          value: aggregatedStats.itemsCount.toString(),
          icon: Plus,
          change: "--",
          changeType: "neutral",
        },
        {
          name: "Active Quotations",
          value: aggregatedStats.quotationsCount.toString(),
          icon: Quote,
          change: "--",
          changeType: "neutral",
        },
        {
          name: "Pending Invoices",
          value: aggregatedStats.invoicesCount.toString(),
          icon: FileText,
          change: "--",
          changeType: "neutral",
        },
        {
          name: "Revenue (MTD)",
          value: formatGlobalCurrency(aggregatedStats.totalRevenue),
          icon: TrendingUp,
          change: "--",
          changeType: "neutral",
        },
        {
          name: "Outstanding",
          value: formatGlobalCurrency(aggregatedStats.outstandingAmount),
          icon: TrendingUp,
          change: "--",
          changeType: "neutral",
        },
      ];
    }

    if (quotationsResult.ok && quotationsResult.data) {
      recentQuotations.value = quotationsResult.data.slice(0, 5);
    }
  } catch (error) {
    console.error("Failed to load dashboard data", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p class="text-slate-500">
          Welcome back, here's what's happening today.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="outline" as-child class="flex-1 sm:flex-none">
          <router-link to="/reports">Reports</router-link>
        </Button>
        <Button class="flex items-center gap-2 flex-1 sm:flex-none" as-child>
          <router-link to="/quotations/new">
            <Plus class="w-4 h-4" />
            New Quote
          </router-link>
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <Card v-for="stat in stats" :key="stat.name">
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">{{ stat.name }}</CardTitle>
          <component :is="stat.icon" class="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <Skeleton v-if="isLoading" class="h-8 w-24 mb-1" />
          <div v-else class="text-2xl font-bold">{{ stat.value }}</div>

          <Skeleton v-if="isLoading" class="h-4 w-16 mt-2" />
          <p v-else class="text-xs text-slate-500 mt-1">
            <span
              v-if="stat.change !== '--'"
              :class="
                stat.changeType === 'increase'
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
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
            <template v-if="isLoading">
              <div
                v-for="i in 3"
                :key="i"
                class="flex items-center justify-between p-4 border rounded-lg"
              >
                <div class="flex items-center gap-4">
                  <Skeleton class="w-10 h-10 rounded-full" />
                  <div class="space-y-2">
                    <Skeleton class="h-4 w-32" />
                    <Skeleton class="h-3 w-24" />
                  </div>
                </div>
                <div class="text-right space-y-2 mr-4">
                  <Skeleton class="h-4 w-20 ml-auto" />
                  <Skeleton class="h-3 w-16 ml-auto" />
                </div>
              </div>
            </template>

            <template v-else>
              <div
                v-if="recentQuotations.length === 0"
                class="text-center py-12 text-slate-500"
              >
                <p>No quotations found yet.</p>
                <Button variant="link" as-child class="mt-2">
                  <router-link to="/quotations/new"
                    >Create your first quotation</router-link
                  >
                </Button>
              </div>
              <router-link
                v-for="quo in recentQuotations"
                :key="quo.id"
                :to="`/quotations/${quo.id}`"
                class="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"
                  >
                    <Quote class="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">
                      {{ quo.customers?.name || "Unknown Customer" }}
                    </p>
                    <p class="text-sm text-slate-500">
                      {{ quo.number }} •
                      {{ new Date(quo.date).toLocaleDateString() }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right mr-4">
                    <p class="font-bold text-slate-900">
                      {{ formatGlobalCurrency(quo.total) }}
                    </p>
                    <p class="text-xs capitalize text-slate-500">
                      {{ quo.status }}
                    </p>
                  </div>
                  <ArrowUpRight class="w-4 h-4 text-slate-400" />
                </div>
              </router-link>
              <Button
                v-if="recentQuotations.length > 0 && !isLoading"
                variant="link"
                class="w-full text-slate-500"
                as-child
              >
                <router-link to="/quotations">View all quotations</router-link>
              </Button>
            </template>
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
  </div>
</template>
