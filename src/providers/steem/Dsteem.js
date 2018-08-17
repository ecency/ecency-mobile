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
        return account[0];
    } catch (error) {
        return error;
    }
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
