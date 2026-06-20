<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <Transition name="global-loader">
    <div 
      v-if="uiStore.isAppLoading" 
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md"
      role="alert"
      aria-busy="true"
    >
      <div class="flex flex-col items-center max-w-md w-full px-6 text-center">
        <!-- Logo Animation -->
        <div class="relative mb-8">
          <!-- Pulse rings behind logo -->
          <div class="absolute inset-0 bg-primary/20 rounded-xl animate-ping"></div>
          <div class="absolute inset-0 bg-primary/10 rounded-xl animate-pulse" style="animation-duration: 2s;"></div>
          
          <!-- Logo Block -->
          <div class="relative w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg flex items-center justify-center transform transition-transform hover:scale-105">
            <span class="text-white font-bold text-3xl tracking-tighter">C</span>
          </div>
        </div>

        <!-- Text Animation -->
        <div class="h-8 overflow-hidden relative w-full flex justify-center items-center">
          <Transition name="slide-up" mode="out-in">
            <p 
              :key="uiStore.currentMessage" 
              class="text-slate-600 font-medium text-sm sm:text-base tracking-wide"
            >
              {{ uiStore.currentMessage }}
            </p>
          </Transition>
        </div>

        <!-- Loading Bar -->
        <div class="w-48 h-1 bg-slate-200 rounded-full mt-6 overflow-hidden">
          <div class="h-full bg-primary rounded-full animate-progress origin-left"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Main overlay fade */
.global-loader-enter-active,
.global-loader-leave-active {
  transition: opacity 0.5s ease, backdrop-filter 0.5s ease;
}

.global-loader-enter-from,
.global-loader-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Text slide animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Indeterminate Progress Bar */
@keyframes progress {
  0% {
    transform: translateX(-100%) scaleX(0.2);
  }
  50% {
    transform: translateX(0) scaleX(0.5);
  }
  100% {
    transform: translateX(100%) scaleX(0.2);
  }
}

.animate-progress {
  width: 100%;
  animation: progress 1.5s infinite linear;
}
</style>
