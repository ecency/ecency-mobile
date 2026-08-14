import type { RcPrecheckPayload } from '@ecency/sdk';

import { PostTypes } from '../constants/postTypes';
import { cleanAiTools, extractMetadata, generatePermlink, makeJsonMetadata } from './editor';

/**
 * The comment member of the payload union. Narrowed because this builder only
 * ever produces comments, which lets callers read op.body and friends without
 * re-narrowing at every use.
 */
type CommentRcPayload = Extract<RcPrecheckPayload, { kind: 'comment' }>;

interface BuildArgs {
  /** The account that will sign. */
  username: string;
  /** The editor's live draft. */
  fields: { title?: string; body?: string; tags?: string[]; aiTools?: any };
  /** The parent post, when composing a reply. */
  post?: any;
  isReply?: boolean;
  /**
   * The reply permlink is time-derived, so only its length matters here and a
   * fresh one per keystroke would be noise. Injectable for tests.
   */
  replyPermlink?: string;
}

/** Hive requires a parent permlink; the editor falls back to this tag when the draft has none. */
const DEFAULT_TAG = 'hive-125125';

/**
 * Assembles the comment operation the editor is about to broadcast, for pricing.
 *
 * It has to be the real operation. RC cost tracks serialized transaction size,
 * so an estimate built from the raw draft with tags-only metadata understates a
 * post carrying a summary, images or links, and understating is the one
 * direction that lets the chain reject a post we called affordable.
 *
 * Image ratios are deliberately not fetched: that would put requests on the
 * network every time typing pauses, and the few bytes they add can only make
 * the estimate lower, never a false alarm.
 */
export const buildEditorRcPayload = async ({
  username,
  fields,
  post,
  isReply,
  replyPermlink,
}: BuildArgs): Promise<CommentRcPayload | undefined> => {
  const body = fields?.body ?? '';
  if (!username || !body) {
    return undefined;
  }

  const title = fields?.title ?? '';
  const meta = await extractMetadata({
    body,
    fetchRatios: false,
    ...(isReply ? { postType: PostTypes.COMMENT } : {}),
  });

  const aiTools = cleanAiTools(fields?.aiTools);
  if (aiTools) {
    meta.ai_tools = aiTools;
  }

  const tags = (fields?.tags ?? []).filter((tag: any) => tag && tag !== ' ');
  const jsonMetadata = makeJsonMetadata(
    meta,
    isReply ? post?.json_metadata?.tags || ['ecency'] : tags,
  );

  return {
    kind: 'comment',
    op: {
      author: username,
      permlink: isReply ? replyPermlink ?? '' : generatePermlink(title),
      parent_author: isReply ? post?.author ?? '' : '',
      parent_permlink: isReply ? post?.permlink ?? '' : tags[0] || DEFAULT_TAG,
      title: isReply ? '' : title,
      body,
      json_metadata: JSON.stringify(jsonMetadata),
    },
  };
};
