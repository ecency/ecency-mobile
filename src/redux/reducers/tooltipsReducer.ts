import { REGISTER_TOOLTIP } from '../constants/constants';

export interface Walkthrough {
  walkthroughIndex:number,
  isShown?:boolean,
}
interface State {
  walkthroughMap:{
      [key: number]: Walkthrough
  }
}

const initialState:State = {
  walkthroughMap:{}
};
export default function (state = initialState, action) {
  console.log('action : ', action);
  
  const { type, payload } = action;
  switch (type) {
    case REGISTER_TOOLTIP:
      state.walkthroughMap[payload.walkthroughIndex] = payload
      return {
        ...state,
      };

    default:
      return state;
  }
}
