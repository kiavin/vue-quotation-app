<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useAuthStore } from '@/stores/auth'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import CatalogForm from '@/components/forms/CatalogForm.vue'
import type { Item } from '@/services/catalogService'

const router = useRouter()
const catalogStore = useCatalogStore()
const authStore = useAuthStore()
const isSaving = ref(false)

const handleSave = async (values: Item) => {
  isSaving.value = true
  const result = await catalogStore.addItem({
    ...values,
    organization_id: authStore.organizationId
  })
  if (result.ok) {
    router.push('/catalog')
  }
  isSaving.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ChevronLeft class="w-5 h-5" />
      </Button>
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Add Catalog Item</h2>
        <p class="text-slate-500">Create a new item for your catering catalog.</p>
      </div>
    </div>

    <Card class="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Item Details</CardTitle>
      </CardHeader>
      <CardContent>
        <CatalogForm 
          :loading="isSaving" 
          @submit="handleSave" 
          @cancel="router.back()" 
        />
      </CardContent>
    </Card>
  </div>
</template>
