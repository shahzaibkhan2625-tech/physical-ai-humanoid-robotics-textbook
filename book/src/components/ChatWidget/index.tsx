/**
 * The floating "Ask the book" widget: a toggle button in the bottom-right corner
 * and the chat panel it opens.
 *
 * All conversation state lives in ChatContext, so this file is presentation
 * only. Answers are rendered as plain text — the backend returns short prose,
 * and rendering reader-facing model output as markup is a needless risk.
 */

import React, {useEffect, useRef, useState} from 'react';

import {useChat, type Message} from './ChatContext';
import {MAX_QUESTION_CHARS, type Source} from './api';
import styles from './styles.module.css';

function ChatIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3c-4.97 0-9 3.36-9 7.5 0 2.3 1.25 4.36 3.2 5.73-.13 1.2-.6 2.32-1.36 3.24a.5.5 0 0 0 .46.82c1.9-.3 3.5-1.05 4.72-2.06.63.11 1.29.17 1.98.17 4.97 0 9-3.36 9-7.5S16.97 3 12 3Z"
      />
    </svg>
  );
}

function CloseIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  );
}

function SendIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M3 20.5v-6l9-2.5-9-2.5v-6l19 8.5-19 8.5Z" />
    </svg>
  );
}

/** "From: Chapter 2.3" — the citations that make an answer checkable. */
function Sources({sources}: {sources: Source[]}): React.ReactElement | null {
  // Reader-supplied selected text rides along as an unverified source; it is
  // already shown on the reader's own message, so it is not cited back here.
  const cited = sources.filter((source) => source.verified);
  if (cited.length === 0) {
    return null;
  }

  return (
    <p className={styles.sources}>
      <span className={styles.sourcesLabel}>From:</span>
      {cited.map((source, index) =>
        source.url ? (
          <a
            key={`${source.chapter}-${index}`}
            className={styles.source}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            title={source.module ? `${source.module} — ${source.chapter}` : source.chapter}
          >
            {source.chapter}
          </a>
        ) : (
          <span key={`${source.chapter}-${index}`} className={styles.source}>
            {source.chapter}
          </span>
        ),
      )}
    </p>
  );
}

function Bubble({message}: {message: Message}): React.ReactElement {
  if (message.role === 'user') {
    return (
      <li className={`${styles.row} ${styles.rowUser}`}>
        <div className={`${styles.bubble} ${styles.bubbleUser}`}>
          {message.selection && (
            <blockquote className={styles.quoted}>{message.selection}</blockquote>
          )}
          {message.text}
        </div>
      </li>
    );
  }

  if (message.role === 'error') {
    return (
      <li className={styles.row}>
        <div className={`${styles.bubble} ${styles.bubbleError}`}>{message.text}</div>
      </li>
    );
  }

  return (
    <li className={styles.row}>
      <div className={styles.bubble}>
        {message.grounded === false && (
          <span className={styles.ungrounded}>Not covered by the book</span>
        )}
        {message.text}
        {message.sources && <Sources sources={message.sources} />}
      </div>
    </li>
  );
}

function Panel(): React.ReactElement {
  const {messages, pending, selection, clearSelection, closeChat, send} = useChat();
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Focus the composer as soon as the panel opens, and again when a highlighted
  // passage arrives, so "Ask AI" lands the reader on a cursor ready to type.
  useEffect(() => {
    inputRef.current?.focus();
  }, [selection]);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages, pending]);

  function submit(): void {
    if (!draft.trim() || pending) {
      return;
    }
    send(draft);
    setDraft('');
  }

  return (
    <section
      className={styles.panel}
      role="dialog"
      aria-label="Ask the book"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          closeChat();
        }
      }}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.title}>Ask the book</p>
          <p className={styles.subtitle}>Answers come only from this textbook.</p>
        </div>
        <button
          type="button"
          className={styles.headerButton}
          onClick={closeChat}
          aria-label="Close the chat"
        >
          <CloseIcon />
        </button>
      </header>

      <ul className={styles.messages} ref={listRef}>
        {messages.length === 0 && (
          <li className={styles.empty}>
            <p>
              Ask about anything in <em>Physical AI &amp; Humanoid Robotics</em> — every
              answer cites the chapters it came from.
            </p>
            <p>
              You can also select any text on the page and choose <strong>Ask AI</strong>{' '}
              to ask about that passage.
            </p>
          </li>
        )}
        {messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}
        {pending && (
          <li className={styles.row}>
            <div className={`${styles.bubble} ${styles.thinking}`}>
              <span />
              <span />
              <span />
            </div>
          </li>
        )}
      </ul>

      {selection && (
        <div className={styles.selection}>
          <blockquote className={styles.selectionText}>{selection}</blockquote>
          <button
            type="button"
            className={styles.headerButton}
            onClick={clearSelection}
            aria-label="Remove the selected passage"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <div className={styles.composer}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={draft}
          rows={1}
          maxLength={MAX_QUESTION_CHARS}
          placeholder={selection ? 'Ask about the selected text…' : 'Ask a question…'}
          aria-label="Your question"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          className={styles.send}
          onClick={submit}
          disabled={pending || !draft.trim()}
          aria-label="Send"
        >
          <SendIcon />
        </button>
      </div>
    </section>
  );
}

export default function ChatWidget(): React.ReactElement {
  const {open, toggleChat} = useChat();

  return (
    <div className={styles.container}>
      {open && <Panel />}
      <button
        type="button"
        className={styles.toggle}
        onClick={toggleChat}
        aria-expanded={open}
        aria-label={open ? 'Close the chat' : 'Ask the book a question'}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}
