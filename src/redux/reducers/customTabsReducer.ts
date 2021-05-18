import { DEFAULT_COMMUNITY_FILTERS, DEFAULT_FEED_FILTERS } from '../../constants/options/filters';
import {
  SET_COMMUNITY_TABS,
  SET_MAIN_TABS,
} from '../constants/constants';

interface State {
  communityTabs:string[],
  mainTabs:string[],
}

const initialState:State = {
  communityTabs: DEFAULT_COMMUNITY_FILTERS,
  mainTabs:DEFAULT_FEED_FILTERS
};

export default function (state:State = initialState, action):State {
  switch (action.type) {
    
    case SET_MAIN_TABS:
      return {
        ...state,
        mainTabs: action.payload,
      }

    case SET_COMMUNITY_TABS:
      return {
        ...state,
        communityTabs: action.payload
      }

    default:
      return state;
  }
}
