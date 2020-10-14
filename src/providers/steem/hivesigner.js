import hs from './hivesignerAPI';
import { makeOptions } from '../../utils/editor';

/**
 * @method to upvote/unvote a content
 * @param {*} vote
 */
export const vote = (voteObj) =>
  new Promise((resolve, reject) => {
    hs.vote(voteObj.voter, voteObj.author, voteObj.permlink, voteObj.weight)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

/**
 * @method to submit a comment/reply
 * @param {*} comment
 */
export const comment = (commentObj) =>
  new Promise((resolve, reject) => {
    hs.comment(
      commentObj.parentAuthor,
      commentObj.parentPermlink,
      commentObj.author,
      commentObj.permlink,
      commentObj.title,
      commentObj.body,
      commentObj.jsonMetadata,
    )
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const post = (postObj) => {
  // Create empty array for the operations
  const operations = [];

  // Create the object for the post
  const commentOp = [
    'comment',
    {
      parent_author: '', // Since it is a post, parent author is empty
      parent_permlink: postObj.tags[0], // Parent permlink will be the 0th index in the tags array
      author: postObj.author, // Author is the current logged in username
      permlink: postObj.permlink, // Permlink of the post
      title: postObj.title, // Title of the post
      body: postObj.description, // Description of the post
      json_metadata: postObj.json_metadata, // JSON string with the tags, app, and format
    },
  ];
  operations.push(commentOp);

  const commentOptionsConfig = makeOptions(postObj);

  operations.push(commentOptionsConfig);

  return new Promise((resolve, reject) => {
    hs.broadcast(operations)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const prepareBeneficiaries = (postObj) => {
  const beneficiariesObject = {
    author: postObj.author,
    permlink: postObj.permlink,
    allow_votes: true,
    allow_curation_rewards: true,
    max_accepted_payout: '1000000.000 HBD',
    percent_hbd: '10000',
    extensions: [
      [
        0,
        {
          beneficiaries: [
            {
              account: 'ecency',
              weight: 100, // 1%
            },
          ],
        },
      ],
    ],
  };

  return ['comment_options', beneficiariesObject];
};

export const follow = (data) =>
  new Promise((resolve, reject) => {
    hs.follow(data.follower, data.following)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const unFollow = (data) =>
  new Promise((resolve, reject) => {
    hs.unfollow(data.unfollower, data.unfollowing)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

/**
 * @method to claim rewards
 * @param {*} data
 */
export const claimRewards = (data) =>
  new Promise((resolve, reject) => {
    hs.claimRewardBalance(data.account, data.rewardSteem, data.rewardSBD, data.VESTS)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

/**
 * @method to mute/block an user
 * @param {*} data
 */
export const muteUser = (data) =>
  new Promise((resolve, reject) => {
    hs.ignore(data.follower, data.following)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const reblogPost = (data) =>
  new Promise((resolve, reject) => {
    hs.reblog(data.account, data.author, data.permlink)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const removeAccessToken = (data) =>
  new Promise((resolve, reject) => {
    try {
      hs.removeAccessToken();
      resolve();
    } catch (error) {
      reject(error);
    }
  });

/**
 * @method to revoke access token (Hivesigner logout function)
 */
export const revokeToken = () =>
  new Promise((resolve, reject) => {
    try {
      hs.revokeToken();
      resolve();
    } catch (error) {
      reject(error);
    }
  });

/**
 * @method to update user profile data
 * @param {*} data
 */
export const updateUserMetadata = (data) =>
  new Promise((resolve, reject) => {
    hs.updateUserMetadata(data)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
