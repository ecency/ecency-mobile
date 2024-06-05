import { diff_match_patch as diffMatchPatch } from 'diff-match-patch';
import MimeTypes from 'mime-types';
import { Image } from 'react-native';
import VersionNumber from 'react-native-version-number';
import getSlug from 'speakingurl';
import { PostTypes } from '../constants/postTypes';
import { ThreeSpeakVideo } from '../providers/speak/speak.types';
import { PollDraft } from '../providers/ecency/ecency.types';

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
    extensions: [],
  };
  switch (postObj.operationType) {
    case 'sp':
      a.max_accepted_payout = '1000000.000 HBD';
      a.percent_hbd = 0;
      if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
        postObj.beneficiaries.sort((a, b) => a.account.localeCompare(b.account));
        a.extensions = [[0, { beneficiaries: postObj.beneficiaries }]];
      }
      break;

    case 'dp':
      a.max_accepted_payout = '0.000 HBD';
      a.percent_hbd = 10000;
      if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
        postObj.beneficiaries.sort((a, b) => a.account.localeCompare(b.account));
        a.extensions = [[0, { beneficiaries: postObj.beneficiaries }]];
      }
      break;

    default:
      a.max_accepted_payout = '1000000.000 HBD';
      a.percent_hbd = 10000;
      if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
        postObj.beneficiaries.sort((a, b) => a.account.localeCompare(b.account));
        a.extensions = [[0, { beneficiaries: postObj.beneficiaries }]];
      }
      break;
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

export const makeJsonMetadataForUpdate = (oldJson, meta, tags) => {
  const { meta: oldMeta } = oldJson;
  const mergedMeta = Object.assign({}, oldMeta, meta);

  return Object.assign({}, oldJson, mergedMeta, { tags });
};

const extractUrls = (body: string) => {
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

export const extractMetadata = async ({
  body,
  thumbUrl,
  videoThumbUrls,
  fetchRatios,
  postType,
  videoPublishMeta,
  pollDraft
}: {
  body: string;
  thumbUrl?: string;
  videoThumbUrls: string[];
  fetchRatios?: boolean;
  postType?: PostTypes;
  videoPublishMeta?: ThreeSpeakVideo;
  pollDraft?:PollDraft
}) => {
  // NOTE: keepting regex to extract usernames as reference for later usage if any
  // const userReg = /(^|\s)(@[a-z][-.a-z\d]+[a-z\d])/gim;

  const out: any = {};
  const mUrls = extractUrls(body);
  const matchedImages = [...extractImageUrls({ urls: mUrls }), ...(videoThumbUrls || [])];

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

  // insert three speak meta
  if (videoPublishMeta) {
    out.video = {
      info: {
        platform: '3speak',
        title: videoPublishMeta.title,
        author: videoPublishMeta.owner,
        permlink: videoPublishMeta.permlink,
        duration: videoPublishMeta.duration,
        filesize: videoPublishMeta.size,
        file: videoPublishMeta.filename,
        lang: videoPublishMeta.language,
        firstUpload: videoPublishMeta.firstUpload,
        ipfs: null,
        ipfsThumbnail: null,
        video_v2: videoPublishMeta.video_v2,
        sourceMap: [
          {
            type: 'video',
            url: videoPublishMeta.video_v2,
            format: 'm3u8',
          },
          {
            type: 'thumbnail',
            url: videoPublishMeta.thumbUrl,
          },
        ],
      },
      content: {
        description: videoPublishMeta.description,
        tags: videoPublishMeta.tags_v2,
      },
    };
  }


  if(pollDraft){
    //TODO convert draft poll to poll meta here

  }

  // setting post type, primary usecase for separating waves from other posts
  out.type = postType || PostTypes.POST;

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
