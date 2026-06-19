import { supabase, mapSupabaseError } from '@/lib/supabase'
import { apiSuccess, apiError } from '@/types/api-response'
import type { ApiResponse } from '@/types/api-response'

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'staff'
  invited_by?: string
  created_at: string
  profiles: {
    full_name: string | null
    email: string | null
  }
}

export const teamService = {
  /**
   * Get all members for an organization
   */
  async getMembers(organizationId: string): Promise<ApiResponse<OrganizationMember[]>> {
    try {
      // 1. Fetch organization members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true })
      
      if (membersError) throw membersError

      if (!membersData || membersData.length === 0) {
        return apiSuccess([] as OrganizationMember[])
      }

      // 2. Extract user IDs
      const userIds = membersData.map(m => m.user_id)

      // 3. Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

      if (profilesError) {
        console.warn('Failed to fetch profiles for members:', profilesError)
      }

      // 4. Merge data
      const mergedData = membersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id)
        return {
          ...member,
          profiles: {
            full_name: profile?.full_name || null,
            email: profile?.email || null
          }
        }
      })

      return apiSuccess(mergedData as OrganizationMember[])
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load team members.',
      })
    }
  },

  /**
   * Invite a new member
   */
  async inviteMember(organizationId: string, email: string, role: OrganizationMember['role']): Promise<ApiResponse<boolean>> {
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

      const { error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organizationId,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString()
        })
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        title: 'Invitation Sent',
        message: `An invitation has been sent to ${email}.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Invitation Failed',
        message: `Could not send the invitation to ${email}.`,
      })
    }
  },

  /**
   * Update member role
   */
  async updateMemberRole(id: string, role: OrganizationMember['role']): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', id)
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        title: 'Role Updated',
        message: `Team member role has been changed to ${role}.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Update Failed',
        message: 'Could not update the team member role.',
      })
    }
  },

  /**
   * Remove member
   */
  async removeMember(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        title: 'Member Removed',
        message: 'The team member has been removed from the organization.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Remove Failed',
        message: 'Could not remove the team member.',
      })
    }
  }
}
