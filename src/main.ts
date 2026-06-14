import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { authService } from './services/authService'

import './assets/css/main.css'

const initApp = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  
  const authStore = useAuthStore()

  // Initialize auth state before mounting
  try {
    const session = await authService.getSession()
    await authStore.setSession(session)
    
    // Listen for auth changes
    authService.onAuthStateChange(async (_event, session) => {
      await authStore.setSession(session)
    })
  } catch (error) {
    console.error('Failed to initialize auth:', error)
  } finally {
    authStore.setLoading(false)
  }

  app.use(router)
  app.mount('#app')
}

initApp()
