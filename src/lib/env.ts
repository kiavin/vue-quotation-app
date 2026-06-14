/**
 * Environment variable validation and access
 */

export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Validation
Object.entries(env).forEach(([key, value]) => {
  if (!value || value === 'your-project-url' || value === 'your-anon-key') {
    console.warn(`Environment variable ${key} is not properly configured. Check your .env file.`);
  }
});

export type Env = typeof env;
