export default (posts, option) => {
  const updatedPosts = [];
  if (option === '1') {
    posts.map((post) => {
      if (post.parent_permlink === 'nsfw' || post.json_metadata.tags.includes('nsfw')) {
        post.image = 'https://steemitimages.com/p/Zskj9C56UonWToSX7uRkL8H89BqdWqSPnzP84oDpA65G4PfbZk688V2cRYbWszK7zoMMj35CfbJfcXuJSSwTvasK4pPKfHMy2xjGJSkmqs8gLQnoddR8?format=match&mode=fit&width=600&height=600';
      }
    });
    return posts;
  }
  posts.map((post) => {
    if (post.parent_permlink !== 'nsfw' && !post.json_metadata.tags.includes('nsfw')) {
      updatedPosts.push(post);
    }
  });
  return updatedPosts;
};
