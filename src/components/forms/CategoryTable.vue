<script setup lang="ts">
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-vue-next'
import type { Category } from '@/services/catalogService'

defineProps<{
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'edit', category: Category): void
  (e: 'delete', category: Category): void
}>()
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Category Name</TableHead>
        <TableHead>Description</TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="cat in categories" :key="cat.id">
        <TableCell class="font-medium">
          {{ cat.name }}
        </TableCell>
        <TableCell>
          <p class="text-sm text-slate-500">{{ cat.description || 'No description' }}</p>
        </TableCell>
        <TableCell class="text-right">
          <div class="flex justify-end gap-2">
            <Button variant="ghost" size="icon" @click="emit('edit', cat)">
              <Edit class="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="icon" @click="emit('delete', cat)">
              <Trash2 class="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <TableRow v-if="categories.length === 0">
        <TableCell colspan="3" class="h-24 text-center text-slate-500">
          No categories found.
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
