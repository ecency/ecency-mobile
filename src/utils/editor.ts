import { diff_match_patch as diffMatchPatch } from 'diff-match-patch';
import MimeTypes from 'mime-types';
import { unionBy } from 'lodash';
import { Image } from 'react-native';
import VersionNumber from 'react-native-version-number';
import getSlug from 'speakingurl';
import { getQueryClient, getPostQueryOptions, POLLS_PROTOCOL_VERSION } from '@ecency/sdk';
import CryptoJS from 'crypto-js';
import { PostTypes } from '../constants/postTypes';
import { PollDraft } from '../providers/ecency/ecency.types';
import { ContentType, PollMetadata, PostMetadata } from '../providers/hive/hive.types';
import postUrlParser from './postUrlParser';
import { hasThreeSpeakEmbed } from '../providers/speak/beneficiary';

export const getWordsCount = (text) =>
  text && typeof text === 'string' ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length : 0;

export const generateRndStr = () => (Math.random() + 1).toString(16).substring(2);

export const generatePermlink = (title, random = false) => {
  if (!title) {
    return '';
  }

  // TODO: check special character processing
  const slug = getSlug(title);
  let perm = slug && slug.toString();

  if (title) {
    // make shorter url if possible
    const shortp = perm.split('-');
    if (shortp.length > 5) {
      perm = shortp.slice(0, 5).join('-');
    }

    if (random) {
      const rnd = generateRndStr();
      perm = `${perm}-${rnd}`;
    }

    // STEEMIT_MAX_PERMLINK_LENGTH
    if (perm.length > 255) {
      perm = perm.substring(perm.length - 255, perm.length);
    }

    // only letters numbers and dashes
    perm = perm.toLowerCase().replace(/[^a-z0-9-]+/g, '');

    if (perm.length === 0) {
      return generateRndStr();
    }
  }

  return perm;
};

export const extractWordAtIndex = (text: string, index: number) => {
  const RANGE = 50;

  const _start = index - RANGE;
  const _end = index + RANGE;

  const _length = text.length;

  const textChunk = text.substring(_start > 0 ? _start : 0, _end < _length ? _end : _length);
  const indexChunk =
    index < 50 ? index : _length - index < 50 ? textChunk.length - (_length - index) : RANGE;

  console.log('char at index: ', textChunk[indexChunk]);

  const END_REGEX = /[\s,]/;
  let word = '';
  for (let i = indexChunk; i >= 0 && (!END_REGEX.test(textChunk[i]) || i === indexChunk); i--) {
    if (textChunk[i]) {
      word += textChunk[i];
    }
  }
  word = word.split('').reverse().join('');

  if (!END_REGEX.test(textChunk[indexChunk])) {
    for (let i = indexChunk + 1; i < textChunk.length && !END_REGEX.test(textChunk[i]); i++) {
      if (textChunk[i]) {
        word += textChunk[i];
      }
    }
  }

  return word;
};

export const generateUniquePermlink = (prefix) => {
  if (!prefix) {
    return '';
  }

  const t = new Date(Date.now());

  const timeFormat = `${t.getFullYear().toString()}${(t.getMonth() + 1).toString()}${t
    .getDate()
    .toString()}t${t.getHours().toString()}${t.getMinutes().toString()}${t
    .getSeconds()
    .toString()}${t.getMilliseconds().toString()}z`;

  return `${prefix}-${timeFormat}`;
};

/**
 * Deterministic permlink derived purely from content.
 *
 * Used to make retries idempotent: when a user resubmits the same wave after a
 * perceived failure that actually broadcast (network timeout, app crash mid-
 * publish, etc.), the second attempt produces the same permlink and Hive
 * rejects it as a duplicate instead of creating a second post on chain.
 *
 * No time component: a time bucket would re-open a duplicate window every
 * boundary crossing. The trade-off is that intentionally re-posting the exact
 * same body+attachments will surface as a Hive "duplicate transaction" error;
 * for waves that is a better failure mode than two identical posts on chain.
 * Callers scope `contentKey` by author/parent so two users (or one user under
 * different parents) writing identical text still get distinct permlinks.
 */
export const generateContentBasedPermlink = (prefix: string, contentKey: string) => {
  if (!prefix) {
    return '';
  }
  const hash = CryptoJS.SHA256(contentKey).toString(CryptoJS.enc.Hex).slice(0, 16);
  return `${prefix}-${hash}`;
};

export const makeOptions = (postObj) => {
  if (!postObj.author || !postObj.permlink) {
    return {};
  }

  const a = {
    allow_curation_rewards: true,
    allow_votes: true,
    author: postObj.author,
    permlink: postObj.permlink,
    max_accepted_payout: '1000000.000 HBD',
    percent_hbd: 10000,
    extensions: [] as any,
  };

  switch (postObj.operationType) {
    case 'sp':
      a.max_accepted_payout = '1000000.000 HBD';
      a.percent_hbd = 0;
      break;

    case 'dp':
      a.max_accepted_payout = '0.000 HBD';
      a.percent_hbd = 10000;
      break;

    default:
      a.max_accepted_payout = '1000000.000 HBD';
      a.percent_hbd = 10000;
      break;
  }

  if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
    postObj.beneficiaries.sort((a, b) => a.account.localeCompare(b.account));
    a.extensions = [[0, { beneficiaries: unionBy(postObj.beneficiaries, 'account') }]];
  }

  return a;
};

export const makeJsonMetadataReply = (tags) => ({
  tags,
  app: `ecency/${VersionNumber.appVersion}-mobile`,
  format: 'markdown+html',
});

export const makeJsonMetadata = (meta, tags) =>
  Object.assign({}, meta, {
    tags,
    app: `ecency/${VersionNumber.appVersion}-mobile`,
    format: 'markdown+html',
  });

// Optional AI-usage disclosure (`ai_tools`, interoperable with other Hive frontends). Keeps
// only the truthy flags and returns undefined when nothing is disclosed, so a normal post's
// metadata is untouched.
export const cleanAiTools = (aiTools) => {
  if (!aiTools) {
    return undefined;
  }
  const out: { media_generation?: boolean; writing_edit?: boolean } = {};
  if (aiTools.media_generation) {
    out.media_generation = true;
  }
  if (aiTools.writing_edit) {
    out.writing_edit = true;
  }
  return Object.keys(out).length > 0 ? out : undefined;
};

export const makeJsonMetadataForUpdate = (oldJson, meta, tags) => {
  const { meta: oldMeta } = oldJson;
  const mergedMeta = Object.assign({}, oldMeta, meta);

  return Object.assign({}, oldJson, mergedMeta, { tags });
};

export const extractUrls = (body: string) => {
  const urlReg = /(\b(https?|ftp):\/\/[A-Z0-9+&@#/%?=~_|!:,.;-]*[-A-Z0-9+&@#/%=~_|])/gim;
  const mUrls = body && body.match(urlReg);
  return mUrls || [];
};

export const extractImageUrls = ({ body, urls }: { body?: string; urls?: string[] }) => {
  const imgReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|heic|webp))/gim;

  const imgUrls = [];
  const mUrls = urls || extractUrls(body);

  mUrls.forEach((url) => {
    const isImage = url.match(imgReg);
    if (isImage) {
      imgUrls.push(url);
    }
  });

  return imgUrls;
};

export const extract3SpeakIds = ({ body }) => {
  if (!body) {
    return [];
  }

  const regex = /\[3speak]\((.*?)\)/g;
  const matches = [...body.matchAll(regex)];

  const ids = matches.map((match) => match[1]);
  console.log(ids);

  return ids;
};

export const extractFilenameFromPath = ({
  path,
  mimeType,
}: {
  path: string;
  mimeType?: string;
}) => {
  try {
    if (!path) {
      throw new Error('path not provided');
    }
    const filenameIndex = path.lastIndexOf('/') + 1;
    const extensionIndex = path.lastIndexOf('.');
    if (filenameIndex < 0 || extensionIndex <= filenameIndex) {
      throw new Error('file name not present with extension');
    }
    return path.substring(path.lastIndexOf('/') + 1);
  } catch (err) {
    let _ext = 'jpg';
    if (mimeType) {
      _ext = MimeTypes.extension(mimeType);
    }
    return `${generateRndStr()}.${_ext}`;
  }
};

/** A thumbnail generated for an uploaded video, paired with the embed it belongs to. */
export interface VideoThumb {
  embedUrl: string;
  thumbUrl: string;
}

/**
 * 3Speak embeds in the body. Videos are inserted as a raw url on their own line.
 *
 * Deliberately reuses the same predicate as the threespeakfund beneficiary enforcement, so
 * what counts as a video here cannot drift from what counts as one when the payout route is
 * attached.
 */
export const extractVideoEmbedUrls = (body?: string): string[] =>
  (body ? extractUrls(body) : []).filter((url) => hasThreeSpeakEmbed(url));

/**
 * Rebuilds the embed to thumbnail association that a saved draft could not carry.
 *
 * A draft stores its cover as a flat `meta.image[0]` with no link to the video it came from.
 * That link can only be inferred when the draft holds exactly one embed. With several, the
 * cover cannot be attributed to any one of them, and guessing would let a removed video's
 * cover stay selectable and publishable for a post that no longer contains it. Those drafts
 * restore no cover, which is what happened before any of this was carried at all.
 */
export const restoreVideoThumbs = (body?: string, metaImages?: string[]): VideoThumb[] => {
  const thumbUrl = metaImages?.[0];
  const embedUrls = extractVideoEmbedUrls(body);
  return thumbUrl && embedUrls.length === 1 ? [{ embedUrl: embedUrls[0], thumbUrl }] : [];
};

/**
 * Video thumbnails live outside the body, so they cannot be rediscovered by parsing it and
 * have to be carried in state, keyed by the embed they belong to so that a removed video
 * drops its thumbnail instead of leaving it selectable, or published, after the video is
 * gone. This holds for a reopened draft too, see `restoreVideoThumbs`.
 *
 * Thumbnails already present as images in the body are left out, the caller merges this list
 * with the body images and duplicates would otherwise reach `meta.image`.
 */
export const collectVideoThumbUrls = ({
  videoThumbs,
  body,
}: {
  videoThumbs?: VideoThumb[];
  body?: string;
}): string[] => {
  if (!body) {
    return [];
  }

  const bodyUrls = extractUrls(body);
  // Exact match, not a substring test: one embed url can be a prefix of another, so
  // `includes` would keep a removed video alive on the strength of the one replacing it
  const bodyUrlSet = new Set(bodyUrls);
  const bodyImages = new Set(extractImageUrls({ body, urls: bodyUrls }));

  return Array.from(
    new Set(
      (videoThumbs || [])
        .filter(({ embedUrl }) => !!embedUrl && bodyUrlSet.has(embedUrl))
        .map(({ thumbUrl }) => thumbUrl),
    ),
  ).filter((url) => !!url && !bodyImages.has(url));
};

export const extractMetadata = async ({
  body,
  thumbUrl,
  videoThumbUrls,
  fetchRatios,
  postType,
  contentType,
  pollDraft,
}: {
  body: string;
  thumbUrl?: string;
  videoThumbUrls?: string[];
  fetchRatios?: boolean;
  postType?: PostTypes;
  contentType?: ContentType;
  pollDraft?: PollDraft;
}) => {
  // NOTE: keepting regex to extract usernames as reference for later usage if any
  // const userReg = /(^|\s)(@[a-z][-.a-z\d]+[a-z\d])/gim;

  let out: PostMetadata = {
    content_type: contentType,
  };

  const mUrls = extractUrls(body);
  const mImageUrls = extractImageUrls({ body, urls: mUrls });

  const matchedImages = [...mImageUrls, ...(videoThumbUrls || [])];

  // Process link URLs and add to list_meta
  const filteredUrls = mUrls.filter((url) => !mImageUrls.includes(url)).slice(0, 5);
  out.links = filteredUrls;

  // Create an array to track parsed URL data alongside promises
  const postPromises: Promise<any>[] = [];
  const promiseUrls: string[] = [];

  const queryClient = getQueryClient();

  filteredUrls.forEach((url) => {
    try {
      // Check if url is a post url
      const { author, permlink } = postUrlParser(url);

      if (author && permlink) {
        // Store URL info alongside the promise
        promiseUrls.push(url);
        postPromises.push(queryClient.fetchQuery(getPostQueryOptions(author, permlink, '')));
      }
    } catch (e) {
      console.log('error parsing url: ', url, e);
    }
  });

  // Use allSettled so a single failed linked-post fetch can't reject the whole
  // metadata extraction — which previously threw out of extractMetadata and could
  // wedge the publish/reply flow.
  const postResults = await Promise.allSettled(postPromises);

  // Now combine responses with original URL data
  postResults.forEach((result, index) => {
    const url = promiseUrls[index];
    const linkedPost = result.status === 'fulfilled' ? result.value : null;

    if (result.status === 'rejected') {
      console.log('error fetching post data for url, skipping url: ', url, result.reason);
    }

    out.links_meta = {
      ...(out.links_meta || {}),
      [url]: linkedPost
        ? {
            title: linkedPost.title,
            summary: linkedPost.summary,
            image: linkedPost.image,
          }
        : null,
    };
  });

  // sort based on thumbUrl if provided
  if (matchedImages.length) {
    if (thumbUrl) {
      matchedImages.sort((item) => (item === thumbUrl ? -1 : 1));
    }

    out.image = matchedImages.slice(0, 10); // return only first 10 images
  }

  // fetch imagee ratios if flag is set
  if (out.image && fetchRatios) {
    out.image_ratios = await Promise.all(
      out.image
        .slice(0, 5)
        .map((url) => {
          return new Promise((resolve) => {
            Image.getSize(
              url,
              (width, height) => {
                resolve(width / height);
              },
              () => resolve(NaN),
            );
          });
        })
        .slice(0, 5),
    );
  }

  // Note: 3Speak video metadata is no longer stored in json_metadata.
  // The new embed architecture uses the embed URL in the post body instead.

  if (pollDraft && pollDraft.title) {
    // TODO: added poll validity checks

    // convert draft poll to poll meta here
    const _pollMeta = convertToPollMeta(pollDraft);
    out = {
      ...out,
      ..._pollMeta,
      content_type: ContentType.POLL,
    };
  }

  // setting post type, primary usecase for separating waves from other posts
  out.type = postType || PostTypes.POST;

  console.log('out : ', out);

  return out;
};

export const createPatch = (text1, text2) => {
  if (!text1 && text1 === '') {
    return undefined;
  }

  const dmp = new diffMatchPatch();
  const patches = dmp.patch_make(text1, text2);
  const patch = dmp.patch_toText(patches);

  return patch;
};

export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const convertToPollMeta = (pollDraft: PollDraft) => {
  if (!pollDraft) {
    return {};
  }

  return {
    content_type: ContentType.POLL,
    question: pollDraft.title.trim(),
    choices: pollDraft.choices,
    preferred_interpretation: pollDraft.interpretation,
    end_time: Math.floor(new Date(pollDraft.endTime).getTime() / 1000),
    allow_vote_changes: pollDraft.voteChange,
    hive_votes: pollDraft.hideVotes,
    ui_hide_res_until_voted: pollDraft.hideResults,
    max_choices_voted: pollDraft.maxChoicesVoted,
    filters: {
      account_age: pollDraft.filters.accountAge,
    },
    token: pollDraft.token,
    community_membership: pollDraft.communityMembership,
    version: POLLS_PROTOCOL_VERSION,
  } as PollMetadata;
};
