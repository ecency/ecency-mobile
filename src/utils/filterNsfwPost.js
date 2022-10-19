import get from 'lodash/get';
/* eslint-disable array-callback-return */
export default (posts, option) => {
  const updatedPosts = [];
  if (option === '1') {
    posts.map((post) => {
      if (post.parent_permlink === 'nsfw' || get(post, 'json_metadata.tags', []).includes('nsfw')) {
        post.nsfw = true;
      }
    });
    return posts;
  }

  // removes nsfw post from array ... filter value '2'
  if (posts) {
    posts.map((post) => {
      if (
        post.parent_permlink !== 'nsfw' &&
        !get(post, 'json_metadata.tags', []).includes('nsfw')
      ) {
        updatedPosts.push(post);
      }
    });
    return updatedPosts;
  }
};
/* eslint-enable */
