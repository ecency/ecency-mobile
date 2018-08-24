/* eslint-disable no-console */
import { Client, PrivateKey } from "dsteem";
const client = new Client("https://api.steemit.com");

import { parsePosts, parseComments } from "../../utils/PostParser";

let rewardFund = null;
let medianPrice = null;

/**
 * @method getAccount get account data
 * @param user username
 */
export const getAccount = user => {
    return new Promise((resolve, reject) => {
        try {
            let account = client.database.getAccounts([user]);
            resolve(account);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * @method getUser get account data
 * @param user username
 */
export const getUser = async user => {
    try {
        let account = await client.database.getAccounts([user]);
        // get global properties to calculate Steem Power
        let global_properties = await client.database.getDynamicGlobalProperties();

        // calculate Steem Power (own, received, delegated)
        account[0].steem_power = vestToSteem(
            account[0].vesting_shares,
            global_properties.total_vesting_shares,
            global_properties.total_vesting_fund_steem
        ).toFixed(0);
        account[0].received_steem_power = vestToSteem(
            account[0].received_vesting_shares,
            global_properties.total_vesting_shares,
            global_properties.total_vesting_fund_steem
        ).toFixed(0);
        account[0].delegated_steem_power = vestToSteem(
            account[0].delegated_vesting_shares,
            global_properties.total_vesting_shares,
            global_properties.total_vesting_fund_steem
        ).toFixed(0);

        return account[0];
    } catch (error) {
        return error;
    }
};

export const vestToSteem = (
    vestingShares,
    totalVestingShares,
    totalVestingFundSteem
) => {
    return (
        parseFloat(totalVestingFundSteem) *
        (parseFloat(vestingShares) / parseFloat(totalVestingShares))
    );
};

/**
 * @method getFollows get account data
 * @param user username
 */
export const getFollows = user => {
    return new Promise((resolve, reject) => {
        client
            .call("follow_api", "get_follow_count", [user])
            .then(result => {
                resolve(result);
            })
            .catch(err => {
                reject(err);
            });
    });
};

/**
 * @method getFollowers
 * @param user username
 * TODO: Pagination
 */
export const getFollowers = user => {
    return new Promise((resolve, reject) => {
        client
            .call("follow_api", "get_followers", [user, "", "blog", 50])
            .then(result => {
                resolve(result);
            })
            .catch(err => {
                reject(err);
            });
    });
};

/**
 * @method getFollowing
 * @param user username
 * TODO: Pagination
 */
export const getFollowing = user => {
    return new Promise((resolve, reject) => {
        client
            .call("follow_api", "get_following", [user, "", "blog", 50])
            .then(result => {
                resolve(result);
            })
            .catch(err => {
                reject(err);
            });
    });
};

export const isFolllowing = (author, user) => {
    return new Promise((resolve, reject) => {
        client
            .call("follow_api", "get_followers", [author, user, "blog", 10])
            .then(result => {
                if (result[0].follower === user) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};

/**
 * @method getPosts get posts method
 * @param by get discussions by trending, created, active etc.
 * @param query tag, limit, start_author?, start_permalink?
 */
export const getPosts = async (by, query, user) => {
    try {
        let posts = await client.database.getDiscussions(by, query);
        console.log("comments");
        console.log(posts);
        posts = await parsePosts(posts, user);
        return posts;
    } catch (error) {
        return error;
    }
};

export const getUserComments = async query => {
    try {
        let comments = await client.database.getDiscussions("comments", query);
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
export const getPost = (user, permlink) => {
    return new Promise((resolve, reject) => {
        try {
            let post = client.database.call("get_content", [user, permlink]);
            resolve(post);
        } catch (error) {
            reject(error);
        }
    });
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
            .call("get_content_replies", [user, permlink])
            .then(result => {
                comments = parseComments(result);
            })
            .then(() => {
                resolve(comments);
            })
            .catch(error => {
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

    await getPost(user, permlink).then(result => {
        post = result;
    });
    await getComments(user, permlink).then(result => {
        comments = result;
    });

    return [post, comments];
};

/**
 * @method upvote upvote a content
 * @param vote vote object(author, permlink, voter, weight)
 * @param postingKey private posting key
 */
export const upvote = (vote, postingKey) => {
    let key = PrivateKey.fromString(postingKey);
    return new Promise((resolve, reject) => {
        client.broadcast
            .vote(vote, key)
            .then(result => {
                console.log(result);
                resolve(result);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
};

/**
 * @method upvoteAmount estimate upvote amount
 */
export const upvoteAmount = async input => {
    if (rewardFund == null || medianPrice == null) {
        rewardFund = await client.database.call("get_reward_fund", ["post"]);

        await client.database
            .getCurrentMedianHistoryPrice()
            .then(res => {
                medianPrice = res;
            })
            .catch(err => {
                console.log(err);
            });
    }

    let estimated =
        (input / parseFloat(rewardFund.recent_claims)) *
        parseFloat(rewardFund.reward_balance) *
        parseFloat(medianPrice.base);
    return estimated;
};

/**
 * @method postComment post a comment/reply
 * @param comment comment object { author, permlink, ... }
 * @param PrivateKey Private posting key
 */
export const postComment = (comment, postingKey) => {
    let key = PrivateKey.fromString(postingKey);
    return new Promise((resolve, reject) => {
        try {
            client.broadcast.comment(comment, key).then(result => {
                resolve(result);
            });
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
};

export const transferToken = (data, activeKey) => {
    let key = PrivateKey.fromString(activeKey);
    return new Promise((resolve, reject) => {
        client.broadcast
            .transfer(data, key)
            .then(result => {
                console.log(result);
                resolve(result);
            })
            .catch(err => {
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
    let json = {
        id: "follow",
        json: JSON.stringify([
            "follow",
            {
                follower: `${data.follower}`,
                following: `${data.following}`,
                what: ["blog"],
            },
        ]),
        required_auths: [],
        required_posting_auths: [`${data.follower}`],
    };

    return new Promise((resolve, reject) => {
        client.broadcast
            .json(json, key)
            .then(result => {
                console.log(result);
                resolve(result);
            })
            .catch(err => {
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
    let json = {
        id: "follow",
        json: JSON.stringify([
            "follow",
            {
                follower: `${data.follower}`,
                following: `${data.following}`,
                what: [""],
            },
        ]),
        required_auths: [],
        required_posting_auths: [`${data.follower}`],
    };

    return new Promise((resolve, reject) => {
        client.broadcast
            .json(json, key)
            .then(result => {
                console.log(result);
                resolve(result);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
};
