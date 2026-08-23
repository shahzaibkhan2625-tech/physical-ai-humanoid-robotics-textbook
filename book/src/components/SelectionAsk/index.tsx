/**
 * "Ask AI" on highlighted text.
 *
 * Watches for a selection inside the chapter body and floats a button next to
 * it. Clicking hands the passage to the chat widget, which sends it as
 * `selected_text` so the answer is scoped to what the reader was reading
 * (spec 002-chatbot, US3).
 */

import React, {useCallback, useEffect, useState} from 'react';

import {useChat} from '../ChatWidget/ChatContext';
import styles from './styles.module.css';

/** Below this, a selection is more likely a mis-drag than a question. */
const MIN_SELECTION_CHARS = 3;

/** Gap between the selection and the button, in pixels. */
const OFFSET = 8;

type Anchor = {top: number; left: number; text: string};

/** True when the selection sits in the chapter body, not the chat panel or chrome. */
function inChapterBody(selection: Selection): boolean {
  const node = selection.anchorNode;
  const element = node?.nodeType === Node.ELEMENT_NODE ? (node as Element) : node?.parentElement;
  if (!element) {
    return false;
  }
  return Boolean(element.closest('main')) && !element.closest('[role="dialog"]');
}

export default function SelectionAsk(): React.ReactElement | null {
  const {askAbout} = useChat();
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const evaluate = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';

    if (!selection || selection.isCollapsed || text.length < MIN_SELECTION_CHARS) {
      setAnchor(null);
      return;
    }
    if (!inChapterBody(selection)) {
      setAnchor(null);
      return;
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setAnchor(null);
      return;
    }

    // Fixed positioning, so viewport coordinates are what we want. Sit above the
    // selection unless it is too close to the top of the window to fit there.
    const above = rect.top > 56;
    setAnchor({
      top: above ? rect.top - OFFSET : rect.bottom + OFFSET,
      left: rect.left + rect.width / 2,
      text,
    });
  }, []);

  useEffect(() => {
    // A selection is not final until the gesture ends, so settle on mouseup and
    // keyup (Shift+arrow selection) rather than on every selectionchange.
    const settle = () => window.setTimeout(evaluate, 0);
    const dismiss = () => setAnchor(null);

    document.addEventListener('mouseup', settle);
    document.addEventListener('keyup', settle);
    document.addEventListener('mousedown', dismiss);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);

    return () => {
      document.removeEventListener('mouseup', settle);
      document.removeEventListener('keyup', settle);
      document.removeEventListener('mousedown', dismiss);
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [evaluate]);

  if (!anchor) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.button}
      style={{top: anchor.top, left: anchor.left}}
      // The document-level mousedown handler would dismiss this button before
      // its click ever landed, and pressing it would also drop the selection.
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={() => {
        askAbout(anchor.text);
        setAnchor(null);
        window.getSelection()?.removeAllRanges();
      }}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          fill="currentColor"
          d="m12 2 1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2Zm6.5 11 .95 2.8 2.8.95-2.8.95-.95 2.8-.95-2.8-2.8-.95 2.8-.95.95-2.8Z"
        />
      </svg>
      Ask AI
    </button>
  );
}
