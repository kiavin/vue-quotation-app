import { supabase, mapSupabaseError } from '@/lib/supabase'

export interface PlatformOrganization {
  id: string
  name: string
  status: string
  suspended_at?: string
  suspension_reason?: string
  created_at: string
  owner_email?: string
  total_users?: number
}

export interface FeatureFlag {
  id: string
  key: string
  name: string
  description?: string
  is_global: boolean
  is_enabled: boolean
  org_overrides?: any
}

export const adminService = {
  async fetchAllOrganizations(): Promise<PlatformOrganization[]> {
    try {
      const { data, error } = await supabase.rpc('admin_get_organizations')

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Failed to fetch platform organizations', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchOrganizationDetails(orgId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('admin_get_organization_details', {
        org_id_param: orgId
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to fetch organization details', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async suspendOrganization(orgId: string, isSuspended: boolean): Promise<void> {
    try {
      const updates = {
        status: isSuspended ? 'suspended' : 'active',
        suspended_at: isSuspended ? new Date().toISOString() : null
      }
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', orgId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to toggle organization suspension', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch feature flags', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async toggleFeatureFlag(flagId: string, isEnabled: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: isEnabled })
        .eq('id', flagId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to toggle feature flag', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchPlatformMetrics(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('admin_get_platform_metrics')
      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to fetch platform metrics', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchTimeSeriesMetrics(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('admin_get_time_series_metrics')
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch time series metrics', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('admin_get_users')
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch users', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchSystemHealth(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('admin_get_system_health')
      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to fetch system health', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchSubscriptions(): Promise<any[]> {
    // Currently relying on organizations table for base subscription inference
    // until Stripe is implemented.
    try {
      const orgs = await this.fetchAllOrganizations()
      return orgs.map(org => ({
        id: org.id,
        orgName: org.name,
        plan: 'Default',
        status: org.status,
        mrr: 0
      }))
    } catch (error) {
      console.error('Failed to fetch subscriptions', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchAnalytics(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('admin_get_platform_metrics')
      if (error) throw error
      
      // Map platform metrics to analytics structure
      return {
        platform: {
          totalQuotes: data.total_quotes || 0,
          totalInvoices: data.total_invoices || 0,
          totalRevenue: data.total_revenue || 0
        },
        traffic: {
          pageViews: 0,
          uniqueVisitors: 0,
          apiRequests: 0
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchAuditLogs(): Promise<any[]> {
    try {
      // In real scenario, we would use an RPC or join to get the email
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(log => ({
        id: log.id,
        timestamp: log.created_at,
        actor: log.actor_id || 'System',
        action: log.action,
        resource: log.resource,
        organization: log.organization_id || 'Platform'
      }))
    } catch (error) {
      console.error('Failed to fetch audit logs', error)
      throw new Error(mapSupabaseError(error))
    }
  },

  async fetchUserByEmail(email: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('admin_get_users')
      if (error) throw error
      const users = data || []
      return users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || null
    } catch (error) {
      console.error('Failed to fetch user by email', error)
      throw new Error(mapSupabaseError(error))
    }
  }
}
