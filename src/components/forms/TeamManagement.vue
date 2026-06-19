<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { teamService, type OrganizationMember } from '@/services/teamService'
import { useAuthStore } from '@/stores/auth'
import { notify } from '@/lib/notify'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table'
import { UserPlus, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  organizationId?: string
}>()

const authStore = useAuthStore()
const members = ref<OrganizationMember[]>([])
const isLoading = ref(true)

const inviteForm = ref({
  email: '',
  role: 'staff' as const
})

const getOrgId = () => props.organizationId || authStore.organizationId

const fetchMembers = async () => {
  const orgId = getOrgId()
  if (!orgId) return
  isLoading.value = true
  try {
    members.value = await teamService.getMembers(orgId)
  } catch (error) {
    console.error('Failed to fetch team members', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMembers()
})

watch(() => props.organizationId, () => {
  fetchMembers()
})

const handleInvite = async () => {
  const orgId = getOrgId()
  if (!orgId) return
  const result = await teamService.inviteMember(orgId, inviteForm.value.email, inviteForm.value.role)
  notify.handleResponse(result)
  if (result.ok) {
    inviteForm.value.email = ''
  }
}

const handleRemove = async (id: string) => {
  const isConfirmed = await notify.confirm(
    'Remove Member',
    'Are you sure you want to remove this member from the organization?',
    { confirmText: 'Yes, remove', icon: 'warning' }
  )
  if (!isConfirmed) return
  
  const result = await teamService.removeMember(id)
  notify.handleResponse(result)
  if (result.ok) {
    await fetchMembers()
  }
}

const handleRoleChange = async (id: string, event: Event) => {
  const select = event.target as HTMLSelectElement
  const result = await teamService.updateMemberRole(id, select.value as any)
  notify.handleResponse(result)
  if (result.ok) {
    await fetchMembers()
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Team Management</CardTitle>
      <p class="text-sm text-muted-foreground">Manage who has access to your organization.</p>
    </CardHeader>
    <CardContent class="space-y-6">
      
      <!-- Invite Form -->
      <form @submit.prevent="handleInvite" class="flex items-end gap-4 p-4 border rounded-lg bg-slate-50">
        <div class="flex-1 space-y-2">
          <Label for="invite-email">Email Address</Label>
          <Input id="invite-email" type="email" v-model="inviteForm.email" required placeholder="colleague@example.com" />
        </div>
        <div class="w-48 space-y-2">
          <Label for="invite-role">Role</Label>
          <select id="invite-role" v-model="inviteForm.role" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <Button type="submit" class="gap-2">
          <UserPlus class="w-4 h-4" />
          Invite
        </Button>
      </form>

      <!-- Members List -->
      <div class="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="member in members" :key="member.id">
              <TableCell class="font-medium">{{ member.profiles?.full_name || 'Pending User' }}</TableCell>
              <TableCell>{{ member.profiles?.email || 'N/A' }}</TableCell>
              <TableCell>
                <select 
                  :value="member.role" 
                  @change="handleRoleChange(member.id, $event)"
                  :disabled="member.user_id === authStore.user?.id || member.role === 'owner'"
                  class="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </TableCell>
              <TableCell class="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="text-red-500 hover:text-red-700 hover:bg-red-50"
                  @click="handleRemove(member.id)"
                  :disabled="member.user_id === authStore.user?.id || member.role === 'owner'"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="members.length === 0 && !isLoading">
              <TableCell colspan="4" class="text-center py-8 text-slate-500">
                No members found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

    </CardContent>
  </Card>
</template>
