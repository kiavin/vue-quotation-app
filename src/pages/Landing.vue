<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Check, 
  CheckCircle, 
  Clock, 
  FileText, 
  LayoutDashboard, 
  Lock, 
  Mail, 
  Send, 
  Utensils, 
  XCircle 
} from 'lucide-vue-next'

const router = useRouter()
const isScrolled = ref(false)

// Intersection Observer for scroll reveal animations
let observer: IntersectionObserver | null = null

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

  document.querySelectorAll('.reveal').forEach((el) => {
    observer?.observe(el)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  observer?.disconnect()
})
</script>

<template>
  <div class="min-h-screen bg-[#F8F7F4] text-[#1B1B1B] font-body dark:bg-[#121212] dark:text-[#F8F7F4] selection:bg-[#C57B57] selection:text-white transition-colors duration-300 overflow-x-hidden">
    
    <!-- Navigation -->
    <nav 
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent px-6 py-4 lg:px-12',
        isScrolled ? 'bg-[#F8F7F4]/80 dark:bg-[#121212]/80 backdrop-blur-md border-[#E8D8C4] dark:border-gray-800 shadow-sm py-3' : 'bg-transparent'
      ]"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/')">
          <div class="w-8 h-8 rounded bg-[#C57B57] flex items-center justify-center text-white font-heading font-bold text-xl">
            C
          </div>
          <span class="font-heading font-bold text-2xl tracking-tight text-[#2D5A4B] dark:text-[#E8D8C4]">CQIS</span>
        </div>
        
        <div class="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B7280] dark:text-gray-400">
          <a href="#features" class="hover:text-[#C57B57] transition-colors">Features</a>
          <a href="#how-it-works" class="hover:text-[#C57B57] transition-colors">How It Works</a>
          <a href="#testimonials" class="hover:text-[#C57B57] transition-colors">Testimonials</a>
          <a href="#pricing" class="hover:text-[#C57B57] transition-colors">Pricing</a>
          <a href="#contact" class="hover:text-[#C57B57] transition-colors">Contact</a>
        </div>

        <div class="flex items-center gap-4">
          <button 
            @click="router.push('/auth/login')" 
            class="hidden md:block text-sm font-medium text-[#1B1B1B] dark:text-[#F8F7F4] hover:text-[#C57B57] transition-colors"
          >
            Sign In
          </button>
          <button 
            @click="router.push('/onboarding')" 
            class="bg-[#C57B57] hover:bg-[#b06a48] text-white px-5 py-2.5 rounded-md text-sm font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
      
      <!-- Ambient Background -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div class="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#E8D8C4]/40 to-transparent opacity-60 blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-drift"></div>
        <div class="absolute top-[40%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#C57B57]/10 to-transparent opacity-50 blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-drift-slow"></div>
      </div>

      <!-- Left Content -->
      <div class="lg:w-1/2 flex flex-col items-start text-left z-10 reveal">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8D8C4]/50 dark:bg-[#E8D8C4]/10 text-[#2D5A4B] dark:text-[#E8D8C4] text-xs font-semibold tracking-wide uppercase mb-6 border border-[#E8D8C4] dark:border-gray-700">
          <span class="w-2 h-2 rounded-full bg-[#C57B57] animate-pulse"></span>
          Built for Hospitality
        </div>
        <h1 class="font-heading text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-[#1B1B1B] dark:text-[#F8F7F4]">
          From Event Inquiry to <span class="text-[#C57B57] italic">Professional Quote</span> in Minutes.
        </h1>
        <p class="text-lg text-[#6B7280] dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
          Create stunning catering quotations, generate PDFs instantly, and send invoices to clients without drowning in spreadsheets and Word documents.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full sm:w-auto">
          <button @click="router.push('/onboarding')" class="w-full sm:w-auto bg-[#2D5A4B] hover:bg-[#224438] text-white px-8 py-3.5 rounded-md text-base font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
            Get Started
            <Send class="w-4 h-4" />
          </button>
          <button class="w-full sm:w-auto bg-transparent border border-[#2D5A4B] dark:border-[#E8D8C4] text-[#2D5A4B] dark:text-[#E8D8C4] hover:bg-[#2D5A4B]/5 px-8 py-3.5 rounded-md text-base font-medium transition-all flex items-center justify-center gap-2">
            Watch Demo
          </button>
        </div>

        <div class="flex items-center gap-6 text-sm text-[#6B7280] font-medium dark:text-gray-400">
          <div class="flex items-center gap-1.5"><Check class="w-4 h-4 text-[#C57B57]" /> Wedding Caterers</div>
          <div class="flex items-center gap-1.5"><Check class="w-4 h-4 text-[#C57B57]" /> Corporate Events</div>
          <div class="flex items-center gap-1.5"><Check class="w-4 h-4 text-[#C57B57]" /> Private Chefs</div>
        </div>
      </div>

      <!-- Right Illustration -->
      <div class="lg:w-1/2 relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto h-[400px] lg:h-[600px] z-10 flex items-center justify-center perspective-1000">
        <!-- Main Quote Card -->
        <div class="relative w-72 md:w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/40 dark:border-gray-700 p-6 rounded-2xl shadow-2xl animate-float z-20">
          <div class="flex justify-between items-start mb-6">
            <div>
              <p class="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Quotation</p>
              <p class="font-heading font-bold text-xl text-[#1B1B1B] dark:text-white">Wedding Reception</p>
              <p class="text-sm text-[#C57B57] font-medium">120 Guests</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-[#F8F7F4] dark:bg-gray-800 flex items-center justify-center text-[#2D5A4B]">
              <Utensils class="w-5 h-5" />
            </div>
          </div>
          
          <div class="space-y-3 mb-6">
            <p class="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Menu</p>
            <div class="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
              <span class="text-[#1B1B1B] dark:text-gray-200">• Grilled Chicken</span>
              <span class="text-[#6B7280]">x120</span>
            </div>
            <div class="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
              <span class="text-[#1B1B1B] dark:text-gray-200">• Pilau Rice</span>
              <span class="text-[#6B7280]">x120</span>
            </div>
            <div class="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
              <span class="text-[#1B1B1B] dark:text-gray-200">• Fresh Juice & Dessert</span>
              <span class="text-[#6B7280]">x120</span>
            </div>
          </div>
          
          <div class="flex justify-between items-end pt-2">
            <div>
              <p class="text-xs text-[#6B7280] uppercase mb-1">Total</p>
              <p class="font-heading font-bold text-2xl text-[#2D5A4B] dark:text-[#E8D8C4]">KES 145,000</p>
            </div>
            <span class="px-3 py-1 bg-[#2D5A4B]/10 text-[#2D5A4B] dark:bg-[#E8D8C4]/10 dark:text-[#E8D8C4] rounded-full text-xs font-medium">Ready to Send</span>
          </div>
        </div>

        <!-- Floating Elements -->
        <div class="absolute top-[10%] right-[10%] w-32 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 dark:border-gray-700 animate-float-delayed flex items-center gap-3 z-30 transform rotate-3">
          <div class="w-8 h-8 rounded bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center">
            <FileText class="w-4 h-4" />
          </div>
          <span class="text-xs font-semibold text-[#1B1B1B] dark:text-white">PDF Generated</span>
        </div>

        <div class="absolute bottom-[20%] right-[5%] w-36 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 dark:border-gray-700 animate-float flex items-center gap-3 z-30 transform -rotate-2" style="animation-delay: 1.5s;">
          <div class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
            <Mail class="w-4 h-4" />
          </div>
          <span class="text-xs font-semibold text-[#1B1B1B] dark:text-white">Email Sent</span>
        </div>

        <div class="absolute bottom-[10%] left-[5%] w-32 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 dark:border-gray-700 animate-float-slow flex items-center gap-3 z-10 transform rotate-6" style="animation-delay: 0.5s;">
          <div class="w-8 h-8 rounded bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
            <CheckCircle class="w-4 h-4" />
          </div>
          <span class="text-xs font-semibold text-[#1B1B1B] dark:text-white">Invoice Paid</span>
        </div>
      </div>
    </header>

    <!-- The Problem Section -->
    <section id="problem" class="py-24 bg-white dark:bg-[#1A1A1A]">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        
        <!-- Abstract Messy Desk -->
        <div class="relative h-[400px] w-full rounded-2xl bg-[#F8F7F4] dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 reveal p-8">
          <div class="absolute top-10 left-10 w-48 h-64 bg-white dark:bg-gray-800 shadow-md transform -rotate-6 border border-gray-200 dark:border-gray-700 p-4">
            <div class="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div class="w-full h-2 bg-gray-100 dark:bg-gray-600 rounded mb-2"></div>
            <div class="w-3/4 h-2 bg-gray-100 dark:bg-gray-600 rounded mb-2"></div>
            <div class="w-full h-2 bg-gray-100 dark:bg-gray-600 rounded mb-2"></div>
          </div>
          
          <div class="absolute bottom-12 right-12 w-40 h-56 bg-white dark:bg-gray-800 shadow-lg transform rotate-3 border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between">
            <div>
              <div class="w-1/3 h-4 bg-[#C57B57]/20 rounded mb-4"></div>
              <div class="space-y-2">
                <div class="w-full h-6 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded"></div>
                <div class="w-full h-6 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded"></div>
                <div class="w-full h-6 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded"></div>
              </div>
            </div>
            <div class="w-full h-8 bg-[#2D5A4B]/10 rounded mt-4"></div>
          </div>

          <div class="absolute top-20 right-20 w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 shadow transform rotate-12 p-3">
            <div class="w-full h-1 bg-yellow-300 dark:bg-yellow-700 mb-1"></div>
            <div class="w-3/4 h-1 bg-yellow-300 dark:bg-yellow-700 mb-1"></div>
            <div class="w-5/6 h-1 bg-yellow-300 dark:bg-yellow-700"></div>
          </div>
          
          <div class="absolute inset-0 bg-gradient-to-t from-white/50 dark:from-[#1A1A1A]/80 to-transparent pointer-events-none"></div>
        </div>

        <!-- Text Content -->
        <div class="reveal">
          <h2 class="font-heading text-4xl lg:text-5xl font-bold mb-8 text-[#1B1B1B] dark:text-white leading-tight">
            Catering paperwork shouldn't feel like event planning chaos.
          </h2>
          <ul class="space-y-5">
            <li class="flex items-start gap-4">
              <XCircle class="w-6 h-6 text-[#C57B57] shrink-0 mt-0.5" />
              <span class="text-lg text-[#6B7280] dark:text-gray-300">Rebuilding quotations from scratch every time.</span>
            </li>
            <li class="flex items-start gap-4">
              <XCircle class="w-6 h-6 text-[#C57B57] shrink-0 mt-0.5" />
              <span class="text-lg text-[#6B7280] dark:text-gray-300">Struggling to format and export PDFs manually.</span>
            </li>
            <li class="flex items-start gap-4">
              <XCircle class="w-6 h-6 text-[#C57B57] shrink-0 mt-0.5" />
              <span class="text-lg text-[#6B7280] dark:text-gray-300">Copy-pasting the same emails repeatedly.</span>
            </li>
            <li class="flex items-start gap-4">
              <XCircle class="w-6 h-6 text-[#C57B57] shrink-0 mt-0.5" />
              <span class="text-lg text-[#6B7280] dark:text-gray-300">Losing track of which quotations were sent or approved.</span>
            </li>
            <li class="flex items-start gap-4">
              <XCircle class="w-6 h-6 text-[#C57B57] shrink-0 mt-0.5" />
              <span class="text-lg text-[#6B7280] dark:text-gray-300">Looking less professional than your competitors.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- How it Works Section -->
    <section id="how-it-works" class="py-24 bg-[#F8F7F4] dark:bg-[#121212] relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center max-w-2xl mx-auto mb-16 reveal">
          <h2 class="font-heading text-4xl font-bold mb-4 text-[#1B1B1B] dark:text-white">An Elegant Workflow</h2>
          <p class="text-[#6B7280] dark:text-gray-400 text-lg">Four simple steps from first contact to confirmed booking.</p>
        </div>

        <div class="relative grid md:grid-cols-4 gap-8 lg:gap-12 text-center">
          <!-- Connecting Line -->
          <div class="hidden md:block absolute top-12 left-1/8 right-1/8 h-[1px] bg-gradient-to-r from-transparent via-[#C57B57]/30 to-transparent -z-10"></div>

          <!-- Step 1 -->
          <div class="relative reveal delay-100 group">
            <div class="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#2D5A4B] dark:text-[#E8D8C4] transition-transform duration-500 group-hover:scale-110">
              <Utensils class="w-8 h-8" />
            </div>
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border border-dashed border-[#C57B57] animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 class="font-heading font-bold text-xl mb-2 text-[#1B1B1B] dark:text-white">1. Build Quote</h3>
            <p class="text-sm text-[#6B7280] dark:text-gray-400">Select items from your catalog to instantly build a quote.</p>
          </div>

          <!-- Step 2 -->
          <div class="relative reveal delay-200 group">
            <div class="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#2D5A4B] dark:text-[#E8D8C4] transition-transform duration-500 group-hover:scale-110">
              <FileText class="w-8 h-8" />
            </div>
            <h3 class="font-heading font-bold text-xl mb-2 text-[#1B1B1B] dark:text-white">2. Generate PDF</h3>
            <p class="text-sm text-[#6B7280] dark:text-gray-400">One click transforms the web quote into a branded PDF document.</p>
          </div>

          <!-- Step 3 -->
          <div class="relative reveal delay-300 group">
            <div class="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#2D5A4B] dark:text-[#E8D8C4] transition-transform duration-500 group-hover:-translate-y-2">
              <Send class="w-8 h-8" />
            </div>
            <h3 class="font-heading font-bold text-xl mb-2 text-[#1B1B1B] dark:text-white">3. Send to Client</h3>
            <p class="text-sm text-[#6B7280] dark:text-gray-400">Email directly from the platform with personalized templates.</p>
          </div>

          <!-- Step 4 -->
          <div class="relative reveal delay-400 group">
            <div class="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#2D5A4B] dark:text-[#E8D8C4] transition-transform duration-500 group-hover:scale-110">
              <CheckCircle class="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-green-500/10 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <h3 class="font-heading font-bold text-xl mb-2 text-[#1B1B1B] dark:text-white">4. Get Approved</h3>
            <p class="text-sm text-[#6B7280] dark:text-gray-400">Track status, receive approvals, and convert easily to invoices.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="py-24 bg-white dark:bg-[#1A1A1A]">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="mb-16 reveal">
          <h2 class="font-heading text-4xl font-bold mb-4 text-[#1B1B1B] dark:text-white">Crafted for Caterers</h2>
          <p class="text-[#6B7280] dark:text-gray-400 text-lg max-w-2xl">Every tool you need to run the administrative side of your catering business with grace and precision.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="group p-8 rounded-2xl bg-[#F8F7F4]/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-[#E8D8C4] dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 reveal">
            <div class="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#C57B57] group-hover:scale-110 transition-transform">
              <Utensils class="w-6 h-6" />
            </div>
            <h3 class="font-heading font-bold text-xl mb-3 text-[#1B1B1B] dark:text-white">Professional Quotations</h3>
            <p class="text-[#6B7280] dark:text-gray-400 leading-relaxed">Beautiful event quotations with structured pricing breakdowns that instill trust in your clients.</p>
          </div>

          <!-- Feature 2 -->
          <div class="group p-8 rounded-2xl bg-[#F8F7F4]/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-[#E8D8C4] dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 reveal delay-100">
            <div class="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#C57B57] group-hover:scale-110 transition-transform">
              <FileText class="w-6 h-6" />
            </div>
            <h3 class="font-heading font-bold text-xl mb-3 text-[#1B1B1B] dark:text-white">Instant PDF Generation</h3>
            <p class="text-[#6B7280] dark:text-gray-400 leading-relaxed">One click creates polished, historically accurate PDF documents with your branding embedded.</p>
          </div>

          <!-- Feature 3 -->
          <div class="group p-8 rounded-2xl bg-[#F8F7F4]/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-[#E8D8C4] dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 reveal delay-200">
            <div class="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#C57B57] group-hover:scale-110 transition-transform">
              <Mail class="w-6 h-6" />
            </div>
            <h3 class="font-heading font-bold text-xl mb-3 text-[#1B1B1B] dark:text-white">Email Integration</h3>
            <p class="text-[#6B7280] dark:text-gray-400 leading-relaxed">Send quotes directly from the platform. No more saving files to your desktop and attaching them manually.</p>
          </div>

          <!-- Feature 4 -->
          <div class="group p-8 rounded-2xl bg-[#F8F7F4]/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-[#E8D8C4] dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 reveal">
            <div class="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#C57B57] group-hover:scale-110 transition-transform">
              <Lock class="w-6 h-6" />
            </div>
            <h3 class="font-heading font-bold text-xl mb-3 text-[#1B1B1B] dark:text-white">Secure Cloud Storage</h3>
            <p class="text-[#6B7280] dark:text-gray-400 leading-relaxed">Your quotations, item catalog, and customer information remain protected and accessible anywhere.</p>
          </div>

          <!-- Feature 5 -->
          <div class="group p-8 rounded-2xl bg-[#F8F7F4]/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-[#E8D8C4] dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 reveal delay-100">
            <div class="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#C57B57] group-hover:scale-110 transition-transform">
              <LayoutDashboard class="w-6 h-6" />
            </div>
            <h3 class="font-heading font-bold text-xl mb-3 text-[#1B1B1B] dark:text-white">Modern Dashboard</h3>
            <p class="text-[#6B7280] dark:text-gray-400 leading-relaxed">A clean, intuitive interface designed to be simple and enjoyable to use, not overwhelming.</p>
          </div>

          <!-- Feature 6 -->
          <div class="group p-8 rounded-2xl bg-[#F8F7F4]/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-[#E8D8C4] dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 reveal delay-200">
            <div class="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#E8D8C4] dark:border-gray-700 flex items-center justify-center mb-6 text-[#C57B57] group-hover:scale-110 transition-transform">
              <Clock class="w-6 h-6" />
            </div>
            <h3 class="font-heading font-bold text-xl mb-3 text-[#1B1B1B] dark:text-white">Save Hours Weekly</h3>
            <p class="text-[#6B7280] dark:text-gray-400 leading-relaxed">Turn administrative hours into minutes, giving you more time to focus on delivering exceptional events.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Showcase / Storyline Section -->
    <section id="showcase" class="py-24 bg-[#E8D8C4]/20 dark:bg-[#121212] border-y border-[#E8D8C4]/50 dark:border-gray-800 overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-16 reveal">
        <h2 class="font-heading text-4xl font-bold mb-4 text-[#1B1B1B] dark:text-white">The Journey of a Booking</h2>
        <p class="text-[#6B7280] dark:text-gray-400 text-lg">Watch how seamlessly an inquiry turns into revenue.</p>
      </div>

      <div class="flex flex-col gap-6 max-w-4xl mx-auto px-6">
        <!-- Card 1 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-6 reveal w-full md:w-5/6 mr-auto">
          <div class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
            <Mail class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-bold text-[#1B1B1B] dark:text-white text-lg">1. Client Inquiry</h4>
            <p class="text-[#6B7280] dark:text-gray-400 text-sm">"Hi, we're looking for catering for our corporate retreat for 50 people next month."</p>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-6 reveal w-full md:w-5/6 ml-auto">
          <div class="w-12 h-12 rounded-full bg-[#C57B57]/10 text-[#C57B57] flex items-center justify-center shrink-0">
            <LayoutDashboard class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-bold text-[#1B1B1B] dark:text-white text-lg">2. Quotation Builder</h4>
            <p class="text-[#6B7280] dark:text-gray-400 text-sm">You quickly select "Premium Lunch Box" from your catalog, adjust quantities to 50, and hit save.</p>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-6 reveal w-full md:w-5/6 mr-auto">
          <div class="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center shrink-0">
            <FileText class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-bold text-[#1B1B1B] dark:text-white text-lg">3. PDF Generated</h4>
            <p class="text-[#6B7280] dark:text-gray-400 text-sm">A branded, beautifully formatted A4 PDF is generated instantly, complete with your logo and colors.</p>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-6 reveal w-full md:w-5/6 ml-auto">
          <div class="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center shrink-0">
            <Send class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-bold text-[#1B1B1B] dark:text-white text-lg">4. Sent Successfully</h4>
            <p class="text-[#6B7280] dark:text-gray-400 text-sm">The quotation is emailed directly to the client with a personalized message. The status updates to 'Sent'.</p>
          </div>
        </div>

        <!-- Card 5 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-green-200 dark:border-green-900 flex items-center gap-6 reveal w-full mx-auto relative overflow-hidden">
          <div class="absolute inset-0 bg-green-500/5 dark:bg-green-500/10 pointer-events-none"></div>
          <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-bold text-[#1B1B1B] dark:text-white text-lg">5. Invoice Paid</h4>
            <p class="text-[#6B7280] dark:text-gray-400 text-sm">The quote is approved, converted to an invoice in one click, and paid. Event confirmed.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="py-24 bg-white dark:bg-[#1A1A1A]">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center mb-16 reveal">
          <h2 class="font-heading text-4xl font-bold mb-4 text-[#1B1B1B] dark:text-white">Trusted by Hospitality Professionals</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div class="bg-[#F8F7F4] dark:bg-gray-900 p-10 rounded-3xl relative reveal">
            <div class="text-[#C57B57] font-heading text-6xl absolute top-6 left-6 opacity-20">"</div>
            <p class="text-lg text-[#1B1B1B] dark:text-gray-200 relative z-10 mb-8 italic font-heading">
              "Creating quotations used to take me nearly an hour. With CQIS, I prepare and send them before I even leave the venue."
            </p>
            <div class="flex items-center gap-4 relative z-10">
              <div class="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                SM
              </div>
              <div>
                <p class="font-bold text-[#1B1B1B] dark:text-white">Sarah M.</p>
                <p class="text-sm text-[#6B7280] dark:text-gray-400">Wedding Caterer</p>
              </div>
            </div>
          </div>

          <div class="bg-[#F8F7F4] dark:bg-gray-900 p-10 rounded-3xl relative reveal delay-100">
            <div class="text-[#C57B57] font-heading text-6xl absolute top-6 left-6 opacity-20">"</div>
            <p class="text-lg text-[#1B1B1B] dark:text-gray-200 relative z-10 mb-8 italic font-heading">
              "The PDFs look incredibly professional. Clients assume we invested in expensive enterprise software to generate these documents."
            </p>
            <div class="flex items-center gap-4 relative z-10">
              <div class="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                JK
              </div>
              <div>
                <p class="font-bold text-[#1B1B1B] dark:text-white">James K.</p>
                <p class="text-sm text-[#6B7280] dark:text-gray-400">Corporate Catering Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="py-24 bg-[#2D5A4B] text-white overflow-hidden relative">
      <!-- Decorative patterns -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-white/20"></div>
        <div class="absolute top-12 -left-12 w-64 h-64 rounded-full border border-white/20"></div>
      </div>
      
      <div class="max-w-4xl mx-auto px-6 text-center relative z-10 reveal">
        <h2 class="font-heading text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          Spend Less Time Making Quotations. <br>
          <span class="text-[#E8D8C4] italic">Spend More Time Creating Memorable Events.</span>
        </h2>
        <p class="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Join caterers who are turning inquiries into confirmed bookings faster and elevating their brand presentation.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button @click="router.push('/onboarding')" class="w-full sm:w-auto bg-[#C57B57] hover:bg-[#b06a48] text-white px-10 py-4 rounded-md text-base font-semibold transition-all shadow-xl transform hover:-translate-y-1">
            Get Started
          </button>
          <button class="w-full sm:w-auto bg-transparent border border-white/30 text-white hover:bg-white/10 px-10 py-4 rounded-md text-base font-semibold transition-all">
            Book a Demo
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-[#1B1B1B] text-white/70 py-16">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div class="text-center md:text-left">
          <div class="flex items-center gap-2 justify-center md:justify-start mb-4">
            <div class="w-6 h-6 rounded bg-[#C57B57] flex items-center justify-center text-white font-heading font-bold text-sm">
              C
            </div>
            <span class="font-heading font-bold text-xl tracking-tight text-white">CQIS</span>
          </div>
          <p class="text-sm max-w-xs">
            Professional Catering Quotations & Invoicing. Built for caterers, event planners, and hospitality professionals.
          </p>
        </div>
        
        <div class="flex flex-wrap justify-center gap-8 text-sm font-medium">
          <a href="#features" class="hover:text-white transition-colors">Features</a>
          <a href="#pricing" class="hover:text-white transition-colors">Pricing</a>
          <a href="#" class="hover:text-white transition-colors">Privacy</a>
          <a href="#" class="hover:text-white transition-colors">Terms</a>
          <a href="#" class="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-6 lg:px-12 mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/50">
        &copy; {{ new Date().getFullYear() }} CQIS. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<style>
/* Import Google Fonts for specific typography request */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

.font-heading {
  font-family: 'Playfair Display', serif;
}

.font-body {
  font-family: 'Inter', sans-serif;
}

/* Scroll Reveal Animations */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.delay-100 { transition-delay: 100ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-400 { transition-delay: 400ms; }

/* Floating Animations */
@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

@keyframes float-slow {
  0% { transform: translateY(0px) rotate(6deg); }
  50% { transform: translateY(-10px) rotate(4deg); }
  100% { transform: translateY(0px) rotate(6deg); }
}

@keyframes drift {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 7s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-drift {
  animation: drift 20s infinite alternate ease-in-out;
}

.animate-drift-slow {
  animation: drift 25s infinite alternate-reverse ease-in-out;
}

.animate-spin-slow {
  animation: spin 10s linear infinite;
}

@keyframes spin {
  from { transform: translateX(-50%) rotate(0deg); }
  to { transform: translateX(-50%) rotate(360deg); }
}

.perspective-1000 {
  perspective: 1000px;
}
</style>