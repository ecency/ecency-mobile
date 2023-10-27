import unionBy from 'lodash/unionBy';
import { TabMeta } from './tabbedPostsModels';

// cacludate posts check refresh time for selected filter;
export const calculateTimeLeftForPostCheck = (firstPost: any) => {
  const refetchTime = 600000;

  // schedules refresh 30 minutes after last post creation time
  const currentTime = new Date().getTime();
  const createdAt = new Date(firstPost.created).getTime();

  const timeSpent = currentTime - createdAt;
  let timeLeft = refetchTime - timeSpent;
  if (timeLeft < 30000) {
    timeLeft = refetchTime;
  }
  return timeLeft;
};

// filter posts that are not present in top 5 posts currently in list.
export const filterLatestPosts = (fetchedPosts: any[], cachedPosts: any[]) => {
  // console.log('Comparing: ', fetchedPosts, cachedPosts);

  const latestPosts = [];
  fetchedPosts.forEach((post) => {
    const newPostAuthPrem = post.author + post.permlink;
    const postExist = cachedPosts.find((cPost) => cPost.author + post.permlink === newPostAuthPrem);

    if (!postExist) {
      latestPosts.push(post);
    }
  });

  if (latestPosts.length > 0) {
    return latestPosts.slice(0, 5);
  } else {
    return [];
  }
};

// process posts result and return updated posts for the list.
export const getUpdatedPosts = (
  prevPosts: any[],
  nextPosts: any[],
  shouldReset: boolean,
  tabMeta: TabMeta,
  setTabMeta: (meta: TabMeta) => void,
) => {
  // return state as is if component is unmounter
  let _posts = nextPosts;

  if (nextPosts.length === 0) {
    setTabMeta({
      ...tabMeta,
      isNoPost: true,
    });
    return shouldReset ? [] : prevPosts;
  }

  const refreshing = tabMeta.isRefreshing;

  if (prevPosts.length > 0 && !shouldReset) {
    if (refreshing) {
      _posts = unionBy(_posts, prevPosts, 'permlink');
    } else {
      _posts = unionBy(prevPosts, _posts, 'permlink');
    }
  }

  setTabMeta({
    ...tabMeta,
    startAuthor: _posts[_posts.length - 1] && _posts[_posts.length - 1].author,
    startPermlink: _posts[_posts.length - 1] && _posts[_posts.length - 1].permlink,
  });

  return _posts;
};
