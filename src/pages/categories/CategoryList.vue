<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { Plus, Edit2, Trash2, Search } from 'lucide-vue-next'
import { notify } from '@/lib/notify'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table'
import DataTablePagination from '@/components/shared/DataTablePagination.vue'
import { usePagination } from '@/composables/usePagination'

const router = useRouter()
const catalogStore = useCatalogStore()
const searchQuery = ref('')

onMounted(async () => {
  await catalogStore.fetchCatalog()
})

const handleDelete = async (id: string) => {
  const isConfirmed = await notify.confirm(
    'Delete Category',
    'Are you sure you want to delete this category? Items in this category will become uncategorized.',
    { confirmText: 'Yes, delete', icon: 'warning' }
  )
  if (isConfirmed) {
    await catalogStore.removeCategory(id)
  }
}

// Calculate usage
const getCategoryUsage = (categoryId: string) => {
  return catalogStore.items.filter(item => item.category_id === categoryId).length
}

const filteredCategories = computed(() => {
  if (!searchQuery.value) return catalogStore.categories
  const query = searchQuery.value.toLowerCase()
  return catalogStore.categories.filter(cat => 
    cat.name.toLowerCase().includes(query) || 
    (cat.description && cat.description.toLowerCase().includes(query))
  )
})

const {
  currentPage,
  itemsPerPage,
  totalItems,
  paginatedItems
} = usePagination(filteredCategories)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Categories</h2>
        <p class="text-slate-500">Manage item classifications for your catalog.</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative w-64">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input v-model="searchQuery" placeholder="Search categories..." class="pl-9" />
        </div>
        <Button @click="router.push('/categories/create')" class="gap-2">
          <Plus class="w-4 h-4" />
          Add Category
        </Button>
      </div>
    </div>

    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Items Count</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="category in paginatedItems" :key="category.id">
              <TableCell class="font-medium">{{ category.name }}</TableCell>
              <TableCell class="text-slate-500">{{ category.description || 'No description' }}</TableCell>
              <TableCell>
                <span class="inline-flex items-center justify-center bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {{ getCategoryUsage(category.id) }} items
                </span>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" @click="router.push(`/categories/${category.id}/edit`)">
                    <Edit2 class="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="handleDelete(category.id)">
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredCategories.length === 0 && !catalogStore.loading">
              <TableCell colspan="4" class="text-center py-12 text-slate-500">
                No categories found. Create one to organize your catalog.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <DataTablePagination 
          v-if="!catalogStore.loading && totalItems > 0"
          :total-items="totalItems"
          v-model:current-page="currentPage"
          v-model:items-per-page="itemsPerPage"
        />
      </CardContent>
    </Card>
  </div>
</template>