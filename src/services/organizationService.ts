import { supabase, mapSupabaseError } from '@/lib/supabase'
import { apiSuccess, apiError } from '@/types/api-response'
import type { ApiResponse } from '@/types/api-response'
import type { Organization } from '@/types/organization'

export const organizationService = {
  async getOrganization(organizationId: string): Promise<ApiResponse<Organization>> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Organization not found or access denied by RLS.')

      return apiSuccess(data as Organization)
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load organization details.',
      })
    }
  },

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<ApiResponse<Organization>> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return apiSuccess(data as Organization, {
        type: 'toast',
        title: 'Settings Saved',
        message: 'Organization settings have been updated.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Update Failed',
        message: 'Could not update organization settings.',
      })
    }
  },

  async uploadLogo(organizationId: string, file: File): Promise<ApiResponse<string>> {
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

      return apiSuccess(data.publicUrl, {
        type: 'toast',
        title: 'Logo Uploaded',
        message: 'Your company logo has been updated.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Upload Failed',
        message: 'Could not upload the logo. Please try a different file.',
      })
    }
  },

  async getUserOrganizationsWithStats(): Promise<ApiResponse<any[]>> {
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

      return apiSuccess(orgsWithStats)
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load organizations.',
      })
    }
  },

  async setupOrganization(orgDetails: Partial<Organization>): Promise<ApiResponse<Organization>> {
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

      const orgResult = await this.getOrganization(String(parsedId))
      if (!orgResult.ok) throw new Error(orgResult.error || 'Failed to fetch created organization')

      return apiSuccess(orgResult.data!, {
        type: 'toast',
        title: 'Welcome!',
        message: 'Your organization has been set up successfully.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        type: 'alert',
        title: 'Setup Failed',
        message: 'Could not set up your organization. Please try again.',
      })
    }
  }
}