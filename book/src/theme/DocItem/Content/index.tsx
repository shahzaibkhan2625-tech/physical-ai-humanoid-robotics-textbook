/**
 * Wrapper swizzle (not an eject): renders the original DocItem/Content
 * unchanged and adds the "Translate to Urdu" control above it. Wrapping
 * rather than ejecting means this never has to be kept in sync with
 * Docusaurus's own Content implementation.
 *
 * This runs on every doc page, which in this docs-only site is every chapter.
 */

import React, {type ReactElement} from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';

import TranslateButton from '@site/src/components/TranslateButton';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): ReactElement {
  return (
    <TranslateButton>
      <Content {...props} />
    </TranslateButton>
  );
}
