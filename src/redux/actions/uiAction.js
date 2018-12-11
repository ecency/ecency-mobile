import { UPDATE_ACTIVE_BOTTOM_TAB, IS_COLLAPSE_POST_BUTTON } from '../constants/constants';

export const updateActiveBottomTab = payload => ({
  payload,
  type: UPDATE_ACTIVE_BOTTOM_TAB,
});

export const isCollapsePostButton = payload => ({
  payload,
  type: IS_COLLAPSE_POST_BUTTON,
});
