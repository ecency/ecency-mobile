import { Dispatch } from 'redux';
import {
  getCommunitiesQueryOptions,
  getQueryClient,
  getAccountSubscriptionsQueryOptions,
} from '@ecency/sdk';
import {
  FETCH_COMMUNITIES,
  FETCH_COMMUNITIES_SUCCESS,
  FETCH_COMMUNITIES_FAIL,
  FETCH_SUBSCRIBED_COMMUNITIES,
  FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS,
  FETCH_SUBSCRIBED_COMMUNITIES_FAIL,
} from '../constants/constants';

// Fetch Communities
export const fetchCommunities = (limit: any, query: any, sort: any, observer: any) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_COMMUNITIES });
    try {
      const queryClient = getQueryClient();
      const res = await queryClient.fetchQuery(
        getCommunitiesQueryOptions(sort || 'rank', query, limit || 100, observer),
      );
      dispatch(fetchCommunitiesSuccess(res));
    } catch (err) {
      dispatch(fetchCommunitiesFail(err));
    }
  };
};

export const fetchCommunitiesSuccess = (payload: any) => ({
  payload,
  type: FETCH_COMMUNITIES_SUCCESS,
});

export const fetchCommunitiesFail = (payload: any) => ({
  payload,
  type: FETCH_COMMUNITIES_FAIL,
});

// Fetch Subscribed Communities
export const fetchSubscribedCommunities = (username: string) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_SUBSCRIBED_COMMUNITIES });
    try {
      const queryClient = getQueryClient();
      const res: any = await queryClient.fetchQuery(getAccountSubscriptionsQueryOptions(username));
      res.forEach((item) => item.push(true)); // add true value for subscribe status
      res.sort((a, b) => a[1].localeCompare(b[1]));
      dispatch(fetchSubscribedCommunitiesSuccess(res));
    } catch (err) {
      dispatch(fetchSubscribedCommunitiesFail(err));
    }
  };
};

export const fetchSubscribedCommunitiesSuccess = (payload: any) => ({
  payload,
  type: FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS,
});

export const fetchSubscribedCommunitiesFail = (payload: any) => ({
  payload,
  type: FETCH_SUBSCRIBED_COMMUNITIES_FAIL,
});
