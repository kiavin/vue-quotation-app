import { defineStore } from 'pinia'
import { ref } from 'vue'
import { organizationService } from '@/services/organizationService'
import type { Organization } from '@/types/organization'
import { useAuthStore } from '@/stores/auth'
import { notify } from '@/lib/notify'

export const useSettingsStore = defineStore('settings', () => {
  const organization = ref<Organization | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  async function fetchOrganization() {
    if (!authStore.organizationId) return
    loading.value = true
    error.value = null
    const result = await organizationService.getOrganization(authStore.organizationId)
    if (result.ok) {
      organization.value = result.data!
    } else {
      error.value = result.error
      notify.handleResponse(result)
    }
    loading.value = false
  }

  async function updateOrganization(updates: Partial<Organization>) {
    if (!organization.value?.id) return

    loading.value = true
    const result = await organizationService.updateOrganization(organization.value.id, updates)
    notify.handleResponse(result)
    if (result.ok) {
      organization.value = result.data!
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  async function uploadLogo(file: File) {
    if (!organization.value?.id) return

    loading.value = true
    const result = await organizationService.uploadLogo(organization.value.id, file)
    notify.handleResponse(result)
    if (result.ok) {
      await updateOrganization({ logo_url: result.data! })
    } else {
      error.value = result.error
    }
    loading.value = false
    return result
  }

  return {
    organization,
    loading,
    error,
    fetchOrganization,
    updateOrganization,
    uploadLogo
  }
})
