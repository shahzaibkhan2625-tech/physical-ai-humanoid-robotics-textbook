/**
 * Thin client for the textbook's RAG chat service (spec 002-chatbot, FR-033/034).
 *
 * The service is the only source of answers, so every failure it can report is
 * surfaced to the reader by cause rather than collapsed into "something broke"
 * (FR-039). Nothing here retries on its own; the caller decides.
 */

/** Limits mirror the backend's, so an over-long input fails in the UI, not over the wire. */
export const MAX_QUESTION_CHARS = 2_000;
export const MAX_SELECTED_CHARS = 8_000;

/** Slightly above the backend's own 30s generation timeout, so its message wins. */
const REQUEST_TIMEOUT_MS = 35_000;

export type Source = {
  chapter: string;
  text: string;
  module?: string | null;
  url?: string | null;
  score?: number | null;
  /** False for the reader's own selected text, which is context and not evidence. */
  verified: boolean;
};

export type ChatResponse = {
  answer: string;
  sources: Source[];
  grounded: boolean;
  session_id: string;
  persisted: boolean;
};

export type ChatRequest = {
  question: string;
  session_id?: string;
  selected_text?: string;
};

/** An error the reader can be shown, carrying the backend's own cause code. */
export class ChatApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ChatApiError';
    this.code = code;
  }
}

/** Pull {error, message} out of a FastAPI error body, whatever shape it arrived in. */
function readError(status: number, body: unknown): ChatApiError {
  const detail = (body as {detail?: unknown} | null)?.detail;

  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const {error, message} = detail as {error?: string; message?: string};
    if (message) {
      return new ChatApiError(error ?? 'error', message);
    }
  }

  // Pydantic validation failures arrive as a list of issues, not our shape.
  if (Array.isArray(detail)) {
    return new ChatApiError('bad_request', 'That request was not valid.');
  }

  return new ChatApiError(
    'error',
    `The assistant returned an unexpected error (HTTP ${status}).`,
  );
}

/** Ask the book a question. Rejects with a ChatApiError the caller can render.
 *
 * `token` is optional — chat works the same for a logged-out reader (see
 * AuthContext); when present it just rides along as a Bearer header.
 */
export async function askBook(
  baseUrl: string,
  request: ChatRequest,
  token?: string | null,
): Promise<ChatResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
  } catch (cause) {
    if (controller.signal.aborted) {
      throw new ChatApiError('timeout', 'That took too long. Please try again.');
    }
    throw new ChatApiError(
      'unreachable',
      'Cannot reach the assistant right now. Please try again shortly.',
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw readError(response.status, await response.json().catch(() => null));
  }

  return (await response.json()) as ChatResponse;
}
