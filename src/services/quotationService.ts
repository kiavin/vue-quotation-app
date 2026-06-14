import { supabase, handleSupabaseError } from '@/lib/supabase'

export interface Quotation {
  id?: string
  organization_id: string
  customer_id: string
  number: string
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
  async getQuotations(organizationId: string) {
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
      return data
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get a single quotation by ID with its items
   */
  async getQuotationById(id: string) {
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

      return { ...quotation, items }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Create a new quotation with items
   */
  async createQuotation(quotation: Quotation, items: QuotationItem[]) {
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

      return newQuotation
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Update an existing quotation and its items
   */
  async updateQuotation(id: string, updates: Partial<Quotation>, items: QuotationItem[]) {
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

      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Change quotation status
   */
  async updateStatus(id: string, status: Quotation['status']) {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Delete a quotation
   */
  async deleteQuotation(id: string) {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}
// pabase
//         .from('quotations')
//         .delete()
//         .eq('id', id)
      
//       if (error) throw error
//       return true
//     } catch (error) {
//       return handleSupabaseError(error)
//     }
//   }
// }
