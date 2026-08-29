/**
 * Auth state for the whole site.
 *
 * Mounted once by the swizzled Root (src/theme/Root.tsx), so it survives
 * client-side navigation between chapters. The token and email are mirrored to
 * localStorage so a reload restores the logged-in state; Root mounts this
 * provider inside BrowserOnly, so there is no SSR/hydration pass to keep in
 * sync with.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import {
  signup as signupRequest,
  login as loginRequest,
  AuthApiError,
  type ExperienceLevel,
} from './api';

const STORAGE_KEY = 'textbook-auth';

type StoredAuth = {token: string; email: string};

/** The token's `exp` claim, read without verifying the signature — that is the
 * backend's job. This is only a local, best-effort check so an obviously dead
 * token does not sit in localStorage pretending to be a session. */
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const {exp} = JSON.parse(atob(padded)) as {exp?: number};
    return typeof exp === 'number' && Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const stored = JSON.parse(raw) as Partial<StoredAuth>;
    if (!stored.token || !stored.email || isTokenExpired(stored.token)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {token: stored.token, email: stored.email};
  } catch {
    // Corrupt JSON, or storage unavailable (e.g. private browsing) — treat as
    // logged out rather than crash.
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing more we can do.
    }
    return null;
  }
}

function writeStoredAuth(token: string, email: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({token, email}));
  } catch {
    // Storage full or unavailable — the session still works, it just won't
    // survive a reload.
  }
}

function clearStoredAuth(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing more we can do.
  }
}

type AuthContextValue = {
  token: string | null;
  email: string | null;
  pending: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, experienceLevel: ExperienceLevel) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return value;
}

/** Where the backend lives — see `customFields.chatApiUrl` in docusaurus.config.ts. */
function useApiUrl(): string {
  const {siteConfig} = useDocusaurusContext();
  return (siteConfig.customFields?.chatApiUrl as string) ?? 'http://localhost:8000';
}

export function AuthProvider({children}: {children: ReactNode}): ReactNode {
  const apiUrl = useApiUrl();

  // Read once per mount and share the result between both initializers below,
  // rather than hitting localStorage twice.
  const restored = useRef<StoredAuth | null | undefined>(undefined);
  if (restored.current === undefined) {
    restored.current = readStoredAuth();
  }

  const [token, setToken] = useState<string | null>(() => restored.current?.token ?? null);
  const [email, setEmail] = useState<string | null>(() => restored.current?.email ?? null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (emailInput: string, password: string) => {
      setPending(true);
      setError(null);
      try {
        const result = await loginRequest(apiUrl, emailInput, password);
        const normalizedEmail = emailInput.trim().toLowerCase();
        setToken(result.access_token);
        setEmail(normalizedEmail);
        writeStoredAuth(result.access_token, normalizedEmail);
      } catch (cause) {
        setError(
          cause instanceof AuthApiError
            ? cause.message
            : 'Could not log in. Please try again.',
        );
        throw cause;
      } finally {
        setPending(false);
      }
    },
    [apiUrl],
  );

  const signup = useCallback(
    async (emailInput: string, password: string, experienceLevel: ExperienceLevel) => {
      setPending(true);
      setError(null);
      try {
        await signupRequest(apiUrl, emailInput, password, experienceLevel);
        // Signing up and then having to sign in again is friction the reader
        // does not need — go straight to a logged-in state.
        const result = await loginRequest(apiUrl, emailInput, password);
        const normalizedEmail = emailInput.trim().toLowerCase();
        setToken(result.access_token);
        setEmail(normalizedEmail);
        writeStoredAuth(result.access_token, normalizedEmail);
      } catch (cause) {
        setError(
          cause instanceof AuthApiError
            ? cause.message
            : 'Could not sign up. Please try again.',
        );
        throw cause;
      } finally {
        setPending(false);
      }
    },
    [apiUrl],
  );

  const logout = useCallback(() => {
    setToken(null);
    setEmail(null);
    clearStoredAuth();
  }, []);

  const value = useMemo(
    () => ({token, email, pending, error, login, signup, logout, clearError}),
    [token, email, pending, error, login, signup, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
