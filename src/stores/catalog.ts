import { defineStore } from 'pinia'
import { ref } from 'vue'
import { catalogService, type Item, type Category } from '@/services/catalogService'
import { useAuthStore } from '@/stores/auth'
import { notify } from '@/lib/notify'

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

    const [itemsResult, categoriesResult] = await Promise.all([
      catalogService.getItems(authStore.organizationId),
      catalogService.getCategories(authStore.organizationId)
    ])

    if (itemsResult.ok) {
      items.value = itemsResult.data!
    } else {
      error.value = itemsResult.error
      notify.handleResponse(itemsResult)
    }

    if (categoriesResult.ok) {
      categories.value = categoriesResult.data!
    } else {
      error.value = categoriesResult.error
      notify.handleResponse(categoriesResult)
    }

    loading.value = false
  }

  async function addItem(item: Item) {
    loading.value = true
    const result = await catalogService.createItem(item)
    notify.handleResponse(result)
    if (result.ok) {
      await fetchCatalog()
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function updateItem(id: string, updates: Partial<Item>) {
    loading.value = true
    const result = await catalogService.updateItem(id, updates)
    notify.handleResponse(result)
    if (result.ok) {
      await fetchCatalog()
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function removeItem(id: string) {
    loading.value = true
    const result = await catalogService.deleteItem(id)
    notify.handleResponse(result)
    if (result.ok) {
      items.value = items.value.filter(i => i.id !== id)
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function addCategory(category: Partial<Category>) {
    loading.value = true
    const result = await catalogService.createCategory(category)
    notify.handleResponse(result)
    if (result.ok) {
      await fetchCatalog()
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    loading.value = true
    const result = await catalogService.updateCategory(id, updates)
    notify.handleResponse(result)
    if (result.ok) {
      await fetchCatalog()
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function removeCategory(id: string) {
    loading.value = true
    const result = await catalogService.deleteCategory(id)
    notify.handleResponse(result)
    if (result.ok) {
      await fetchCatalog()
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
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
