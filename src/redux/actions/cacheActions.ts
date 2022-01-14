import {
    UPDATE_VOTE_CACHE,
    PURGE_EXPIRED_CACHE
  } from '../constants/constants';
import { Vote } from '../reducers/cacheReducer';
  
  
  export const updateVoteCache = (postPath:string, vote:Vote) => ({
    payload:{
        postPath,
        vote
    },
    type: UPDATE_VOTE_CACHE
  })
  
  export const purgeExpiredCache = () => ({
    type: PURGE_EXPIRED_CACHE
  })
  
  