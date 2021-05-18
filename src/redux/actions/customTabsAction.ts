import {
    SET_COMMUNITY_TABS,
    SET_MAIN_TABS
  } from '../constants/constants';
  
  
  export const setMainTabs = (payload:string[]) => ({
    payload,
    type: SET_MAIN_TABS
  })
  

  export const setCommunityTabs = (payload:string[]) => ({
    payload,
    type: SET_COMMUNITY_TABS
  })
  
  