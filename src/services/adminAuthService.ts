import { supabase, assertSupabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export function isAdminSession(session: Session | null): boolean {
  return session?.user?.app_metadata?.['role'] === 'admin';
}

export async function getSession(): Promise<Session | null> {
  assertSupabase(supabase);
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  assertSupabase(supabase);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Email hoặc mật khẩu không đúng.' };
  return { error: null };
}

export async function signOut(): Promise<void> {
  assertSupabase(supabase);
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string): Promise<void> {
  assertSupabase(supabase);
  // Always silently succeed to avoid user enumeration
  try {
    await supabase.auth.resetPasswordForEmail(email);
  } catch {
    // intentionally silent
  }
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  assertSupabase(supabase);
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}
