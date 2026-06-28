<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  Users as UsersIcon,
  Search,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Filter,
  Shield
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminService } from '@/services/adminService'
import DataTablePagination from '@/components/shared/DataTablePagination.vue'
import { usePagination } from '@/composables/usePagination'

const users = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')

onMounted(async () => {
  try {
    const data = await adminService.fetchUsers()
    users.value = data
  } catch (error) {
    console.error('Failed to fetch users', error)
  } finally {
    loading.value = false
  }
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.name?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query) ||
    user.organization?.toLowerCase().includes(query)
  )
})

const {
  currentPage,
  itemsPerPage,
  totalItems,
  paginatedItems
} = usePagination(filteredUsers)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UsersIcon class="w-6 h-6 text-slate-400" />
          Global Users
        </h1>
        <p class="text-sm text-slate-500 mt-1">Manage all user accounts across the platform.</p>
      </div>
      
      <div class="flex items-center gap-2">
        <Button variant="outline" class="hidden sm:flex">
          <Filter class="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
    </div>

    <!-- Data Table Area -->
    <div class="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
        <div class="relative w-full max-w-sm">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input v-model="searchQuery" placeholder="Search users by name, email..." class="pl-9 bg-white" />
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow class="bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead>User</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="6" class="h-24 text-center text-slate-500">Loading users...</TableCell>
          </TableRow>
          <TableRow v-else-if="filteredUsers.length === 0">
            <TableCell colspan="6" class="h-24 text-center text-slate-500">No users found.</TableCell>
          </TableRow>
          <TableRow v-for="user in paginatedItems" :key="user.id" v-else>
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                  {{ user.name?.charAt(0) || user.email?.charAt(0) || 'U' }}
                </div>
                <div>
                  <div class="font-medium text-slate-900">{{ user.name }}</div>
                  <div class="text-xs text-slate-500">{{ user.email }}</div>
                </div>
              </div>
            </TableCell>
            <TableCell class="text-slate-500">{{ user.organization }}</TableCell>
            <TableCell>
              <span 
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  user.role === 'super_admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                ]"
              >
                <Shield v-if="user.role === 'super_admin'" class="w-3 h-3 mr-1" />
                {{ user.role === 'super_admin' ? 'Super Admin' : user.role }}
              </span>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1.5">
                <CheckCircle2 v-if="user.status === 'active'" class="w-4 h-4 text-emerald-500" />
                <XCircle v-else class="w-4 h-4 text-red-500" />
                <span :class="[
                  'text-sm capitalize',
                  user.status === 'active' ? 'text-emerald-700' : 'text-red-700'
                ]">
                  {{ user.status }}
                </span>
              </div>
            </TableCell>
            <TableCell class="text-slate-500 text-sm">
              {{ user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never' }}
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>View User Profile</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-amber-600">Impersonate User</DropdownMenuItem>
                  <DropdownMenuItem>Force Logout</DropdownMenuItem>
                  <DropdownMenuItem>Send Password Reset</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-red-600">
                    {{ user.status === 'active' ? 'Suspend' : 'Activate' }} User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <DataTablePagination 
        v-if="!loading && totalItems > 0"
        :total-items="totalItems"
        v-model:current-page="currentPage"
        v-model:items-per-page="itemsPerPage"
      />
    </div>
  </div>
</template>
