import { supabase, mapSupabaseError } from '@/lib/supabase';
import { apiSuccess, apiError } from '@/types/api-response';
import type { ApiResponse } from '@/types/api-response';
import type { AuthResponse, SignInWithPasswordCredentials, Session } from '@supabase/supabase-js';

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

  async getSession(retried = false): Promise<Session | null> {
    const SESSION_TIMEOUT_MS = 8000;
    try {
      const result = await Promise.race([
        supabase.auth.getSession().then(({ data, error }) => {
          if (error) throw error;
          return data.session;
        }),
        new Promise<'TIMEOUT'>((resolve) => setTimeout(() => resolve('TIMEOUT'), SESSION_TIMEOUT_MS)),
      ]);

      if (result === 'TIMEOUT') {
        if (!retried) {
          // one retry — often clears a transient lock/network stall
          return this.getSession(true);
        }
        throw new Error('Session verification timed out after retry');
      }
      return result;
    } catch (error) {
      return null; // here, null genuinely means "couldn't determine" — caller should NOT treat this as definitive logout
    }
  },

  /**
   * Listen to auth changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
