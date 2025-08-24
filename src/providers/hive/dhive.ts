/* eslint-disable camelcase */
// import '../../../shim';
// import * as bitcoin from 'bitcoinjs-lib';

import {
  Client,
  cryptoUtils,
  utils,
  Types,
  Transaction,
  Operation,
  TransactionConfirmation,
} from '@hiveio/dhive';
import { PrivateKey } from '@esteemapp/dhive';
import bytebuffer from 'bytebuffer';
import * as Crypto from 'expo-crypto';

import { Client as hsClient } from 'hivesigner';
import Config from 'react-native-config';
import { get, has } from 'lodash';
import * as hiveuri from 'hive-uri';
import * as Sentry from '@sentry/react-native';
import { getServer, getCache, setCache } from '../../realm/realm';

// Utils
import { decryptKey } from '../../utils/crypto';
import {
  parsePost,
  parseComments,
  parseCommentThreads,
  parseDiscussionCollection,
} from '../../utils/postParser';
import { getName, getAvatar, parseReputation } from '../../utils/user';
import parseToken from '../../utils/parseToken';
import parseAsset from '../../utils/parseAsset';
import filterNsfwPost from '../../utils/filterNsfwPost';
import { jsonStringify } from '../../utils/jsonUtils';
import { getDsteemDateErrorMessage } from '../../utils/dsteemUtils';

// Constant
import AUTH_TYPE from '../../constants/authType';
import { SERVER_LIST } from '../../constants/options/api';
import { b64uEnc } from '../../utils/b64';
import TransferTypes from '../../constants/transferTypes';

interface LocalAccount {
  authType: string;
  accessToken: string;
}

interface CurrentAccount {
  username: string;
  local: LocalAccount;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = global.Buffer || require('buffer').Buffer;

const DEFAULT_SERVER = SERVER_LIST;
let client = new Client(DEFAULT_SERVER, {
  timeout: 4000,
  failoverThreshold: 10,
  consoleOnFailover: true,
});

export const checkClient = async () => {
  const selectedServer = DEFAULT_SERVER;

  await getServer().then((response) => {
    if (response) {
      selectedServer.unshift(response);
    }
  });

  client = new Client(selectedServer, {
    timeout: 4000,
    failoverThreshold: 10,
    consoleOnFailover: true,
  });
};

checkClient();

/**
 * Computes the SHA-256 hash of the input.
 *
 * @param {Buffer} input - The input data to hash (either a Buffer or a string).
 * @returns {Promise<Buffer>} - A Promise that resolves to the hash as a Buffer.
 */
const sha256 = async (input: Buffer | Uint8Array): Promise<Buffer> => {
  // Convert input buffer to a int8array
  const inputData = new Int8Array(input);

  // Compute the SHA-256 hash using expo-crypto
  const hash = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, inputData);

  // Convert the hexadecimal hash string back to a Buffer
  return Buffer.from(hash, 'hex');
};

export const generateTrxId = async (transaction: Transaction): Promise<string> => {
  const buffer = new bytebuffer(bytebuffer.DEFAULT_CAPACITY, bytebuffer.LITTLE_ENDIAN);
  try {
    Types.Transaction(buffer, transaction);
  } catch (cause) {
    console.warn('SerializationError', cause);
  }
  buffer.flip();
  const transactionData = Buffer.from(buffer.toBuffer());
  const _bufferHash = await sha256(transactionData);
  return _bufferHash.toString('hex').slice(0, 40); // CryptoJS.enc.Hex;
};

export const sendHiveOperations = async (
  operations: Operation[],
  key: PrivateKey | PrivateKey[],
): Promise<TransactionConfirmation> => {
  try {
    const { head_block_number, head_block_id, time } = await getDynamicGlobalProperties();
    const ref_block_num = head_block_number & 0xffff;
    const ref_block_prefix = Buffer.from(head_block_id, 'hex').readUInt32LE(4);
    const expireTime = 60 * 1000;
    const chainId = Buffer.from(
      'beeab0de00000000000000000000000000000000000000000000000000000000',
      'hex',
    );
    const expiration = new Date(new Date(`${time}Z`).getTime() + expireTime)
      .toISOString()
      .slice(0, -5);
    const extensions = [];

    const tx: Transaction = {
      expiration,
      extensions,
      operations,
      ref_block_num,
      ref_block_prefix,
    };

    const transaction = await cryptoUtils.signTransaction(tx, key, chainId);
    const trxId = await generateTrxId(transaction);
    const resultHive = await client.broadcast.call('broadcast_transaction', [transaction]);
    const result = Object.assign({ id: trxId }, resultHive);
    return result;
  } catch (err) {
    Sentry.captureException(err, (scope) => {
      scope.setTag('context', 'send-hive-operations');
      scope.setContext('operationsArray', { operations });
    });
    throw err;
  }
};

/** reuseable broadcast json method with posting auth */

export const broadcastPostingJSON = async (
  id: string,
  json: unknown,
  currentAccount: CurrentAccount,
  pinHash: string,
): Promise<TransactionConfirmation> => {
  const digitPinCode = getDigitPinCode(pinHash);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    return api
      .customJson([], [currentAccount.username], id, JSON.stringify(json))
      .then((r) => r.result as TransactionConfirmation);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const custom_json = {
      id,
      json: JSON.stringify(json),
      required_auths: [],
      required_posting_auths: [currentAccount.username],
    };
    const opArray: Operation[] = [['custom_json', custom_json] as Operation];

    return new Promise<TransactionConfirmation>((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
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

export const buildActiveCustomJsonOpArr = (
  username: string,
  operationId: string,
  json: unknown,
): Operation[] => {
  return [
    [
      'custom_json',
      {
        id: operationId,
        json: JSON.stringify(json),
        required_auths: [username],
        required_posting_auths: [],
      },
    ] as Operation,
  ];
};

export const getDigitPinCode = (pin) => decryptKey(pin, Config.PIN_KEY);

export const getDynamicGlobalProperties = () => client.database.getDynamicGlobalProperties();

export const getRewardFund = () => client.database.call('get_reward_fund', ['post']);

export const getMarketStatistics = () => client.call('condenser_api', 'get_ticker', []);

export const getOrderBook = (limit = 500) =>
  client.call('condenser_api', 'get_order_book', [limit]);

export const getFeedHistory = async () => {
  try {
    const feedHistory = await client.database.call('get_feed_history');
    return feedHistory;
  } catch (error) {
    return error;
  }
};

export const getCurrentMedianHistoryPrice = async () => {
  try {
    const feedHistory = await client.database.call('get_current_median_history_price');
    return feedHistory;
  } catch (error) {
    return error;
  }
};

export const fetchGlobalProps = async () => {
  let globalDynamic;
  let medianHistory;
  let rewardFund;

  try {
    globalDynamic = await getDynamicGlobalProperties();
    await setCache('globalDynamic', globalDynamic);
    medianHistory = await getFeedHistory();
    rewardFund = await getRewardFund();
  } catch (e) {
    return;
  }

  const hivePerMVests =
    (parseToken(get(globalDynamic, 'total_vesting_fund_hive')) /
      parseToken(get(globalDynamic, 'total_vesting_shares'))) *
    1e6;
  const hbdPrintRate = get(globalDynamic, 'hbd_print_rate');
  const base = parseAsset(get(medianHistory, 'current_median_history.base')).amount;
  const quote = parseAsset(get(medianHistory, 'current_median_history.quote')).amount;
  const fundRecentClaims = get(rewardFund, 'recent_claims');
  const fundRewardBalance = parseToken(get(rewardFund, 'reward_balance'));
  const globalProps = {
    hivePerMVests,
    base,
    quote,
    fundRecentClaims,
    fundRewardBalance,
    hbdPrintRate,
  };

  return globalProps;
};

/**
 * fetches all tranding orders that are not full-filled yet
 * @param {string} username
 * @returns {Promise<OpenOrderItem[]>} array of openorders both hive and hbd
 */
export const getOpenOrders = async (username) => {
  try {
    const rawData = await client.call('condenser_api', 'get_open_orders', [username]);
    if (!rawData || !rawData.length) {
      return [];
    }
    return rawData;
  } catch (err) {
    console.warn('Failed to get open orders', err);
    return [];
  }
};

/**
 * fetchs all pending converstion requests that are yet to be fullfilled
 * @param {string} account
 * @returns {Promise<ConversionRequest[]>}  array of conversion requests
 */
export const getConversionRequests = async (username) => {
  try {
    const rawData = await client.database.call('get_conversion_requests', [username]);
    if (!rawData || !rawData.length) {
      return [];
    }
    return rawData;
  } catch (err) {
    console.warn('Failed to get open orders', err);
    return [];
  }
};

/**
 * fetchs all pending converstion requests that are yet to be fullfilled
 * @param {string} account
 * @returns {Promise<SavingsWithdrawRequest[]>}  array of requested savings withdraw
 */

export const getSavingsWithdrawFrom = async (username) => {
  try {
    const rawData = await client.database.call('get_savings_withdraw_from', [username]);
    if (!rawData || !rawData.length) {
      return [];
    }
    return rawData;
  } catch (err) {
    console.warn('Failed to get open orders', err);
    return [];
  }
};

/**
 * @method getAccount fetch raw account data without post processings
 * @param username username
 */
export const getAccount = (username) =>
  new Promise((resolve, reject) => {
    client.database
      .getAccounts([username])
      .then((response) => {
        if (response.length) {
          resolve(response[0]);
        }
        throw new Error(`Account not found, ${JSON.stringify(response)}`);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const getAccountHistory = (user, operations, startIndex = -1, limit = 1000) =>
  new Promise((resolve, reject) => {
    const wallet_operations_bitmask = utils.makeBitMaskFilter(operations);
    try {
      const ah = client.call('condenser_api', 'get_account_history', [
        user,
        startIndex,
        limit,
        ...wallet_operations_bitmask,
      ]);
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
export const getUser = async (user) => {
  try {
    const account = await client.database.getAccounts([user]);
    const _account = {
      ...account[0],
    };
    const unreadActivityCount = 0;

    if (account && account.length < 1) {
      return null;
    }

    let globalProperties;
    try {
      globalProperties = await getDynamicGlobalProperties();
    } catch (error) {
      globalProperties = getCache('globalDynamic');
    }

    const rcPower =
      (user &&
        (await client.call('rc_api', 'find_rc_accounts', {
          accounts: [user],
        }))) ||
      getCache('rcPower');
    await setCache('rcPower', rcPower);

    _account.reputation = await getUserReputation(user);
    _account.username = _account.name;
    _account.unread_activity_count = unreadActivityCount;
    _account.vp_manabar = client.rc.calculateVPMana(_account);
    _account.rc_manabar = client.rc.calculateRCMana(rcPower.rc_accounts[0]);
    _account.steem_power = await vestToSteem(
      _account.vesting_shares,
      globalProperties.total_vesting_shares,
      globalProperties.total_vesting_fund_hive,
    );
    _account.received_steem_power = await vestToSteem(
      get(_account, 'received_vesting_shares'),
      get(globalProperties, 'total_vesting_shares'),
      get(globalProperties, 'total_vesting_fund_hive'),
    );
    _account.delegated_steem_power = await vestToSteem(
      get(_account, 'delegated_vesting_shares'),
      get(globalProperties, 'total_vesting_shares'),
      get(globalProperties, 'total_vesting_fund_hive'),
    );

    if (has(_account, 'posting_json_metadata')) {
      try {
        _account.about = JSON.parse(get(_account, 'posting_json_metadata'));
      } catch (e) {
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

export const getUserReputation = async (author) => {
  try {
    const response = await client.call('condenser_api', 'get_account_reputations', [author, 1]);

    if (response && response.length < 1) {
      return 0;
    }

    const _account = {
      ...response[0],
    };

    return parseReputation(_account.reputation);
  } catch (error) {
    Sentry.captureException(error);
    return 0;
  }
};

const cache = {};
const patt = /hive-\d\w+/g;
export const getCommunity = async (tag, observer = '') => {
  try {
    const community = await client.call('bridge', 'get_community', {
      name: tag,
      observer,
    });
    if (community) {
      return community;
    } else {
      return {};
    }
  } catch (err) {
    Sentry.captureException(err, (scope) => {
      scope.setContext('info', { message: 'failed to get community' });
    });
    throw err;
  }
};

export const getCommunityTitle = async (tag) => {
  if (cache[tag] !== undefined) {
    return cache[tag];
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
        return title;
      } else {
        return tag;
      }
    } catch (err) {
      Sentry.captureMessage('failed to get community title');
      throw err;
    }
  } else {
    return tag;
  }
};

export const getCommunities = async (
  last = '',
  limit = 100,
  query = null,
  sort = 'rank',
  observer = '',
) => {
  try {
    console.log('Getting communities', query);
    const data = await client.call('bridge', 'list_communities', {
      last,
      limit,
      query,
      sort,
      observer,
    });
    if (data) {
      return data;
    } else {
      return {};
    }
  } catch (error) {
    console.warn('failed to get communities', error);
    Sentry.captureException(error, (scope) => {
      scope.setContext('info', { message: 'failed to get communities' });
    });
    return {};
  }
};

export const getSubscriptions = async (account = '') => {
  try {
    const data = await client.call('bridge', 'list_all_subscriptions', {
      account,
    });
    if (data) {
      return data;
    } else {
      return {};
    }
  } catch (error) {
    Sentry.captureException(error, (scope) => {
      scope.setContext('info', { message: 'failed to get subscriptions' });
    });
    throw error;
  }
};

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

export const getMutes = async (currentUsername) => {
  try {
    const type = 'ignore';
    const limit = 1000;
    const response = await client.database.call('get_following', [
      currentUsername,
      '',
      type,
      limit,
    ]);
    if (!response) {
      return [];
    }
    return response.map((item) => item.following);
  } catch (err) {
    console.warn('Failed to get muted accounts', err);
    Sentry.captureException(err);
    return [];
  }
};

export const getRelationship = (follower, following) =>
  new Promise((resolve, reject) => {
    if (follower) {
      client
        .call('bridge', 'get_relationship_between_accounts', [follower, following])
        .then((result) => {
          if (result) {
            resolve(result);
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

/** DEPRECATED - Do not use this method and it's an invalid use of get_following call
 *  almost always returns wrong data, espacially when user is not in following or follwers list */
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

export const ignoreUser = async (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
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
    const opArray = [['custom_json', json]];

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
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

export const getProposalsVoted = async (username) => {
  try {
    if (!username) {
      throw new Error('invalid parameters');
    }

    console.log('Getting proposals voted:', username);

    const votedProposals = await client.call('condenser_api', 'list_proposal_votes', [
      [username],
      100,
      'by_voter_proposal',
      'ascending',
      'active',
    ]);

    if (!Array.isArray(votedProposals)) {
      throw new Error('invalid data');
    }

    const filteredProposals = votedProposals.filter((item) => item.voter === username);

    console.log(`Returning filtered proposals`, filteredProposals);
    return filteredProposals;
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
};

export const getActiveVotes = (author, permlink) =>
  new Promise((resolve, reject) => {
    try {
      console.log('Getting active votes', author, permlink);
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

export const getPostReblogs = async (author, permlink) => {
  try {
    if (!author || !permlink) {
      throw new Error('invalid parameters');
    }

    console.log('Getting post reblogs:', author, permlink);

    const reblogs = await client.call('condenser_api', 'get_reblogged_by', [author, permlink]);

    if (!reblogs) {
      throw new Error('invalid data');
    }

    console.log(`Returning reblogs`, reblogs);
    return reblogs;
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
};

export const getRankedPosts = async (query, currentUserName, filterNsfw) => {
  try {
    console.log('Getting ranked posts:', query);

    let posts = await client.call('bridge', 'get_ranked_posts', query);

    if (posts) {
      const areComments = query.sort === 'comments' || query.sort === 'replies';

      posts = areComments
        ? parseComments(posts)
        : await resolvePosts(posts, currentUserName, false);

      if (filterNsfw !== '0') {
        const updatedPosts = filterNsfwPost(posts, filterNsfw);
        return updatedPosts;
      }
    }
    console.log(`Returning fetched posts: ${posts}` ? posts.length : null);
    return posts;
  } catch (error) {
    return error;
  }
};

export const getAccountPosts = async (query, currentUserName, filterNsfw) => {
  try {
    console.log('Getting account posts: ', query);
    let posts = await client.call('bridge', 'get_account_posts', query);

    if (posts) {
      const areComments = query.sort === 'comments' || query.sort === 'replies';

      posts = areComments
        ? parseComments(posts)
        : await resolvePosts(posts, currentUserName, false);

      if (filterNsfw !== '0') {
        const updatedPosts = filterNsfwPost(posts, filterNsfw);
        return updatedPosts;
      }
    }
    console.log(`Returning fetched posts: ${posts}` ? posts.length : null);
    return posts;
  } catch (error) {
    return error;
  }
};

export const getRepliesByLastUpdate = async (query) => {
  try {
    console.log('Getting replies: ', query);
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
  author = author && author.toLowerCase();
  permlink = permlink && permlink.toLowerCase();
  try {
    console.log('Getting post: ', author, permlink);
    const post = await client.call('bridge', 'get_post', { author, permlink });
    console.log('post fetched', post?.post_id);
    // TODO check for cross post, resolve it
    return post ? await resolvePost(post, currentUserName, isPromoted) : null;
  } catch (error) {
    console.warn(error);
    Sentry.captureException(error);
    return error;
  }
};

export const isPostAvailable = async (author, permlink) => {
  author = author && author.toLowerCase();
  permlink = permlink && permlink.toLowerCase();
  try {
    const post = await client.call('bridge', 'get_post', { author, permlink });
    return get(post, 'post_id', 0) !== 0;
  } catch (error) {
    return false;
  }
};

export const getPurePost = async (author, permlink) => {
  author = author && author.toLowerCase();
  permlink = permlink && permlink.toLowerCase();
  try {
    return await client.call('bridge', 'get_post', { author, permlink });
  } catch (error) {
    console.warn('Failed to get pure post', error);
    Sentry.captureException(error);
    return error;
  }
};

export const deleteComment = (currentAccount, pin, permlink) => {
  const { name: author } = currentAccount;
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
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

    return sendHiveOperations(opArray, privateKey);
  }
};

export const getDiscussionCollection = async (author, permlink) => {
  try {
    const commentsMap = await client.call('bridge', 'get_discussion', { author, permlink });

    const _parsedCollection = await parseDiscussionCollection(commentsMap);
    return _parsedCollection;
  } catch (error) {
    console.warn('failed to fetch discusssion', error, author, permlink);
    return error;
  }
};

export const getComments = async (author, permlink) => {
  try {
    const commentsMap = await client.call('bridge', 'get_discussion', { author, permlink });

    // it appear the get_discussion fetches the parent post as an intry in thread
    // may be later we can make use of this to save post fetch call in post display
    // for now, deleting to keep the change footprint small for PR
    delete commentsMap[`${author}/${permlink}`];

    const groomedComments = parseCommentThreads(commentsMap, author, permlink);
    return groomedComments;
  } catch (error) {
    return error;
  }
};

// resolve individual post based on simple or cross post
const resolvePost = async (
  post,
  currentUsername,
  isPromoted = false,
  isList = false,
  discardBody = false,
) => {
  if (post) {
    const json = post.json_metadata;
    if (
      json?.original_author &&
      json?.original_permlink &&
      json?.tags &&
      json?.tags[0] === 'cross-post'
    ) {
      // fetch and replace cross post with original post with cross post meta
      const originalPost = await getPost(json.original_author, json.original_permlink);

      // inject cross poster usename and community id in origin post
      originalPost.crosspostMeta = {
        author: post.author,
        community: post.category,
        message: post.body,
      };

      return originalPost;
    } else {
      return parsePost(post, currentUsername, isPromoted, false, isList, discardBody);
    }
  }
  return null;
};

// resolves posts to be used in the feed,
const resolvePosts = async (posts, currentUsername) => {
  if (posts) {
    const formattedPosts = posts.map(async (post) => resolvePost(post, currentUsername));

    console.log('formatted posts', formattedPosts);
    const _formattedPost = await Promise.all(formattedPosts);
    return _formattedPost;
  }
  return null;
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

export const signImage = async (file, currentAccount, pin) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (isHsClientSupported(currentAccount.local.authType)) {
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

// /**
//  * @method getBlockNum return block num based on transaction id
//  * @param trx_id transactionId
//  */
// const getBlockNum = async (trx_id) => {
//   try {
//     console.log('Getting transaction data', trx_id);
//     const transData = await client.call('condenser_api', 'get_transaction', [trx_id]);
//     const blockNum = transData.block_num;
//     console.log('Block number', blockNum);
//     return blockNum;
//   } catch (err) {
//     console.warn('Failed to get transaction data: ', err);
//     return undefined;
//   }
// };

/**
 * @method upvote upvote a content
 * @param vote vote object(author, permlink, voter, weight)
 * @param postingKey private posting key
 */

export const vote = async (account, pin, author, permlink, weight) => {
  try {
    const resp = await _vote(account, pin, author, permlink, weight);
    console.log('Returning vote response', resp);

    return resp;
  } catch (err) {
    console.warn('Failed to complete vote', err);
    return Promise.reject(err);
  }
};

const _vote = (currentAccount, pin, author, permlink, weight) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);
  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
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
          Sentry.captureException(err);
          reject(err);
        });
    });
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const voter = currentAccount.name;
    const args = [
      [
        'vote',
        {
          voter,
          author,
          permlink,
          weight,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      sendHiveOperations(args, privateKey)
        .then((result) => {
          console.log('vote result', result);
          resolve(result);
        })
        .catch((err) => {
          if (err && get(err, 'jse_info.code') === 4030100) {
            err.message = getDsteemDateErrorMessage(err);
          }
          Sentry.captureException(err);
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

/**
 * Update Hive Proposal Vote with current account as voter
 * @param {*} currentAccount
 * @param {*} pin
 * @param {*} proposalId
 * @returns
 */
export const voteProposal = (currentAccount, pinHash, proposalId) => {
  const digitPinCode = getDigitPinCode(pinHash);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  const voter = currentAccount.name;
  const opArray = [
    [
      'update_proposal_votes',
      {
        voter,
        proposal_ids: [proposalId],
        approve: true,
        extensions: [],
      },
    ],
  ];

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    return api.broadcast(opArray).then((resp) => resp.result);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          console.log('vote result', result);
          resolve(result);
        })
        .catch((err) => {
          if (err && get(err, 'jse_info.code') === 4030100) {
            err.message = getDsteemDateErrorMessage(err);
          }
          Sentry.captureException(err);
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

    const destinationInput = data.destination;

    // Split the destination input into an array of usernames
    // Handles both spaces and commas as separators
    const destinations = destinationInput
      ? destinationInput.trim().split(/[\s,]+/) // Split by spaces or commas
      : [];

    // Prepare the base arguments for the transfer operation
    const baseArgs = {
      from: data.from,
      amount: data.amount,
      memo: data.memo,
    };

    // Create a transfer operation for each destination username
    const opArray = destinations.map((destination) => {
      const args = { ...baseArgs, to: destination.trim() }; // Trim whitespace
      return ['transfer', args];
    });

    console.log(opArray); // Output the array of operations

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
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

export const recurrentTransferToken = (currentAccount, pin, data) => {
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
      recurrence: get(data, 'recurrence'),
      executions: get(data, 'executions'),
      extensions: [],
    };

    const opArray = [[TransferTypes.RECURRENT_TRANSFER, args]];

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          if (result) {
            resolve(result);
          }
        })
        .catch((err) => {
          console.log('====================================');
          console.log('error on recurrent transfer token');
          console.log('====================================');
          console.log(err);
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
      sendHiveOperations(args, privateKey)
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
      sendHiveOperations(args, privateKey)
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
      sendHiveOperations(args, privateKey)
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
      sendHiveOperations(args, privateKey)
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
      sendHiveOperations(args, privateKey)
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
      sendHiveOperations(args, privateKey)
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

/**
 *
 * @param {string} username
 * @param {string} fromDelegatee
 * @param {number} limit
 * @returns {Array} Array of vesting delegation objects [{
 *  delegatee:string;
 *  delegator:string;
 *  id: number;
 *  min_delegation_time: string;
 *  vesting_shares": string'
 * }]
 */
export const getVestingDelegations = async (username, fromDelegatee = '', limit = 1000) => {
  try {
    const response = await client.database.call('get_vesting_delegations', [
      username,
      fromDelegatee,
      limit,
    ]);
    console.log('Vested delegatees response', response);
    return response;
  } catch (err) {
    console.warn('Failed to get vested delegatees');
    Sentry.captureException(err);
  }
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
      sendHiveOperations(args, privateKey)
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

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hsClient({
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
    const opArray = [['custom_json', json]];

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
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

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
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
    const opArray = [['custom_json', json]];
    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
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

export const markHiveNotifications = async (currentAccount, pinHash) => {
  const digitPinCode = getDigitPinCode(pinHash);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  const now = new Date().toISOString();
  const date = now.split('.')[0];

  const params = {
    id: 'notify',
    required_auths: [],
    required_posting_auths: [currentAccount.name],
    json: JSON.stringify(['setLastRead', { date }]),
  };
  const params1 = {
    id: 'ecency_notify',
    required_auths: [],
    required_posting_auths: [currentAccount.name],
    json: JSON.stringify(['setLastRead', { date }]),
  };

  const opArray: Operation[] = [
    ['custom_json', params],
    ['custom_json', params1],
  ];

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    return api.broadcast(opArray).then((resp) => resp.result);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
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
    return [];
    // throw error;
  }
};

export const getTrendingTags = async (tag, number = 20) => {
  try {
    const tags = await client.database.call('get_trending_tags', [tag, number]);
    return tags;
  } catch (error) {
    return [];
    // throw error;
  }
};

export const getRecurrentTransfers = async (username) => {
  try {
    const rawData = await client.call('condenser_api', 'find_recurrent_transfers', [username]);
    if (!rawData || !rawData.length) {
      return [];
    }
    return rawData;
  } catch (err) {
    console.warn('Failed to get recurrent transfers', err);
    return [];
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
  )
    .then((resp) => {
      return resp;
    })
    .catch((err) => {
      console.warn('Failed to post conent', err);
      Sentry.captureException(err);
      throw err;
    });

/**
 * Broadcasts a comment to post
 * @param account currentAccount object
 * @param pin encrypted pin taken from redux
 * @param {*} parentAuthor author of parent post or in case of reply to comment author of parent comment
 * @param {*} parentPermlink permlink of parent post or in case of reply to comment author of parent comment
 * @param {*} permlink perlink of comment to be make
 * @param {*} body body of comment
 * @param {*} parentTags tags of parent post or parent comment
 * @param {*} isEdit optional to avoid tracking activity in case of comment editing
 * @returns
 */
export const postComment = (
  account,
  pin,
  parentAuthor,
  parentPermlink,
  permlink,
  body,
  jsonMetadata,
) =>
  _postContent(
    account,
    pin,
    parentAuthor,
    parentPermlink,
    permlink,
    '',
    body,
    jsonMetadata,
    null,
    null,
  )
    .then((resp) => {
      return resp;
    })
    .catch((err) => {
      console.warn('Failed to post conent', err);
      Sentry.captureException(err);
      throw err;
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

  if (isHsClientSupported(account.local.authType)) {
    const token = decryptKey(account.local.accessToken, digitPinCode);
    const api = new hsClient({
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
      sendHiveOperations(opArray, privateKey)
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
export const reblog = (account, pinCode, author, permlink, undo = false) =>
  _reblog(account, pinCode, author, permlink, undo).then((resp) => {
    return resp;
  });

const _reblog = async (account, pinCode, author, permlink, undo = false) => {
  const json = [
    'reblog',
    {
      account: account.name,
      author,
      permlink,
      delete: undo ? 'delete' : undefined,
    },
  ];

  return broadcastPostingJSON('follow', json, account, pinCode);
};

export const claimRewardBalance = (account, pinCode, rewardHive, rewardHbd, rewardVests) => {
  const pin = getDigitPinCode(pinCode);
  const key = getAnyPrivateKey(get(account, 'local'), pin);

  if (isHsClientSupported(account.local.authType)) {
    const token = decryptKey(get(account, 'local.accessToken'), pin);
    const api = new hsClient({
      accessToken: token,
    });

    return api.claimRewardBalance(get(account, 'name'), rewardHive, rewardHbd, rewardVests);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'claim_reward_balance',
        {
          account: account.name,
          reward_hive: rewardHive,
          reward_hbd: rewardHbd,
          reward_vests: rewardVests,
        },
      ],
    ];

    return sendHiveOperations(opArray, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const transferPoint = (currentAccount, pinCode, data) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);
  const username = get(currentAccount, 'name');

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const destinationInput = data.destination;

    // Split the destination input into an array of usernames
    // Handles both spaces and commas as separators
    const destinations = destinationInput
      ? destinationInput.trim().split(/[\s,]+/) // Split by spaces or commas
      : [];

    // Prepare the base arguments for the transfer operation
    const baseArgs = {
      sender: data.from,
      amount: data.amount,
      memo: data.memo,
    };

    // Create a transfer operation for each destination username
    const opArray = destinations.map((destination) => {
      const json = JSON.stringify({ ...baseArgs, receiver: destination.trim() }); // Trim whitespace
      const op = {
        id: 'ecency_point_transfer',
        json,
        required_auths: [username],
        required_posting_auths: [],
      };
      return ['custom_json', op];
    });

    console.log(opArray); // Output the array of operations

    return sendHiveOperations(opArray, privateKey);
  } else {
    const err = new Error('Check private key permission! Required private active key or above.');
    Sentry.captureException(err, (scope) => {
      scope.setUser({ username: currentAccount.username });
      scope.setTag('context', 'transfer-points');
    });
    return Promise.reject(err);
  }
};

export const promote = (currentAccount, pinCode, duration, author, permlink) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const user = get(currentAccount, 'name');

    const json = {
      id: 'ecency_promote',
      json: JSON.stringify({
        user,
        author,
        permlink,
        duration,
      }),
      required_auths: [user],
      required_posting_auths: [],
    };
    const opArray = [['custom_json', json]];

    return sendHiveOperations(opArray, privateKey);
  } else {
    const err = new Error('Check private key permission! Required private active key or above.');
    Sentry.captureException(err, (scope) => {
      scope.setUser({ username: currentAccount.username });
      scope.setTag('context', 'promoting-content');
    });
    return Promise.reject(err);
  }
};

export const boostPlus = (currentAccount, pinCode, duration, account) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const user = get(currentAccount, 'name');

    const json = {
      id: 'ecency_boost_plus',
      json: JSON.stringify({
        user,
        account,
        duration,
      }),
      required_auths: [user],
      required_posting_auths: [],
    };
    const opArray = [['custom_json', json]];

    return sendHiveOperations(opArray, privateKey);
  } else {
    const err = new Error('Check private key permission! Required private active key or above.');
    Sentry.captureException(err, (scope) => {
      scope.setUser({ username: currentAccount.username });
      scope.setTag('context', 'boost-plus-content');
    });
    return Promise.reject(err);
  }
};

export const boost = (currentAccount, pinCode, point, author, permlink) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);

  if (key && point) {
    const privateKey = PrivateKey.fromString(key);
    const user = get(currentAccount, 'name');

    const json = {
      id: 'ecency_boost',
      json: JSON.stringify({
        user,
        author,
        permlink,
        amount: `${point.toFixed(3)} POINT`,
      }),
      required_auths: [user],
      required_posting_auths: [],
    };
    const opArray = [['custom_json', json]];

    return sendHiveOperations(opArray, privateKey);
  } else {
    const err = new Error('Check private key permission! Required private active key or above.');
    Sentry.captureException(err, (scope) => {
      scope.setUser({ username: currentAccount.username });
      scope.setTag('context', 'boosting-content');
    });
    return Promise.reject(err);
  }
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

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hsClient({
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
      .catch((error) => {
        console.warn('Failed to update posting key');
        Sentry.captureException(error);
        console.log(error);
      });
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
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          if (error && get(error, 'jse_info.code') === 4030100) {
            error.message = getDsteemDateErrorMessage(error);
          }
          console.warn('Failed to update posting key, non-steam', error);
          Sentry.captureException(error);
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

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hsClient({
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
      sendHiveOperations(opArray, privateKey)
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
  const json = [data.isSubscribed ? 'unsubscribe' : 'subscribe', { community: data.communityId }];

  return broadcastPostingJSON('community', json, currentAccount, pinCode);
};

export const pinCommunityPost = (
  currentAccount,
  pinCode,
  communityId,
  author,
  permlink,
  unpinPost = false,
) => {
  const digitPinCode = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);
  const username = get(currentAccount, 'name');

  const json = JSON.stringify([
    unpinPost ? 'unpinPost' : 'pinPost',
    {
      community: communityId,
      account: author,
      permlink,
    },
  ]);

  const op = {
    id: 'community',
    json,
    required_auths: [],
    required_posting_auths: [username],
  };
  const opArray = [['custom_json', op]];

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });
    return api.broadcast(opArray);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    return sendHiveOperations(opArray, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const getBtcAddress = () => {
  /* const digitPinCode = getDigitPinCode(pin);
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

export const getAnyPrivateKey = (local, pin) => {
  const { postingKey, activeKey } = local;

  if (activeKey) {
    return decryptKey(local.activeKey, pin);
  }

  if (postingKey) {
    return decryptKey(local.postingKey, pin);
  }

  return false;
};

export const getActiveKey = (local, pin) => {
  const { activeKey } = local;

  if (activeKey) {
    return decryptKey(local.activeKey, pin);
  }

  return false;
};

export const votingPower = (account) => {
  const calc = client.rc.calculateVPMana(account);
  const { percentage } = calc;

  return percentage / 100;
};

export const isHsClientSupported = (authType) => {
  switch (authType) {
    case AUTH_TYPE.STEEM_CONNECT:
    case AUTH_TYPE.HIVE_AUTH:
      return true;
    default:
      return false;
  }
};

/* eslint-enable */

export const resolveTransaction = async (parsedTx, parsedParams, signer) => {
  const EXPIRE_TIME = 60 * 1000;
  const props = await client.database.getDynamicGlobalProperties();

  // resolve the decoded tx and params to a signable tx
  const { tx } = hiveuri.resolveTransaction(parsedTx, parsedParams, {
    ref_block_num: props.head_block_number & 0xffff,
    ref_block_prefix: Buffer.from(props.head_block_id, 'hex').readUInt32LE(4),
    expiration: new Date(Date.now() + client.broadcast.expireTime + EXPIRE_TIME)
      .toISOString()
      .slice(0, -5),
    signers: [signer],
    preferred_signer: signer,
  });
  tx.ref_block_num = parseInt(`${tx.ref_block_num}`, 10);
  tx.ref_block_prefix = parseInt(`${tx.ref_block_prefix}`, 10);

  return tx;
};

const handleChainError = (strErr: string) => {
  if (/You may only post once every/.test(strErr)) {
    return 'chain-error.min-root-comment';
  } else if (/Your current vote on this comment is identical/.test(strErr)) {
    return 'chain-error.identical-vote';
  } else if (/Please wait to transact, or power up/.test(strErr)) {
    return 'chain-error.insufficient-resource';
  } else if (/Cannot delete a comment with net positive/.test(strErr)) {
    return 'chain-error.delete-comment-with-vote';
  } else if (/children == 0/.test(strErr)) {
    return 'chain-error.comment-children';
  } else if (/comment_cashout/.test(strErr)) {
    return 'chain-error.comment-cashout';
  } else if (/Votes evaluating for comment that is paid out is forbidden/.test(strErr)) {
    return 'chain-error.paid-out-post-forbidden';
  } else if (/Missing Active Authority/.test(strErr)) {
    return 'chain-error.missing-authority';
  } else if (/Missing Owner Authority/.test(strErr)) {
    return 'chain-error.missing-owner-authority';
  } else if (/does not have sufficient funds/.test(strErr)) {
    return 'chain-error.insufficient_fund';
  }
  return null;
};

export const handleHiveUriOperation = async (
  currentAccount: any,
  pin: any,
  tx: any,
): Promise<TransactionConfirmation> => {
  try {
    const digitPinCode = getDigitPinCode(pin);
    const key = getAnyPrivateKey(currentAccount.local, digitPinCode);
    const privateKey = PrivateKey.fromString(key);
    const chainId = Buffer.from(
      'beeab0de00000000000000000000000000000000000000000000000000000000',
      'hex',
    );
    // console.log('tx : ', tx);
    const transaction = cryptoUtils.signTransaction(tx, privateKey, chainId);
    const trxId = await generateTrxId(transaction);
    const resultHive = await client.broadcast.call('broadcast_transaction', [transaction]);
    const result = Object.assign({ id: trxId }, resultHive);
    return result;
  } catch (err) {
    const errString = handleChainError(err.toString());
    Sentry.captureException(err, (scope) => {
      scope.setTag('context', 'handle-hive-uri-operation');
      scope.setContext('tx', tx);
    });
    return Promise.reject(errString);
  }
};
