import { REGISTER_TOOLTIP } from '../constants/constants';

const initialState = {
  walkthroughId: null,
  isDone: false,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case REGISTER_TOOLTIP:
      return {
        ...state,
        walkthroughId: payload,
        isDone: true,
      };

    default:
      return state;
  }
}
