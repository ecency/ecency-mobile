import { Platform } from 'react-native';
import { postBodySummary } from '@ecency/render-helper';

export const SUMMARY_LENGTH = 150;

const platform = Platform.OS as 'ios' | 'android';

/**
 * Plain-text excerpt of an author-written string, capped at `length` characters.
 *
 * postBodySummary truncates on spaces and drops a first "word" longer than the
 * cap, so text without spaces (CJK prose, a long hashtag) summarises to "". When
 * that happens, take the untruncated plain text and cut it by code point instead,
 * so such a description still yields a bounded excerpt.
 */
export const summarizeText = (text: string, length = SUMMARY_LENGTH): string => {
  const summary = postBodySummary(text, length, platform);
  if (summary) {
    return summary;
  }
  const plain = postBodySummary(text, 0, platform);
  return plain ? Array.from(plain).slice(0, length).join('') : '';
};

/**
 * Card summary: an author-set json_metadata.description wins over the generated
 * body summary, but json_metadata is untrusted on-chain data. Some apps write the
 * whole markdown body (or a non-string) into description, which used to render
 * raw markdown of unbounded length in the feed. Route it through the same
 * summary function as the body so both paths yield plain text of the same cap.
 */
export const parseSummary = (post: any): string => {
  const declared = post?.json_metadata?.description;
  if (typeof declared === 'string' && declared.trim()) {
    const summary = summarizeText(declared.trim(), SUMMARY_LENGTH);
    if (summary) {
      return summary;
    }
  }
  return postBodySummary(post, SUMMARY_LENGTH, platform);
};
