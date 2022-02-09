import { REGISTER_TOOLTIP } from '../constants/constants';

export interface Walkthrough {
  walkthroughIndex:number,
  isShown?:boolean,
}
interface State {
  walkthroughMap: Map<number, Walkthrough>
}

const initialState:State = {
  walkthroughMap:new Map(),
};
export default function (state = initialState, action) {
  console.log('action : ', action);
  
  const { type, payload } = action;
  switch (type) {
    case REGISTER_TOOLTIP:
      if(!state.walkthroughMap){
        state.walkthroughMap = new Map<number, Walkthrough>();
    }
      state.walkthroughMap.set(payload.walkthroughIndex, payload);
      return {
        ...state,
      };

    default:
      return state;
  }
}
