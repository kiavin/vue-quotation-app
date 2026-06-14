import { supabase, handleSupabaseError } from '@/lib/supabase'

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
  async getMembers(organizationId: string) {
    try {
      // 1. Fetch organization members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true })
      
      if (membersError) throw membersError

      if (!membersData || membersData.length === 0) {
        return []
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

      return mergedData as OrganizationMember[]
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Invite a new member
   */
  async inviteMember(organizationId: string, email: string, role: OrganizationMember['role']) {
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
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Update member role
   */
  async updateMemberRole(id: string, role: OrganizationMember['role']) {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Remove member
   */
  async removeMember(id: string) {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}
