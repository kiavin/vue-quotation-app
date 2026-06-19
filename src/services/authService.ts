import { supabase, mapSupabaseError } from '@/lib/supabase';
import { apiSuccess, apiError } from '@/types/api-response';
import type { ApiResponse } from '@/types/api-response';
import type { AuthResponse, SignInWithPasswordCredentials } from '@supabase/supabase-js';

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInWithPasswordCredentials): Promise<ApiResponse<AuthResponse['data']>> {
    try {
      const response = await supabase.auth.signInWithPassword(credentials);
      if (response.error) throw response.error;
      
      return apiSuccess(response.data, {
        type: 'toast',
        title: 'Welcome Back!',
        message: 'You have signed in successfully.',
      });
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        type: 'toast',
        title: 'Sign In Failed',
        message: mapSupabaseError(error),
      });
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return apiSuccess(true, {
        type: 'toast',
        title: 'Signed Out',
        message: 'You have been signed out.',
      });
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        title: 'Sign Out Failed',
        message: 'Could not sign you out. Please try again.',
      });
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Session error:', error);
      return null;
    }
  },

  /**
   * Listen to auth changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
