export default (posts, option) => {
  const updatedPosts = [];
  if (option === '1') {
    posts.map(post => {
      if (post.parent_permlink === 'nsfw' || post.json_metadata.tags.includes('nsfw')) {
        post.nsfw = true;
      }
    });
    return posts;
  }
<<<<<<< HEAD
  posts.map(post => {
    if (post.parent_permlink !== 'nsfw' && !post.json_metadata.tags.includes('nsfw')) {
      updatedPosts.push(post);
    }
  });
  return updatedPosts;
=======

  if (posts) {
    posts.map((post) => {
      if (post.parent_permlink !== 'nsfw' && !post.json_metadata.tags.includes('nsfw')) {
        updatedPosts.push(post);
      }
    });
    return updatedPosts;
  }
>>>>>>> 3bd23bb1faf32382b70b2851b200099e6dd0b945
};
