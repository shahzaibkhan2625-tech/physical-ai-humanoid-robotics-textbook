/**
 * Thin client for the textbook's Urdu translation endpoint (POST /translate).
 *
 * Mirrors ChatWidget/api.ts's error-shape handling so a translation failure is
 * shown to the reader by cause, not collapsed into "something broke".
 */

/** Above the backend's own translation timeout (300s), so its message wins. */
const REQUEST_TIMEOUT_MS = 305_000;

export type TranslateResponse = {
  translated_text: string;
  chapter_id: string;
  cached: boolean;
};

/** An error the reader can be shown, carrying the backend's own cause code. */
export class TranslateApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'TranslateApiError';
    this.code = code;
  }
}

/** Pull {error, message} out of a FastAPI error body, whatever shape it arrived in. */
function readError(status: number, body: unknown): TranslateApiError {
  const detail = (body as {detail?: unknown} | null)?.detail;

  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const {error, message} = detail as {error?: string; message?: string};
    if (message) {
      return new TranslateApiError(error ?? 'error', message);
    }
  }

  // Pydantic validation failures arrive as a list of issues, not our shape.
  if (Array.isArray(detail)) {
    return new TranslateApiError('bad_request', 'That request was not valid.');
  }

  return new TranslateApiError(
    'error',
    `The translator returned an unexpected error (HTTP ${status}).`,
  );
}

/** Translate a chapter to Urdu. Rejects with a TranslateApiError the caller can render. */
export async function translateToUrdu(
  baseUrl: string,
  text: string,
  chapterId: string,
): Promise<TranslateResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, '')}/translate`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text, chapter_id: chapterId}),
      signal: controller.signal,
    });
  } catch (cause) {
    if (controller.signal.aborted) {
      throw new TranslateApiError('timeout', 'That took too long. Please try again.');
    }
    throw new TranslateApiError(
      'unreachable',
      'Cannot reach the translator right now. Please try again shortly.',
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw readError(response.status, await response.json().catch(() => null));
  }

  return (await response.json()) as TranslateResponse;
}
