import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Typed Supabase Client
 * 
 * TODO: In the future, we can generate database types using the Supabase CLI:
 * npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
 * And then pass it to createClient<Database>(...)
 */
const supabaseUrl = env.SUPABASE_URL || '';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || '';

// In development, Vite HMR can re-execute this file, creating multiple GoTrueClient instances
// which contend for local storage locks and cause getSession() to hang.
// We use globalThis to cache the instance to ensure a true singleton.
declare global {
  var __supabaseInstance: ReturnType<typeof createClient> | undefined;
}

export const supabase = globalThis.__supabaseInstance || createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'cqis-auth-token', // Unique key to prevent overlap with other local projects
    }
  }
);

if (import.meta.env.DEV) {
  globalThis.__supabaseInstance = supabase;
}

/**
 * Map common Supabase / PostgreSQL error codes to user-friendly messages.
 * Used by services to build meaningful alertify payloads.
 */
export function mapSupabaseError(error: any): string {
  // PostgreSQL error codes
  if (error?.code) {
    switch (error.code) {
      case '23505':
        return 'This record already exists. Please check for duplicates.'
      case '23503':
        return 'This record is referenced by other data and cannot be modified.'
      case '23502':
        return 'A required field is missing. Please fill in all required fields.'
      case '42501':
        return 'You don\'t have permission to perform this action.'
      case '42P01':
        return 'A system error occurred. Please contact support.'
      case 'PGRST116':
        return 'The requested record was not found.'
      case 'PGRST301':
        return 'You don\'t have permission to access this resource.'
      default:
        break
    }
  }

  // Supabase Auth errors
  if (error?.message) {
    const msg = error.message.toLowerCase()
    if (msg.includes('invalid login credentials'))
      return 'Invalid email or password. Please try again.'
    if (msg.includes('email not confirmed'))
      return 'Please check your email and confirm your account first.'
    if (msg.includes('user already registered'))
      return 'An account with this email already exists.'
    if (msg.includes('jwt expired') || msg.includes('token expired'))
      return 'Your session has expired. Please sign in again.'
    if (msg.includes('network') || msg.includes('fetch'))
      return 'Connection lost. Please check your internet and try again.'
  }

  // Fallback
  return error?.message || 'An unexpected error occurred. Please try again.'
}

/**
 * @deprecated Use `apiError()` with `mapSupabaseError()` instead.
 * Kept temporarily for backward compatibility during migration.
 */
export const handleSupabaseError = (error: any): never => {
  console.error('Supabase Error:', error);
  throw new Error(error.message || 'An unexpected database error occurred');
};
