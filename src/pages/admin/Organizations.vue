<script setup lang="ts">
import {
  Building2,
  Search,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { onMounted, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAdminStore } from "@/stores/admin";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const adminStore = useAdminStore();
const authStore = useAuthStore();

onMounted(() => {
  adminStore.fetchOrganizations();
});

const organizations = computed(() => {
  return adminStore.organizations.filter((org) => {
    if (!searchQuery.value) return true;
    return org.name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const searchQuery = ref("");

const toggleSuspension = async (orgId: string, currentStatus: string) => {
  try {
    await adminStore.toggleOrganizationSuspension(
      orgId,
      currentStatus === "active",
    );
  } catch (error) {
    // Error handled by store toast
  }
};
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 class="w-6 h-6 text-slate-400" />
          Organizations
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Manage all tenant organizations on the platform.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" class="hidden sm:flex">
          <Filter class="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button>Add Organization</Button>
      </div>
    </div>

    <!-- Data Table Area -->
    <div
      class="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm"
    >
      <div
        class="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50"
      >
        <div class="relative w-full max-w-sm">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search organizations..." class="pl-9 bg-white" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow class="bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead>Organization Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead class="text-right">Users</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="org in organizations" :key="org.id">
            <TableCell class="font-medium text-slate-900">{{
              org.name
            }}</TableCell>
            <TableCell class="text-slate-500">{{
              org.owner_email || "N/A"
            }}</TableCell>
            <TableCell>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800"
              >
                Default
              </span>
            </TableCell>
            <TableCell class="text-right">{{ org.total_users || 0 }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-1.5">
                <CheckCircle2
                  v-if="org.status === 'active'"
                  class="w-4 h-4 text-emerald-500"
                />
                <XCircle
                  v-if="org.status === 'suspended'"
                  class="w-4 h-4 text-red-500"
                />
                <span
                  :class="[
                    'text-sm capitalize',
                    org.status === 'active'
                      ? 'text-emerald-700'
                      : 'text-red-700',
                  ]"
                >
                  {{ org.status }}
                </span>
              </div>
            </TableCell>
            <TableCell class="text-slate-500">{{
              new Date(org.created_at).toLocaleDateString()
            }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    @click="$router.push(`/admin/organizations/${org.id}`)"
                    >View Details</DropdownMenuItem
                  >
                  <DropdownMenuItem>Edit Organization</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    class="text-amber-600"
                    @click="authStore.startImpersonating(org.id)"
                  >
                    Impersonate Owner
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    @click="toggleSuspension(org.id, org.status)"
                    :class="
                      org.status === 'active'
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    "
                  >
                    {{
                      org.status === "active" ? "Suspend" : "Activate"
                    }}
                    Organization
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          <TableRow v-if="organizations.length === 0">
            <TableCell colspan="7" class="h-24 text-center text-slate-500">
              No organizations found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
