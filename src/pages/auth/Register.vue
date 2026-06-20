<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { notify } from '@/lib/notify'

const router = useRouter()
const fname = ref('')
const lname = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleRegister = async () => {
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const result = await authService.signUp({
      fname: fname.value,
      lname: lname.value,
      username: username.value,
      email: email.value,
      password: password.value,
    })

    if (!result.ok) {
      errorMsg.value = result.error || 'An error occurred during registration'
      notify.handleResponse(result)
    } else {
      notify.handleResponse(result)
      // Send user to login page after successful registration
      await router.push({ name: 'login' })
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}

const loginWithGoogle = async () => {
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) throw error
  } catch (err: any) {
    errorMsg.value = err.message || 'An error occurred during Google login'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleRegister" class="space-y-4">
    <div class="mb-4 text-center">
      <h2 class="text-xl font-semibold text-slate-800">Create an account</h2>
      <p class="text-sm text-slate-500 mt-1">Get started with CQIS today.</p>
    </div>

    <div v-if="errorMsg" class="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md">
      {{ errorMsg }}
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label for="fname" class="text-sm font-medium leading-none">First Name</label>
        <input
          v-model="fname"
          type="text"
          placeholder="Jane"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          required
        />
      </div>
      <div class="space-y-2">
        <label for="lname" class="text-sm font-medium leading-none">Last Name</label>
        <input
          v-model="lname"
          type="text"
          placeholder="Doe"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          required
        />
      </div>
    </div>

    <div class="space-y-2">
      <label for="username" class="text-sm font-medium leading-none">Username</label>
      <input
        v-model="username"
        type="text"
        placeholder="janedoe"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        required
      />
    </div>

    <div class="space-y-2">
      <label for="email" class="text-sm font-medium leading-none">Email</label>
      <input
        v-model="email"
        type="email"
        placeholder="name@company.com"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        required
      />
    </div>

    <div class="space-y-2">
      <label for="password" class="text-sm font-medium leading-none">Password</label>
      <input
        v-model="password"
        type="password"
        placeholder="Create a password"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        required
        minlength="6"
      />
    </div>

    <Button type="submit" class="w-full" :disabled="isLoading">
      {{ isLoading ? 'Creating account...' : 'Create Account' }}
    </Button>
    
    <div class="text-center text-sm text-slate-500 mt-4">
      Already have an account? 
      <router-link to="/auth/login" class="text-primary hover:underline font-medium">Sign in</router-link>
    </div>

    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t"></span>
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-white px-2 text-slate-500">Or continue with</span>
      </div>
    </div>
    
    <Button variant="outline" type="button" class="w-full" :disabled="isLoading" @click="loginWithGoogle">
      <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        <path d="M1 1h22v22H1z" fill="none" />
      </svg>
      Google
    </Button>
  </form>
</template>
