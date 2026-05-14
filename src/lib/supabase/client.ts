import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return !!(url && key && url !== 'your-project-url-here');
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a no-op stub during build/SSG when env vars are absent
    return null as never;
  }
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
