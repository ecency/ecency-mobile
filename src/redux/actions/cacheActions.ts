import {
    UPDATE_VOTE_CACHE,
    PURGE_EXPIRED_CACHE,
    UPDATE_COMMENT_CACHE
  } from '../constants/constants';
import { Comment, Vote } from '../reducers/cacheReducer';
  
  
  export const updateVoteCache = (postPath:string, vote:Vote) => ({
      payload:{
          postPath,
          vote
      },
      type: UPDATE_VOTE_CACHE
    })


  export const updateCommentCache = (commentPath:string, comment:Comment) => {

    comment.created = comment.created || new Date().toISOString();
    comment.expiresAt = comment.expiresAt || new Date().getTime() + 600000;
    comment.active_votes = comment.active_votes || [];
    comment.net_rshares = comment.net_rshares || 0;
    comment.author_reputation = comment.author_reputation || 25;
    comment.total_payout = comment.total_payout || 0;

    return ({
        payload:{
          commentPath,
          comment
        },
        type: UPDATE_COMMENT_CACHE
      })
    }
  
  export const purgeExpiredCache = () => ({
    type: PURGE_EXPIRED_CACHE
  })
  
  