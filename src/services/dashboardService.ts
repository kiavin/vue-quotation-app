import { supabase, mapSupabaseError } from '@/lib/supabase'
import { apiSuccess, apiError } from '@/types/api-response'
import type { ApiResponse } from '@/types/api-response'

export interface DashboardStats {
  totalRevenue: number
  outstandingAmount: number
  invoicesCount: number
  quotationsCount: number
  customersCount: number
  itemsCount: number
  membersCount: number
}

export const dashboardService = {
  /**
   * Get revenue statistics
   */
  async getRevenueStats(organizationId: string): Promise<ApiResponse<{ totalRevenue: number; outstandingAmount: number }>> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('total, amount_paid, status')
        .eq('organization_id', organizationId)
        .neq('status', 'void')
        .neq('status', 'draft')

      if (error) throw error

      const totalRevenue = data
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.total), 0)
        
      const outstandingAmount = data
        .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + (Number(inv.total) - Number(inv.amount_paid || 0)), 0)

      return apiSuccess({ totalRevenue, outstandingAmount })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load revenue statistics.',
      })
    }
  },

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(organizationId: string): Promise<ApiResponse<{ invoicesCount: number }>> {
    try {
      const { count, error } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return apiSuccess({ invoicesCount: count || 0 })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load invoice statistics.',
      })
    }
  },

  /**
   * Get quotation statistics
   */
  async getQuotationStats(organizationId: string): Promise<ApiResponse<{ quotationsCount: number }>> {
    try {
      const { count, error } = await supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return apiSuccess({ quotationsCount: count || 0 })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load quotation statistics.',
      })
    }
  },

  /**
   * Get customer statistics
   */
  async getCustomerStats(organizationId: string): Promise<ApiResponse<{ customersCount: number }>> {
    try {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return apiSuccess({ customersCount: count || 0 })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load customer statistics.',
      })
    }
  },

  /**
   * Get item statistics
   */
  async getItemStats(organizationId: string): Promise<ApiResponse<{ itemsCount: number }>> {
    try {
      const { count, error } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return apiSuccess({ itemsCount: count || 0 })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load item statistics.',
      })
    }
  },

  /**
   * Get member statistics
   */
  async getMemberStats(organizationId: string): Promise<ApiResponse<{ membersCount: number }>> {
    try {
      const { count, error } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (error) throw error
      return apiSuccess({ membersCount: count || 0 })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load team statistics.',
      })
    }
  },

  /**
   * Get aggregated dashboard statistics
   */
  async getAggregatedStats(organizationId: string): Promise<ApiResponse<DashboardStats>> {
    try {
      const [revenue, invoices, quotations, customers, items, members] = await Promise.all([
        this.getRevenueStats(organizationId),
        this.getInvoiceStats(organizationId),
        this.getQuotationStats(organizationId),
        this.getCustomerStats(organizationId),
        this.getItemStats(organizationId),
        this.getMemberStats(organizationId)
      ])

      // If any sub-call failed, surface the first error
      const failed = [revenue, invoices, quotations, customers, items, members].find(r => !r.ok)
      if (failed) {
        return apiError(failed.error || 'Partial load failure', {
          title: 'Dashboard Error',
          message: 'Some dashboard data could not be loaded.',
          severity: 'warning',
        })
      }

      return apiSuccess({
        ...revenue.data!,
        ...invoices.data!,
        ...quotations.data!,
        ...customers.data!,
        ...items.data!,
        ...members.data!,
      })
    } catch (error) {
      return apiError(error, {
        title: 'Dashboard Error',
        message: 'Could not load dashboard statistics.',
      })
    }
  }
}
