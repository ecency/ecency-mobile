import { REGISTER_TOOLTIP } from '../constants/constants';

export const registerTooltip = (walkthroughId: string) => ({
  payload: walkthroughId,
  type: REGISTER_TOOLTIP,
});
