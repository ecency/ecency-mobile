import getSlug from 'speakingurl';
import { diff_match_patch } from 'diff-match-patch';

export const getWordsCount = text =>
  text && typeof text === 'string' ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length : 0;

const permlinkRnd = () => (Math.random() + 1).toString(16).substring(2);

export const generatePermlink = (title, random = false) => {
  if (!title) return '';

  const slug = getSlug(title);
  let perm = slug && slug.toString();

  if (title) {
    if (random) {
      const rnd = (Math.random() + 1).toString(16).substring(2);
      perm = `${slug.toString()}${rnd}est`;
    }

    // STEEMIT_MAX_PERMLINK_LENGTH
    if (perm.length > 255) {
      perm = perm.substring(perm.length - 255, perm.length);
    }

    // only letters numbers and dashes
    perm = perm.toLowerCase().replace(/[^a-z0-9-]+/g, '');

    if (perm.length === 0) {
      return permlinkRnd();
    }
  }

  return perm;
};

export const generateReplyPermlink = toAuthor => {
  if (!toAuthor) return '';

  const t = new Date(Date.now());

  const timeFormat = `${t.getFullYear().toString()}${(
    t.getMonth() + 1
  ).toString()}${t
    .getDate()
    .toString()}t${t
    .getHours()
    .toString()}${t
    .getMinutes()
    .toString()}${t.getSeconds().toString()}${t.getMilliseconds().toString()}z`;

  return `re-${toAuthor.replace(/\./g, '')}-${timeFormat}`;
};

export const makeOptions = (author, permlink, operationType) => {
  if (!author || !permlink) return {};

  const a = {
    allow_curation_rewards: true,
    allow_votes: true,
    author,
    permlink,
    max_accepted_payout: '1000000.000 SBD',
    percent_steem_dollars: 10000,
    extensions: [[0, { beneficiaries: [{ account: 'esteemapp', weight: 1000 }] }]],
  };

  switch (operationType) {
    case 'sp':
      a.max_accepted_payout = '1000000.000 SBD';
      a.percent_steem_dollars = 0;
      break;

    case 'dp':
      a.max_accepted_payout = '0.000 SBD';
      a.percent_steem_dollars = 10000;
      break;

    default:
      a.max_accepted_payout = '1000000.000 SBD';
      a.percent_steem_dollars = 10000;
      break;
  }

  return a;
};

export const makeJsonMetadataReply = tags => ({
  tags,
  app: 'esteem/2.0.0-mobile',
  format: 'markdown+html',
  community: 'esteem.app',
});

export const makeJsonMetadata = (meta, tags) =>
  Object.assign({}, meta, {
    tags,
    app: 'esteem/2.0.0-mobile',
    format: 'markdown+html',
    community: 'esteem.app',
  });

export const extractMetadata = body => {
  const urlReg = /(\b(https?|ftp):\/\/[A-Z0-9+&@#/%?=~_|!:,.;-]*[-A-Z0-9+&@#/%=~_|])/gim;
  const userReg = /(^|\s)(@[a-z][-.a-z\d]+[a-z\d])/gim;
  const imgReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;

  const out = {};

  const mUrls = body && body.match(urlReg);
  const mUsers = body && body.match(userReg);

  const matchedImages = [];
  const matchedLinks = [];
  const matchedUsers = [];

  if (mUrls) {
    for (let i = 0; i < mUrls.length; i++) {
      const ind = mUrls[i].match(imgReg);
      if (ind) {
        matchedImages.push(mUrls[i]);
      } else {
        matchedLinks.push(mUrls[i]);
      }
    }
  }

  if (matchedLinks.length) {
    out.links = matchedLinks;
  }
  if (matchedImages.length) {
    out.image = matchedImages;
  }

  if (mUsers) {
    for (let i = 0; i < mUsers.length; i++) {
      matchedUsers.push(mUsers[i].trim().substring(1));
    }
  }

  if (matchedUsers.length) {
    out.users = matchedUsers;
  }

  return out;
};

export const createPatch = (text1, text2) => {
  if (!text1 && text1 === '') return undefined;

  const dmp = new diff_match_patch();
  const patches = dmp.patch_make(text1, text2);
  const patch = dmp.patch_toText(patches);

  return patch;
};
