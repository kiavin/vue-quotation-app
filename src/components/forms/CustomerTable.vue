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
import { Edit, Trash2, Eye } from 'lucide-vue-next'
import type { Customer } from '@/services/customerService'

defineProps<{
  customers: Customer[]
}>()

const emit = defineEmits<{
  (e: 'edit', customer: Customer): void
  (e: 'view', customer: Customer): void
  (e: 'delete', customer: Customer): void
}>()
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Status</TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="customer in customers" :key="customer.id">
        <TableCell class="font-medium">{{ customer.name }}</TableCell>
        <TableCell>{{ customer.email || '-' }}</TableCell>
        <TableCell>{{ customer.phone || '-' }}</TableCell>
        <TableCell>
          <Badge :variant="customer.is_active !== false ? 'success' : 'outline'">
            {{ customer.is_active !== false ? 'Active' : 'Inactive' }}
          </Badge>
        </TableCell>
        <TableCell class="text-right">
          <div class="flex justify-end gap-2">
            <Button variant="ghost" size="icon" @click="emit('view', customer)">
              <Eye class="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" @click="emit('edit', customer)">
              <Edit class="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="icon" @click="emit('delete', customer)">
              <Trash2 class="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <TableRow v-if="customers.length === 0">
        <TableCell colspan="5" class="h-24 text-center text-slate-500">
          No customers found.
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
