import { defineStore } from 'pinia'
import { ref } from 'vue'
import { catalogService, type Item, type Category } from '@/services/catalogService'
import { useAuthStore } from '@/stores/auth'

export const useCatalogStore = defineStore('catalog', () => {
  const items = ref<(Item & { categories: { name: string } | null })[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  async function fetchCatalog() {
    if (!authStore.organizationId) {
      console.warn('Cannot fetch catalog: No organizationId found in authStore')
      return
    }
    loading.value = true
    error.value = null
    try {
      console.log('API Request: getItems and getCategories for', authStore.organizationId)
      const [fetchedItems, fetchedCategories] = await Promise.all([
        catalogService.getItems(authStore.organizationId),
        catalogService.getCategories(authStore.organizationId)
      ])
      console.log('API Response:', { itemsCount: fetchedItems.length, categoriesCount: fetchedCategories.length })
      items.value = fetchedItems
      categories.value = fetchedCategories
    } catch (err: any) {
      console.error('fetchCatalog Error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addItem(item: Item) {
    loading.value = true
    try {
      const newItem = await catalogService.createItem(item)
      // Re-fetch to get category join data
      await fetchCatalog()
      return newItem
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id: string, updates: Partial<Item>) {
    loading.value = true
    try {
      await catalogService.updateItem(id, updates)
      await fetchCatalog()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeItem(id: string) {
    loading.value = true
    try {
      await catalogService.deleteItem(id)
      items.value = items.value.filter(i => i.id !== id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addCategory(category: Partial<Category>) {
    loading.value = true
    try {
      const newCategory = await catalogService.createCategory(category)
      await fetchCatalog()
      return newCategory
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    loading.value = true
    try {
      await catalogService.updateCategory(id, updates)
      await fetchCatalog()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeCategory(id: string) {
    loading.value = true
    try {
      await catalogService.deleteCategory(id)
      await fetchCatalog()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    categories,
    loading,
    error,
    fetchCatalog,
    addItem,
    updateItem,
    removeItem,
    addCategory,
    updateCategory,
    removeCategory
  }
})
