import { Client } from 'dsteem';
const client = new Client('https://api.steemit.com');

import { parsePosts } from '../../utils/PostParser';

import Remarkable from 'remarkable';
var md = new Remarkable({
    html: true, // Enable HTML tags in source
    xhtmlOut: false, // Use '/' to close single tags (<br />)
    breaks: true, // Convert '\n' in paragraphs into <br>
    langPrefix: 'language-', // CSS language prefix for fenced blocks
    linkify: true, // Autoconvert URL-like text to links

    // Enable some language-neutral replacement + quotes beautification
    typographer: true,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',
});

/**
 * @method getAccount get account data
 * @param user username
 */
export const getAccount = user => {
    return new Promise((resolve, reject) => {
        let account = client.database.getAccounts([user]);
        resolve(account);
    });
};

/**
 * @method getPosts get posts method
 * @param by get discussions by trending, created, active etc.
 * @param query tag, limit, start_author?, start_permalink?
 */
export const getPosts = async (by, query) => {
    let posts = await client.database.getDiscussions(by, query);
    posts = await parsePosts(posts);
    return posts;
};

/**
 * @method getUser get user data
 * @param user post author
 * @param permlink post permlink
 */
export const getPost = (user, permlink) => {
    return new Promise((resolve, reject) => {
        let post = client.database.call('get_content', [user, permlink]);
        resolve(post);
    });
};

/**
 * @method getUser get user data
 * @param user post author
 * @param permlink post permlink
 */
export const getComments = (user, permlink) => {
    return new Promise((resolve, reject) => {
        let comments = client.database.call('get_content_replies', [
            user,
            permlink,
        ]);
        resolve(comments);
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
