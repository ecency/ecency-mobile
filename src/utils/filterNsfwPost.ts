import get from 'lodash/get';

export interface Post {
  parent_permlink?: string;
  json_metadata?: {
    tags?: string[];
    [key: string]: any;
  };
  nsfw?: boolean;
  [key: string]: any;
}

const filterNsfwPost = (posts: Post[], option: string): Post[] => {
  const updatedPosts: Post[] = [];

  switch (option) {
    case '0':
      return posts;

    case '1':
      posts.forEach((post) => {
        if (
          post.parent_permlink === 'nsfw' ||
          get(post, 'json_metadata.tags', []).includes('nsfw')
        ) {
          post.nsfw = true;
        }
      });
      return posts;

    default:
      posts.forEach((post) => {
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

export default filterNsfwPost;
