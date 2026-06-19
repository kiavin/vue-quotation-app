<script setup lang="ts">
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Trash2 } from 'lucide-vue-next'
import type { Item } from '@/services/catalogService'

defineProps<{
  items: (Item & { categories: { name: string } | null })[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', item: Item): void
  (e: 'delete', item: Item): void
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Item Name</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Unit</TableHead>
        <TableHead>Price</TableHead>
        <TableHead>Status</TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <template v-if="isLoading && items.length === 0">
        <TableRow v-for="i in 5" :key="i">
          <TableCell>
            <div class="space-y-2">
              <Skeleton class="h-5 w-32" />
              <Skeleton class="h-3 w-48" />
            </div>
          </TableCell>
          <TableCell><Skeleton class="h-6 w-24 rounded-full" /></TableCell>
          <TableCell><Skeleton class="h-5 w-12" /></TableCell>
          <TableCell><Skeleton class="h-5 w-20" /></TableCell>
          <TableCell><Skeleton class="h-6 w-16 rounded-full" /></TableCell>
          <TableCell class="text-right">
            <div class="flex justify-end gap-2">
              <Skeleton class="h-8 w-8" />
              <Skeleton class="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      </template>
      <template v-else>
        <TableRow v-for="item in items" :key="item.id">
          <TableCell class="font-medium">
            <div>
              <p>{{ item.name }}</p>
              <p class="text-xs text-slate-500 font-normal line-clamp-1">{{ item.description || 'No description' }}</p>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline">{{ item.categories?.name || 'Uncategorized' }}</Badge>
          </TableCell>
          <TableCell>{{ item.unit || 'Each' }}</TableCell>
          <TableCell>{{ formatCurrency(item.price) }}</TableCell>
          <TableCell>
            <Badge :variant="item.is_active !== false ? 'success' : 'outline'">
              {{ item.is_active !== false ? 'Active' : 'Inactive' }}
            </Badge>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex justify-end gap-2">
              <Button variant="ghost" size="icon" @click="emit('edit', item)">
                <Edit class="w-4 h-4 text-slate-600" />
              </Button>
              <Button variant="ghost" size="icon" @click="emit('delete', item)">
                <Trash2 class="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-if="items.length === 0">
          <TableCell colspan="6" class="h-24 text-center text-slate-500">
            No items found in catalog.
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>
