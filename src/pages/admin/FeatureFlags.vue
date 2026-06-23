<script setup lang="ts">
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Settings2 } from "lucide-vue-next";
import { Input } from "@/components/ui/input";

import { onMounted, computed } from "vue";
import { useAdminStore } from "@/stores/admin";

const adminStore = useAdminStore();

onMounted(() => {
  adminStore.fetchFeatureFlags();
});

const flags = computed(() => {
  return adminStore.featureFlags;
});

const toggleFlag = async (flagId: string, currentEnabled: boolean) => {
  await adminStore.toggleFeatureFlag(flagId, !currentEnabled);
};

const getStatusColor = (isEnabled: boolean) => {
  return isEnabled
    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
    : "bg-slate-100 text-slate-700 hover:bg-slate-100";
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">
          Feature Flags
        </h1>
        <p class="text-sm text-slate-500">
          Manage platform features and gradual rollouts.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button>
          <Plus class="w-4 h-4 mr-2" />
          Create Flag
        </Button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
        />
        <Input placeholder="Search feature flags..." class="pl-9" />
      </div>
      <Button variant="outline">
        <Settings2 class="w-4 h-4 mr-2" />
        Filters
      </Button>
    </div>

    <!-- Data Table -->
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flag Details</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rollout (Orgs)</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="flag in flags" :key="flag.id">
            <TableCell>
              <div>
                <div class="font-medium text-slate-900">{{ flag.name }}</div>
                <div
                  class="text-xs text-slate-500 truncate max-w-[250px]"
                  :title="flag.description"
                >
                  {{ flag.description }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <code
                class="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700"
                >{{ flag.key }}</code
              >
            </TableCell>
            <TableCell>
              <Badge variant="outline" class="capitalize">{{
                flag.is_global ? "Global" : "Targeted"
              }}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                :class="getStatusColor(flag.is_enabled)"
                class="capitalize"
                >{{ flag.is_enabled ? "Active" : "Inactive" }}</Badge
              >
            </TableCell>
            <TableCell class="text-slate-600">
              {{
                flag.is_global
                  ? "All"
                  : Object.keys(flag.org_overrides || {}).length || 0
              }}
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-2">
                <Button
                  @click="toggleFlag(flag.id, flag.is_enabled)"
                  variant="ghost"
                  size="sm"
                  class="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  {{ flag.is_enabled ? "Disable" : "Enable" }}
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="flags.length === 0">
            <TableCell colspan="6" class="h-32 text-center text-slate-500">
              No feature flags found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
