import { REGISTER_WALKTHROUGH_ITEM } from '../constants/constants';
import { WalkthroughItem } from '../reducers/walkthroughReducer';

export const registerWalkthroughItem = (walkthrough: WalkthroughItem) => ({
  payload: walkthrough,
  type: REGISTER_WALKTHROUGH_ITEM,
});
