import {
  SET_COMMUNITY_TABS,
  SET_MAIN_TABS,
  SET_OWN_PROFILE_TABS,
  SET_PROFILE_TABS,
} from '../constants/constants';

export const setMainTabs = (payload: string[]) => ({
  payload,
  type: SET_MAIN_TABS,
});

export const setCommunityTabs = (payload: string[]) => ({
  payload,
  type: SET_COMMUNITY_TABS,
});

export const setProfileTabs = (payload: string[]) => ({
  payload,
  type: SET_PROFILE_TABS,
});

export const setOwnProfileTabs = (payload: string[]) => ({
  payload,
  type: SET_OWN_PROFILE_TABS,
});
