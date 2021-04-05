import { Dispatch, ReducerAction } from "react";
import { getAccountPosts, getRankedPosts } from "../../../providers/hive/dhive";
import { CachedDataEntry, onLoadComplete, PostsCache, setFilterLoading, updateFilterCache } from "./tabbedPostsReducer";
import Matomo from 'react-native-matomo-sdk';


interface LoadPostsOptions {
    type:string; 
    cache:PostsCache, 
    cacheDispatch:Dispatch<ReducerAction<any>>, 
    isLatestPostCheck:boolean,
    getFor:string,
    isConnected:boolean,
    isLoggedIn:boolean,
    refreshing:boolean,
    username:string,
    pageType:string,
    tag:string,
    nsfw:string,
    isAnalytics:boolean
}

export const loadPosts = async ({
    type, 
    cache, 
    cacheDispatch, 
    isLatestPostCheck = false,
    getFor,
    isConnected,
    isLoggedIn,
    refreshing,
    username,
    pageType,
    tag,
    nsfw,
    isAnalytics

}:LoadPostsOptions) => {
    const filter = type || cache.selectedFilter;

    const {isLoading, startPermlink, startAuthor}:CachedDataEntry = cache.cachedData[filter];
    
    if (
        isLoading ||
      !isConnected ||
      (!isLoggedIn && filter === 'feed') ||
      (!isLoggedIn && filter === 'blog')
    ) {
      return;
    }

    if (!isConnected && (refreshing || isLoading)) {
      cacheDispatch(onLoadComplete(filter))
      return;
    }

    cacheDispatch(setFilterLoading(filter, true));
        
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
          observer: username,
          sort: 'created',
          tag: 'my',
        };
      } else {
        func = getAccountPosts;
        options = {
          observer: username || '',
          account: username,
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
      const result = await func(options, username, nsfw);

      if(result.lenght > 0 && filter === 'reblogs'){
        for (let i = result.length - 1; i >= 0; i--) {
            if (result[i].author === username) {
                result.splice(i, 1);
            }
          }
      }

      cacheDispatch(updateFilterCache(filter, result, refreshing))
      cacheDispatch(onLoadComplete(filter));

    } catch (err) {
      
      cacheDispatch(onLoadComplete(filter));
    }

    // track filter and tag views
    if (isAnalytics) {
      if (tag) {
        Matomo.trackView([`/${filter}/${tag}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      } else if (filter === 'friends' || filter === 'communities') {
        Matomo.trackView([`/@${username}/${filter}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      } else {
        Matomo.trackView([`/${filter}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      }
    }
  };