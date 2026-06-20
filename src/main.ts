import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { authService } from './services/authService'

import './assets/css/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Mount the app immediately — don't block rendering on auth.
// The router guard handles redirects once auth resolves.
app.mount('#app')

// Initialize auth in the background (non-blocking)
const authStore = useAuthStore()
import { useUiStore } from './stores/ui'
const uiStore = useUiStore()

uiStore.startLoading('auth-init', 'Restoring your session...')

authService.getSession()
  .then(session => authStore.setSession(session))
  .catch(error => console.error('Failed to initialize auth:', error))
  .finally(() => {
    authStore.setLoading(false)
    uiStore.stopLoading('auth-init')
  })

// Listen for auth changes
authService.onAuthStateChange(async (_event, session) => {
  await authStore.setSession(session)
})

// Redirect authenticated users away from guest-only pages once auth resolves
watch(() => authStore.loading, (isLoading) => {
  if (!isLoading && authStore.isAuthenticated) {
    const current = router.currentRoute.value
    if (current.meta.guestOnly) {
      router.replace({ name: 'dashboard' })
    }
  }
})
