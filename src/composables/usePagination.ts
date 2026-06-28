import { ref, computed, type Ref, watch } from 'vue'

export function usePagination<T>(items: Ref<T[]>, defaultPerPage = 25) {
  const currentPage = ref(1)
  const itemsPerPage = ref(defaultPerPage)

  // Reset to page 1 when items change significantly (e.g. searching/filtering)
  watch(items, () => {
    currentPage.value = 1
  }, { deep: false })

  const totalItems = computed(() => items.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)))

  // Ensure current page doesn't exceed total pages if total items drop
  watch(totalPages, (newTotal) => {
    if (currentPage.value > newTotal) {
      currentPage.value = newTotal
    }
  })

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return items.value.slice(start, end)
  })

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage
  }
}
