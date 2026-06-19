<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useAuthStore } from '@/stores/auth'
import { Plus, Search, Filter, BookOpen, Layers } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CatalogTable from '@/components/forms/CatalogTable.vue'
import CategoryTable from '@/components/forms/CategoryTable.vue'
import type { Item, Category } from '@/services/catalogService'
import { cn } from '@/utils/utils'
import { notify } from '@/lib/notify'

const router = useRouter()
const catalogStore = useCatalogStore()
const authStore = useAuthStore()

const activeTab = ref<'items' | 'categories'>('items')
const searchQuery = ref('')
const selectedCategory = ref('all')

// Category Form State
const isCategoryModalOpen = ref(false)
const categoryForm = ref<Partial<Category>>({
  name: '',
  description: ''
})
const editingCategoryId = ref<string | null>(null)

onMounted(async () => {
  if (authStore.organizationId) {
    await catalogStore.fetchCatalog()
  }
})

watch(() => authStore.organizationId, async (newId) => {
  if (newId) {
    await catalogStore.fetchCatalog()
  }
})

const filteredItems = computed(() => {
  let items = catalogStore.items
  
  if (selectedCategory.value !== 'all') {
    items = items.filter(i => i.category_id === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(i => 
      i.name.toLowerCase().includes(query) || 
      i.description?.toLowerCase().includes(query)
    )
  }
  
  return items
})

const handleEditItem = (item: Item) => {
  router.push(`/catalog/${item.id}/edit`)
}

const handleDeleteItem = async (item: Item) => {
  const isConfirmed = await notify.confirm(
    'Delete Item',
    `Are you sure you want to delete ${item.name}?`,
    { confirmText: 'Yes, delete', icon: 'warning' }
  )
  if (isConfirmed) {
    await catalogStore.removeItem(item.id!)
  }
}

// Category Handlers
const openCategoryModal = (category?: Category) => {
  if (category) {
    editingCategoryId.value = category.id
    categoryForm.value = { 
      name: category.name, 
      description: category.description 
    }
  } else {
    editingCategoryId.value = null
    categoryForm.value = { name: '', description: '' }
  }
  isCategoryModalOpen.value = true
}

const handleSaveCategory = async () => {
  if (!categoryForm.value.name) return
  
  let result
  if (editingCategoryId.value) {
    result = await catalogStore.updateCategory(editingCategoryId.value, categoryForm.value)
  } else {
    result = await catalogStore.addCategory({
      ...categoryForm.value,
      organization_id: authStore.organizationId
    })
  }
  
  if (result.ok) {
    isCategoryModalOpen.value = false
  }
}

const handleDeleteCategory = async (category: Category) => {
  const isConfirmed = await notify.confirm(
    'Delete Category',
    `Delete category "${category.name}"? This will not delete items in this category.`,
    { confirmText: 'Yes, delete', icon: 'warning' }
  )
  if (isConfirmed) {
    await catalogStore.removeCategory(category.id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Item Catalog <span class="text-xs font-normal text-slate-400">v0.6.1</span></h2>
        <p class="text-slate-500">Manage your food items, packages, and categories.</p>
      </div>
      <div class="flex gap-2">
        <Button 
          variant="outline" 
          @click="activeTab = 'items'" 
          :class="cn(activeTab === 'items' && 'bg-slate-100')"
        >
          <BookOpen class="w-4 h-4 mr-2" />
          Items
        </Button>
        <Button 
          variant="outline" 
          @click="activeTab = 'categories'"
          :class="cn(activeTab === 'categories' && 'bg-slate-100')"
        >
          <Layers class="w-4 h-4 mr-2" />
          Categories
        </Button>
      </div>
    </div>

    <!-- Items Tab -->
    <div v-if="activeTab === 'items'" class="space-y-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4 flex-1">
          <div class="relative flex-1 max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input v-model="searchQuery" placeholder="Search items..." class="pl-9" />
          </div>
          <div class="flex items-center gap-2">
            <Filter class="w-4 h-4 text-slate-400" />
            <select 
              v-model="selectedCategory" 
              class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="all">All Categories</option>
              <option v-for="cat in catalogStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>
        <Button @click="router.push('/catalog/create')" class="gap-2">
          <Plus class="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardContent class="p-0">
          <div v-if="catalogStore.loading && catalogStore.items.length === 0" class="p-8 text-center">
            <p class="text-slate-500">Loading items...</p>
          </div>
          <CatalogTable 
            v-else
            :items="filteredItems" 
            @edit="handleEditItem"
            @delete="handleDeleteItem"
          />
        </CardContent>
      </Card>
    </div>

    <!-- Categories Tab -->
    <div v-else class="space-y-4">
      <div class="flex justify-end">
        <Button @click="openCategoryModal()" class="gap-2">
          <Plus class="w-4 h-4" />
          New Category
        </Button>
      </div>

      <Card>
        <CardContent class="p-0">
          <div v-if="catalogStore.loading && catalogStore.categories.length === 0" class="p-8 text-center">
            <p class="text-slate-500">Loading categories...</p>
          </div>
          <CategoryTable 
            v-else
            :categories="catalogStore.categories" 
            @edit="openCategoryModal"
            @delete="handleDeleteCategory"
          />
        </CardContent>
      </Card>
    </div>

    <!-- Simple Category Modal (Native for now) -->
    <div v-if="isCategoryModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card class="w-full max-w-md">
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold">{{ editingCategoryId ? 'Edit' : 'New' }} Category</h3>
        </div>
        <CardContent class="p-6 space-y-4">
          <div class="space-y-2">
            <Label for="cat-name">Category Name</Label>
            <Input id="cat-name" v-model="categoryForm.name" placeholder="e.g. Appetizers" />
          </div>
          <div class="space-y-2">
            <Label for="cat-desc">Description</Label>
            <Input id="cat-desc" v-model="categoryForm.description" placeholder="Optional description" />
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <Button variant="ghost" @click="isCategoryModalOpen = false">Cancel</Button>
            <Button @click="handleSaveCategory" :disabled="!categoryForm.name">
              {{ editingCategoryId ? 'Update' : 'Create' }} Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
