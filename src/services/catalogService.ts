import { supabase, mapSupabaseError } from '@/lib/supabase'
import { apiSuccess, apiError } from '@/types/api-response'
import type { ApiResponse } from '@/types/api-response'

export interface Category {
  id: string
  organization_id: string
  name: string
  description?: string
}

export interface Item {
  id?: string
  organization_id?: string
  category_id?: string
  name: string
  description?: string
  unit?: string
  price: number
  is_active?: boolean
}

export const catalogService = {
  /**
   * Get all items for the current organization
   */
  async getItems(organizationId: string): Promise<ApiResponse<(Item & { categories: { name: string } | null })[]>> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('organization_id', organizationId)
        .order('name', { ascending: true })
      
      if (error) throw error
      return apiSuccess(data as (Item & { categories: { name: string } | null })[])
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load catalog items.',
      })
    }
  },

  /**
   * Get all categories for the current organization
   */
  async getCategories(organizationId: string): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true })
      
      if (error) throw error
      return apiSuccess(data as Category[])
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Load Failed',
        message: 'Could not load categories.',
      })
    }
  },

  /**
   * Create a new category
   */
  async createCategory(category: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()
      
      if (error) throw error
      return apiSuccess(data as Category, {
        type: 'toast',
        title: 'Category Created',
        message: `"${data.name}" category has been added.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Save Failed',
        message: 'Could not create the category.',
      })
    }
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return apiSuccess(data as Category, {
        type: 'toast',
        title: 'Category Updated',
        message: `"${data.name}" has been updated.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Update Failed',
        message: 'Could not update the category.',
      })
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        title: 'Category Deleted',
        message: 'The category has been removed.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Delete Failed',
        message: 'Could not delete the category. It may still have items assigned.',
      })
    }
  },

  /**
   * Create a new item
   */
  async createItem(item: Item): Promise<ApiResponse<Item>> {
    try {
      const itemData = { ...item }
      if (itemData.category_id === '') {
        itemData.category_id = null as any
      }

      const { data, error } = await supabase
        .from('items')
        .insert(itemData)
        .select()
        .single()
      
      if (error) throw error
      return apiSuccess(data as Item, {
        type: 'toast',
        title: 'Item Created',
        message: `"${data.name}" has been added to the catalog.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Save Failed',
        message: 'Could not create the catalog item.',
      })
    }
  },

  /**
   * Update an existing item
   */
  async updateItem(id: string, updates: Partial<Item>): Promise<ApiResponse<Item>> {
    try {
      const updateData = { ...updates }
      if (updateData.category_id === '') {
        updateData.category_id = null as any
      }

      const { data, error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return apiSuccess(data as Item, {
        type: 'toast',
        title: 'Item Updated',
        message: `"${data.name}" has been updated.`,
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Update Failed',
        message: 'Could not update the catalog item.',
      })
    }
  },

  /**
   * Delete an item (hard delete for catalog items typically)
   */
  async deleteItem(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return apiSuccess(true, {
        type: 'toast',
        title: 'Item Deleted',
        message: 'The catalog item has been removed.',
      })
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Delete Failed',
        message: 'Could not delete the catalog item.',
      })
    }
  }
}
