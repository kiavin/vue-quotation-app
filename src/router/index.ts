import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/pages/Landing.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/pages/Dashboard.vue'),
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/pages/Customers.vue'),
        },
        {
          path: 'customers/create',
          name: 'customers-create',
          component: () => import('@/pages/customers/CustomerCreate.vue'),
        },
        {
          path: 'customers/:id',
          name: 'customers-detail',
          component: () => import('@/pages/customers/CustomerDetail.vue'),
        },
        {
          path: 'customers/:id/edit',
          name: 'customers-edit',
          component: () => import('@/pages/customers/CustomerEdit.vue'),
        },
        {
          path: 'catalog',
          name: 'catalog',
          component: () => import('@/pages/Catalog.vue'),
        },
        {
          path: 'catalog/create',
          name: 'catalog-create',
          component: () => import('@/pages/catalog/CatalogCreate.vue'),
        },
        {
          path: 'catalog/:id/edit',
          name: 'catalog-edit',
          component: () => import('@/pages/catalog/CatalogEdit.vue'),
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/pages/categories/CategoryList.vue'),
        },
        {
          path: 'categories/create',
          name: 'categories-create',
          component: () => import('@/pages/categories/CategoryCreate.vue'),
        },
        {
          path: 'categories/:id/edit',
          name: 'categories-edit',
          component: () => import('@/pages/categories/CategoryEdit.vue'),
        },
        {
          path: 'quotations',
          name: 'quotations',
          component: () => import('@/pages/quotations/QuotationList.vue'),
        },
        {
          path: 'quotations/new',
          name: 'quotations-new',
          component: () => import('@/pages/quotations/QuotationBuilder.vue'),
        },
        {
          path: 'quotations/:id',
          name: 'quotations-detail',
          component: () => import('@/pages/quotations/QuotationDetail.vue'),
        },
        {
          path: 'quotations/:id/edit',
          name: 'quotations-edit',
          component: () => import('@/pages/quotations/QuotationBuilder.vue'),
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('@/pages/invoices/InvoiceList.vue'),
        },
        {
          path: 'invoices/:id',
          name: 'invoice-detail',
          component: () => import('@/pages/invoices/InvoiceDetail.vue'),
        },
        {
          path: 'branding',
          name: 'branding',
          component: () => import('@/pages/Branding.vue'),
        },
        {
          path: 'team',
          name: 'team',
          component: () => import('@/pages/Team.vue'),
        },
        {
          path: 'organizations',
          name: 'organizations',
          component: () => import('@/pages/organizations/OrganizationList.vue'),
        },
        {
          path: 'organizations/:id',
          name: 'organizations-detail',
          component: () => import('@/pages/organizations/OrganizationDetail.vue'),
        },
        {
          path: 'organizations/:id/edit',
          name: 'organizations-edit',
          component: () => import('@/pages/organizations/OrganizationEdit.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/pages/Settings.vue'),
        },
      ],
    },
    {
      path: '/quotations/:id/print',
      name: 'quotations-print',
      component: () => import('@/pages/quotations/QuotationPrint.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/invoices/:id/print',
      name: 'invoices-print',
      component: () => import('@/pages/invoices/InvoicePrint.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { guestOnly: true },
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/pages/auth/Login.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/pages/auth/Register.vue'),
        },
      ],
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/pages/auth/Onboarding.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresPlatformAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/pages/admin/Dashboard.vue'),
        },
        {
          path: 'organizations',
          name: 'admin-organizations',
          component: () => import('@/pages/admin/Organizations.vue'),
        },
        {
          path: 'organizations/:id',
          name: 'admin-org-detail',
          component: () => import('@/pages/admin/OrganizationDetail.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/pages/admin/Users.vue'),
        },
        {
          path: 'subscriptions',
          name: 'admin-subscriptions',
          component: () => import('@/pages/admin/Subscriptions.vue'),
        },
        {
          path: 'analytics',
          name: 'admin-analytics',
          component: () => import('@/pages/admin/Analytics.vue'),
        },
        {
          path: 'audit',
          name: 'admin-audit',
          component: () => import('@/pages/admin/AuditLogs.vue'),
        },
        {
          path: 'health',
          name: 'admin-health',
          component: () => import('@/pages/admin/Health.vue'),
        },
        {
          path: 'flags',
          name: 'admin-flags',
          component: () => import('@/pages/admin/FeatureFlags.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/pages/admin/Settings.vue'),
        },
        {
          path: 'support',
          name: 'admin-support',
          component: () => import('@/pages/admin/Support.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFound.vue'),
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Only block navigation for routes that actually require knowing auth state up front
  if (authStore.loading && (to.meta.requiresAuth || to.meta.guestOnly)) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(() => authStore.loading, (isLoading) => {
        if (!isLoading) { unwatch(); resolve() }
      })
      if (!authStore.loading) { unwatch(); resolve() }
    })
  }

  const isAuthenticated = authStore.isAuthenticated
  const hasOrganization = !!authStore.organizationId

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresPlatformAdmin && !authStore.isPlatformAdmin) {
    next({ name: 'NotFound' })
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: authStore.isPlatformAdmin ? 'admin-dashboard' : 'dashboard' })
  } else if (isAuthenticated && !hasOrganization && to.name !== 'onboarding' && !to.meta.requiresPlatformAdmin) {
    next({ name: authStore.isPlatformAdmin ? 'admin-dashboard' : 'onboarding' })
  } else if (isAuthenticated && hasOrganization && to.name === 'onboarding') {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
