import { supabase, handleSupabaseError } from '@/lib/supabase'

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
  async getItems(organizationId: string) {
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
      return data as (Item & { categories: { name: string } | null })[]
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Get all categories for the current organization
   */
  async getCategories(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true })
      
      if (error) throw error
      return data as Category[]
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Create a new category
   */
  async createCategory(category: Partial<Category>) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()
      
      if (error) throw error
      return data as Category
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<Category>) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Category
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Create a new item
   */
  async createItem(item: Item) {
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
      return data as Item
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Update an existing item
   */
  async updateItem(id: string, updates: Partial<Item>) {
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
      return data as Item
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  /**
   * Delete an item (hard delete for catalog items typically)
   */
  async deleteItem(id: string) {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}
