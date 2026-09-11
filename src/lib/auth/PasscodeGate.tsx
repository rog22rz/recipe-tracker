import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { supabase } from '../supabase/client';
import { getSession, signInWithPasscode } from './session';
import styles from './PasscodeGate.module.css';

export function PasscodeGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSession().then((session) => setAuthed(session !== null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(session !== null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  if (authed === null) return null;
  if (authed) return <>{children}</>;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signInWithPasscode(passcode);
    } catch (err) {
      if (err instanceof Error && err.message === 'Incorrect passcode') {
        setError('Incorrect passcode');
      } else {
        console.error('Passcode sign-in failed:', err);
        setError('Something went wrong — try again');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="passcode">
          Passcode
        </label>
        <input
          id="passcode"
          className={styles.input}
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          autoFocus
        />
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button className={styles.button} type="submit" disabled={submitting}>
          {submitting ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
