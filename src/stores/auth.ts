import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const profile = ref<any>(null);
  const organization = ref<any>(null);
  const loading = ref(true);

  const isAuthenticated = computed(() => !!user.value);
  const organizationId = computed(() => profile.value?.organization_id);

  function setUser(newUser: User | null) {
    user.value = newUser;
  }

  async function setSession(newSession: Session | null) {
    session.value = newSession;
    user.value = newSession?.user ?? null;
    
    if (newSession?.user) {
      await fetchProfileAndOrganization();
    } else {
      profile.value = null;
      organization.value = null;
    }
  }

  async function fetchProfileAndOrganization() {
    if (!user.value) return;

    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .maybeSingle();
    
    // Handle missing profile for OAuth sign-ins (if database trigger hasn't fired yet)
    if (!profileData && !profileError) {
      console.warn("Profile not found. Attempting to create a default profile.");
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.value.id,
          email: user.value.email,
          full_name: user.value.user_metadata?.full_name || user.value.user_metadata?.name || user.value.email?.split('@')[0] || 'User',
          first_name: user.value.user_metadata?.first_name || '',
          last_name: user.value.user_metadata?.last_name || '',
          username: user.value.user_metadata?.username || user.value.email?.split('@')[0] || ''
        })
        .select()
        .maybeSingle();
        
      if (newProfile) profileData = newProfile;
    }

    if (!profileError && profileData) {
      profile.value = profileData;
      
      if (profileData.organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .maybeSingle();
          
        if (!orgError) {
          organization.value = orgData;
        }
      }
    }
  }

  function setLoading(val: boolean) {
    loading.value = val;
  }

  return {
    user,
    session,
    profile,
    organization,
    organizationId,
    loading,
    isAuthenticated,
    setUser,
    setSession,
    fetchProfileAndOrganization,
    setLoading,
  };
});
