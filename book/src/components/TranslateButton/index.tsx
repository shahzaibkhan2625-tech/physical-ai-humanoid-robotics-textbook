/**
 * "Translate to Urdu" control shown above a chapter's content.
 *
 * Wraps the original English content (passed as `children`) rather than
 * replacing it: the original is always rendered as-is, and toggling just
 * shows or hides it alongside a translated panel built from the backend's
 * plain-text response. The book's own MDX rendering (code blocks,
 * admonitions, links) is never touched or re-parsed.
 *
 * The chapter text sent for translation is read from the rendered DOM
 * (`innerText` of the wrapped content) rather than reconstructed from MDX
 * source, which keeps this independent of how any given chapter is authored.
 */

import React, {useRef, useState, type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

import {translateToUrdu, TranslateApiError} from './api';
import styles from './styles.module.css';

type Props = {
  children: ReactNode;
};

/** Where the backend lives — see `customFields.chatApiUrl` in docusaurus.config.ts. */
function useApiUrl(): string {
  const {siteConfig} = useDocusaurusContext();
  return (siteConfig.customFields?.chatApiUrl as string) ?? 'http://localhost:8000';
}

export default function TranslateButton({children}: Props): React.ReactElement {
  const apiUrl = useApiUrl();
  const {metadata} = useDoc();
  const contentRef = useRef<HTMLDivElement>(null);

  const [showUrdu, setShowUrdu] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(): Promise<void> {
    // Already translated: just flip which panel is visible, no network call.
    if (translated !== null) {
      setShowUrdu((current) => !current);
      return;
    }

    const text = contentRef.current?.innerText?.trim();
    if (!text) {
      return;
    }

    setPending(true);
    setError(null);
    try {
      const result = await translateToUrdu(apiUrl, text, metadata.id);
      setTranslated(result.translated_text);
      setShowUrdu(true);
    } catch (cause) {
      setError(
        cause instanceof TranslateApiError
          ? cause.message
          : 'Could not translate this chapter. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  const label = pending
    ? 'Translating…'
    : showUrdu
      ? 'Show English'
      : 'Translate to Urdu';

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.button}
          onClick={handleClick}
          disabled={pending}
          aria-busy={pending}
        >
          {label}
        </button>
        {error && (
          <span className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>

      {/* Kept mounted (just hidden) rather than unmounted, so the ref stays
          valid and a second click never needs to re-read or re-translate. */}
      <div ref={contentRef} hidden={showUrdu}>
        {children}
      </div>

      {showUrdu && translated && (
        <div className={styles.urdu} lang="ur" dir="rtl">
          {translated
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <p key={index}>{paragraph}</p>
            ))}
        </div>
      )}
    </div>
  );
}
