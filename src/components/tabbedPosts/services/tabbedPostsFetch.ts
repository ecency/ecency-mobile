import { getAccountPosts, getPost, getRankedPosts } from "../../../providers/hive/dhive";
import { filterLatestPosts, getUpdatedPosts } from "./tabbedPostsReducer";
import Matomo from 'react-native-matomo-sdk';
import { LoadPostsOptions } from "./tabbedPostsModels";
import { getPromotePosts } from "../../../providers/ecency/ecency";
import { get, isEmpty } from 'lodash';

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
    pageType,
    tag,
    nsfw,
    isAnalytics

}:LoadPostsOptions) => {
    let filter = filterKey;
    
    //match filter with api if is friends
    if(filter === 'friends'){
        filter = 'feed';
    }

    const {isLoading, startPermlink, startAuthor} = tabMeta;
    
    if (
        isLoading ||
      !isConnected ||
      (!isLoggedIn && filterKey === 'feed') ||
      (!isLoggedIn && filterKey === 'blog')
    ) {
      return;
    }

    if (!isConnected && (refreshing || isLoading)) {
      setTabMeta({
        ...tabMeta,
        isLoading:false,
        isRefreshing:false,
      })
      return;
    }

    setTabMeta({
      ...tabMeta,
      isLoading:true,
      isRefreshing:refreshing,
    })
        
    let options = {} as any;
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


    if (startAuthor && startPermlink && !refreshing && !isLatestPostsCheck) {
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

      // cacheDispatch(updateFilterCache(filter, result, refreshing))
      setTabMeta({
        ...tabMeta,
        isLoading:false,
        isRefreshing:false,
      })

      if(isLatestPostsCheck){
        const latestPosts = filterLatestPosts(result, prevPosts.slice(0, 5));
        return {latestPosts}
      }else{
        const updatedPosts = getUpdatedPosts(
          prevPosts,
          result,
          refreshing,
          tabMeta,
          setTabMeta
        )
        return {updatedPosts}
      }
      

    } catch (err) {
      setTabMeta({
        ...tabMeta,
        isLoading:false,
        isRefreshing:false,
      })
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



  export const getPromotedPosts = async (username:string) => {
    try {
      const res = await getPromotePosts();
      if (res && res.length) {
        const _promotedPosts = await Promise.all(
          res.map((item) =>
            getPost(get(item, 'author'), get(item, 'permlink'), username, true).then(
              (post) => post,
            ),
          ),
        );
  
        // if (isMountedRef.current) {
          return _promotedPosts;
        // }
      } else {
        return [];
      }
    } catch(err){
      console.warn("Failed to get promoted posts, ", err)
    }
  }