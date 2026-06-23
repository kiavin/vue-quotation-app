<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { 
  Activity,
  BarChart3,
  Building2,
  CreditCard,
  Flag,
  Globe,
  LayoutDashboard, 
  LogOut,
  Menu,
  Server,
  Settings,
  Shield,
  Users, 
  ChevronLeft,
  ChevronRight,
  LifeBuoy
} from 'lucide-vue-next'
import { cn } from '@/utils/utils'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const isDesktopCollapsed = ref(false)
const isMobileOpen = ref(false)
const isLoggingOut = ref(false)
// we don't have useMediaQuery here but we can approximate or use basic responsive classes. 
const isMobile = ref(window.innerWidth <= 1024)

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 1024
})

const isSidebarExpanded = computed(() => {
  if (isMobile.value) return isMobileOpen.value
  return !isDesktopCollapsed.value
})

const navigation = [
  { name: 'Platform Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Traffic & Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/admin/audit', icon: Activity },
  { name: 'System Health', href: '/admin/health', icon: Server },
  { name: 'Feature Flags', href: '/admin/flags', icon: Flag },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
  { name: 'Support Tools', href: '/admin/support', icon: LifeBuoy },
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
  <!-- Admin panel is distinctly dark-themed for the sidebar to differentiate from org dashboard -->
  <div class="flex h-screen bg-slate-50 relative overflow-hidden">
    <!-- Mobile Overlay -->
    <div 
      v-if="isMobile && isMobileOpen" 
      class="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
      @click="isMobileOpen = false"
    ></div>

    <!-- Sidebar (Dark theme for Admin) -->
    <aside
      :class="cn(
        'fixed inset-y-0 left-0 z-50 transform bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out lg:relative',
        isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
        !isMobile && isDesktopCollapsed ? 'w-20' : 'w-64'
      )"
    >
      <div class="flex flex-col h-full text-slate-300">
        <!-- Logo Area -->
        <div class="flex items-center h-16 px-4 lg:px-6 border-b border-slate-800 justify-between">
          <div class="flex items-center gap-2 overflow-hidden">
            <div class="w-8 h-8 flex-shrink-0 rounded-md bg-indigo-600 flex items-center justify-center">
              <Shield class="w-4 h-4 text-white" />
            </div>
            <span v-if="isSidebarExpanded" class="font-bold text-xl tracking-tight text-white whitespace-nowrap">Admin <span class="text-[10px] font-normal opacity-50 ml-1 text-indigo-400">CQIS</span></span>
          </div>
          <Button 
            v-if="!isMobile" 
            variant="ghost" 
            size="icon" 
            class="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 ml-2 flex-shrink-0"
            @click="toggleDesktopCollapse"
          >
            <ChevronRight v-if="isDesktopCollapsed" class="w-4 h-4" />
            <ChevronLeft v-else class="w-4 h-4" />
          </Button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :title="!isSidebarExpanded ? item.name : undefined"
            :class="cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
              route.path === item.href || (item.href !== '/admin' && route.path.startsWith(item.href))
                ? 'bg-indigo-600/10 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
              !isSidebarExpanded && 'justify-center px-0'
            )"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span v-if="isSidebarExpanded" class="truncate">{{ item.name }}</span>
          </router-link>
        </nav>

        <!-- User Profile Area -->
        <div class="p-4 border-t border-slate-800 space-y-2 overflow-hidden">
          <div class="flex items-center gap-3" :class="!isSidebarExpanded && 'justify-center'">
            <div class="w-8 h-8 flex-shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs uppercase border border-slate-700">
              {{ authStore.user?.email?.charAt(0) || 'A' }}
            </div>
            <div v-if="isSidebarExpanded" class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">
                {{ authStore.user?.email?.split('@')[0] }}
              </p>
              <p class="text-xs text-slate-500 truncate">Super Admin</p>
            </div>
          </div>
          <Button 
            v-if="isSidebarExpanded" 
            variant="ghost" 
            size="sm" 
            class="w-full justify-start gap-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
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
            class="w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10"
            @click="handleLogout"
            :disabled="isLoggingOut"
          >
            <LogOut class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
      <!-- Topbar -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" class="lg:hidden text-slate-600" @click="toggleMobileMenu">
            <Menu class="w-5 h-5" />
          </Button>
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <Globe class="w-4 h-4" />
            <span class="font-medium">CQIS Platform Administration</span>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Active Impersonation Warning -->
          <div v-if="authStore.isImpersonating" class="hidden sm:flex items-center gap-2 bg-amber-100 text-amber-800 pl-3 pr-1 py-1 rounded-full text-xs font-semibold">
            <Shield class="w-3 h-3" />
            <span>Impersonating Org: {{ authStore.impersonatedOrganizationId?.substring(0, 8) }}...</span>
            <Button variant="ghost" size="sm" class="h-6 px-2 ml-2 text-amber-900 hover:bg-amber-200 rounded-full" @click="authStore.stopImpersonating()">
              Stop
            </Button>
          </div>
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>
