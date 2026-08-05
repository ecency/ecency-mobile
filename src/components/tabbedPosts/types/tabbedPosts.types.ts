export interface TabItem {
  filterKey: string;
  label: string;
}

export interface TabbedPostsProps {
  tabFilters: TabItem[];
  isFeedScreen?: boolean;
  feedUsername?: string;
  selectedOptionIndex: number;
  pageType: 'main' | 'community' | 'profile' | 'ownProfile';
  // absent on profile pages; the container falls back to ''
  tag?: string;
  // optional: the feed screen omits it; the tab content guards the callback
  onChangeTab?: (event: any) => void;
  tabContentOverrides?: Map<number, any>;
  pinnedPermlink?: string;
  handleOnScroll?: (event?: any) => void;
  handleOnScrollBeginDrag?: any;
}

export interface PostsTabContentProps {
  filterKey: string;
  isFeedScreen?: boolean;
  isInitialTab: boolean;
  pageType: 'main' | 'profile' | 'ownProfile' | 'community';
  feedUsername?: string;
  tag: string;
  filterScrollRequest?: string | null;
  pinnedPermlink?: string;
  onScrollRequestProcessed: () => void;
  handleOnScroll: (event?: any) => void;
  handleOnScrollBeginDrag?: () => void;
}
