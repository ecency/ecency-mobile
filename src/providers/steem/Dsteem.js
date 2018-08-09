import { Client } from 'dsteem';
const client = new Client('https://api.steemit.com');

import { parsePosts } from '../../utils/PostParser';

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
            .call('follow_api', 'get_follow_count', [user])
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
export const getPosts = async (by, query) => {
    try {
        let posts = await client.database.getDiscussions(by, query);
        posts = await parsePosts(posts);
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
            let post = client.database.call('get_content', [user, permlink]);
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
    return new Promise((resolve, reject) => {
        try {
            let comments = client.database.call('get_content_replies', [
                user,
                permlink,
            ]);
            resolve(comments);
        } catch (error) {
            reject(error);
        }
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
