import { FunctionsHttpError } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { invoke, setSession, getSession } = vi.hoisted(() => ({
  invoke: vi.fn(),
  setSession: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('../supabase/client', () => ({
  supabase: {
    functions: { invoke },
    auth: { setSession, getSession },
  },
}));

import { getSession as getCurrentSession, signInWithPasscode } from './session';

describe('signInWithPasscode', () => {
  beforeEach(() => {
    invoke.mockReset();
    setSession.mockReset();
  });

  it('sets the session when the Edge Function returns tokens', async () => {
    invoke.mockResolvedValue({
      data: { access_token: 'a', refresh_token: 'r' },
      error: null,
    });
    setSession.mockResolvedValue({ error: null });

    await signInWithPasscode('correct-horse');

    expect(invoke).toHaveBeenCalledWith('verify-passcode', { body: { passcode: 'correct-horse' } });
    expect(setSession).toHaveBeenCalledWith({ access_token: 'a', refresh_token: 'r' });
  });

  it('throws with the Edge Function body message when the passcode is rejected', async () => {
    const error = new FunctionsHttpError({
      json: async () => ({ error: 'Incorrect passcode' }),
    });
    invoke.mockResolvedValue({ data: null, error });

    await expect(signInWithPasscode('wrong')).rejects.toThrow('Incorrect passcode');
    expect(setSession).not.toHaveBeenCalled();
  });
});

describe('getCurrentSession', () => {
  it('returns null when there is no session', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await expect(getCurrentSession()).resolves.toBeNull();
  });
});
