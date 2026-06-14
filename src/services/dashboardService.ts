import { supabase, handleSupabaseError } from '@/lib/supabase'

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
  async getRevenueStats(organizationId: string) {
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

      return { totalRevenue, outstandingAmount }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(organizationId: string) {
    try {
      const { count, error } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return { invoicesCount: count || 0 }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get quotation statistics
   */
  async getQuotationStats(organizationId: string) {
    try {
      const { count, error } = await supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return { quotationsCount: count || 0 }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get customer statistics
   */
  async getCustomerStats(organizationId: string) {
    try {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return { customersCount: count || 0 }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get item statistics
   */
  async getItemStats(organizationId: string) {
    try {
      const { count, error } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return { itemsCount: count || 0 }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get member statistics
   */
  async getMemberStats(organizationId: string) {
    try {
      const { count, error } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (error) throw error
      return { membersCount: count || 0 }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get aggregated dashboard statistics
   */
  async getAggregatedStats(organizationId: string): Promise<DashboardStats> {
    try {
      const [revenue, invoices, quotations, customers, items, members] = await Promise.all([
        this.getRevenueStats(organizationId),
        this.getInvoiceStats(organizationId),
        this.getQuotationStats(organizationId),
        this.getCustomerStats(organizationId),
        this.getItemStats(organizationId),
        this.getMemberStats(organizationId)
      ])

      return {
        ...revenue,
        ...invoices,
        ...quotations,
        ...customers,
        ...items,
        ...members
      }
    } catch (error) {
      throw error // Let the caller handle it
    }
  }
}
