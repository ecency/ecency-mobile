import { PURGE_EXPIRED_CACHE, UPDATE_VOTE_CACHE } from "../constants/constants";

export interface Vote {
    amount:number;
    isDownvote:boolean;
    incrementStep:number;
    votedAt:number; 
    expiresAt:number;
}

interface State {
    votes:Map<string, Vote>
}

const initialState:State = {
    votes:new Map()
  };
  
  export default function (state = initialState, action) {
      const {type, payload} = action;
    switch (type) {
        case UPDATE_VOTE_CACHE:
            if(!state.votes){
                state.votes = new Map<string, Vote>();
            }
            state.votes.set(payload.postPath, payload.vote);
            return {
                ...state //spread operator in requried here, otherwise persist do not register change
            };
        case PURGE_EXPIRED_CACHE:
            const currentTime = new Date().getTime();

            if(state.votes && state.votes.entries){
                Array.from(state.votes).forEach((entry)=>{
                   if(entry[1].expiresAt < currentTime){
                       state.votes.delete(entry[0]);
                   }
                })
            }
            
            return {
                ...state
            }
        default:
          return state;
      }
    }

