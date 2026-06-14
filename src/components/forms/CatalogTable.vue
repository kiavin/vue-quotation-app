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
import { Edit, Trash2 } from 'lucide-vue-next'
import type { Item } from '@/services/catalogService'

defineProps<{
  items: (Item & { categories: { name: string } | null })[]
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
    </TableBody>
  </Table>
</template>
