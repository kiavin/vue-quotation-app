<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useStorage, useMediaQuery } from '@vueuse/core'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Quote, 
  FileText, 
  Palette, 
  Settings,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { cn } from '@/utils/utils'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const isDesktopCollapsed = useStorage('cqis-sidebar-collapsed', false)
const isMobileOpen = ref(false)
const isLoggingOut = ref(false)
const isMobile = useMediaQuery('(max-width: 1024px)')

// Computed for actual display state based on breakpoint
const isSidebarExpanded = computed(() => {
  if (isMobile.value) return isMobileOpen.value
  return !isDesktopCollapsed.value
})

// Close mobile menu when navigating
watch(() => route.path, () => {
  if (isMobile.value) {
    isMobileOpen.value = false
  }
})

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Item Catalog', href: '/catalog', icon: BookOpen },
  { name: 'Categories', href: '/categories', icon: BookOpen },
  { name: 'Quotations', href: '/quotations', icon: Quote },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Branding', href: '/branding', icon: Palette },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const toggleMobileMenu = () => {
  isMobileOpen.value = !isMobileOpen.value
}

const toggleDesktopCollapse = () => {
  isDesktopCollapsed.value = !isDesktopCollapsed.value
}

const handleLogout = async () => {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    await authService.signOut()
    router.push({ name: 'landing' })
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <div class="flex h-screen bg-slate-50 relative overflow-hidden">
    <!-- Mobile Overlay -->
    <div 
      v-if="isMobile && isMobileOpen" 
      class="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
      @click="isMobileOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="cn(
        'fixed inset-y-0 left-0 z-50 transform bg-white border-r transition-all duration-300 ease-in-out lg:relative',
        isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
        !isMobile && isDesktopCollapsed ? 'w-20' : 'w-64'
      )"
    >
      <div class="flex flex-col h-full">
        <!-- Logo Area -->
        <div class="flex items-center h-16 px-4 lg:px-6 border-b justify-between">
          <div class="flex items-center gap-2 overflow-hidden">
            <div class="w-8 h-8 flex-shrink-0 rounded-md bg-primary flex items-center justify-center">
              <span class="text-white font-bold text-lg">C</span>
            </div>
            <span v-if="isSidebarExpanded" class="font-bold text-xl tracking-tight text-slate-900 whitespace-nowrap">CQIS <span class="text-[10px] font-normal opacity-50 ml-1 text-primary">v0.6.1</span></span>
          </div>
          <Button 
            v-if="!isMobile" 
            variant="ghost" 
            size="icon" 
            class="h-8 w-8 text-slate-500 hover:text-slate-900 ml-2 flex-shrink-0"
            @click="toggleDesktopCollapse"
          >
            <ChevronRight v-if="isDesktopCollapsed" class="w-4 h-4" />
            <ChevronLeft v-else class="w-4 h-4" />
          </Button>
          <Button 
            v-if="isMobile" 
            variant="ghost" 
            size="icon" 
            class="h-8 w-8 lg:hidden flex-shrink-0"
            @click="isMobileOpen = false"
          >
            <ChevronLeft class="w-4 h-4" />
          </Button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :title="!isSidebarExpanded ? item.name : undefined"
            :class="cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
              route.path === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              !isSidebarExpanded && 'justify-center px-0'
            )"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span v-if="isSidebarExpanded" class="truncate">{{ item.name }}</span>
          </router-link>
        </nav>

        <!-- User Profile Area -->
        <div class="p-4 border-t space-y-2 overflow-hidden">
          <div class="flex items-center gap-3" :class="!isSidebarExpanded && 'justify-center'">
            <div class="w-8 h-8 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
              {{ authStore.user?.email?.charAt(0) || 'U' }}
            </div>
            <div v-if="isSidebarExpanded" class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">
                {{ authStore.user?.email?.split('@')[0] }}
              </p>
              <p class="text-xs text-slate-500 truncate">{{ authStore.user?.email }}</p>
            </div>
          </div>
          <Button 
            v-if="isSidebarExpanded" 
            variant="ghost" 
            size="sm" 
            class="w-full justify-start gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50"
            @click="handleLogout"
            :disabled="isLoggingOut"
          >
            <LogOut class="w-4 h-4" />
            {{ isLoggingOut ? 'Logging out...' : 'Log out' }}
          </Button>
          <Button 
            v-else 
            variant="ghost" 
            size="icon" 
            title="Log out"
            class="w-full text-slate-500 hover:text-red-600 hover:bg-red-50"
            @click="handleLogout"
            :disabled="isLoggingOut"
          >
            <LogOut class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" class="lg:hidden" @click="toggleMobileMenu">
            <Menu class="w-5 h-5" />
          </Button>
          <h1 class="text-lg font-semibold text-slate-900">
            {{ navigation.find(n => n.href === route.path)?.name || 'Dashboard' }}
          </h1>
        </div>
        
        <div class="flex items-center gap-4">
          <router-link to="/quotations/new">
            <Button variant="outline" size="sm" class="hidden sm:flex items-center gap-2">
              <Quote class="w-4 h-4" />
              New Quotation
            </Button>
          </router-link>
          <div class="w-px h-6 bg-slate-200"></div>
          <Button variant="ghost" size="icon">
            <Settings class="w-5 h-5" />
          </Button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-8">
        <div class="max-w-7xl mx-auto h-full">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>