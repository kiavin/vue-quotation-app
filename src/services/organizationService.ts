import { supabase, handleSupabaseError } from '@/lib/supabase'
import type { Organization } from '@/types/organization'

export const organizationService = {
  async getOrganization(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Organization not found or access denied by RLS.')

      return data as Organization
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  async updateOrganization(id: string, updates: Partial<Organization>) {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data as Organization
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  async uploadLogo(organizationId: string, file: File) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`

      // IMPORTANT: first folder must be organization id
      const filePath = `${organizationId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  async getUserOrganizationsWithStats() {
    try {
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('name')
      
      if (orgsError) throw orgsError

      // Fetch stats for each org using Promise.all
      const orgsWithStats = await Promise.all(
        orgs.map(async (org) => {
          const [members, customers, quotations, invoices] = await Promise.all([
            supabase.from('organization_members').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
            supabase.from('customers').select('*', { count: 'exact', head: true }).eq('organization_id', org.id).is('deleted_at', null),
            supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('organization_id', org.id).is('deleted_at', null),
            supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('organization_id', org.id).is('deleted_at', null)
          ])

          return {
            ...org,
            member_count: members.count || 0,
            customer_count: customers.count || 0,
            quotation_count: quotations.count || 0,
            invoice_count: invoices.count || 0
          }
        })
      )

      return orgsWithStats
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  async setupOrganization(orgDetails: Partial<Organization>) {
    try {
      const { data: newOrgId, error } = await supabase.rpc(
        'create_organization_onboarding',
        {
          org_name: orgDetails.name || '',
          org_email: orgDetails.email || '',
          org_phone: orgDetails.phone || '',
          org_currency: orgDetails.currency || 'USD'
        }
      )

      if (error) throw error
      if (!newOrgId) throw new Error('Failed to create organization: No ID returned')

      // Safely handle cases where the RPC returns a record object instead of a scalar UUID
      const parsedId = typeof newOrgId === 'object' && newOrgId !== null ? (newOrgId as any).id || (newOrgId as any).organization_id : newOrgId

      return await this.getOrganization(String(parsedId))
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}