import { supabase, handleSupabaseError } from '@/lib/supabase'

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
  async getInvoices(organizationId: string) {
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
      return data
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get a single invoice by ID with its items
   */
  async getInvoiceById(id: string) {
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

      return { ...invoice, items }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Create an invoice from a quotation
   */
  async createFromQuotation(quotation: Quotation & { items: QuotationItem[] }) {
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
        due_date: new Date(date.setDate(date.getDate() + 14)).toISOString().split('T')[0], // Default 14 days
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

      return newInvoice
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Update invoice status
   */
  async updateStatus(id: string, status: Invoice['status']) {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: string) {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}
