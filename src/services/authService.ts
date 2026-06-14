import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { AuthResponse, AuthError, SignInWithPasswordCredentials } from '@supabase/supabase-js';

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInWithPasswordCredentials): Promise<AuthResponse> {
    try {
      const response = await supabase.auth.signInWithPassword(credentials);
      if (response.error) throw response.error;
      
      return response;
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleSupabaseError(error);
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
      return handleSupabaseError(error);
    }
  },

  /**
   * Listen to auth changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
