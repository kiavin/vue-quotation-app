import { supabase, mapSupabaseError } from '@/lib/supabase'
import { apiSuccess, apiError } from '@/types/api-response'
import type { ApiResponse } from '@/types/api-response'

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
  async getCustomers(organizationId: string): Promise<ApiResponse<Customer[]>> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('name', { ascending: true })
      
      if (error) throw error
      return apiSuccess(data as Customer[])
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load your customers. Please try again.',
      })
    }
  },

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return apiSuccess(data as Customer)
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load customer details.',
      })
    }
  },

  /**
   * Create a new customer
   */
  async createCustomer(customer: Customer): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer as any)
        .select()
        .single()
      
      if (error) throw error
      return apiSuccess(data as Customer, {
        type: 'toast',
        title: 'Customer Created',
        message: `${data.name} has been added to your customer list.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Save Failed',
        message: 'Could not create the customer. Please try again.',
      })
    }
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return apiSuccess(data as Customer, {
        type: 'toast',
        title: 'Customer Updated',
        message: `${data.name} has been updated successfully.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Update Failed',
        message: 'Could not update the customer. Please try again.',
      })
    }
  },

  /**
   * Soft delete a customer
   */
  async deleteCustomer(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        title: 'Customer Archived',
        message: 'The customer has been archived successfully.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Delete Failed',
        message: 'Could not archive the customer. Please try again.',
      })
    }
  }
}
