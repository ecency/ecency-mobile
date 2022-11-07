import {
  FETCH_COMMUNITIES,
  FETCH_COMMUNITIES_SUCCESS,
  FETCH_COMMUNITIES_FAIL,
  FETCH_SUBSCRIBED_COMMUNITIES,
  FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS,
  FETCH_SUBSCRIBED_COMMUNITIES_FAIL,
  SUBSCRIBE_COMMUNITY,
  SUBSCRIBE_COMMUNITY_SUCCESS,
  SUBSCRIBE_COMMUNITY_FAIL,
  LEAVE_COMMUNITY,
  LEAVE_COMMUNITY_SUCCESS,
  LEAVE_COMMUNITY_FAIL,
  TOAST_NOTIFICATION,
} from '../constants/constants';

import {
  getCommunities,
  getSubscriptions,
  subscribeCommunity as subscribeCommunityReq,
} from '../../providers/hive/dhive';

// Fetch Communities
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

// Fetch Subscribed Communities
export const fetchSubscribedCommunities = (username) => {
  return (dispatch) => {
    dispatch({ type: FETCH_SUBSCRIBED_COMMUNITIES });
    getSubscriptions(username)
      .then((res) => {
        res.forEach((item) => item.push(true)); // add true value for subscribe status
        res.sort((a, b) => a[1].localeCompare(b[1]));
        dispatch(fetchSubscribedCommunitiesSuccess(res));
      })
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

// Subscribe Community
export const subscribeCommunity = (
  currentAccount,
  pin,
  data,
  successToastText,
  failToastText,
  screen,
) => {
  return (dispatch) => {
    dispatch({ type: SUBSCRIBE_COMMUNITY, payload: { ...data, screen } });
    subscribeCommunityReq(currentAccount, pin, data)
      .then((res) => dispatch(subscribeCommunitySuccess(data, successToastText, screen)))
      .catch((err) => dispatch(subscribeCommunityFail(err, data, failToastText, screen)));
  };
};

export const subscribeCommunitySuccess = (data, successToastText, screen) => {
  return (dispatch) => [
    dispatch({
      payload: { ...data, screen },
      type: SUBSCRIBE_COMMUNITY_SUCCESS,
    }),
    dispatch({
      payload: successToastText,
      type: TOAST_NOTIFICATION,
    }),
  ];
};

export const subscribeCommunityFail = (error, data, failToastText, screen) => {
  return (dispatch) => [
    dispatch({
      payload: { ...data, screen },
      type: SUBSCRIBE_COMMUNITY_FAIL,
    }),
    dispatch({
      payload: failToastText,
      type: TOAST_NOTIFICATION,
    }),
  ];
};

// Leave Community
export const leaveCommunity = (
  currentAccount,
  pin,
  data,
  successToastText,
  failToastText,
  screen,
) => {
  return (dispatch) => {
    dispatch({ type: LEAVE_COMMUNITY, payload: { ...data, screen } });
    subscribeCommunityReq(currentAccount, pin, data)
      .then((res) => dispatch(leaveCommunitySuccess(data, successToastText, screen)))
      .catch((err) => dispatch(leaveCommunityFail(err, data, failToastText, screen)));
  };
};

export const leaveCommunitySuccess = (data, successToastText, screen) => {
  return (dispatch) => [
    dispatch({
      payload: { ...data, screen },
      type: LEAVE_COMMUNITY_SUCCESS,
    }),
    dispatch({
      payload: successToastText,
      type: TOAST_NOTIFICATION,
    }),
  ];
};

export const leaveCommunityFail = (error, data, failToastText, screen) => {
  return (dispatch) => [
    dispatch({
      payload: { ...data, screen },
      type: LEAVE_COMMUNITY_FAIL,
    }),
    dispatch({
      payload: failToastText,
      type: TOAST_NOTIFICATION,
    }),
  ];
};
