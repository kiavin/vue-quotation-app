import { supabase, mapSupabaseError } from '@/lib/supabase'
import { apiSuccess, apiError } from '@/types/api-response'
import type { ApiResponse } from '@/types/api-response'

import type { Quotation, QuotationItem } from './quotationService'

export interface Invoice {
  id?: string
  organization_id: string
  customer_id: string
  quotation_id?: string | null
  number: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
  issue_date: string
  due_date?: string
  subtotal: number
  transport_charge: number
  tax_rate: number
  tax_amount: number
  total: number
  amount_paid: number
  notes?: string
  branding_snapshot?: any
  created_at?: string
  updated_at?: string
}

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  name: string
  description?: string
  quantity: number
  price: number
  total: number
}

export const invoiceService = {
  /**
   * Get all invoices for the current organization
   */
  async getInvoices(organizationId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            name
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return apiSuccess(data)
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load invoices.',
      })
    }
  },

  /**
   * Get a single invoice by ID with its items
   */
  async getInvoiceById(id: string): Promise<ApiResponse<any>> {
    try {
      const { data: invoice, error: iError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (*)
        `)
        .eq('id', id)
        .single()
      
      if (iError) throw iError

      const { data: items, error: itError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id)
      
      if (itError) throw itError

      return apiSuccess({ ...invoice, items })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load invoice details.',
      })
    }
  },

  /**
   * Create an invoice from a quotation
   */
  async createFromQuotation(quotation: Quotation & { items: QuotationItem[] }): Promise<ApiResponse<any>> {
    try {
      // 1. Generate Invoice Number safely via RPC
      const { data: invoiceNumber, error: countError } = await supabase.rpc(
        'get_next_invoice_number',
        { org_id: quotation.organization_id }
      )
      
      if (countError) throw countError

      // 2. Prepare Invoice Data
      const date = new Date()
      const invoice: Invoice = {
        organization_id: quotation.organization_id,
        customer_id: quotation.customer_id,
        quotation_id: quotation.id,
        number: invoiceNumber,
        status: 'draft',
        issue_date: date.toISOString().split('T')[0],
        due_date: new Date(date.setDate(date.getDate() + 14)).toISOString().split('T')[0],
        subtotal: quotation.subtotal,
        transport_charge: quotation.transport_charge,
        tax_rate: quotation.tax_rate,
        tax_amount: quotation.tax_amount,
        total: quotation.total,
        amount_paid: 0,
        notes: quotation.notes,
        branding_snapshot: quotation.branding_snapshot
      }

      // 3. Insert Invoice
      const { data: newInvoice, error: invError } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single()
      
      if (invError) throw invError

      // 4. Insert Items
      const invoiceItems = quotation.items.map((item: QuotationItem) => ({
        invoice_id: newInvoice.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }))

      const { error: itemError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)
      
      if (itemError) throw itemError

      // 5. Update Quotation status to 'approved' if it was 'sent'
      if (quotation.status === 'sent') {
        await supabase
          .from('quotations')
          .update({ status: 'approved' })
          .eq('id', quotation.id)
      }

      return apiSuccess(newInvoice, {
        type: 'toast',
        title: 'Invoice Created',
        message: `Invoice ${newInvoice.number} has been created from the quotation.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Conversion Failed',
        message: 'Could not convert the quotation to an invoice.',
      })
    }
  },

  /**
   * Update invoice status
   */
  async updateStatus(id: string, status: Invoice['status']): Promise<ApiResponse<boolean>> {
    const statusMessages: Record<string, string> = {
      draft: 'Invoice moved back to draft.',
      sent: 'Invoice has been marked as sent.',
      paid: 'Invoice has been marked as paid!',
      overdue: 'Invoice has been marked as overdue.',
      void: 'Invoice has been voided.',
    }

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        severity: status === 'paid' ? 'success' : status === 'void' ? 'warning' : 'info',
        title: 'Status Updated',
        message: statusMessages[status] || 'Invoice status updated.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Status Update Failed',
        message: 'Could not update the invoice status.',
      })
    }
  },

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        title: 'Invoice Deleted',
        message: 'The invoice has been removed.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Delete Failed',
        message: 'Could not delete the invoice.',
      })
    }
  }
}
