<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { NumberStepper } from '@/components/ui/number-stepper'
import { Loader2, Save } from 'lucide-vue-next'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CURRENCIES } from '@/utils/currencies'

const settingsStore = useSettingsStore()
const isSaving = ref(false)

const form = ref({
  default_tax_rate: 0,
  currency: 'USD'
})

onMounted(async () => {
  await settingsStore.fetchOrganization()
  if (settingsStore.organization) {
    form.value = {
      default_tax_rate: settingsStore.organization.default_tax_rate || 0,
      currency: settingsStore.organization.currency || 'USD'
    }
  }
})

async function handleSave() {
  isSaving.value = true
  try {
    await settingsStore.updateOrganization(form.value)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        <p class="text-muted-foreground">Manage your system defaults and business preferences.</p>
      </div>
      <Button @click="handleSave" :disabled="isSaving" class="w-full sm:w-auto">
        <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
        <Save v-else class="mr-2 h-4 w-4" />
        Save Settings
      </Button>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Financial Defaults</CardTitle>
          <p class="text-sm text-muted-foreground">Configure default values for new quotations and invoices.</p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="tax-rate">Default Tax Rate (%)</Label>
            <NumberStepper id="tax-rate" v-model="form.default_tax_rate" :min="0" :step="0.5" />
          </div>

          <div class="grid gap-2">
            <Label for="currency">Currency Code</Label>
            <Select v-model="form.currency">
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="c in CURRENCIES" :key="c.code" :value="c.code">
                    {{ c.code }} - {{ c.name }} ({{ c.symbol }})
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">Standard ISO currency code (e.g., USD for US Dollars).</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <p class="text-sm text-muted-foreground">Other configuration options for your workspace.</p>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground italic">More settings coming soon...</p>
        </CardContent>
      </Card>
    </div>

    <!-- Team Management -->
    <TeamManagement />
  </div>
</template>
