<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useAuthStore } from '@/stores/auth'
import { catalogService, type Item } from '@/services/catalogService'
import { notify } from '@/lib/notify'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import CatalogForm from '@/components/forms/CatalogForm.vue'

const router = useRouter()
const route = useRoute()
const catalogStore = useCatalogStore()
const authStore = useAuthStore()
const item = ref<Item | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  if (!authStore.organizationId) {
    router.push('/catalog')
    return
  }
  
  const result = await catalogService.getItems(authStore.organizationId)
  if (result.ok && result.data) {
    const found = result.data.find(i => i.id === id)
    if (found) {
      item.value = found as Item
    } else {
      notify.toast('error', 'Not Found', 'Item not found')
      router.push('/catalog')
    }
  } else {
    notify.handleResponse(result)
    router.push('/catalog')
  }
  isLoading.value = false
})

const handleSave = async (values: Item) => {
  if (!item.value?.id) return
  isSaving.value = true
  const result = await catalogStore.updateItem(item.value.id, values)
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
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Edit Catalog Item</h2>
        <p class="text-slate-500">Update item details and pricing.</p>
      </div>
    </div>

    <Card v-if="!isLoading" class="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Item Details</CardTitle>
      </CardHeader>
      <CardContent>
        <CatalogForm 
          :initialValues="item!"
          :loading="isSaving" 
          @submit="handleSave" 
          @cancel="router.back()" 
        />
      </CardContent>
    </Card>
    
    <div v-else class="text-center p-12">
      <p class="text-slate-500">Loading item details...</p>
    </div>
  </div>
</template>
