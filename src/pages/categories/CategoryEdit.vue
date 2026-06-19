<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { ChevronLeft, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const route = useRoute()
const catalogStore = useCatalogStore()

const isSaving = ref(false)
const isLoading = ref(true)
const categoryId = route.params.id as string

const form = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  if (catalogStore.categories.length === 0) {
    await catalogStore.fetchCatalog()
  }
  const category = catalogStore.categories.find(c => c.id === categoryId)
  if (category) {
    form.value = {
      name: category.name,
      description: category.description || ''
    }
  } else {
    router.push('/categories')
  }
  isLoading.value = false
})

const handleSave = async () => {
  isSaving.value = true
  const result = await catalogStore.updateCategory(categoryId, {
    name: form.value.name,
    description: form.value.description
  })
  if (result.ok) {
    router.push('/categories')
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
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Edit Category</h2>
        <p class="text-slate-500">Update category details.</p>
      </div>
    </div>

    <Card class="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Category Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="flex justify-center py-8">
          <Loader2 class="w-8 h-8 animate-spin text-primary" />
        </div>
        <form v-else @submit.prevent="handleSave" class="space-y-6">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="form.name" required placeholder="e.g., Appetizers" />
          </div>
          
          <div class="space-y-2">
            <Label for="description">Description (Optional)</Label>
            <Input id="description" v-model="form.description" placeholder="Brief description of this category" />
          </div>

          <div class="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" @click="router.back()">Cancel</Button>
            <Button type="submit" :disabled="isSaving">
              <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>