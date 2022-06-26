import { renderPostBody } from '@ecency/render-helper';
import { Platform } from 'react-native';
import { convertCommunityRes } from '../../providers/ecency/converters';
import { getCommunities, getSubscriptions, subscribeCommunity } from '../../providers/hive/dhive';
import { makeJsonMetadataReply } from '../../utils/editor';
import {
  UPDATE_VOTE_CACHE,
  PURGE_EXPIRED_CACHE,
  UPDATE_COMMENT_CACHE,
  DELETE_COMMENT_CACHE_ENTRY,
  UPDATE_DRAFT_CACHE,
  DELETE_DRAFT_CACHE_ENTRY,
  UPDATE_COMMUNITIES_CACHE,
  SET_COMMUNITIES_CACHE,
  SET_LOADING,
  SET_FETCHING_SUBSCRIBED_COMMUNITIES,
  SET_SUBSCRIBING_COMMUNITY,
  TOAST_NOTIFICATION,
  SET_DISCOVER_COMMUNITIES_CACHE,
  SET_FETCHING_DISCOVER_COMMUNITIES,
  UPDATE_DISCOVER_COMMUNITIES_CACHE,
} from '../constants/constants';
import { Comment, Community, Draft, Vote } from '../reducers/cacheReducer';




export const updateVoteCache = (postPath: string, vote: Vote) => ({
  payload: {
    postPath,
    vote
  },
  type: UPDATE_VOTE_CACHE
})


interface CommentCacheOptions {
  isUpdate?: boolean;
  parentTags?: Array<string>;
}

export const updateCommentCache = (commentPath: string, comment: Comment, options: CommentCacheOptions = { isUpdate: false }) => {

  console.log("body received:", comment.markdownBody);
  const updated = new Date();
  updated.setSeconds(updated.getSeconds() - 5); //make cache delayed by 5 seconds to avoid same updated stamp in post data
  const updatedStamp = updated.toISOString().substring(0, 19); //server only return 19 character time string without timezone part

  if (options.isUpdate && !comment.created) {
    throw new Error("For comment update, created prop must be provided from original comment data to update local cache");
  }

  if (!options.parentTags && !comment.json_metadata) {
    throw new Error("either of json_metadata in comment data or parentTags in options must be provided");
  }

  comment.created = comment.created || updatedStamp;  //created will be set only once for new comment;
  comment.updated = comment.updated || updatedStamp;
  comment.expiresAt = comment.expiresAt || updated.getTime() + 6000000;//600000;
  comment.active_votes = comment.active_votes || [];
  comment.net_rshares = comment.net_rshares || 0;
  comment.author_reputation = comment.author_reputation || 25;
  comment.total_payout = comment.total_payout || 0;
  comment.json_metadata = comment.json_metadata || makeJsonMetadataReply(options.parentTags)
  comment.isDeletable = comment.isDeletable || true;

  comment.body = renderPostBody({
    author: comment.author,
    permlink: comment.permlink,
    last_update: comment.updated,
    body: comment.markdownBody,
  }, true, Platform.OS === 'android');

  return ({
    payload: {
      commentPath,
      comment
    },
    type: UPDATE_COMMENT_CACHE
  })
}

export const deleteCommentCacheEntry = (commentPath: string) => ({
  payload: commentPath,
  type: DELETE_COMMENT_CACHE_ENTRY
})

export const updateDraftCache = (id: string, draft: Draft) => ({
  payload: {
    id,
    draft
  },
  type: UPDATE_DRAFT_CACHE
})

export const deleteDraftCacheEntry = (id: string) => ({
  payload: id,
  type: DELETE_DRAFT_CACHE_ENTRY
})

// Communities Cache Actions
export const fetchSubscribedCommunities = (username) => {
  return (dispatch) => {
    dispatch(setFetchingSubscribedCommunities(true));
    getSubscriptions(username)
      .then((res) => {
        if(res && res.length > 0){
          const subscribedCommunities = res.map((item) => convertCommunityRes(item));
          dispatch(fetchCommunitiesSuccess(subscribedCommunities));
          dispatch(setFetchingSubscribedCommunities(false));
          dispatch(fetchDiscoverCommunities()); //fetch discovers after fetching subscriptions, as discovers depends on subscribed data
        }
      })
      .catch((err) => {
        console.log('Error while fetching subscriptions : ', err);
        dispatch(setFetchingSubscribedCommunities(false));
      });
  };
};

export const fetchCommunitiesSuccess = (payload) => ({
  payload,
  type: SET_COMMUNITIES_CACHE,
});

export const updateCommunitiesSubscription = (currentAccount: any, pin: any, item: Community, successText: string, failText: string) => {
  return (dispatch) => {
    dispatch(setSubscribingCommunity(true));
    subscribeCommunity(currentAccount, pin, item)
      .then((res) => {
        dispatch(subscribeCommunitySuccess(item));
        dispatch(showToast(successText));
        dispatch(updateDiscoverCommunities()); //update discovers data when subscription is changed
      })
      .catch((err) => {
        console.log('Error while subscribing : ', err);
        dispatch(setSubscribingCommunity(false));
        dispatch(showToast(failText));
      });
    
  };
};

export const subscribeCommunitySuccess = (payload: Community) => ({
  type: UPDATE_COMMUNITIES_CACHE,
  payload,
})

export const fetchDiscoverCommunities = () => {
  return (dispatch) => {
    dispatch(setFetchingDiscoverCommunities(true));
    getCommunities('', 50, null, 'rank')
      .then((communities) => {
        dispatch(fetchDiscoverCommunitiesSuccess(communities));
      })
      .catch((err) => {
        console.warn('Failed to get subscriptions', err);
        dispatch(setFetchingDiscoverCommunities(false));
      });
  };
};

export const fetchDiscoverCommunitiesSuccess = (payload) => ({
  payload,
  type: SET_DISCOVER_COMMUNITIES_CACHE,
});

export const updateDiscoverCommunities = () => ({
  type: UPDATE_DISCOVER_COMMUNITIES_CACHE,
});


export const setFetchingSubscribedCommunities = (payload) => ({
  payload,
  type: SET_FETCHING_SUBSCRIBED_COMMUNITIES,
});

export const setSubscribingCommunity = (payload) => ({
  payload,
  type: SET_SUBSCRIBING_COMMUNITY,
});

export const setFetchingDiscoverCommunities = (payload) => ({
  payload,
  type: SET_FETCHING_DISCOVER_COMMUNITIES,
});

export const showToast = (payload) => ({
  payload: payload,
  type: TOAST_NOTIFICATION,
});
export const purgeExpiredCache = () => ({
  type: PURGE_EXPIRED_CACHE
})

