import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const runtimeConfig = window.__APP_CONFIG__ ?? {};
const supabaseUrl =
  runtimeConfig.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  runtimeConfig.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// supabase is null when env vars are not configured.
// Public reads (published content) use the anon key.
// Admin writes require Supabase Auth session with app_metadata.role = 'admin'.
// Never expose service-role credentials to the frontend.
export const supabase: SupabaseClient<Database> | null =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

export function assertSupabase(
  client: SupabaseClient<Database> | null,
): asserts client is SupabaseClient<Database> {
  if (!client) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.',
    );
  }
}
