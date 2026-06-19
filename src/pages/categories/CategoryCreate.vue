<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useAuthStore } from '@/stores/auth'
import { ChevronLeft, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const catalogStore = useCatalogStore()
const authStore = useAuthStore()

const isSaving = ref(false)
const form = ref({
  name: '',
  description: ''
})

const handleSave = async () => {
  if (!authStore.organizationId) return
  isSaving.value = true
  const result = await catalogStore.addCategory({
    ...form.value,
    organization_id: authStore.organizationId
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
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">New Category</h2>
        <p class="text-slate-500">Create a new classification for your items.</p>
      </div>
    </div>

    <Card class="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Category Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSave" class="space-y-6">
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
              Save Category
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>