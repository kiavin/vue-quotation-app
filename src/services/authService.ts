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
   * Sign up with email, password and metadata
   */
  async signUp(credentials: { email: string; password: string; fname: string; lname: string; username: string }): Promise<ApiResponse<AuthResponse['data']>> {
    try {
      const { email, password, fname, lname, username } = credentials;
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: fname,
            last_name: lname,
            full_name: `${fname} ${lname}`,
            username: username
          }
        }
      });
      if (response.error) throw response.error;
      
      return apiSuccess(response.data, {
        type: 'toast',
        title: 'Account Created',
        message: 'Your account has been successfully created. You can now sign in.',
      });
    } catch (error) {
      return apiError(mapSupabaseError(error), {
        type: 'toast',
        title: 'Sign Up Failed',
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

  async getSession() {
    const SESSION_TIMEOUT_MS = 10000; // 10 seconds max wait

    try {
      const sessionPromise = (async () => {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw sessionError || new Error('No session');
        
        return sessionData.session;
      })();

      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Session verification timed out')), SESSION_TIMEOUT_MS);
      });

      return await Promise.race([sessionPromise, timeoutPromise]);
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
