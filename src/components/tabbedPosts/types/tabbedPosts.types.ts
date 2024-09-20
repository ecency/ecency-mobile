export interface TabbedPostsProps {
  filterOptions: string[];
  filterOptionsValue: string[];
  isFeedScreen: boolean;
  feedUsername: string;
  selectedOptionIndex: number;
  feedSubfilterOptions: string[];
  feedSubfilterOptionsValue: string[];
  getFor: string;
  pageType: 'main' | 'community' | 'profile' | 'ownProfile';
  tag: string;
  forceLoadPosts: boolean;
  tabContentOverrides: Map<number, any>;
  stackedTabs: boolean;
  pinnedPermlink?: string;
  handleOnScroll: () => void;
}

export interface PostsTabContentProps {
  filterKey: string;
  isFeedScreen: boolean;
  isInitialTab: boolean;
  getFor: string;
  pageType: 'main' | 'profile' | 'ownProfile' | 'community';
  feedUsername: string;
  tag: string;
  forceLoadPosts: boolean;
  filterScrollRequest: string;
  pinnedPermlink?: string;
  onScrollRequestProcessed: () => void;
  handleOnScroll: () => void;
  handleOnScrollBeginDrag?: () => void;
}
