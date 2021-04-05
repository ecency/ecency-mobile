import { TabItem } from "../view/stackedTabBar";
import unionBy from 'lodash/unionBy';

export const CacheActions = {
    SET_FILTER_LOADING:'SET_FILTER_LOADING',
    SET_FILTER_REFRESHING:'SET_FILTER_REFRESHING',
    UPDATE_FILTER_CACHE:'UPDATE_FILTER_CACHE',
    RESET_CURRENT_FILTER_CACHE:'RESET_CURRENT_FILTER_CACHE',
    SET_SELECTED_FILTER:'SET_SELECTED_FILTER',
    RESET_CACHE:'RESET_CACHE',
    ON_LOAD_COMPLETE:'ON_LOAD_COMPLETE'
}

export interface CachedDataEntry {
    posts:any[],
    startAuthor: string;
    startPermlink: string;
    isLoading: boolean;
    isRefreshing: boolean;
    isNoPost:boolean;

}

export interface PostsCache {
    isFeedScreen: boolean,
    selectedFilter: string,
    isLoggedIn:boolean,
    isMounted:boolean
    cachedData: Map<string, CachedDataEntry>,
}


//actions
export const setSelectedFilter = (filter:string) => ({
    payload:{
        selectedFilter:filter
    },
    type:CacheActions.SET_SELECTED_FILTER
})

export const setFilterLoading = (filter:string, isLoading:boolean) => ({
    payload:{
        filter,
        isLoading
    },
    type:CacheActions.SET_FILTER_LOADING
})

export const onLoadComplete = (filter:string) => ({
    payload:{
        filter,
    },
    type:CacheActions.ON_LOAD_COMPLETE
})

export const updateFilterCache = (filter:string, posts:any[], refreshing:boolean) => ({
    payload: {
        filter,
        posts,
        shouldReset: refreshing,
    },
    type: CacheActions.UPDATE_FILTER_CACHE,
})


export const initCacheState = (filters:TabItem[], selectedFilter:string, isFeedScreen:boolean) => {
    const cachedData = {};

    filters.forEach((option) => {
        cachedData[option.filterKey] = {
          posts: [],
          startAuthor: '',
          startPermlink: '',
          isLoading: false,
          isNoPost:false,
        } as CachedDataEntry;
    });

    return {
      isFeedScreen,
      selectedFilter: selectedFilter,
      cachedData,
      isMounted:true,
    } as PostsCache;
  };




  //Reducer
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


      //update filter cache
      case CacheActions.UPDATE_FILTER_CACHE: {

        const filter = action.payload.filter;
        const nextPosts = action.payload.posts;
        const shouldReset = action.payload.shouldReset;

        //return state as is if component is unmounter
        if(!state.isMounted){
            return state;
        }

        let _posts = nextPosts;
        

        const isFeedScreen = state.isFeedScreen
        const cachedEntry:CachedDataEntry = state.cachedData[filter];
        if (!cachedEntry) {
          throw new Error('No cached entry available');
        }

        if(nextPosts.length === 0){
            cachedEntry.isNoPost = true;
            state.cachedData[filter] = cachedEntry;
            return state;
        }

        const refreshing = cachedEntry.isRefreshing;
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
        const data  = Object.create(state.cachedData);
        data[filter] = {
            ...cachedEntry,
            startAuthor : _posts[_posts.length - 1] && _posts[_posts.length - 1].author,
            startPermlink : _posts[_posts.length - 1] && _posts[_posts.length - 1].permlink,
            posts : _posts,
        }
        // cachedEntry.startAuthor = _posts[_posts.length - 1] && _posts[_posts.length - 1].author;
        // cachedEntry.startPermlink = _posts[_posts.length - 1] && _posts[_posts.length - 1].permlink;
        // cachedEntry.posts = _posts;

        // state.cachedData[filter] = cachedEntry;

        state.cachedData = data
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


      case CacheActions.ON_LOAD_COMPLETE: {
        const filter = action.payload.filter;

        const cachedEntry:CachedDataEntry = state.cachedData[filter];
        if (!cachedEntry) {
          throw new Error('No cached entry available');
        }
        cachedEntry.isLoading = false;
        cachedEntry.isRefreshing = false;

        state.cachedData[filter] = cachedEntry;

        return state;
      }

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

