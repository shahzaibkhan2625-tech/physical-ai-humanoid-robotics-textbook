/**
 * Swizzled Root — the one component Docusaurus renders above the router, so it
 * mounts once and never remounts on navigation.
 *
 * That is exactly what the chat needs: the conversation survives a reader moving
 * between chapters, and the widget appears on every page without touching a
 * single chapter file.
 *
 * The chat is client-only (it has no meaning in the pre-rendered HTML and reads
 * the selection API), so it is wrapped in BrowserOnly rather than guarded piece
 * by piece.
 */

import React, {type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

import ChatWidget from '@site/src/components/ChatWidget';
import {ChatProvider} from '@site/src/components/ChatWidget/ChatContext';
import SelectionAsk from '@site/src/components/SelectionAsk';
import AuthButton from '@site/src/components/Auth';
import {AuthProvider} from '@site/src/components/Auth/AuthContext';

export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <BrowserOnly>
        {() => (
          <AuthProvider>
            <ChatProvider>
              <AuthButton />
              <SelectionAsk />
              <ChatWidget />
            </ChatProvider>
          </AuthProvider>
        )}
      </BrowserOnly>
    </>
  );
}
