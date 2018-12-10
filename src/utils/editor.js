export const getWordsCount = text => (text && typeof text === 'string' ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length : 0);

export const generatePermlink = (text) => {
  if (text) {
    const re = /[^a-z0-9]+/gi;
    const re2 = /^-*|-*$/g;
    let permlink = text.replace(re, '-');

    permlink = `${permlink.replace(re2, '').toLowerCase()}-id-${Math.random()
      .toString(36)
      .substr(2, 16)}`;
    return permlink;
  }
  return null;
};

export const generateReplyPermlink = (toAuthor) => {
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

export const makeJsonMetadata = (meta, tags) => Object.assign({}, meta, {
  tags,
  app: 'esteem/2.0.0-mobile',
  format: 'markdown+html',
  community: 'esteem.app',
});

export const extractMetadata = (body) => {
  const urlReg = /(\b(https?|ftp):\/\/[A-Z0-9+&@#/%?=~_|!:,.;-]*[-A-Z0-9+&@#/%=~_|])/gim;
  const userReg = /(^|\s)(@[a-z][-.a-z\d]+[a-z\d])/gim;
  const imgReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;

  const out = {};

  const mUrls = body.match(urlReg);
  const mUsers = body.match(userReg);

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
