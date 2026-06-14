import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
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
      ],
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/pages/auth/Onboarding.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize if it hasn't yet
  if (authStore.loading) {
    // handled in main.ts
  }

  const isAuthenticated = authStore.isAuthenticated
  const hasOrganization = !!authStore.organizationId

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'dashboard' })
  } else if (isAuthenticated && !hasOrganization && to.name !== 'onboarding') {
    next({ name: 'onboarding' })
  } else if (isAuthenticated && hasOrganization && to.name === 'onboarding') {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
