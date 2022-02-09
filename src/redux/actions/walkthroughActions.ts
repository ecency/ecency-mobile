import { REGISTER_TOOLTIP } from '../constants/constants';
import { Walkthrough } from '../reducers/walkthroughReducer';

export const registerTooltip = (walkthrough: Walkthrough) => ({
  payload: walkthrough,
  type: REGISTER_TOOLTIP,
});
