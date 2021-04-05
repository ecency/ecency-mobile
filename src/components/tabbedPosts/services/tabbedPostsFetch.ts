import { Dispatch, ReducerAction } from "react";
import { getAccountPosts, getRankedPosts } from "../../../providers/hive/dhive";
import { CachedDataEntry, onLoadComplete, PostsCache, setFilterLoading, updateFilterCache } from "./tabbedPostsReducer";
import Matomo from 'react-native-matomo-sdk';


export interface LoadPostsOptions {
    cache:PostsCache, 
    cacheDispatch:Dispatch<ReducerAction<any>>,
    getFor:string,
    isConnected:boolean,
    isLoggedIn:boolean,
    feedUsername:string,
    pageType:string,
    tag:string,
    nsfw:string,
    isAnalytics:boolean,
    isLatestPostCheck?:boolean,
    refreshing?:boolean,
    passedFilter?:string; 
}

export const loadPosts = async ({
    passedFilter, 
    cache, 
    cacheDispatch, 
    isLatestPostCheck = false,
    getFor,
    isConnected,
    isLoggedIn,
    refreshing,
    feedUsername,
    pageType,
    tag,
    nsfw,
    isAnalytics

}:LoadPostsOptions) => {
    let filter = passedFilter || cache.selectedFilter;
    
    //match filter with api if is friends
    if(filter === 'friends'){
        filter = 'feed';
    }

    const {isLoading, startPermlink, startAuthor}:CachedDataEntry = cache.cachedData[filter];
    
    if (
        isLoading ||
      !isConnected ||
      (!isLoggedIn && passedFilter === 'feed') ||
      (!isLoggedIn && passedFilter === 'blog')
    ) {
      return;
    }

    if (!isConnected && (refreshing || isLoading)) {
      cacheDispatch(onLoadComplete(cache,filter))
      return;
    }

    cacheDispatch(setFilterLoading(cache,filter, true));
        
    let options = {} as any;
    const limit = isLatestPostCheck ? 5 : 20;
    let func = null;

    if (
      filter === 'feed' ||
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
        };
      } else {
        func = getAccountPosts;
        options = {
          observer: feedUsername || '',
          account: feedUsername,
          limit,
          sort: filter,
        };

        if (pageType === 'profiles' && (filter === 'feed' || filter === 'posts')) {
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


    if (startAuthor && startPermlink && !refreshing && !isLatestPostCheck) {
      options.start_author = startAuthor;
      options.start_permlink = startPermlink;
    }

    try {
      const result:any[] = await func(options, feedUsername, nsfw);

      if(result.length > 0 && filter === 'reblogs'){
        for (let i = result.length - 1; i >= 0; i--) {
            if (result[i].author === feedUsername) {
                result.splice(i, 1);
            }
          }
      }

      //if filter is feed convert back to reducer filter
      if(filter === 'feed'){
          filter = 'friends'
      }
      cacheDispatch(updateFilterCache(cache, filter, result, refreshing))
      cacheDispatch(onLoadComplete(cache,filter));

    } catch (err) {
      
      cacheDispatch(onLoadComplete(cache,filter));
    }

    // track filter and tag views
    if (isAnalytics) {
      if (tag) {
        Matomo.trackView([`/${filter}/${tag}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      } else if (filter === 'friends' || filter === 'communities') {
        Matomo.trackView([`/@${feedUsername}/${filter}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      } else {
        Matomo.trackView([`/${filter}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      }
    }
  };