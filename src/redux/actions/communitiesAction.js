import {
  FETCH_COMMUNITIES,
  FETCH_COMMUNITIES_SUCCESS,
  FETCH_COMMUNITIES_FAIL,
  FETCH_SUBSCRIBED_COMMUNITIES,
  FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS,
  FETCH_SUBSCRIBED_COMMUNITIES_FAIL,
} from '../constants/constants';

export const fetchCommunities = (payload) => ({
  payload,
  type: FETCH_COMMUNITIES,
});
export const fetchCommunitiesSuccess = (payload) => ({
  payload,
  type: FETCH_COMMUNITIES_SUCCESS,
});
export const fetchCommunitiesFail = (payload) => ({
  payload,
  type: FETCH_COMMUNITIES_FAIL,
});
export const fetchSubscribedCommunities = (payload) => ({
  payload,
  type: FETCH_SUBSCRIBED_COMMUNITIES,
});
export const fetchSubscribedCommunitiesSuccess = (payload) => ({
  payload,
  type: FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS,
});
export const fetchSubscribedCommunitiesFail = (payload) => ({
  payload,
  type: FETCH_SUBSCRIBED_COMMUNITIES_FAIL,
});
