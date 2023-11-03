import {
  DEFAULT_COMMUNITY_FILTERS,
  DEFAULT_FEED_FILTERS,
  DEFAULT_OWN_PROFILE_FILTERS,
  DEFAULT_PROFILE_FILTERS,
} from '../../constants/options/filters';
import {
  SET_COMMUNITY_TABS,
  SET_MAIN_TABS,
  SET_OWN_PROFILE_TABS,
  SET_PROFILE_TABS,
} from '../constants/constants';

interface State {
  communityTabs: string[];
  mainTabs: string[];
  profileTabs: string[];
  ownProfileTabs: string[];
}

const initialState: State = {
  communityTabs: DEFAULT_COMMUNITY_FILTERS,
  mainTabs: DEFAULT_FEED_FILTERS,
  profileTabs: DEFAULT_PROFILE_FILTERS,
  ownProfileTabs: DEFAULT_OWN_PROFILE_FILTERS,
};

const customTabsReducer = (state: State = initialState, action): State => {
  switch (action.type) {
    case SET_MAIN_TABS:
      return {
        ...state,
        mainTabs: action.payload,
      };

    case SET_COMMUNITY_TABS:
      return {
        ...state,
        communityTabs: action.payload,
      };

    case SET_PROFILE_TABS:
      return {
        ...state,
        profileTabs: action.payload,
      };

    case SET_OWN_PROFILE_TABS:
      return {
        ...state,
        ownProfileTabs: action.payload,
      };

    default:
      return state;
  }
};

export default customTabsReducer;
