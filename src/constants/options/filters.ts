export const DEFAULT_FEED_FILTERS = ['friends', 'communities', 'trending', 'hot'];
export const DEFAULT_COMMUNITY_FILTERS = ['trending', 'hot', 'created'];
export const DEFAULT_PROFILE_FILTERS = ['blog', 'posts', 'comments'];
export const DEFAULT_OWN_PROFILE_FILTERS = ['blog', 'posts', 'replies'];

export const FEED_SCREEN_FILTER_MAP: { [key: string]: string } = {
  friends: 'home.friends',
  communities: 'home.communities',
  trending: 'home.trending',
  hot: 'home.hot',
  created: 'home.new',
  blog: 'home.my_blog',
  posts: 'home.my_posts',
  comments: 'home.my_comments',
};

export const COMMUNITY_SCREEN_FILTER_MAP: { [key: string]: string } = {
  trending: 'home.trending',
  hot: 'home.hot',
  created: 'home.new',
  muted: 'community.muted',
  payout: 'community.payout',
};

export const PROFILE_SCREEN_FILTER_MAP: { [key: string]: string } = {
  blog: 'home.blog',
  posts: 'home.posts',
  comments: 'profile.comments',
  replies: 'profile.replies',
  wallet: 'profile.wallet',
};

export const GLOBAL_POST_FILTERS = ['home.TOP', 'home.HOT', 'home.NEW'];
export const GLOBAL_POST_FILTERS_VALUE = ['trending', 'hot', 'created'];

export const getFilterMap = (type: 'main' | 'community' | 'profile' | 'ownProfile') => {
  switch (type) {
    case 'community':
      return COMMUNITY_SCREEN_FILTER_MAP;
    case 'main':
      return FEED_SCREEN_FILTER_MAP;
    case 'profile':
      return PROFILE_SCREEN_FILTER_MAP;
    case 'ownProfile':
      return PROFILE_SCREEN_FILTER_MAP;
    default:
      return FEED_SCREEN_FILTER_MAP;
  }
};

export const getDefaultFilters = (type: 'main' | 'community' | 'profile' | 'ownProfile') => {
  switch (type) {
    case 'community':
      return DEFAULT_COMMUNITY_FILTERS;
    case 'main':
      return DEFAULT_FEED_FILTERS;
    case 'profile':
      return DEFAULT_PROFILE_FILTERS;
    case 'ownProfile':
      return DEFAULT_OWN_PROFILE_FILTERS;
  }
};
