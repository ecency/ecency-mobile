export interface TabItem {
  filterKey: string;
  label: string;
}

export interface TabbedPostsProps {
  tabFilters: TabItem[];
  isFeedScreen: boolean;
  feedUsername: string;
  selectedOptionIndex: number;
  pageType: 'main' | 'community' | 'profile' | 'ownProfile';
  tag: string;
  forceLoadPosts: boolean;
  tabContentOverrides?: Map<number, any>;
  pinnedPermlink?: string;
  handleOnScroll: () => void;
}

export interface PostsTabContentProps {
  filterKey: string;
  isFeedScreen: boolean;
  isInitialTab: boolean;
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
