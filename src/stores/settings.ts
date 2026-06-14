import { defineStore } from 'pinia'
import { ref } from 'vue'
import { organizationService } from '@/services/organizationService'
import type { Organization } from '@/types/organization'
import { useAuthStore } from '@/stores/auth'

export const useSettingsStore = defineStore('settings', () => {
  const organization = ref<Organization | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  async function fetchOrganization() {
    if (!authStore.organizationId) return
    loading.value = true
    error.value = null
    try {
      const data = await organizationService.getOrganization(authStore.organizationId)
      organization.value = data
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function updateOrganization(updates: Partial<Organization>) {
    if (!organization.value?.id) return

    loading.value = true
    try {
      const data = await organizationService.updateOrganization(organization.value.id, updates)
      organization.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function uploadLogo(file: File) {
    if (!organization.value?.id) return

    loading.value = true
    try {
      const logoUrl = await organizationService.uploadLogo(organization.value.id, file)
      await updateOrganization({ logo_url: logoUrl })
      return logoUrl
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
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
