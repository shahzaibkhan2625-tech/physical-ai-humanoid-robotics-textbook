/**
 * Conversation state for the whole site.
 *
 * Mounted once by the swizzled Root (src/theme/Root.tsx), so it survives
 * client-side navigation between chapters: a reader can ask a question, follow a
 * link, and keep the thread. It does not survive a reload, by design — the
 * session id lives in a ref and nothing is written to localStorage or any other
 * browser storage.
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

import {useAuth} from '@site/src/components/Auth/AuthContext';
import {
  askBook,
  ChatApiError,
  MAX_SELECTED_CHARS,
  type ChatRequest,
  type Source,
} from './api';

export type Message = {
  id: number;
  role: 'user' | 'bot' | 'error';
  text: string;
  /** On a user message: the passage that was sent with it, if any. */
  selection?: string;
  /** On a bot message: the passages the answer drew on. */
  sources?: Source[];
  grounded?: boolean;
};

type ChatContextValue = {
  open: boolean;
  messages: Message[];
  pending: boolean;
  /** Text the reader highlighted, queued to go out with the next question. */
  selection: string | null;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  /** Open the panel with a highlighted passage attached as context. */
  askAbout: (text: string) => void;
  clearSelection: () => void;
  send: (question: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat(): ChatContextValue {
  const value = useContext(ChatContext);
  if (!value) {
    throw new Error('useChat must be used inside <ChatProvider>');
  }
  return value;
}

/** Where the backend lives — see `customFields.chatApiUrl` in docusaurus.config.ts. */
function useApiUrl(): string {
  const {siteConfig} = useDocusaurusContext();
  return (siteConfig.customFields?.chatApiUrl as string) ?? 'http://localhost:8000';
}

export function ChatProvider({children}: {children: ReactNode}): ReactNode {
  const apiUrl = useApiUrl();
  const {token} = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);

  // The backend mints the session id on the first turn; we hold it for the rest
  // of this browser session and send it back so follow-ups resolve in context.
  const sessionId = useRef<string | null>(null);
  const nextId = useRef(0);

  const push = useCallback((message: Omit<Message, 'id'>) => {
    nextId.current += 1;
    setMessages((current) => [...current, {...message, id: nextId.current}]);
  }, []);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);
  const toggleChat = useCallback(() => setOpen((it) => !it), []);
  const clearSelection = useCallback(() => setSelection(null), []);

  const askAbout = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    // The backend rejects anything longer, and a reader who lassoed half a
    // chapter still deserves an answer about the start of it.
    setSelection(trimmed.slice(0, MAX_SELECTED_CHARS));
    setOpen(true);
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || pending) {
        return;
      }

      const selected = selection;
      setSelection(null);
      push({role: 'user', text: question, selection: selected ?? undefined});
      setPending(true);

      const request: ChatRequest = {question};
      if (selected) {
        request.selected_text = selected;
      }

      try {
        let reply;
        try {
          reply = await askBook(
            apiUrl,
            {
              ...request,
              ...(sessionId.current ? {session_id: sessionId.current} : {}),
            },
            token,
          );
        } catch (error) {
          // The service restarted, or history was cleared, and our id no longer
          // names a conversation. Start a fresh one rather than lose the question.
          if (error instanceof ChatApiError && error.code === 'unknown_session') {
            sessionId.current = null;
            reply = await askBook(apiUrl, request, token);
          } else {
            throw error;
          }
        }

        sessionId.current = reply.session_id;
        push({
          role: 'bot',
          text: reply.answer,
          sources: reply.sources,
          grounded: reply.grounded,
        });
      } catch (error) {
        push({
          role: 'error',
          text:
            error instanceof ChatApiError
              ? error.message
              : 'Something went wrong. Please try again.',
        });
      } finally {
        setPending(false);
      }
    },
    [apiUrl, pending, push, selection, token],
  );

  const value = useMemo(
    () => ({
      open,
      messages,
      pending,
      selection,
      openChat,
      closeChat,
      toggleChat,
      askAbout,
      clearSelection,
      send,
    }),
    [
      open,
      messages,
      pending,
      selection,
      openChat,
      closeChat,
      toggleChat,
      askAbout,
      clearSelection,
      send,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
