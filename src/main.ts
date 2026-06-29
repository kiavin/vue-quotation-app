import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { authService } from './services/authService'

import './assets/css/main.css'

import { createHead } from '@vueuse/head'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

app.use(pinia)
app.use(router)
app.use(head)

// Mount the app immediately — don't block rendering on auth.
// The router guard handles redirects once auth resolves.
app.mount('#app')

// Initialize auth in the background (non-blocking)
const authStore = useAuthStore()
import { useUiStore } from './stores/ui'
const uiStore = useUiStore()

uiStore.startLoading('auth-init', 'Restoring your session...')

// Listen for auth changes as the primary source of truth.
// INITIAL_SESSION fires automatically on load with the resolved session (or null), avoiding getSession() hangs.
authService.onAuthStateChange((event, session) => {
  // Do not await setSession here! Awaiting database calls inside onAuthStateChange 
  // causes a deadlock because the Supabase GoTrue client internal lock is held 
  // while firing callbacks. DB calls implicitly call getSession() which waits for the lock.
  authStore.setSession(session).then(() => {
    // If this is the initial load, stop the global loading spinner
    if (event === 'INITIAL_SESSION') {
      authStore.setLoading(false)
      uiStore.stopLoading('auth-init')
    }
  }).catch(err => {
    console.error('Failed to set session', err)
    if (event === 'INITIAL_SESSION') {
      authStore.setLoading(false)
      uiStore.stopLoading('auth-init')
    }
  })
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
