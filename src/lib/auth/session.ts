import { supabase } from '../supabase/client';
import type { Session } from '@supabase/supabase-js';

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithPasscode(passcode: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke<{
    access_token: string;
    refresh_token: string;
  }>('verify-passcode', { body: { passcode } });

  if (error) {
    throw error instanceof Error ? error : new Error(error.message ?? 'Sign-in failed');
  }
  if (!data) {
    throw new Error('Incorrect passcode');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
  if (sessionError) throw sessionError;
}
