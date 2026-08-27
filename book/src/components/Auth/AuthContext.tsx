/**
 * Auth state for the whole site.
 *
 * Mounted once by the swizzled Root (src/theme/Root.tsx), so it survives
 * client-side navigation between chapters. Like ChatContext's session id, the
 * token lives only in React state — nothing is written to localStorage or any
 * other browser storage, so a reload logs the reader out.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import {signup as signupRequest, login as loginRequest, AuthApiError} from './api';

type AuthContextValue = {
  token: string | null;
  email: string | null;
  pending: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
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

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (emailInput: string, password: string) => {
      setPending(true);
      setError(null);
      try {
        const result = await loginRequest(apiUrl, emailInput, password);
        setToken(result.access_token);
        setEmail(emailInput.trim().toLowerCase());
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
    async (emailInput: string, password: string) => {
      setPending(true);
      setError(null);
      try {
        await signupRequest(apiUrl, emailInput, password);
        // Signing up and then having to sign in again is friction the reader
        // does not need — go straight to a logged-in state.
        const result = await loginRequest(apiUrl, emailInput, password);
        setToken(result.access_token);
        setEmail(emailInput.trim().toLowerCase());
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
  }, []);

  const value = useMemo(
    () => ({token, email, pending, error, login, signup, logout, clearError}),
    [token, email, pending, error, login, signup, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
