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

  // Platform Admin State
  const platformRoles = ref<string[]>([]);
  const impersonatedOrganizationId = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const organizationId = computed(() => impersonatedOrganizationId.value || profile.value?.organization_id);

  const isPlatformAdmin = computed(() => {
    return platformRoles.value.includes('super_admin') || platformRoles.value.includes('support_admin');
  });

  const isImpersonating = computed(() => !!impersonatedOrganizationId.value);

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
    
    // We explicitly wrap the Supabase DB calls in a 1ms timeout.
    // This forcibly pushes the execution out of the current microtask queue.
    // When Supabase fires INITIAL_SESSION, it may still hold internal GoTrue locks
    // that cause implicit getSession() calls (made by supabase.from) to deadlock.
    await new Promise(resolve => setTimeout(resolve, 1));
    
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

      // If we are impersonating, we don't fetch the default org, we fetch the impersonated one
      const activeOrgId = impersonatedOrganizationId.value || profileData.organization_id;

      if (activeOrgId) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', activeOrgId)
          .maybeSingle();

        if (!orgError) {
          organization.value = orgData;
        }
      }
    }

    // Check Platform Admin Role
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
    if (isSuperAdmin) {
      platformRoles.value = ['super_admin'];
    } else {
      platformRoles.value = [];
    }
  }

  async function startImpersonating(orgId: string) {
    if (!isPlatformAdmin.value) return;
    impersonatedOrganizationId.value = orgId;
    await fetchProfileAndOrganization();
  }

  async function stopImpersonating() {
    impersonatedOrganizationId.value = null;
    await fetchProfileAndOrganization();
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
    isPlatformAdmin,
    isImpersonating,
    impersonatedOrganizationId,
    setUser,
    setSession,
    fetchProfileAndOrganization,
    startImpersonating,
    stopImpersonating,
    setLoading,
  };
});
