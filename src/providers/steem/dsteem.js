/* eslint-disable camelcase */
import { Client, PrivateKey } from 'dsteem';
import steemConnect from 'steemconnect';
import Config from 'react-native-config';

import { getServer } from '../../realm/realm';
import { getUnreadActivityCount } from '../esteem/esteem';
import { userActivity, transfer } from '../esteem/ePoint';
// Utils
import { decryptKey } from '../../utils/crypto';
import { parsePosts, parsePost, parseComments } from '../../utils/postParser';
import { getName, getAvatar } from '../../utils/user';
import { getReputation } from '../../utils/reputation';
import parseToken from '../../utils/parseToken';
import filterNsfwPost from '../../utils/filterNsfwPost';

// Constant
import AUTH_TYPE from '../../constants/authType';

const DEFAULT_SERVER = 'https://api.steemit.com';
let client = new Client(DEFAULT_SERVER);

export const checkClient = async () => {
  let selectedServer = DEFAULT_SERVER;

  await getServer().then((response) => {
    if (response) {
      selectedServer = response;
    }
  });

  client = new Client(selectedServer);
};

checkClient();

export const getDigitPinCode = pin => decryptKey(pin, Config.PIN_KEY);

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
    feedHistory = await getFeedHistory();
    rewardFund = await getRewardFund();
  } catch (e) {
    return;
  }

  const steemPerMVests = (parseToken(globalDynamic.total_vesting_fund_steem)
      / parseToken(globalDynamic.total_vesting_shares))
    * 1e6;
  const base = parseToken(feedHistory.current_median_history.base);
  const quote = parseToken(feedHistory.current_median_history.quote);
  const fundRecentClaims = rewardFund.recent_claims;
  const fundRewardBalance = parseToken(rewardFund.reward_balance);
  const globalProps = {
    steemPerMVests,
    base,
    quote,
    fundRecentClaims,
    fundRewardBalance,
  };

  return globalProps;
};

/**
 * @method getAccount get account data
 * @param user username
 */
export const getAccount = user => new Promise((resolve, reject) => {
  try {
    const account = client.database.getAccounts([user]);
    resolve(account);
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

    if (account && account.length < 1) return null;

    // get global properties to calculate Steem Power
    const globalProperties = await client.database.getDynamicGlobalProperties();
    const rcPower = await client.call('rc_api', 'find_rc_accounts', { accounts: [user] });
    const unreadActivityCount = await getUnreadActivityCount({ user });

    account[0].reputation = getReputation(account[0].reputation);
    account[0].username = account[0].name;
    account[0].unread_activity_count = unreadActivityCount;
    account[0].rc_manabar = rcPower.rc_accounts[0].rc_manabar;
    account[0].steem_power = await vestToSteem(
      account[0].vesting_shares,
      globalProperties.total_vesting_shares,
      globalProperties.total_vesting_fund_steem,
    );
    account[0].received_steem_power = await vestToSteem(
      account[0].received_vesting_shares,
      globalProperties.total_vesting_shares,
      globalProperties.total_vesting_fund_steem,
    );
    account[0].delegated_steem_power = await vestToSteem(
      account[0].delegated_vesting_shares,
      globalProperties.total_vesting_shares,
      globalProperties.total_vesting_fund_steem,
    );

    account[0].about = account[0].json_metadata && JSON.parse(account[0].json_metadata);
    account[0].avatar = getAvatar(account[0].about);
    account[0].display_name = getName(account[0].about);

    return account[0];
  } catch (error) {
    return Promise.reject(error);
  }
};

// TODO: Move to utils folder
export const vestToSteem = async (vestingShares, totalVestingShares, totalVestingFundSteem) => (
  parseFloat(totalVestingFundSteem)
    * (parseFloat(vestingShares) / parseFloat(totalVestingShares))
).toFixed(0);

export const getFollows = username => client.database.call('get_follow_count', [username]);

export const getFollowing = (follower, startFollowing, followType = 'blog', limit = 100) => client.database.call('get_following', [follower, startFollowing, followType, limit]);

export const getFollowers = (follower, startFollowing, followType = 'blog', limit = 100) => client.database.call('get_followers', [follower, startFollowing, followType, limit]);

export const getIsFollowing = (user, author) => new Promise((resolve, reject) => {
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
});

export const getFollowSearch = (user, targetUser) => new Promise((resolve, reject) => {
  client.database
    .call('get_following', [targetUser, user, 'blog', 1])
    .then((result) => {
      if (result[0] && result[0].follower === targetUser && result[0].following === user) {
        resolve(result[0].follower);
      } else {
        resolve(null);
      }
    })
    .catch((err) => {
      reject(err);
    });
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
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    return api.ignore(data.follower, data.following);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const json = {
      id: 'follow',
      json: JSON.stringify([
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

  return Promise.reject(new Error('You dont have permission!'));
};

/**
 * @method getPosts get posts method
 * @param by get discussions by trending, created, active etc.
 * @param query tag, limit, start_author?, start_permalink?
 */
export const getPosts = async (by, query, user) => {
  try {
    let posts = await client.database.getDiscussions(by, query);

    if (posts) {
      posts = await parsePosts(posts, user);
    }
    return posts;
  } catch (error) {
    return error;
  }
};

export const getActiveVotes = (author, permlink) => client.database.call('get_active_votes', [author, permlink]);

export const getPostsSummary = async (by, query, currentUserName, filterNsfw) => {
  try {
    let posts = await client.database.getDiscussions(by, query);

    if (posts) {
      posts = await parsePosts(posts, currentUserName, true);

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

export const getUserComments = async (query) => {
  try {
    let comments = await client.database.getDiscussions('comments', query);
    comments = parseComments(comments);
    return comments;
  } catch (error) {
    return error;
  }
};

export const getRepliesByLastUpdate = async (query) => {
  try {
    let replies = await client.database.call('get_replies_by_last_update', [
      query.start_author,
      query.start_permlink,
      query.limit,
    ]);
    replies = parseComments(replies);
    return replies;
  } catch (error) {
    return error;
  }
};

/**
 * @method getUser get user data
 * @param user post author
 * @param permlink post permlink
 * @param currentUserName active accounts username
 */
export const getPost = async (author, permlink, currentUserName = null) => {
  try {
    const post = await client.database.call('get_content', [author, permlink]);

    return post ? await parsePost(post, currentUserName) : null;
  } catch (error) {
    return error;
  }
};

export const getPurePost = async (author, permlink) => {
  try {
    return await client.database.call('get_content', [author, permlink]);
  } catch (error) {
    return error;
  }
};

// export const deleteComment = (author, permlink) => {
//   return new Promise((resolve, reject) => {
//     client.database
//       .call('delete_comment', [author, permlink])
//       .then((response) => {
//         resolve(response);
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// };

export const deleteComment = (currentAccount, pin, permlink) => {
  const { name: author } = currentAccount;
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.accessToken, pin);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    const params = {
      author,
      permlink,
    };

    const opArray = [['delete_comment', params]];

    return api.broadcast(opArray).then(resp => resp.result);
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

/**
 * @method getUser get user data
 * @param user post author
 * @param permlink post permlink
 */
export const getComments = (user, permlink) => {
  let comments;
  return new Promise((resolve, reject) => {
    client.database
      .call('get_content_replies', [user, permlink])
      .then((result) => {
        comments = parseComments(result);
      })
      .then(() => {
        resolve(comments);
      })
      .catch((error) => {
        reject(error);
      });
  });
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

/**
 * @method upvote upvote a content
 * @param vote vote object(author, permlink, voter, weight)
 * @param postingKey private posting key
 */

export const vote = (account, pin, author, permlink, weight) => _vote(account, pin, author, permlink, weight).then((resp) => {
  userActivity(account.username, 120, resp.block_num, resp.id);
  return resp;
});

const _vote = async (currentAccount, pin, author, permlink, weight) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = steemConnect.Initialize({
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
          reject(err);
        });
    });
  }

  return Promise.reject(new Error('You dont have permission!'));
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

  const estimated = (input / parseFloat(rewardFund.recent_claims))
    * parseFloat(rewardFund.reward_balance)
    * (parseFloat(medianPrice.base) / parseFloat(medianPrice.quote));
  return estimated;
};

export const transferToken = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey({ activeKey: currentAccount.local.activeKey }, digitPinCode);

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = {
      from: data.from,
      to: data.destination,
      amount: data.amount,
      memo: data.memo,
    };

    return new Promise((resolve, reject) => {
      client.broadcast
        .transfer(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(new Error('You dont have permission!'));
};

export const transferToSavings = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey({ activeKey: currentAccount.local.activeKey }, digitPinCode);

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const args = [[
      'transfer_to_savings',
      {
        from: data.from,
        to: data.destination,
        amount: data.amount,
        memo: data.memo,
      },
    ]];

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

  return Promise.reject(new Error('You dont have permission!'));
};

export const transferFromSavings = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey({ activeKey: currentAccount.local.activeKey }, digitPinCode);

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [[
      'transfer_from_savings',
      {
        from: data.from,
        to: data.destination,
        amount: data.amount,
        memo: data.memo,
        request_id: data.requestId,
      },
    ]];

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

  return Promise.reject(new Error('You dont have permission!'));
};

export const transferToVesting = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey({ activeKey: currentAccount.local.activeKey }, digitPinCode);

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [[
      'transfer_to_vesting',
      {
        from: data.from,
        to: data.destination,
        amount: data.amount,
      },
    ]];

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

  return Promise.reject(new Error('You dont have permission!'));
};

export const followUser = async (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    return api.follow(data.follower, data.following);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const json = {
      id: 'follow',
      json: JSON.stringify([
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

  return Promise.reject(new Error('You dont have permission!'));
};

export const unfollowUser = async (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getAnyPrivateKey(currentAccount.local, digitPinCode);

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    return api.unfollow(data.follower, data.following);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const json = {
      id: 'follow',
      json: JSON.stringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: [''],
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

  return Promise.reject(new Error('You dont have permission!'));
};

export const delegate = (data, activeKey) => {
  const privateKey = PrivateKey.fromString(activeKey);

  return new Promise((resolve, reject) => {
    client.broadcast
      .delegateVestingShares(data, privateKey)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const withdrawVesting = (data, activeKey) => {
  const privateKey = PrivateKey.fromString(activeKey);
  const op = [
    'withdraw_vesting',
    {
      account: data.account,
      vesting_shares: data.vesting_shares,
    },
  ];

  return new Promise((resolve, reject) => {
    client.broadcast
      .sendOperations([op], privateKey)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const lookupAccounts = async (username) => {
  try {
    const users = await client.database.call('lookup_accounts', [username, 20]);
    return users;
  } catch (error) {
    throw error;
  }
};

export const getTrendingTags = async (tag) => {
  try {
    const users = await client.database.call('get_trending_tags', [tag, 20]);
    return users;
  } catch (error) {
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
) => _postContent(
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
  if (options) {
    const t = title ? 100 : 110;
    const { block_num, id } = resp;

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
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    const params = {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      author,
      permlink,
      title,
      body,
      json_metadata: JSON.stringify(jsonMetadata),
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

    return api.broadcast(opArray).then(resp => resp.result);
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
          json_metadata: JSON.stringify(jsonMetadata),
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
          reject(error);
        });
    });
  }

  return Promise.reject(new Error('You dont have permission!'));
};

// Re-blog
// TODO: remove pinCode
export const reblog = (account, pinCode, author, permlink) => _reblog(account, pinCode, author, permlink).then((resp) => {
  userActivity(account.name, 130, resp.block_num, resp.id);
  return resp;
});

const _reblog = async (account, pinCode, author, permlink) => {
  const pin = getDigitPinCode(pinCode);
  const key = getAnyPrivateKey(account.local, pin);

  if (account.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(account.local.accessToken, pin);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    const follower = account.name;

    return api.reblog(follower, author, permlink).then(resp => resp.result);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const follower = account.name;

    const json = {
      id: 'follow',
      json: JSON.stringify([
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

  return Promise.reject(new Error('You dont have permission!'));
};

export const claimRewardBalance = (account, pinCode, rewardSteem, rewardSbd, rewardVests) => {
  const pin = getDigitPinCode(pinCode);
  const key = getAnyPrivateKey(account.local, pin);

  if (account.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(account.local.accessToken, pin);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    return api.claimRewardBalance(account.name, rewardSteem, rewardSbd, rewardVests);
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'claim_reward_balance',
        {
          account: account.name,
          reward_steem: rewardSteem,
          reward_sbd: rewardSbd,
          reward_vests: rewardVests,
        },
      ],
    ];

    return client.broadcast.sendOperations(opArray, privateKey);
  }

  return Promise.reject(new Error('You dont have permission!'));
};

const getAnyPrivateKey = (local, pin) => {
  const { postingKey, activeKey } = local;

  if (postingKey) {
    return decryptKey(local.postingKey, pin);
  }

  if (activeKey) {
    return decryptKey(local.activeKey, pin);
  }

  return false;
};
