import {
  FETCH_COMMUNITIES,
  FETCH_COMMUNITIES_SUCCESS,
  FETCH_COMMUNITIES_FAIL,
  FETCH_SUBSCRIBED_COMMUNITIES,
  FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS,
  FETCH_SUBSCRIBED_COMMUNITIES_FAIL,
} from '../constants/constants';

import { getCommunities, getSubscriptions } from '../../providers/hive/hive';

export const fetchCommunities = (last, limit, query, sort, observer) => {
  return (dispatch) => {
    dispatch({ type: FETCH_COMMUNITIES });
    getCommunities(last, limit, query, sort, observer)
      .then((res) => dispatch(fetchCommunitiesSuccess(res)))
      .catch((err) => dispatch(fetchCommunitiesFail(err)));
  };
};
export const fetchCommunitiesSuccess = (payload) => ({
  payload,
  type: FETCH_COMMUNITIES_SUCCESS,
});
export const fetchCommunitiesFail = (payload) => ({
  payload,
  type: FETCH_COMMUNITIES_FAIL,
});

export const fetchSubscribedCommunities = (username) => {
  return (dispatch) => {
    dispatch({ type: FETCH_SUBSCRIBED_COMMUNITIES });
    getSubscriptions(username)
      .then((res) => dispatch(fetchSubscribedCommunitiesSuccess(res)))
      .catch((err) => dispatch(fetchSubscribedCommunitiesFail(err)));
  };
};
export const fetchSubscribedCommunitiesSuccess = (payload) => ({
  payload,
  type: FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS,
});
export const fetchSubscribedCommunitiesFail = (payload) => ({
  payload,
  type: FETCH_SUBSCRIBED_COMMUNITIES_FAIL,
});
