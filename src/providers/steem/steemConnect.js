import steemConnect from './steemConnectAPI';

/**
 * @method to upvote/unvote a content
 * @param {*} vote
 */
export const vote = vote => new Promise((resolve, reject) => {
  steemConnect
    .vote(vote.voter, vote.author, vote.permlink, vote.weight)
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
export const comment = comment => new Promise((resolve, reject) => {
  steemConnect
    .comment(
      comment.parentAuthor,
      comment.parentPermlink,
      comment.author,
      comment.permlink,
      comment.title,
      comment.body,
      comment.jsonMetadata,
    )
    .then((result) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
});

export const post = (post) => {
  // Create empty array for the operations
  const operations = [];

  // Create the object for the post
  const commentOp = [
    'comment',
    {
      parent_author: '', // Since it is a post, parent author is empty
      parent_permlink: post.tags[0], // Parent permlink will be the 0th index in the tags array
      author: post.author, // Author is the current logged in username
      permlink: post.permlink, // Permlink of the post
      title: post.title, // Title of the post
      body: post.description, // Description of the post
      json_metadata: post.json_metadata, // JSON string with the tags, app, and format
    },
  ];
  operations.push(commentOp);

  const commentOptionsConfig = prepareBeneficiaries(post);

  operations.push(commentOptionsConfig);

  return new Promise((resolve, reject) => {
    steemConnect
      .broadcast(operations)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const prepareBeneficiaries = (post) => {
  const beneficiariesObject = {
    author: post.author,
    permlink: post.permlink,
    allow_votes: true,
    allow_curation_rewards: true,
    max_accepted_payout: '1000000.000 SBD',
    percent_steem_dollars: '10000',
    extensions: [
      [
        0,
        {
          beneficiaries: [
            {
              account: 'esteemapp',
              weight: 1000, // 10%
            },
          ],
        },
      ],
    ],
  };

  return ['comment_options', beneficiariesObject];
};

export const follow = data => new Promise((resolve, reject) => {
  steemConnect
    .follow(data.follower, data.following)
    .then((result) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
});

export const unFollow = data => new Promise((resolve, reject) => {
  steemConnect
    .unfollow(data.unfollower, data.unfollowing)
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
export const claimRewards = data => new Promise((resolve, reject) => {
  steemConnect
    .claimRewardBalance(data.account, data.rewardSteem, data.rewardSBD, data.VESTS)
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
export const muteUser = data => new Promise((resolve, reject) => {
  steemConnect
    .ignore(data.follower, data.following)
    .then((result) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
});

export const reblogPost = data => new Promise((resolve, reject) => {
  steemConnect
    .reblog(data.account, data.author, data.permlink)
    .then((result) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
});

export const removeAccessToken = data => new Promise((resolve, reject) => {
  try {
    steemConnect.removeAccessToken();
    resolve();
  } catch (error) {
    reject(error);
  }
});

/**
 * @method to revoke access token (SteemConnect logout function)
 */
export const revokeToken = () => new Promise((resolve, reject) => {
  try {
    steemConnect.revokeToken();
    resolve();
  } catch (error) {
    reject(error);
  }
});

/**
 * @method to update user profile data
 * @param {*} data
 */
export const updateUserMetadata = data => new Promise((resolve, reject) => {
  steemConnect
    .updateUserMetadata(data)
    .then((result) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
});
