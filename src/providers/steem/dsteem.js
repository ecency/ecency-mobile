/* eslint-disable no-console */

// TestNet
// const client = new Client("https://testnet.steem.vc", { chainId: "79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673", addressPrefix: "STX" });

import { Client, PrivateKey } from 'dsteem';
import { AsyncStorage } from 'react-native';
import { parsePosts, parsePost, parseComments } from '../../utils/postParser';

let rewardFund = null;
let medianPrice = null;
let client = new Client('https://api.steemit.com');

getClient = async () => {
  const server = await AsyncStorage.getItem('server');

  if (server === null || server === undefined || server === '') {
    client = new Client('https://api.steemit.com');
  } else {
    client = new Client(`${server}`);
  }
};
getClient();

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
 * @method getUser get account data
 * @param user username
 */
export const getUser = async (user) => {
  try {
    const account = await client.database.getAccounts([user]);
    // get global properties to calculate Steem Power
    const global_properties = await client.database.getDynamicGlobalProperties();
    const rc_power = await client.call('rc_api', 'find_rc_accounts', { accounts: [user] });

    account[0].rc_manabar = rc_power.rc_accounts[0].rc_manabar;
    account[0].steem_power = vestToSteem(
      account[0].vesting_shares,
      global_properties.total_vesting_shares,
      global_properties.total_vesting_fund_steem,
    ).toFixed(0);
    account[0].received_steem_power = vestToSteem(
      account[0].received_vesting_shares,
      global_properties.total_vesting_shares,
      global_properties.total_vesting_fund_steem,
    ).toFixed(0);
    account[0].delegated_steem_power = vestToSteem(
      account[0].delegated_vesting_shares,
      global_properties.total_vesting_shares,
      global_properties.total_vesting_fund_steem,
    ).toFixed(0);

    account[0].about = account[0].json_metadata && JSON.parse(account[0].json_metadata);
    return account[0];
  } catch (error) {
    return error;
  }
};

export const vestToSteem = (vestingShares, totalVestingShares, totalVestingFundSteem) => parseFloat(totalVestingFundSteem) * (parseFloat(vestingShares) / parseFloat(totalVestingShares));

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
export const getFollowers = user => new Promise((resolve, reject) => {
  client
    .call('follow_api', 'get_followers', [user, '', 'blog', 50])
    .then((result) => {
      resolve(result);
    })
    .catch((err) => {
      reject(err);
    });
});

/**
 * @method getFollowing
 * @param user username
 * TODO: Pagination
 */
export const getFollowing = (follower, startFollowing, followType = 'blog', limit = 100) => client.database.call('get_following', [follower, startFollowing, followType, limit]);

export const isFolllowing = (user, author) => new Promise((resolve, reject) => {
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

export const getUserComments = async (query) => {
  try {
    let comments = await client.database.getDiscussions('comments', query);
    comments = parseComments(comments);
    console.log(comments);
    return comments;
  } catch (error) {
    return error;
  }
};

/**
 * @method getUser get user data
 * @param user post author
 * @param permlink post permlink
 */
export const getPost = async (user, permlink) => {
  try {
    let posts = await client.database.call('get_content', [user, permlink]);

    posts = await parsePost(posts, user);
    return posts;
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
export const upvote = (vote, postingKey) => {
  const key = PrivateKey.fromString(postingKey);
  return new Promise((resolve, reject) => {
    client.broadcast
      .vote(vote, key)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
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
        console.log(err);
      });
  }

  const estimated = (input / parseFloat(rewardFund.recent_claims))
    * parseFloat(rewardFund.reward_balance)
    * parseFloat(medianPrice.base);
  return estimated;
};

/**
 * @method postComment post a comment/reply
 * @param comment comment object { author, permlink, ... }
 * @param PrivateKey Private posting key
 */
export const postComment = (comment, postingKey) => {
  const key = PrivateKey.fromString(postingKey);
  return new Promise((resolve, reject) => {
    try {
      client.broadcast.comment(comment, key).then((result) => {
        resolve(result);
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const transferToken = (data, activeKey) => {
  const key = PrivateKey.fromString(activeKey);
  return new Promise((resolve, reject) => {
    client.broadcast
      .transfer(data, key)
      .then((result) => {
        console.log(result);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

export const followUser = (data, postingKey) => {
  let key;
  try {
    key = PrivateKey.fromString(postingKey);
  } catch (error) {
    console.log(error);
  }
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
      .json(json, key)
      .then((result) => {
        console.log(result);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

export const unfollowUser = (data, postingKey) => {
  let key;
  try {
    key = PrivateKey.fromString(postingKey);
  } catch (error) {
    console.log(error);
  }
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
      .json(json, key)
      .then((result) => {
        console.log(result);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

export const delegate = (data, activeKey) => {
  let key;
  try {
    key = PrivateKey.fromString(activeKey);
  } catch (error) {
    console.log(error);
  }

  return new Promise((resolve, reject) => {
    client.broadcast
      .delegateVestingShares(data, key)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

export const globalProps = async () => {
  try {
    const globalProperties = await client.database.getDynamicGlobalProperties();
    return globalProperties;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getFeedHistory = async () => {
  try {
    const feedHistory = await client.database.call('get_feed_history');
    return feedHistory;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const transferToVesting = (data, activeKey) => {
  let key;
  try {
    key = PrivateKey.fromString(activeKey);
    console.log(key);
  } catch (error) {
    console.log(error);
  }

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
      .sendOperations([op], key)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

export const withdrawVesting = (data, activeKey) => {
  let key;
  try {
    key = PrivateKey.fromString(activeKey);
    console.log(key);
  } catch (error) {
    console.log(error);
  }

  const op = [
    'withdraw_vesting',
    {
      account: data.account,
      vesting_shares: data.vesting_shares,
    },
  ];

  return new Promise((resolve, reject) => {
    client.broadcast
      .sendOperations([op], key)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

export const postContent = (data, postingKey) => {
  let key;

  try {
    key = PrivateKey.fromString(postingKey);
  } catch (error) {
    console.log(error);
  }

  const post = {
    author: data.author,
    body: data.body,
    parent_author: '',
    parent_permlink: data.tags[0],
    permlink: data.permlink,
    title: data.title,
    json_metadata: JSON.stringify({
      app: 'esteem/2.0.0-mobile',
      community: 'esteem.app',
      tags: data.tags,
    }),
  };

  const op = {
    author: data.author,
    permlink: data.permlink,
    max_accepted_payout: '1000000.000 SBD',
    percent_steem_dollars: 10000,
    allow_votes: true,
    allow_curation_rewards: true,
    extensions: [
      [
        0,
        {
          beneficiaries: [{ account: 'esteemapp', weight: 1000 }],
        },
      ],
    ],
  };

  return new Promise((resolve, reject) => {
    client.broadcast
      .commentWithOptions(post, op, key)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
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
