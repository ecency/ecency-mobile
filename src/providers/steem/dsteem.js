/* eslint-disable camelcase */
// import '../../../shim';
// import * as bitcoin from 'bitcoinjs-lib';

import { Client, cryptoUtils } from '@hiveio/dhive';
import { PrivateKey } from '@esteemapp/dhive';

import hivesigner from 'hivesigner';
import Config from 'react-native-config';
import { get, has } from 'lodash';
import { getServer, getCache, setCache } from '../../realm/realm';
import { getUnreadActivityCount } from '../esteem/esteem';
import { userActivity } from '../esteem/ePoint';

// Utils
import { decryptKey } from '../../utils/crypto';
import { parsePosts, parsePost, parseComments } from '../../utils/postParser';
import { getName, getAvatar } from '../../utils/user';
import { getReputation } from '../../utils/reputation';
import parseToken from '../../utils/parseToken';
import parseAsset from '../../utils/parseAsset';
import filterNsfwPost from '../../utils/filterNsfwPost';
import { jsonStringify } from '../../utils/jsonUtils';
import { getDsteemDateErrorMessage } from '../../utils/dsteemUtils';

// Constant
import AUTH_TYPE from '../../constants/authType';
import { SERVER_LIST } from '../../constants/options/api';

global.Buffer = global.Buffer || require('buffer').Buffer;

const DEFAULT_SERVER = SERVER_LIST;
let client = new Client(DEFAULT_SERVER, {
  timeout: 3000,
  failoverThreshold: 10,
  consoleOnFailover: true,
  rebrandedApi: true,
});

export const checkClient = async () => {
  let selectedServer = DEFAULT_SERVER;

  await getServer().then((response) => {
    if (response) {
      selectedServer.unshift(response);
    }
  });

  client = new Client(selectedServer, {
    timeout: 3000,
    failoverThreshold: 10,
    consoleOnFailover: true,
    rebrandedApi: true,
  });
};

checkClient();

export const getDigitPinCode = (pin) => decryptKey(pin, Config.PIN_KEY);

export const getDynamicGlobalProperties = () => client.database.getDynamicGlobalProperties();

export const getRewardFund = () => client.database.call('get_reward_fund', ['post']);

export const getFeedHistory = async () => {
  try {
    const feedHistory = await client.database.call('get_feed_history');
    return feedHistory;
  } catch (error) {
    return error;
  }
};

export const fetchGlobalProps = async () => {
  let globalDynamic;
  let feedHistory;
  let rewardFund;

  try {
    globalDynamic = await getDynamicGlobalProperties();
    await setCache('globalDynamic', globalDynamic);
    feedHistory = await getFeedHistory();
    await setCache('feedHistory', feedHistory);
    rewardFund = await getRewardFund();
    await setCache('rewardFund', rewardFund);
  } catch (e) {
    return;
  }

  const steemPerMVests =
    (parseToken(
      get(globalDynamic, 'total_vesting_fund_steem', globalDynamic.total_vesting_fund_hive),
    ) /
      parseToken(get(globalDynamic, 'total_vesting_shares'))) *
    1e6;
  const sbdPrintRate = get(globalDynamic, 'sbd_print_rate', globalDynamic.hbd_print_rate);
  const base = parseAsset(get(feedHistory, 'current_median_history.base')).amount;
  const quote = parseAsset(get(feedHistory, 'current_median_history.quote')).amount;
  const fundRecentClaims = get(rewardFund, 'recent_claims');
  const fundRewardBalance = parseToken(get(rewardFund, 'reward_balance'));
  const globalProps = {
    steemPerMVests,
    base,
    quote,
    fundRecentClaims,
    fundRewardBalance,
    sbdPrintRate,
  };

  return globalProps;
};

/**
 * @method getAccount get account data
 * @param user username
 */
export const getAccount = (user) =>
  new Promise((resolve, reject) => {
    try {
      const account = client.database.getAccounts([user]);
      resolve(account);
    } catch (error) {
      reject(error);
    }
  });

export const getAccountHistory = (user) =>
  new Promise((resolve, reject) => {
    try {
      const ah = client.call('condenser_api', 'get_account_history', [user, -1, 1000]);
      resolve(ah);
    } catch (error) {
      reject(error);
    }
  });

/**
 * @method getAccount get account data
 * @param user username
 */
export const getState = async (path) => {
  try {
    const state = await client.database.getState(path);
    return state;
  } catch (error) {
    return error;
  }
};

/**
 * @method getUser get account data
 * @param user username
 */
export const getUser = async (user, loggedIn = true) => {
  try {
    const account = await client.database.getAccounts([user]);
    const _account = {
      ...account[0],
    };
    let unreadActivityCount = 0;

    if (account && account.length < 1) {
      return null;
    }

    const globalProperties = getCache('globalDynamic');

    const rcPower =
      (user &&
        (await client.call('rc_api', 'find_rc_accounts', {
          accounts: [user],
        }))) ||
      getCache('rcPower');
    await setCache('rcPower', rcPower);

    if (loggedIn) {
      try {
        unreadActivityCount = await getUnreadActivityCount({
          user,
        });
      } catch (error) {
        unreadActivityCount = 0;
      }
    }

    _account.reputation = getReputation(_account.reputation);
    _account.username = _account.name;
    _account.unread_activity_count = unreadActivityCount;
    _account.vp_manabar = client.rc.calculateVPMana(_account);
    _account.rc_manabar = client.rc.calculateRCMana(rcPower.rc_accounts[0]);
    _account.steem_power = await vestToSteem(
      _account.vesting_shares,
      globalProperties.total_vesting_shares,
      globalProperties.total_vesting_fund_steem || globalProperties.total_vesting_fund_hive,
    );
    _account.received_steem_power = await vestToSteem(
      get(_account, 'received_vesting_shares'),
      get(globalProperties, 'total_vesting_shares'),
      get(globalProperties, 'total_vesting_fund_steem', globalProperties.total_vesting_fund_hive),
    );
    _account.delegated_steem_power = await vestToSteem(
      get(_account, 'delegated_vesting_shares'),
      get(globalProperties, 'total_vesting_shares'),
      get(globalProperties, 'total_vesting_fund_steem', globalProperties.total_vesting_fund_hive),
    );

    if (has(_account, 'posting_json_metadata')) {
      try {
        _account.about = JSON.parse(get(_account, 'posting_json_metadata'));
      } catch (e) {
        //alert(e);
        _account.about = {};
      }
    }

    _account.avatar = getAvatar(get(_account, 'about'));
    _account.display_name = getName(get(_account, 'about'));

    return _account;
  } catch (error) {
    return Promise.reject(error);
  }
};

const cache = {};
const patt = /hive-\d\w+/g;
export const getCommunity = async (tag, observer = '') =>
  new Promise(async (resolve, reject) => {
    try {
      const community = await client.call('bridge', 'get_community', {
        name: tag,
        observer: observer,
      });
      if (community) {
        resolve(community);
      } else {
        resolve({});
      }
    } catch (error) {
      reject(error);
    }
  });

export const getCommunityTitle = async (tag) =>
  new Promise(async (resolve, reject) => {
    if (cache[tag] !== undefined) {
      resolve(cache[tag]);
      return;
    }
    const mm = tag.match(patt);
    if (mm && mm.length > 0) {
      try {
        const community = await client.call('bridge', 'get_community', {
          name: tag,
          observer: '',
        });
        if (community) {
          const { title } = community;
          cache[tag] = title;
          resolve(title);
        } else {
          resolve(tag);
        }
      } catch (error) {
        reject(error);
      }
    }

    resolve(tag);
  });

// TODO: Move to utils folder
export const vestToSteem = async (vestingShares, totalVestingShares, totalVestingFundSteem) =>
  (
    parseFloat(totalVestingFundSteem) *
    (parseFloat(vestingShares) / parseFloat(totalVestingShares))
  ).toFixed(0);

export const getFollows = (username) => client.database.call('get_follow_count', [username]);

export const getFollowing = (follower, startFollowing, followType = 'blog', limit = 100) =>
  client.database.call('get_following', [follower, startFollowing, followType, limit]);

export const getFollowers = (follower, startFollowing, followType = 'blog', limit = 100) =>
  client.database.call('get_followers', [follower, startFollowing, followType, limit]);

export const getIsFollowing = (user, author) =>
  new Promise((resolve, reject) => {
    if (author) {
      client.database
        .call('get_following', [author, user, 'blog', 1])
        .then((result) => {
          if (result[0] && result[0].follower === author && result[0].following === user) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      resolve(false);
    }
  });

export const getFollowSearch = (user, targetUser) =>
  new Promise((resolve, reject) => {
    if (targetUser) {
      client.database
        .call('get_following', [targetUser, user, 'blog', 1])
        .then((result) => {
          if (result[0] && result[0].follower === targetUser && result[0].following === user) {
            resolve(result);
          } else {
            resolve(null);
          }
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      resolve(null);
    }
  });

export const getIsMuted = async (targetUsername, username) => {
  let resp;

  try {
    resp = await getFollowing(username, targetUsername, 'ignore', 1);
  } catch (err) {
    return false;
  }

  if (resp && resp.length > 0) {
    if (resp[0].follower === username && resp[0].following === targetUsername) {
      return true;
    }
  }

  return false;
};

export const ignoreUser = async (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hivesigner.Client({
      accessToken: token,
    });

    return api.ignore(data.follower, data.following);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const json = {
      id: 'follow',
      json: jsonStringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: ['ignore'],
        },
      ]),
      required_auths: [],
      required_posting_auths: [`${data.follower}`],
    };

    return new Promise((resolve, reject) => {
      client.broadcast
        .json(json, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const getActiveVotes = (author, permlink) =>
  new Promise((resolve, reject) => {
    try {
      client
        .call('condenser_api', 'get_active_votes', [author, permlink])
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });

export const getRankedPosts = async (query, currentUserName, filterNsfw) => {
  try {
    let posts = await client.call('bridge', 'get_ranked_posts', query);

    if (posts) {
      posts = parsePosts(posts, currentUserName, true);

      if (filterNsfw !== '0') {
        const updatedPosts = filterNsfwPost(posts, filterNsfw);
        return updatedPosts;
      }
    }
    return posts;
  } catch (error) {
    return error;
  }
};

export const getAccountPosts = async (query, currentUserName, filterNsfw) => {
  try {
    let posts = await client.call('bridge', 'get_account_posts', query);

    if (posts) {
      posts = parsePosts(posts, currentUserName, true);

      if (filterNsfw !== '0') {
        const updatedPosts = filterNsfwPost(posts, filterNsfw);
        return updatedPosts;
      }
    }
    return posts;
  } catch (error) {
    return error;
  }
};

export const getRepliesByLastUpdate = async (query) => {
  try {
    const replies = await client.database.call('get_replies_by_last_update', [
      query.start_author,
      query.start_permlink,
      query.limit,
    ]);
    const groomedComments = parseComments(replies);
    return groomedComments;
  } catch (error) {
    return error;
  }
};

export const getPost = async (author, permlink, currentUserName = null, isPromoted = false) => {
  try {
    const post = await client.database.call('get_content', [author, permlink]);

    return post ? parsePost(post, currentUserName, isPromoted) : null;
  } catch (error) {
    return error;
  }
};

export const isPostAvailable = async (author, permlink) => {
  try {
    const post = await client.database.call('get_content', [author, permlink]);

    return get(post, 'id', 0) !== 0;
  } catch (error) {
    return false;
  }
};

export const getPurePost = async (author, permlink) => {
  try {
    return await client.database.call('get_content', [author, permlink]);
  } catch (error) {
    return error;
  }
};

export const deleteComment = (currentAccount, pin, permlink) => {
  const { name: author } = currentAccount;
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hivesigner.Client({
      accessToken: token,
    });

    const params = {
      author,
      permlink,
    };

    const opArray = [['delete_comment', params]];

    return api.broadcast(opArray).then((resp) => resp.result);
  }

  if (key) {
    const opArray = [
      [
        'delete_comment',
        {
          author,
          permlink,
        },
      ],
    ];

    const privateKey = PrivateKey.fromString(key);

    return client.broadcast.sendOperations(opArray, privateKey);
  }
};

export const getComments = async (author, permlink, currentUserName = null) => {
  try {
    //const comments = await client.call('bridge', 'get_discussion', [author, permlink]);
    const comments = await client.database.call('get_content_replies', [author, permlink]);
    const groomedComments = parseComments(comments, currentUserName);

    return comments ? groomedComments : null;
  } catch (error) {
    return error;
  }
};

/**
 * @method getPostWithComments get user data
 * @param user post author
 * @param permlink post permlink
 */
export const getPostWithComments = async (user, permlink) => {
  let post;
  let comments;

  await getPost(user, permlink).then((result) => {
    post = result;
  });
  await getComments(user, permlink).then((result) => {
    comments = result;
  });

  return [post, comments];
};
const b64uLookup = {
  '/': '_',
  _: '/',
  '+': '-',
  '-': '+',
  '=': '.',
  '.': '=',
};
export const b64uEnc = (str) =>
  Buffer.from(str)
    .toString('base64')
    .replace(/(\+|\/|=)/g, (m) => b64uLookup[m]);
export const signImage = async (file, currentAccount, pin) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    return decryptKey(currentAccount.local.accessToken, digitPinCode);
  }
  if (key) {
    const message = {
      signed_message: { type: 'posting', app: 'ecency.app' },
      authors: [currentAccount.name],
      timestamp: parseInt(new Date().getTime() / 1000, 10),
    };
    const hash = cryptoUtils.sha256(JSON.stringify(message));

    const privateKey = PrivateKey.fromString(key);
    const signature = privateKey.sign(hash).toString();
    message.signatures = [signature];
    return b64uEnc(JSON.stringify(message));
  }
};

/**
 * @method upvote upvote a content
 * @param vote vote object(author, permlink, voter, weight)
 * @param postingKey private posting key
 */

export const vote = (account, pin, author, permlink, weight) =>
  _vote(account, pin, author, permlink, weight).then((resp) => {
    userActivity(account.username, 120, resp.block_num, resp.id);
    return resp;
  });

const _vote = async (currentAccount, pin, author, permlink, weight) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);
  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hivesigner.Client({
      accessToken: token,
    });

    const voter = currentAccount.name;

    return new Promise((resolve, reject) => {
      api
        .vote(voter, author, permlink, weight)
        .then((result) => {
          resolve(result.result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const voter = currentAccount.name;
    const args = {
      voter,
      author,
      permlink,
      weight,
    };

    return new Promise((resolve, reject) => {
      client.broadcast
        .vote(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          if (err && get(err, 'jse_info.code') === 4030100) {
            err.message = getDsteemDateErrorMessage(err);
          }
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

/**
 * @method upvoteAmount estimate upvote amount
 */
export const upvoteAmount = async (input) => {
  let medianPrice;
  const rewardFund = await getRewardFund();

  await client.database.getCurrentMedianHistoryPrice().then((res) => {
    medianPrice = res;
  });

  const estimated =
    (input / parseFloat(rewardFund.recent_claims)) *
    parseFloat(rewardFund.reward_balance) *
    (parseFloat(medianPrice.base) / parseFloat(medianPrice.quote));
  return estimated;
};

export const transferToken = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(
    {
      activeKey: get(currentAccount, 'local.activeKey'),
    },
    digitPinCode,
  );

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = {
      from: get(data, 'from'),
      to: get(data, 'destination'),
      amount: get(data, 'amount'),
      memo: get(data, 'memo'),
    };

    return new Promise((resolve, reject) => {
      client.broadcast
        .transfer(args, privateKey)
        .then((result) => {
          if (result) {
            resolve(result);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const convert = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(
    {
      activeKey: get(currentAccount, 'local.activeKey'),
    },
    digitPinCode,
  );

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const args = [
      [
        'convert',
        {
          owner: get(data, 'from'),
          amount: get(data, 'amount'),
          requestid: get(data, 'requestId'),
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(args, privateKey)
        .then((result) => {
          if (result) {
            resolve(result);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const transferToSavings = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(
    {
      activeKey: get(currentAccount, 'local.activeKey'),
    },
    digitPinCode,
  );

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const args = [
      [
        'transfer_to_savings',
        {
          from: get(data, 'from'),
          to: get(data, 'destination'),
          amount: get(data, 'amount'),
          memo: get(data, 'memo'),
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const transferFromSavings = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(
    {
      activeKey: get(currentAccount, 'local.activeKey'),
    },
    digitPinCode,
  );

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'transfer_from_savings',
        {
          from: get(data, 'from'),
          to: get(data, 'destination'),
          amount: get(data, 'amount'),
          memo: get(data, 'memo'),
          request_id: get(data, 'requestId'),
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const transferToVesting = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(
    {
      activeKey: get(currentAccount, 'local.activeKey'),
    },
    digitPinCode,
  );

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'transfer_to_vesting',
        {
          from: data.from,
          to: data.destination,
          amount: data.amount,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const withdrawVesting = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(
    {
      activeKey: get(currentAccount, 'local.activeKey'),
    },
    digitPinCode,
  );

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'withdraw_vesting',
        {
          account: data.from,
          vesting_shares: data.amount,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const delegateVestingShares = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(
    {
      activeKey: get(currentAccount, 'local.activeKey'),
    },
    digitPinCode,
  );

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'delegate_vesting_shares',
        {
          delegator: data.from,
          delegatee: data.destination,
          vesting_shares: data.amount,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const setWithdrawVestingRoute = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(
    {
      activeKey: get(currentAccount, 'local.activeKey'),
    },
    digitPinCode,
  );

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'set_withdraw_vesting_route',
        {
          from_account: data.from,
          to_account: data.to,
          percent: data.percentage,
          auto_vest: data.autoVest,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const getWithdrawRoutes = (account) =>
  client.database.call('get_withdraw_routes', [account, 'outgoing']);

export const followUser = async (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hivesigner.Client({
      accessToken: token,
    });

    return api.follow(data.follower, data.following);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const json = {
      id: 'follow',
      json: jsonStringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: ['blog'],
        },
      ]),
      required_auths: [],
      required_posting_auths: [`${data.follower}`],
    };

    return new Promise((resolve, reject) => {
      client.broadcast
        .json(json, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const unfollowUser = async (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hivesigner.Client({
      accessToken: token,
    });

    return api.unfollow(data.follower, data.following);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const json = {
      id: 'follow',
      json: jsonStringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: [],
        },
      ]),
      required_auths: [],
      required_posting_auths: [`${data.follower}`],
    };

    return new Promise((resolve, reject) => {
      client.broadcast
        .json(json, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const lookupAccounts = async (username) => {
  try {
    const users = await client.database.call('lookup_accounts', [username, 20]);
    return users;
  } catch (error) {
    console.log('lookup_accounts');
    throw error;
  }
};

export const getTrendingTags = async (tag) => {
  try {
    const users = await client.database.call('get_trending_tags', [tag, 20]);
    return users;
  } catch (error) {
    console.log('get_trending_tags');
    throw error;
  }
};

export const postContent = (
  account,
  pin,
  parentAuthor,
  parentPermlink,
  permlink,
  title,
  body,
  jsonMetadata,
  options = null,
  voteWeight = null,
  isEdit = false,
) =>
  _postContent(
    account,
    pin,
    parentAuthor,
    parentPermlink,
    permlink,
    title,
    body,
    jsonMetadata,
    options,
    voteWeight,
  ).then((resp) => {
    const t = title ? 100 : 110;
    const { block_num, id } = resp;
    if (!isEdit) {
      userActivity(account.username, t, block_num, id);
    }
    return resp;
  });

/**
 * @method postComment post a comment/reply
 * @param comment comment object { author, permlink, ... }
 */
const _postContent = async (
  account,
  pin,
  parentAuthor,
  parentPermlink,
  permlink,
  title,
  body,
  jsonMetadata,
  options = null,
  voteWeight = null,
) => {
  const { name: author } = account;
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(account.local, digitPinCode);

  if (account.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(account.local.accessToken, digitPinCode);
    const api = new hivesigner.Client({
      accessToken: token,
    });

    const params = {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink || '',
      author,
      permlink,
      title,
      body,
      json_metadata: jsonStringify(jsonMetadata),
    };

    const opArray = [['comment', params]];

    if (options) {
      const e = ['comment_options', options];
      opArray.push(e);
    }

    if (voteWeight) {
      const e = [
        'vote',
        {
          voter: author,
          author,
          permlink,
          weight: voteWeight,
        },
      ];
      opArray.push(e);
    }

    return api.broadcast(opArray).then((resp) => resp.result);
  }

  if (key) {
    const opArray = [
      [
        'comment',
        {
          parent_author: parentAuthor,
          parent_permlink: parentPermlink,
          author,
          permlink,
          title,
          body,
          json_metadata: jsonStringify(jsonMetadata),
        },
      ],
    ];

    if (options) {
      const e = ['comment_options', options];
      opArray.push(e);
    }

    if (voteWeight) {
      const e = [
        'vote',
        {
          voter: author,
          author,
          permlink,
          weight: voteWeight,
        },
      ];
      opArray.push(e);
    }

    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          if (error && get(error, 'jse_info.code') === 4030100) {
            error.message = getDsteemDateErrorMessage(error);
          }
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

// Re-blog
// TODO: remove pinCode
export const reblog = (account, pinCode, author, permlink) =>
  _reblog(account, pinCode, author, permlink).then((resp) => {
    userActivity(account.name, 130, resp.block_num, resp.id);
    return resp;
  });

const _reblog = async (account, pinCode, author, permlink) => {
  const pin = getDigitPinCode(pinCode);
  const key = getAnyPrivateKey(account.local, pin);

  if (account.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(account.local.accessToken, pin);
    const api = new hivesigner.Client({
      accessToken: token,
    });

    const follower = account.name;

    return api.reblog(follower, author, permlink).then((resp) => resp.result);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const follower = account.name;

    const json = {
      id: 'follow',
      json: jsonStringify([
        'reblog',
        {
          account: follower,
          author,
          permlink,
        },
      ]),
      required_auths: [],
      required_posting_auths: [follower],
    };

    return client.broadcast.json(json, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const claimRewardBalance = (account, pinCode, rewardSteem, rewardSbd, rewardVests) => {
  const pin = getDigitPinCode(pinCode);
  const key = getAnyPrivateKey(get(account, 'local'), pin);

  if (account.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(get(account, 'local.accessToken'), pin);
    const api = new hivesigner.Client({
      accessToken: token,
    });

    return api.claimRewardBalance(get(account, 'name'), rewardSteem, rewardSbd, rewardVests);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'claim_reward_balance',
        {
          account: account.name,
          reward_hive: rewardSteem,
          reward_hbd: rewardSbd,
          reward_vests: rewardVests,
        },
      ],
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const transferPoint = (currentAccount, pinCode, data) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);
  const username = get(currentAccount, 'name');

  const json = JSON.stringify({
    sender: get(data, 'from'),
    receiver: get(data, 'destination'),
    amount: get(data, 'amount'),
    memo: get(data, 'memo'),
  });

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const op = {
      id: 'esteem_point_transfer',
      json,
      required_auths: [username],
      required_posting_auths: [],
    };

    return client.broadcast.json(op, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const promote = (currentAccount, pinCode, duration, permlink, author) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const user = get(currentAccount, 'name');

    const json = {
      id: 'esteem_promote',
      json: JSON.stringify({
        user,
        author,
        permlink,
        duration,
      }),
      required_auths: [user],
      required_posting_auths: [],
    };

    return client.broadcast.json(json, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const boost = (currentAccount, pinCode, point, permlink, author) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);

  if (key && point) {
    const privateKey = PrivateKey.fromString(key);
    const user = get(currentAccount, 'name');

    const json = {
      id: 'esteem_boost',
      json: JSON.stringify({
        user,
        author,
        permlink,
        amount: `${point.toFixed(3)} POINT`,
      }),
      required_auths: [user],
      required_posting_auths: [],
    };

    return client.broadcast.json(json, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const grantPostingPermission = async (json, pin, currentAccount) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  const newPosting = Object.assign(
    {},
    {
      ...get(currentAccount, 'posting'),
    },
    {
      account_auths: [
        ...get(currentAccount, 'posting.account_auths'),
        ['ecency.app', get(currentAccount, 'posting.weight_threshold')],
      ],
    },
  );
  newPosting.account_auths.sort();
  if (get(currentAccount, 'local.authType') === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hivesigner.Client({
      accessToken: token,
    });
    const _params = {
      account: get(currentAccount, 'name'),
      posting: newPosting,
      memo_key: get(currentAccount, 'memo_key'),
      json_metadata: json,
    };

    const opArray = [['account_update', _params]];

    return api
      .broadcast(opArray)
      .then((resp) => resp.result)
      .catch((error) => console.log(error));
  }

  if (key) {
    const opArray = [
      [
        'account_update',
        {
          account: get(currentAccount, 'name'),
          memo_key: get(currentAccount, 'memo_key'),
          json_metadata: json,
          posting: newPosting,
        },
      ],
    ];
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          if (error && get(error, 'jse_info.code') === 4030100) {
            error.message = getDsteemDateErrorMessage(error);
          }
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const profileUpdate = async (params, pin, currentAccount) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(get(currentAccount, 'local'), digitPinCode);

  if (get(currentAccount, 'local.authType') === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hivesigner.Client({
      accessToken: token,
    });

    const _params = {
      account: get(currentAccount, 'name'),
      json_metadata: '',
      posting_json_metadata: jsonStringify({ profile: params }),
      extensions: [],
    };

    const opArray = [['account_update2', _params]];

    return api
      .broadcast(opArray)
      .then((resp) => resp.result)
      .catch((error) => console.log(error));
  }

  if (key) {
    const opArray = [
      [
        'account_update2',
        {
          account: get(currentAccount, 'name'),
          json_metadata: '',
          posting_json_metadata: jsonStringify({ profile: params }),
          extensions: [],
        },
      ],
    ];

    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      client.broadcast
        .sendOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          if (error && get(error, 'jse_info.code') === 4030100) {
            error.message = getDsteemDateErrorMessage(error);
          }
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const subscribeCommunity = (currentAccount, pinCode, data) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);
  const username = get(currentAccount, 'name');

  const json = JSON.stringify([
    data.isSubscribed ? 'unsubscribe' : 'subscribe',
    { community: data.communityId },
  ]);

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const op = {
      id: 'community',
      json,
      required_auths: [username],
      required_posting_auths: [],
    };

    return client.broadcast.json(op, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const getBtcAddress = (pin, currentAccount) => {
  /*const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  if (key) {
    const keyPair = bitcoin.ECPair.fromWIF(key);
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

    // console.log('btc address', address);
    return { address: address };
  }
  */
  return {
    address: '',
  };
};

// HELPERS

const getAnyPrivateKey = (local, pin) => {
  const { postingKey, activeKey } = local;

  if (activeKey) {
    return decryptKey(local.activeKey, pin);
  }

  if (postingKey) {
    return decryptKey(local.postingKey, pin);
  }

  return false;
};

const getActiveKey = (local, pin) => {
  const { activeKey } = local;

  if (activeKey) {
    return decryptKey(local.activeKey, pin);
  }

  return false;
};
/* eslint-enable */
