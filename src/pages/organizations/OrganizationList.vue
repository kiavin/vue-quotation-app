<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { organizationService } from "@/services/organizationService";
import { notify } from "@/lib/notify";
import { Plus, Settings2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { Organization } from "@/types/organization";

const router = useRouter();
const organizations = ref<Organization[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  const result = await organizationService.getUserOrganizationsWithStats();
  if (result.ok && result.data) {
    organizations.value = result.data;
  } else {
    notify.handleResponse(result);
  }
  isLoading.value = false;
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">
          Organizations
        </h2>
        <p class="text-slate-500">Manage businesses you are a member of.</p>
      </div>
      <Button @click="router.push('/onboarding')" class="gap-2">
        <Plus class="w-4 h-4" />
        New Organization
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead class="text-center">Members</TableHead>
              <TableHead class="text-center">Customers</TableHead>
              <TableHead class="text-center">Quotations</TableHead>
              <TableHead class="text-center">Invoices</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="org in organizations" :key="org.id">
              <TableCell>
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center overflow-hidden"
                  >
                    <img
                      v-if="org.logo_url"
                      :src="org.logo_url"
                      class="w-full h-full object-contain"
                    />
                    <span v-else class="font-bold text-slate-400">{{
                      org.name.charAt(0)
                    }}</span>
                  </div>
                  <div>
                    <p class="font-medium">{{ org.name }}</p>
                    <p class="text-xs text-slate-500">{{ org.slug }}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{{ org.currency }}</TableCell>
              <TableCell class="text-center">
                <span
                  class="inline-flex items-center justify-center bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium"
                >
                  {{ org.member_count }}
                </span>
              </TableCell>
              <TableCell class="text-center">{{
                org.customer_count
              }}</TableCell>
              <TableCell class="text-center">{{
                org.quotation_count
              }}</TableCell>
              <TableCell class="text-center">{{ org.invoice_count }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="router.push(`/organizations/${org.id}`)"
                  >
                    <Settings2 class="w-4 h-4 text-slate-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="organizations.length === 0 && !isLoading">
              <TableCell colspan="7" class="text-center py-12 text-slate-500">
                No organizations found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
