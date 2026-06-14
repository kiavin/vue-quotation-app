import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Typed Supabase Client
 * 
 * TODO: In the future, we can generate database types using the Supabase CLI:
 * npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
 * And then pass it to createClient<Database>(...)
 */
export const supabase = createClient(
  env.SUPABASE_URL || '',
  env.SUPABASE_ANON_KEY || ''
);

/**
 * Standard error handling for Supabase operations
 */
export const handleSupabaseError = (error: any): never => {
  console.error('Supabase Error:', error);
  throw new Error(error.message || 'An unexpected database error occurred');
};
