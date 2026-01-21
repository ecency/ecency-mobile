import { getQueryClient, getDynamicPropsQueryOptions } from '@ecency/sdk';
import {
  ADD_OTHER_ACCOUNT,
  FETCH_ACCOUNT_FAIL,
  REMOVE_OTHER_ACCOUNT,
  REMOVE_ALL_OTHER_ACCOUNT,
  SET_GLOBAL_PROPS,
  UPDATE_CURRENT_ACCOUNT,
  UPDATE_UNREAD_ACTIVITY_COUNT,
  UPDATE_OTHER_ACCOUNT,
  SET_PREV_LOGGED_IN_USERS,
  CLEAR_PREV_LOGGED_IN_USERS,
} from '../constants/constants';
import { PrevLoggedInUsers } from '../reducers/accountReducer';

export const fetchGlobalProperties = () => async (dispatch) => {
  const queryClient = getQueryClient();
  const props: any = await queryClient.fetchQuery(getDynamicPropsQueryOptions());

  // Process and return in the format expected by legacy code
  const { dynamicProps, rewardFund, feedHistory } = props;

  const hivePerMVests =
    (parseFloat(dynamicProps.total_vesting_fund_hive) /
      parseFloat(dynamicProps.total_vesting_shares)) *
    1e6;

  const base = parseFloat(feedHistory.current_median_history.base.split(' ')[0]);
  const quote = parseFloat(feedHistory.current_median_history.quote.split(' ')[0]);

  const res = {
    hivePerMVests,
    base,
    quote,
    fundRecentClaims: rewardFund.recent_claims,
    fundRewardBalance: parseFloat(rewardFund.reward_balance.split(' ')[0]),
    hbdPrintRate: dynamicProps.hbd_print_rate,
  };

  dispatch({
    type: SET_GLOBAL_PROPS,
    payload: { ...res },
  });
};

export const updateCurrentAccount = (data) => ({
  type: UPDATE_CURRENT_ACCOUNT,
  payload: data,
});

export const addOtherAccount = (data) => ({
  type: ADD_OTHER_ACCOUNT,
  payload: data,
});

export const updateOtherAccount = (accountObj) => ({
  type: UPDATE_OTHER_ACCOUNT,
  payload: accountObj,
});

export const failedAccount = (data) => ({
  type: FETCH_ACCOUNT_FAIL,
  payload: data,
});

export const updateUnreadActivityCount = (data) => ({
  type: UPDATE_UNREAD_ACTIVITY_COUNT,
  payload: data,
});

export const removeOtherAccount = (data) => ({
  type: REMOVE_OTHER_ACCOUNT,
  payload: data,
});

export const removeAllOtherAccount = () => ({
  type: REMOVE_ALL_OTHER_ACCOUNT,
});

export const setGlobalProps = (data) => ({
  type: SET_GLOBAL_PROPS,
  payload: data,
});

export const setPrevLoggedInUsers = (data: PrevLoggedInUsers[]) => ({
  payload: data,
  type: SET_PREV_LOGGED_IN_USERS,
});

export const clearPrevLoggedInUsers = () => ({
  type: CLEAR_PREV_LOGGED_IN_USERS,
});
