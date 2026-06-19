import { supabase, mapSupabaseError } from '@/lib/supabase'
import { apiSuccess, apiError } from '@/types/api-response'
import type { ApiResponse } from '@/types/api-response'

export interface Quotation {
  id?: string
  organization_id: string
  customer_id: string
  number: string
  title?: string
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  date: string
  expiry_date?: string
  subtotal: number
  transport_charge: number
  tax_rate: number
  tax_amount: number
  total: number
  notes?: string
  branding_snapshot?: any
  created_at?: string
  updated_at?: string
  customers?: any
  items?: QuotationItem[]
}

export interface QuotationItem {
  id?: string
  quotation_id?: string
  item_id?: string
  name: string
  description?: string
  quantity: number
  price: number
  total: number
}

export const quotationService = {
  /**
   * Get all quotations for the current organization
   */
  async getQuotations(organizationId: string): Promise<ApiResponse<Quotation[]>> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customers (
            name
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return apiSuccess(data as Quotation[])
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load quotations.',
      })
    }
  },

  /**
   * Get a single quotation by ID with its items
   */
  async getQuotationById(id: string): Promise<ApiResponse<Quotation>> {
    try {
      const { data: quotation, error: qError } = await supabase
        .from('quotations')
        .select(`
          *,
          customers (*)
        `)
        .eq('id', id)
        .single()
      
      if (qError) throw qError

      const { data: items, error: iError } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id)
      
      if (iError) throw iError

      return apiSuccess({ ...quotation, items } as Quotation)
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load quotation details.',
      })
    }
  },

  /**
   * Create a new quotation with items
   */
  async createQuotation(quotation: Quotation, items: QuotationItem[]): Promise<ApiResponse<Quotation>> {
    try {
      // 1. Insert quotation
      const { data: newQuotation, error: qError } = await supabase
        .from('quotations')
        .insert(quotation)
        .select()
        .single()
      
      if (qError) throw qError

      // 2. Insert items
      const itemsWithQuoId = items.map(item => ({
        ...item,
        quotation_id: newQuotation.id,
        organization_id: newQuotation.organization_id
      }))

      const { error: iError } = await supabase
        .from('quotation_items')
        .insert(itemsWithQuoId)
      
      if (iError) throw iError

      return apiSuccess(newQuotation as Quotation, {
        type: 'toast',
        title: 'Quotation Created',
        message: `Quotation ${newQuotation.number} has been saved.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Save Failed',
        message: 'Could not create the quotation.',
      })
    }
  },

  /**
   * Update an existing quotation and its items
   */
  async updateQuotation(id: string, updates: Partial<Quotation>, items: QuotationItem[]): Promise<ApiResponse<boolean>> {
    try {
      // 1. Update quotation
      const { error: qError } = await supabase
        .from('quotations')
        .update(updates)
        .eq('id', id)
      
      if (qError) throw qError

      // 2. Replace items (delete old, insert new)
      const { error: dError } = await supabase
        .from('quotation_items')
        .delete()
        .eq('quotation_id', id)
      
      if (dError) throw dError

      const itemsWithQuoId = items.map(item => ({
        ...item,
        quotation_id: id,
        organization_id: (updates as any).organization_id
      }))

      const { error: iError } = await supabase
        .from('quotation_items')
        .insert(itemsWithQuoId)
      
      if (iError) throw iError

      return apiSuccess(true, {
        type: 'toast',
        title: 'Quotation Updated',
        message: 'Your quotation has been updated successfully.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Update Failed',
        message: 'Could not update the quotation.',
      })
    }
  },

  /**
   * Change quotation status
   */
  async updateStatus(id: string, status: Quotation['status']): Promise<ApiResponse<boolean>> {
    const statusMessages: Record<string, string> = {
      draft: 'Quotation moved back to draft.',
      sent: 'Quotation has been marked as sent.',
      approved: 'Quotation has been approved!',
      rejected: 'Quotation has been rejected.',
      expired: 'Quotation has been marked as expired.',
    }

    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        severity: status === 'approved' ? 'success' : status === 'rejected' ? 'warning' : 'info',
        title: 'Status Updated',
        message: statusMessages[status] || 'Quotation status updated.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Status Update Failed',
        message: 'Could not update the quotation status.',
      })
    }
  },

  /**
   * Delete a quotation
   */
  async deleteQuotation(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        title: 'Quotation Deleted',
        message: 'The quotation has been removed.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Delete Failed',
        message: 'Could not delete the quotation.',
      })
    }
  }
}
