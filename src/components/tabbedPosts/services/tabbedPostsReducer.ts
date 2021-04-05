import { TabItem } from "../view/stackedTabBar";
import unionBy from 'lodash/unionBy';

export const CacheActions = {
    SET_FILTER_LOADING:'SET_FILTER_LOADING',
    SET_FILTER_REFRESHING:'SET_FILTER_REFRESHING',
    UPDATE_FILTER_CACHE:'UPDATE_FILTER_CACHE',
    RESET_CURRENT_FILTER_CACHE:'RESET_CURRENT_FILTER_CACHE',
    SET_SELECTED_FILTER:'SET_SELECTED_FILTER',
    RESET_CACHE:'RESET_CACHE'
}

export interface CachedDataEntry {
    posts:any[],
    startAuthor: string;
    startPermlink: string;
    isLoading: boolean;
}

export interface PostsCache {
    isFeedScreen: boolean,
    selectedFilter: string,
    isLoggedIn:boolean,
    cachedData: Map<string, CachedDataEntry>,
}


//actions
export const setSelectedFilter = (filter:string) => ({
    payload:{
        selectedFilter:filter
    },
    action:CacheActions.SET_SELECTED_FILTER
})

export const setFilterLoading = (filter:string, isLoading:boolean) => ({
    payload:{
        filter,
        isLoading
    },
    action:CacheActions.SET_FILTER_LOADING
})


export const initCacheState = (filters:TabItem[], selectedFilter:string, isFeedScreen:boolean) => {
    const cachedData = {};

    filters.forEach((option) => {
        cachedData[option.filterKey] = {
          posts: [],
          startAuthor: '',
          startPermlink: '',
          isLoading: false,
        } as CachedDataEntry;
    });

    return {
      isFeedScreen,
      selectedFilter: selectedFilter,
      cachedData,
    } as PostsCache;
  };


export const cacheReducer = (state:PostsCache, action) => {
    console.log('reducer action:', action);

    switch (action.type) {
      case CacheActions.SET_FILTER_LOADING: {
        const filter = action.payload.filter;
        const loading = action.payload.isLoading;
        state.cachedData[filter].isLoading = loading;

        return state;
      }

      case CacheActions.SET_FILTER_REFRESHING: {
        const filter = action.payload.filter;
        const refreshing = action.payload.isRefreshing;
        state.cachedData[filter].isRefreshing = refreshing;
        return state;
      }


      case CacheActions.UPDATE_FILTER_CACHE: {
        const filter = action.payload.filter;
        const nextPosts = action.payload.posts;
        const shouldReset = action.payload.shouldReset;

        let _posts = nextPosts;

        const isFeedScreen = state.isFeedScreen
        const cachedEntry = state.cachedData[filter];
        if (!cachedEntry) {
          throw new Error('No cached entry available');
        }

        const refreshing = cachedEntry.refreshing;
        const prevPosts = cachedEntry.posts;
    

        if (prevPosts.length > 0 && !shouldReset) {
          if (refreshing) {
            _posts = unionBy(_posts, prevPosts, 'permlink');
          } else {
            _posts = unionBy(prevPosts, _posts, 'permlink');
          }
        }
        //cache latest posts for main tab for returning user
        else if (isFeedScreen) {
        //   //schedule refetch of new posts by checking time of current post
        //   _scheduleLatestPostsCheck(nextPosts[0]);

        //   if (filter == (get(currentAccount, 'name', null) == null ? 'hot' : 'friends')) {
        //     _setInitPosts(nextPosts);
        //   }
        }

        //update stat
        cachedEntry.startAuthor = _posts[_posts.length - 1] && _posts[_posts.length - 1].author;
        cachedEntry.startPermlink = _posts[_posts.length - 1] && _posts[_posts.length - 1].permlink;
        cachedEntry.posts = _posts;

        state.cachedData[filter] = cachedEntry;

        //dispatch to redux
        // if (
        //   filter === (state.selectedFilter !== 'feed' ? state.selectedFilter : state.currentSubFilter)
        // ) {
        //   _setFeedPosts(_posts);
        // }
        return state;
      }

      case CacheActions.RESET_CURRENT_FILTER_CACHE: {
        const filter = state.selectedFilter;
        const cachedEntry = state.cachedData[filter];
        if (!cachedEntry) {
          throw new Error('No cached entry available');
        }
        cachedEntry.startAuthor = '';
        cachedEntry.startPermlink = '';
        cachedEntry.posts = [];

        state.cachedData[filter] = cachedEntry;

        //dispatch to redux
        // _setFeedPosts([]);

        return state;
      }

      case CacheActions.SET_SELECTED_FILTER: {
        const filter = action.payload.selectedFilter;
        state.selectedFilter = filter;

        // const data = state.cachedData[filter !== 'feed' ? filter : state.currentSubFilter];
        // _setFeedPosts(data.posts, data.scrollPosition);

        // if (filter !== 'feed' && isFeedScreen) {
        //   _scheduleLatestPostsCheck(data.posts[0]);
        //   setNewPostsPopupPictures(null);
        // }

        return state;
      }

    //   case 'change-sub-filter': {
    //     const filter = action.payload.currentSubFilter;
    //     state.currentSubFilter = filter;

    //     //dispatch to redux;
    //     const data = state.cachedData[filter];
    //     _setFeedPosts(data.posts, data.scrollPosition);
    //     if (isFeedScreen) {
    //     //   _scheduleLatestPostsCheck(data.posts[0]);
    //     //   setNewPostsPopupPictures(null);
    //     }
    //     return state;
    //   }

    //   case 'scroll-position-change': {
    //     const scrollPosition = action.payload.scrollPosition || 0;
    //     const filter = state.selectedFilter;
    //     const subFilter = state.currentSubFilter;

    //     const cacheFilter = filter !== 'feed' ? filter : subFilter;

    //     state.cachedData[cacheFilter].scrollPosition = scrollPosition;
    //     return state;
    //   }

      case CacheActions.RESET_CACHE: {
         for(const key in state.cachedData){
            if(state.cachedData.hasOwnProperty(key)){
                state.cachedData[key] = {
                    posts:[],
                    startAuthor:'',
                    startPermlink:'',
                    isLoading:false
                } as CachedDataEntry
            }
        }
 
        return state;
      }

      default:
        return state;
    }
  };

