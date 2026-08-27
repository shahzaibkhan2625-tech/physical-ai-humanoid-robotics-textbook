/**
 * The "Login" control shown in the top-right corner of every page.
 *
 * Logged out, it opens a modal with an email/password form that toggles
 * between sign up and log in. Logged in, it shows the reader's email and a
 * Logout button. All state lives in AuthContext; this file is presentation
 * only, same split as ChatWidget/index.tsx and ChatContext.
 */

import React, {useState} from 'react';

import {useAuth} from './AuthContext';
import styles from './styles.module.css';

type Mode = 'login' | 'signup';

function AuthModal({onClose}: {onClose: () => void}): React.ReactElement {
  const {login, signup, pending, error, clearError} = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    try {
      if (mode === 'signup') {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch {
      // Failure is already surfaced via AuthContext's `error`; keep the
      // modal open so the reader can fix and retry.
    }
  }

  function toggleMode(): void {
    clearError();
    setMode((current) => (current === 'login' ? 'signup' : 'login'));
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <form
        className={styles.modal}
        role="dialog"
        aria-label={mode === 'login' ? 'Log in' : 'Sign up'}
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <h2 className={styles.modalTitle}>{mode === 'login' ? 'Log in' : 'Sign up'}</h2>

        <label className={styles.label} htmlFor="auth-email">
          Email
        </label>
        <input
          id="auth-email"
          className={styles.input}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label className={styles.label} htmlFor="auth-password">
          Password
        </label>
        <input
          id="auth-password"
          className={styles.input}
          type="password"
          required
          minLength={8}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className={styles.submit}
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <button type="button" className={styles.toggleMode} onClick={toggleMode}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  );
}

export default function AuthButton(): React.ReactElement {
  const {email, logout} = useAuth();
  const [open, setOpen] = useState(false);

  if (email) {
    return (
      <div className={styles.container}>
        <span className={styles.email}>{email}</span>
        <button type="button" className={styles.button} onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button type="button" className={styles.button} onClick={() => setOpen(true)}>
        Login
      </button>
      {open && <AuthModal onClose={() => setOpen(false)} />}
    </div>
  );
}
