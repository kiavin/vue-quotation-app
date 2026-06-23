import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService, type PlatformOrganization, type FeatureFlag } from '@/services/adminService'
import iziToast from 'izitoast'

export const useAdminStore = defineStore('admin', () => {
  const organizations = ref<PlatformOrganization[]>([])
  const featureFlags = ref<FeatureFlag[]>([])
  const systemHealth = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchOrganizations = async () => {
    loading.value = true
    error.value = null
    try {
      organizations.value = await adminService.fetchAllOrganizations()
    } catch (err: any) {
      error.value = err.message
      iziToast.error({ title: 'Error', message: error.value || 'Failed to fetch organizations' })
    } finally {
      loading.value = false
    }
  }

  const toggleOrganizationSuspension = async (orgId: string, isSuspended: boolean) => {
    try {
      await adminService.suspendOrganization(orgId, isSuspended)
      const org = organizations.value.find(o => o.id === orgId)
      if (org) {
        org.status = isSuspended ? 'suspended' : 'active'
        org.suspended_at = isSuspended ? new Date().toISOString() : undefined
      }
      iziToast.success({ title: 'Success', message: `Organization ${isSuspended ? 'suspended' : 'activated'}` })
    } catch (err: any) {
      iziToast.error({ title: 'Error', message: err.message || 'Failed to toggle status' })
      throw err
    }
  }

  const fetchFeatureFlags = async () => {
    loading.value = true
    error.value = null
    try {
      featureFlags.value = await adminService.fetchFeatureFlags()
    } catch (err: any) {
      error.value = err.message
      iziToast.error({ title: 'Error', message: error.value || 'Failed to fetch flags' })
    } finally {
      loading.value = false
    }
  }

  const toggleFeatureFlag = async (flagId: string, isEnabled: boolean) => {
    try {
      await adminService.toggleFeatureFlag(flagId, isEnabled)
      const flag = featureFlags.value.find(f => f.id === flagId)
      if (flag) {
        flag.is_enabled = isEnabled
      }
      iziToast.success({ title: 'Success', message: 'Feature flag updated' })
    } catch (err: any) {
      iziToast.error({ title: 'Error', message: err.message || 'Failed to toggle flag' })
      throw err
    }
  }

  const fetchSystemHealth = async () => {
    try {
      systemHealth.value = await adminService.fetchSystemHealth()
    } catch (err: any) {
      console.error(err)
    }
  }

  return {
    organizations,
    featureFlags,
    systemHealth,
    loading,
    error,
    fetchOrganizations,
    toggleOrganizationSuspension,
    fetchFeatureFlags,
    toggleFeatureFlag,
    fetchSystemHealth
  }
})
