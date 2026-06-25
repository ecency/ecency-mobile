import {
  SET_COMMUNITY_TABS,
  SET_MAIN_TABS,
  SET_OWN_PROFILE_TABS,
  SET_PROFILE_TABS,
  SET_WAVE_CONTAINERS,
  SET_WAVE_TAGS,
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

// User-pinned waves tag feeds (tag strings, e.g. ['hive', 'photography']).
export const setWaveTags = (payload: string[]) => ({
  payload,
  type: SET_WAVE_TAGS,
});

// User-pinned waves source feeds (container host accounts, e.g.
// ['leothreads', 'peak.snaps']). Each becomes a per-container feed tab.
export const setWaveContainers = (payload: string[]) => ({
  payload,
  type: SET_WAVE_CONTAINERS,
});
