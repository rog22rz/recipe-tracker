import { FunctionsHttpError, type Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

async function describeError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body: unknown = await error.context.json();
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        return body.error;
      }
    } catch {
      // Response body wasn't JSON; fall through to the generic message below.
    }
  }
  return error instanceof Error ? error.message : 'Sign-in failed';
}

export async function signInWithPasscode(passcode: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke<{
    access_token: string;
    refresh_token: string;
  }>('verify-passcode', { body: { passcode } });

  if (error) {
    throw new Error(await describeError(error));
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
