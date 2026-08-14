import { enforceThreeSpeakBeneficiary } from '@ecency/sdk';
import type { RcPrecheckPayload } from '@ecency/sdk';

import {
  ECENCY_SUPPORT_ACCOUNT,
  injectEcencySupportBeneficiary,
} from '../providers/ecency/supportBeneficiary';

import { PostTypes } from '../constants/postTypes';
import {
  cleanAiTools,
  createPatch,
  extractMetadata,
  generatePermlink,
  makeJsonMetadata,
  makeJsonMetadataForUpdate,
  makeOptions,
} from './editor';

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
  /** The parent post when replying, or the post itself when editing. */
  post?: any;
  isReply?: boolean;
  isEdit?: boolean;
  /**
   * The reply permlink is time-derived, so only its length matters here and a
   * fresh one per rebuild would be churn. Injectable for tests.
   */
  replyPermlink?: string;
  /** The rest of what the submit path feeds into the broadcast. */
  thumbUrl?: string;
  videoThumbUrls?: string[];
  pollDraft?: any;
  rewardType?: string;
  /** The stored beneficiary list for this draft, before submit-time additions. */
  beneficiaries?: any[];
  /**
   * Whether the draft has a beneficiary list the author set. The support
   * beneficiary is only injected when it does not, matching the submit path.
   */
  hasExplicitBeneficiaries?: boolean;
  /** The author's saved support percentage, read from cache rather than fetched. */
  supportPercent?: number;
}

/** Hive requires a parent permlink; the editor falls back to this tag when the draft has none. */
const DEFAULT_TAG = 'hive-125125';

/**
 * Assembles the operation the editor is about to broadcast, for pricing.
 *
 * It has to be the real operation. RC cost tracks serialized transaction size,
 * so an estimate built from a reduced draft understates a post carrying a
 * summary, images, a poll or beneficiaries, and understating is the one
 * direction that lets the chain reject a post we called affordable.
 *
 * Three shapes, because the editor broadcasts three:
 *
 * - a new post, which also sends comment_options for the reward split and any
 *   beneficiaries, on default settings as much as custom ones;
 * - a reply, which inherits the parent's tags and sends no options;
 * - an edit, which keeps the original permlink and parent and sends a diff of
 *   the body whenever that is smaller than the body, so pricing it as a new
 *   post would invent warnings rather than miss them.
 *
 * Image ratios are the single deliberate omission: fetching them would put
 * requests on the network every time typing pauses, and the few bytes they add
 * can only make the estimate lower, never a false alarm.
 */
export const buildEditorRcPayload = async ({
  username,
  fields,
  post,
  isReply,
  isEdit,
  replyPermlink,
  thumbUrl,
  videoThumbUrls,
  pollDraft,
  rewardType,
  beneficiaries,
  hasExplicitBeneficiaries,
  supportPercent,
}: BuildArgs): Promise<CommentRcPayload | undefined> => {
  const body = fields?.body ?? '';
  if (!username || !body) {
    return undefined;
  }

  const tags = (fields?.tags ?? []).filter((tag: any) => tag && tag !== ' ');

  if (isEdit) {
    return post
      ? buildEditPayload({ username, fields, post, tags, thumbUrl, videoThumbUrls })
      : undefined;
  }

  const title = fields?.title ?? '';
  const meta = await extractMetadata({
    body,
    thumbUrl,
    videoThumbUrls,
    fetchRatios: false,
    pollDraft,
    ...(isReply ? { postType: PostTypes.COMMENT } : {}),
  });

  const aiTools = cleanAiTools(fields?.aiTools);
  if (aiTools) {
    meta.ai_tools = aiTools;
  }

  const permlink = isReply ? replyPermlink ?? '' : generatePermlink(title);
  const jsonMetadata = makeJsonMetadata(
    meta,
    isReply ? post?.json_metadata?.tags || ['ecency'] : tags,
  );

  // A post always broadcasts comment_options beside the comment, even on
  // default reward settings, so the estimate has to account for it. A reply
  // never does.
  const options: any = isReply
    ? undefined
    : makeOptions({
        author: username,
        permlink,
        operationType: rewardType,
        beneficiaries: resolveSubmitBeneficiaries({
          username,
          body,
          beneficiaries,
          hasExplicitBeneficiaries,
          supportPercent,
        }),
      });

  return {
    kind: 'comment',
    op: {
      author: username,
      permlink,
      parent_author: isReply ? post?.author ?? '' : '',
      parent_permlink: isReply ? post?.permlink ?? '' : tags[0] || DEFAULT_TAG,
      title: isReply ? '' : title,
      body,
      json_metadata: JSON.stringify(jsonMetadata),
    },
    ...(options?.permlink
      ? { options: { beneficiaries: options.extensions?.[0]?.[1]?.beneficiaries } }
      : {}),
  };
};

/**
 * The beneficiaries the post will really carry.
 *
 * Submit adds two rows the stored list does not have: a mandatory 3Speak
 * beneficiary when the body embeds one of their videos, and the author's
 * voluntary Ecency support row when they have not set a list of their own.
 * Each row lands in comment_options, so pricing the stored list alone
 * understates a post that gets either.
 */
const resolveSubmitBeneficiaries = ({
  username,
  body,
  beneficiaries,
  hasExplicitBeneficiaries,
  supportPercent,
}: {
  username: string;
  body: string;
  beneficiaries?: any[];
  hasExplicitBeneficiaries?: boolean;
  supportPercent?: number;
}) => {
  const enforced = enforceThreeSpeakBeneficiary(beneficiaries ?? [], body);

  if (hasExplicitBeneficiaries || username === ECENCY_SUPPORT_ACCOUNT || !supportPercent) {
    return enforced;
  }

  return injectEcencySupportBeneficiary(enforced, supportPercent);
};

/**
 * An edit keeps the post's identity and usually sends far less than the post
 * did: the body goes out as a diff whenever that is smaller, and the metadata
 * is merged over what the post already carries.
 */
const buildEditPayload = async ({
  username,
  fields,
  post,
  tags,
  thumbUrl,
  videoThumbUrls,
}: {
  username: string;
  fields: BuildArgs['fields'];
  post: any;
  tags: string[];
  thumbUrl?: string;
  videoThumbUrls?: string[];
}): Promise<CommentRcPayload> => {
  const oldBody = post?.markdownBody ?? '';
  const draftBody = fields?.body ?? '';
  const patch = createPatch(oldBody, draftBody.trim());
  const body = patch && patch.length < Buffer.from(oldBody, 'utf-8').length ? patch : draftBody;

  const jsonMetadata = post?.json_metadata ?? {};
  const meta = await extractMetadata({
    body: draftBody,
    thumbUrl,
    videoThumbUrls,
    fetchRatios: false,
    postType: jsonMetadata.type,
    contentType: jsonMetadata.content_type,
  });

  // Additive, matching the submit path: an edit must not drop a disclosure the
  // author is not touching.
  const aiTools = cleanAiTools({ ...(jsonMetadata?.ai_tools || {}), ...fields?.aiTools });
  if (aiTools) {
    meta.ai_tools = aiTools;
  }

  let jsonMeta;
  try {
    jsonMeta = makeJsonMetadataForUpdate(jsonMetadata, meta, tags);
  } catch (e) {
    jsonMeta = makeJsonMetadata(meta, tags);
  }

  return {
    kind: 'comment',
    op: {
      author: username,
      permlink: post?.permlink ?? '',
      parent_author: post?.parent_author ?? '',
      parent_permlink: post?.parent_permlink ?? '',
      title: post?.parent_author ? '' : fields?.title ?? '',
      body,
      json_metadata: JSON.stringify(jsonMeta),
    },
  };
};
