<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCatalogStore } from '@/stores/catalog'
import type { Item } from '@/services/catalogService'

const props = defineProps<{
  initialValues?: Partial<Item>
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', values: Item): void
  (e: 'cancel'): void
}>()

const catalogStore = useCatalogStore()

const form = reactive({
  name: props.initialValues?.name || '',
  description: props.initialValues?.description || '',
  unit: props.initialValues?.unit || 'per person',
  price: props.initialValues?.price || 0,
  category_id: props.initialValues?.category_id || '',
  is_active: props.initialValues?.is_active ?? true
})

onMounted(async () => {
  if (catalogStore.categories.length === 0) {
    await catalogStore.fetchCatalog()
  }
})

const handleSubmit = () => {
  emit('submit', { ...form } as Item)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2 md:col-span-2">
        <Label for="name">Item Name *</Label>
        <Input id="name" v-model="form.name" placeholder="e.g. Wedding Buffet Package" required />
      </div>
      
      <div class="space-y-2">
        <Label for="category">Category</Label>
        <select 
          id="category" 
          v-model="form.category_id" 
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select Category</option>
          <option v-for="cat in catalogStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="space-y-2">
        <Label for="unit">Unit (e.g. Each, Per Person)</Label>
        <Input id="unit" v-model="form.unit" placeholder="per person" />
      </div>

      <div class="space-y-2">
        <Label for="price">Price (USD)</Label>
        <Input id="price" v-model.number="form.price" type="number" step="0.01" min="0" required />
      </div>

      <div class="flex items-center gap-2 self-end pb-2">
        <input id="is_active" v-model="form.is_active" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
        <Label for="is_active">Active in Catalog</Label>
      </div>
    </div>

    <div class="space-y-2">
      <Label for="description">Description</Label>
      <textarea
        id="description"
        v-model="form.description"
        class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Brief description of what's included..."
      ></textarea>
    </div>

    <div class="flex justify-end gap-4 pt-4 border-t">
      <Button type="button" variant="outline" @click="emit('cancel')" :disabled="loading">
        Cancel
      </Button>
      <Button type="submit" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Item' }}
      </Button>
    </div>
  </form>
</template>
