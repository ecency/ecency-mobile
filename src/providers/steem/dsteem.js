import { Client, PrivateKey } from 'dsteem';
import steemConnect from 'steemconnect';
import { getServer } from '../../realm/realm';
import { getUnreadActivityCount } from '../esteem/esteem';

// Utils
import { decryptKey } from '../../utils/crypto';
import { getDigitPinCode } from './auth';
import {
  parsePosts, parsePost, parseComments,
} from '../../utils/postParser';
import { getName, getAvatar } from '../../utils/user';

// Constant
import AUTH_TYPE from '../../constants/authType';

const DEFAULT_SERVER = 'https://api.steemit.com';
let rewardFund = null;
let medianPrice = null;
let client = new Client(DEFAULT_SERVER);

const _getClient = async () => {
  let selectedServer = DEFAULT_SERVER;

  await getServer().then((response) => {
    if (response) {
      selectedServer = response;
    }
  });

  client = new Client(selectedServer);
};

_getClient();

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
    // get global properties to calculate Steem Power
    const globalProperties = await client.database.getDynamicGlobalProperties();
    const rcPower = await client.call('rc_api', 'find_rc_accounts', { accounts: [user] });
    const unreadActivityCount = await getUnreadActivityCount({ user });

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

/**
 * @method getFollows get account data
 * @param user username
 */
export const getFollows = user => new Promise((resolve, reject) => {
  client
    .call('follow_api', 'get_follow_count', [user])
    .then((result) => {
      resolve(result);
    })
    .catch((err) => {
      reject(err);
    });
});

/**
 * @method getFollowers
 * @param user username
 * TODO: Pagination
 */
// export const getFollowers = (user, limit = 100) => new Promise((resolve, reject) => {
//   client
//     .call('follow_api', 'get_followers', [user, '', 'blog', limit])
//     .then((result) => {
//       resolve(result);
//     })
//     .catch((err) => {
//       reject(err);
//     });
// });

/**
 * @method getFollowing
 * @param user username
 * TODO: Pagination
 */
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

export const getIsMuted = async (username, targetUsername) => {
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

export const ignoreUser = async (currentAccount, data) => {
  const digitPinCode = await getDigitPinCode();

  if (currentAccount.local.authType === AUTH_TYPE.MASTER_KEY) {
    const key = decryptKey(currentAccount.local.postingKey, digitPinCode);
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

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    return api.ignore(data.follower, data.following);
  }
};

/**
 * @method getPosts get posts method
 * @param by get discussions by trending, created, active etc.
 * @param query tag, limit, start_author?, start_permalink?
 */
export const getPosts = async (by, query, user) => {
  try {
    let posts = await client.database.getDiscussions(by, query);

    posts = await parsePosts(posts, user);
    return posts;
  } catch (error) {
    return error;
  }
};

export const getActiveVotes = (author, permlink) => client.database.call('get_active_votes', [author, permlink]);

export const getPostsSummary = async (by, query, currentUserName) => {
  try {
    let posts = await client.database.getDiscussions(by, query);

    posts = await parsePosts(posts, currentUserName);
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

/**
 * @method getUser get user data
 * @param user post author
 * @param permlink post permlink
 * @param currentUserName active accounts username
 */
export const getPost = async (author, permlink, currentUserName) => {
  try {
    const post = await client.database.call('get_content', [author, permlink]);

    return await parsePost(post, currentUserName);
  } catch (error) {
    return error;
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

// export const getAccountRC = username => client.call('rc_api', 'find_rc_accounts', { accounts: [username] });

/**
 * @method upvote upvote a content
 * @param vote vote object(author, permlink, voter, weight)
 * @param postingKey private posting key
 */
export const vote = async (currentAccount, author, permlink, weight) => {
  const digitPinCode = await getDigitPinCode();

  if (currentAccount.local.authType === AUTH_TYPE.MASTER_KEY) {
    const key = decryptKey(currentAccount.local.postingKey, digitPinCode);
    const privateKey = PrivateKey.fromString(key);
    const voter = currentAccount.name;

    const args = {
      voter,
      author,
      permlink,
      weight,
    };

    return new Promise((resolve, reject) => {
      client.broadcast.vote(args, privateKey).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    const voter = currentAccount.name;

    return new Promise((resolve, reject) => {
      api.vote(voter, author, permlink, weight).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
};

/**
 * @method upvoteAmount estimate upvote amount
 */
export const upvoteAmount = async (input) => {
  if (!rewardFund || !medianPrice) {
    rewardFund = await client.database.call('get_reward_fund', ['post']);

    await client.database
      .getCurrentMedianHistoryPrice()
      .then((res) => {
        medianPrice = res;
      })
      .catch((err) => {
        // reject(err);
      });
  }

  const estimated = (input / parseFloat(rewardFund.recent_claims))
    * parseFloat(rewardFund.reward_balance)
    * (parseFloat(medianPrice.base) / parseFloat(medianPrice.quote));
  return estimated;
};

export const transferToken = (data, activeKey) => {
  const key = PrivateKey.fromString(activeKey);
  return new Promise((resolve, reject) => {
    client.broadcast
      .transfer(data, key)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const followUser = async (currentAccount, data) => {
  const digitPinCode = await getDigitPinCode();

  if (currentAccount.local.authType === AUTH_TYPE.MASTER_KEY) {
    const key = decryptKey(currentAccount.local.postingKey, digitPinCode);
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
  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    return api.follow(data.follower, data.following);
  }
};

export const unfollowUser = async (currentAccount, data) => {
  const digitPinCode = await getDigitPinCode();

  if (currentAccount.local.authType === AUTH_TYPE.MASTER_KEY) {
    const key = decryptKey(currentAccount.local.postingKey, digitPinCode);
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
  if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    return api.unfollow(data.follower, data.following);
  }
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

export const globalProps = async () => {
  try {
    const globalProperties = await client.database.getDynamicGlobalProperties();
    return globalProperties;
  } catch (error) {
    return error;
  }
};

export const getFeedHistory = async () => {
  try {
    const feedHistory = await client.database.call('get_feed_history');
    return feedHistory;
  } catch (error) {
    return error;
  }
};

export const transferToVesting = (data, activeKey) => {
  const privateKey = PrivateKey.fromString(activeKey);

  const op = [
    'transfer_to_vesting',
    {
      from: data.from,
      to: data.to,
      amount: data.amount,
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

/**
 * @method postComment post a comment/reply
 * @param comment comment object { author, permlink, ... }
 */
export const postContent = async (
  account,
  digitPinCode,
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

  if (account.local.authType === AUTH_TYPE.MASTER_KEY) {
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

    const key = decryptKey(account.local.postingKey, digitPinCode);
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

    return api.broadcast(opArray);
  }
};

// Re-blog
export const reblog = async (account, author, permlink) => {
  const pin = await getDigitPinCode();

  if (account.local.authType === AUTH_TYPE.MASTER_KEY) {
    const key = decryptKey(account.local.postingKey, pin);
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

  if (account.local.authType === AUTH_TYPE.STEEM_CONNECT) {
    const token = decryptKey(account.local.accessToken, pin);
    const api = steemConnect.Initialize({
      accessToken: token,
    });

    const follower = account.name;

    return api.reblog(follower, author, permlink);
  }
};
