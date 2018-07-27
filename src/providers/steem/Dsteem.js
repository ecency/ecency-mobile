import { Client } from 'dsteem';
const client = new Client('https://api.steemit.com');

import moment from 'moment';
import { postSummary } from '../../utils/PostSummary';
import { markDown2Html } from '../../utils/PostParser';

const noImage = require('../../assets/noimage.png');

import Remarkable from 'remarkable';
var md = new Remarkable({
  html:         true,        // Enable HTML tags in source
  xhtmlOut:     false,        // Use '/' to close single tags (<br />)
  breaks:       true,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'language-',  // CSS language prefix for fenced blocks
  linkify:      true,        // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  typographer:  true,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
  quotes: '“”‘’'
});


  /**
   * @method getAccount get account data
   * @param user username
   */
  export const getAccount = (user) => {
    return new Promise((resolve, reject) => {
      let account = client.database.getAccounts([user]);
      resolve(account);
    })
  }

  /**
   * @method getPosts get posts method
   * @param by get discussions by trending, created, active etc.
   * @param query tag, limit, start_author?, start_permalink?
   */
  export const getPosts = async (by, query) => {
    let posts = await client.database.getDiscussions(by, query);
    posts = await parsePosts(posts);
    return posts;
  }

  /**
   * TODO move it to Utils
   */
  export const parsePosts = (posts) => {
    posts.map(post => {
      post.json_metadata = JSON.parse(post.json_metadata);
      post.image = (post.json_metadata.image) ? post.json_metadata.image[0] : noImage.url;
      post.pending_payout_value = parseFloat(post.pending_payout_value).toFixed(2);
      post.created = moment.utc(post.created).local().fromNow();
      post.vote_count = post.active_votes.length;
      post.author_reputation = reputation(post.author_reputation);
      post.avatar = `https://steemitimages.com/u/${post.author}/avatar/small`;
      post.body = markDown2Html(post.body)
      post.summary = postSummary(post.body, 200);
      post.raw_body = post.body;
      post.active_votes.sort((a,b) => {
        return b.rshares - a.rshares
      });
      if (post.active_votes.length > 2) {
        post.top_likers = [post.active_votes[0].voter, post.active_votes[1].voter, post.active_votes[2].voter]
      }
    });
    return posts;
  } 

  /**
   * TODO move it to Utils
   */
  export const reputation = (reputation) => {
    if (reputation == null) return reputation;
    reputation = parseInt(reputation);
    let log = Math.log10(reputation);
    log = log - 9;
    log = log * 9;
    log = log + 25;
    log = Math.floor(log);
    return log;
  }

  /**
   * @method getUser get user data
   * @param user post author
   * @param permlink post permlink
   */
  export const getPost = (user, permlink) => {
    return new Promise((resolve, reject) => {
      let post = client.database.call('get_content',[user,permlink]);
      resolve(post);
    });
  }

  /**
   * @method getUser get user data
   * @param user post author
   * @param permlink post permlink
   */
  export const getComments = (user, permlink) => {
    return new Promise((resolve, reject) => {
      let comments = client.database.call('get_content_replies',[user, permlink]);
      resolve(comments);
    });
  }

  /**
   * @method getPostWithComments get user data
   * @param user post author
   * @param permlink post permlink
   */
  export const getPostWithComments = async (user, permlink) => {
    let post;
    let comments;

    await getPost(user,permlink).then((result) => { post = result });
    await getComments(user,permlink).then((result) => { comments = result });

    return([post, comments])
  }
