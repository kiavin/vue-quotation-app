import { supabase, handleSupabaseError } from '@/lib/supabase'

export interface Customer {
  id?: string
  organization_id?: string
  name: string
  email?: string
  phone?: string
  address?: string
  tax_number?: string
  is_active?: boolean
  created_at?: string
}

export const customerService = {
  /**
   * Get all customers for the current organization
   */
  async getCustomers(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('name', { ascending: true })
      
      if (error) throw error
      return data as Customer[]
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Customer
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Create a new customer
   */
  async createCustomer(customer: Customer) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()
      
      if (error) throw error
      return data as Customer
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, updates: Partial<Customer>) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Customer
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Soft delete a customer
   */
  async deleteCustomer(id: string) {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}
