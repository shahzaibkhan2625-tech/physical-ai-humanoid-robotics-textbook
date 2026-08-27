/**
 * Thin client for the textbook's auth endpoints (POST /signup, POST /login).
 *
 * Mirrors ChatWidget/api.ts's error-shape handling, so a signup or login
 * failure is surfaced to the reader by cause rather than collapsed into
 * "something broke".
 */

const REQUEST_TIMEOUT_MS = 15_000;

export type SignupResponse = {
  message: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

/** An error the reader can be shown, carrying the backend's own cause code. */
export class AuthApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
  }
}

/** Pull {error, message} out of a FastAPI error body, whatever shape it arrived in. */
function readError(status: number, body: unknown): AuthApiError {
  const detail = (body as {detail?: unknown} | null)?.detail;

  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const {error, message} = detail as {error?: string; message?: string};
    if (message) {
      return new AuthApiError(error ?? 'error', message);
    }
  }

  // Pydantic validation failures arrive as a list of issues, not our shape.
  if (Array.isArray(detail)) {
    return new AuthApiError('bad_request', 'That request was not valid.');
  }

  return new AuthApiError(
    'error',
    `The server returned an unexpected error (HTTP ${status}).`,
  );
}

async function post<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, '')}${path}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (cause) {
    if (controller.signal.aborted) {
      throw new AuthApiError('timeout', 'That took too long. Please try again.');
    }
    throw new AuthApiError(
      'unreachable',
      'Cannot reach the server right now. Please try again shortly.',
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw readError(response.status, await response.json().catch(() => null));
  }

  return (await response.json()) as T;
}

export function signup(
  baseUrl: string,
  email: string,
  password: string,
): Promise<SignupResponse> {
  return post<SignupResponse>(baseUrl, '/signup', {email, password});
}

export function login(
  baseUrl: string,
  email: string,
  password: string,
): Promise<LoginResponse> {
  return post<LoginResponse>(baseUrl, '/login', {email, password});
}
