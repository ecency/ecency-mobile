import { getAccountPosts, getPost, getRankedPosts } from '../../../providers/hive/dhive';
import { filterLatestPosts, getUpdatedPosts } from './tabbedPostsHelpers';
import { LoadPostsOptions } from './tabbedPostsModels';
import { getPromotedEntries } from '../../../providers/ecency/ecency';
import filterNsfwPost from '../../../utils/filterNsfwPost';

const POSTS_FETCH_COUNT = 20;

export const loadPosts = async ({
  filterKey,
  prevPosts,
  tabMeta,
  setTabMeta,
  isLatestPostsCheck = false,
  getFor,
  isConnected,
  isLoggedIn,
  refreshing,
  feedUsername,
  pinnedPermlink,
  pageType,
  tag,
  nsfw,
}: LoadPostsOptions) => {
  let filter = filterKey;

  // match filter with api if is friends
  if (filter === 'friends') {
    filter = 'feed';
  }

  const { isLoading, startPermlink, startAuthor } = tabMeta;

  // reject update if already loading
  if (
    isLoading ||
    !isConnected ||
    (!isLoggedIn && filterKey === 'feed') ||
    (!isLoggedIn && filterKey === 'communities')
  ) {
    return;
  }

  // reject update if no connection
  if (!isConnected && (refreshing || isLoading)) {
    setTabMeta({
      ...tabMeta,
      isLoading: false,
      isRefreshing: false,
    });
    return;
  }

  setTabMeta({
    ...tabMeta,
    isLoading: true,
    isRefreshing: refreshing,
  });

  let options = {};
  const limit = isLatestPostsCheck ? 5 : POSTS_FETCH_COUNT;
  let func = null;

  if (
    filter === 'feed' ||
    filter === 'communities' ||
    filter === 'posts' ||
    filter === 'blog' ||
    getFor === 'blog' ||
    filter === 'reblogs'
  ) {
    if (filter === 'communities') {
      func = getRankedPosts;
      options = {
        observer: feedUsername,
        sort: 'created',
        tag: 'my',
        limit,
      };
    } else {
      func = getAccountPosts;
      options = {
        observer: feedUsername || '',
        account: feedUsername,
        limit,
        sort: filter,
      };

      if (
        (pageType === 'profile' || pageType === 'ownProfile') &&
        (filter === 'feed' || filter === 'posts')
      ) {
        options.sort = 'posts';
      }
    }
  } else {
    func = getRankedPosts;
    options = {
      tag,
      limit,
      sort: filter,
    };
  }

  if (startAuthor && startPermlink && !refreshing && !isLatestPostsCheck) {
    options.start_author = startAuthor;
    options.start_permlink = startPermlink;
  }

  try {
    // fetching posts
    const result: any[] = await func(options, feedUsername, nsfw);

    if (result.length > 0) {
      if (filter === 'reblogs') {
        for (let i = result.length - 1; i >= 0; i--) {
          if (result[i].author === feedUsername) {
            result.splice(i, 1);
          }
        }
      }

      if ((pageType === 'profile' || pageType === 'ownProfile') && pinnedPermlink) {
        let pinnedIndex = -1;
        result.forEach((post, index) => {
          if (post.author === feedUsername && post.permlink === pinnedPermlink) {
            pinnedIndex = index;
          }
        });
        result.splice(pinnedIndex, 1);
      }
    }

    // if filter is feed convert back to reducer filter
    if (filter === 'feed') {
      filter = 'friends';
    }

    // cacheDispatch(updateFilterCache(filter, result, refreshing))
    setTabMeta({
      ...tabMeta,
      isLoading: false,
      isRefreshing: false,
    });

    const retData = {
      latestPosts: null,
      updatedPosts: null,
    };

    if (isLatestPostsCheck) {
      const latestPosts = filterLatestPosts(result, prevPosts.slice(0, 5));
      retData.latestPosts = latestPosts;
    } else {
      const updatedPosts = getUpdatedPosts(
        startAuthor && startPermlink ? prevPosts : [],
        result,
        refreshing,
        tabMeta,
        setTabMeta,
      );

      retData.updatedPosts = updatedPosts;
    }

    // fetch add pinned posts if applicable
    if (
      retData.updatedPosts &&
      pinnedPermlink &&
      retData.updatedPosts[0].permlink !== pinnedPermlink
    ) {
      const pinnedPost = await getPost(feedUsername, pinnedPermlink);
      pinnedPost.stats = { is_pinned_blog: true, ...pinnedPost.stats };
      retData.updatedPosts = [pinnedPost, ...retData.updatedPosts];
    }

    return retData;
  } catch (err) {
    setTabMeta({
      ...tabMeta,
      isLoading: false,
      isRefreshing: false,
    });
  }
};

export const fetchPromotedEntries = async (username: string, nsfwFilter: string) => {
  try {
    const posts = await getPromotedEntries(username);

    return Array.isArray(posts) ? filterNsfwPost(posts, nsfwFilter) : [];
  } catch (err) {
    console.warn('Failed to get promoted posts, ', err);
  }
};
