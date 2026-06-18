<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Utensils, ArrowLeft, Home } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-[#F8F7F4] dark:bg-[#121212] flex items-center justify-center px-6 relative overflow-hidden font-body text-[#1B1B1B] dark:text-[#F8F7F4]">
    <!-- Ambient background elements -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[10%] left-[20%] w-72 h-72 rounded-full bg-gradient-to-br from-[#E8D8C4]/40 to-transparent blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-drift"></div>
      <div class="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-gradient-to-tr from-[#C57B57]/10 to-transparent blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-drift-slow"></div>
    </div>

    <div class="max-w-xl w-full text-center relative z-10">
      <div class="relative w-32 h-32 mx-auto mb-8 animate-float">
        <!-- Decorative circle -->
        <div class="absolute inset-0 rounded-full border border-dashed border-[#C57B57]/50 animate-spin-slow"></div>
        <!-- Icon -->
        <div class="absolute inset-0 m-2 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-[#E8D8C4] dark:border-gray-700">
          <Utensils class="w-12 h-12 text-[#C57B57] transform -rotate-12" />
        </div>
        <!-- 404 Badge -->
        <div class="absolute -bottom-2 -right-2 bg-[#2D5A4B] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transform rotate-12 font-heading tracking-wider">
          ERROR 404
        </div>
      </div>

      <h1 class="font-heading text-5xl md:text-7xl font-bold mb-4">
        Recipe <span class="text-[#C57B57] italic">Not Found</span>.
      </h1>
      
      <p class="text-lg text-[#6B7280] dark:text-gray-400 mb-10 leading-relaxed">
        Oops! It looks like we're missing the ingredients for the page you requested. It might have been moved, renamed, or perhaps it was never on the menu.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          @click="router.back()" 
          class="w-full sm:w-auto bg-white dark:bg-gray-800 border border-[#E8D8C4] dark:border-gray-700 text-[#1B1B1B] dark:text-white hover:bg-[#F8F7F4] dark:hover:bg-gray-700 px-8 py-3.5 rounded-md text-base font-medium transition-all shadow-sm flex items-center justify-center gap-2 group"
        >
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Go Back
        </button>
        <button 
          @click="router.push('/')" 
          class="w-full sm:w-auto bg-[#2D5A4B] hover:bg-[#224438] text-white px-8 py-3.5 rounded-md text-base font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Home class="w-4 h-4" />
          Return Home
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

.font-heading {
  font-family: 'Playfair Display', serif;
}

.font-body {
  font-family: 'Inter', sans-serif;
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

@keyframes drift {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
}

.animate-float { animation: float 6s ease-in-out infinite; }
.animate-drift { animation: drift 20s infinite alternate ease-in-out; }
.animate-drift-slow { animation: drift 25s infinite alternate-reverse ease-in-out; }
.animate-spin-slow { animation: spin 10s linear infinite; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>