import { PURGE_EXPIRED_CACHE, UPDATE_VOTE_CACHE, UPDATE_COMMENT_CACHE, DELETE_COMMENT_CACHE_ENTRY, DELETE_DRAFT_CACHE_ENTRY, UPDATE_DRAFT_CACHE,  } from "../constants/constants";

export interface Vote {
    amount:number;
    isDownvote:boolean;
    incrementStep:number;
    votedAt:number; 
    expiresAt:number;
}

export interface Comment {
    author:string,
    permlink:string,
    parent_author:string,
    parent_permlink:string,
    body?:string,
    markdownBody:string,
    author_reputation?:number,
    total_payout?:number,
    net_rshares?:number,
    active_votes?:Array<{rshares:number, voter:string}>,
    json_metadata?:any,
    isDeletable?:boolean,
    created?:string, //handle created and updated separatly
    updated?:string,
    expiresAt?:number,
}

export interface Draft {
    author: string,
    body:string,
    title?:string,
    tags?:string,
    created?:number,
    updated?:number,
    expiresAt?:number;
}

interface State {
    votes:Map<string, Vote>
    comments:Map<string, Comment> //TODO: handle comment array per post, if parent is same
    drafts: Map<string, Draft>
    lastUpdate:{
        postPath:string,
        updatedAt:number,
        type:'vote'|'comment'|'draft',
    }
}

const initialState:State = {
    votes:new Map(),
    comments:new Map(),
    drafts: new Map(),
    lastUpdate:null,
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
                ...state, //spread operator in requried here, otherwise persist do not register change
                lastUpdate:{
                    postPath:payload.postPath,
                    updatedAt: new Date().getTime(),
                    type:'vote',
                }
            };
        
        case UPDATE_COMMENT_CACHE:
            if(!state.comments){
                state.comments = new Map<string, Comment>();
            }
            state.comments.set(payload.commentPath, payload.comment);
            return {
                ...state, //spread operator in requried here, otherwise persist do not register change
                lastUpdate:{
                    postPath:payload.commentPath,
                    updatedAt: new Date().getTime(),
                    type:'comment'
                }
            };

        case DELETE_COMMENT_CACHE_ENTRY:
            if(state.comments && state.comments.has(payload)){
                state.comments.delete(payload);
            }
            return { ...state }
            
        case UPDATE_DRAFT_CACHE:
            if(!state.drafts){
                state.drafts = new Map<string, Draft>();
            }

            const curTime = new Date().getTime();
            const curDraft = state.drafts.get(payload.id);
            const payloadDraft = payload.draft;

            payloadDraft.created = curDraft ? curDraft.created : curTime;
            payloadDraft.updated = curTime;
            payloadDraft.expiresAt = curTime + 604800000 // 7 days ms

            state.drafts.set(payload.id, payloadDraft);
            return {
              ...state, //spread operator in requried here, otherwise persist do not register change
              lastUpdate: {
                postPath: payload.id,
                updatedAt: new Date().getTime(),
                type: 'draft',
              },
            };

        case DELETE_DRAFT_CACHE_ENTRY:
            if (state.drafts && state.drafts.has(payload)) {
                state.drafts.delete(payload);
            }
            return { ...state }

        case PURGE_EXPIRED_CACHE:
            const currentTime = new Date().getTime();

            if(state.votes && state.votes.size){
                Array.from(state.votes).forEach((entry)=>{
                   if(entry[1].expiresAt < currentTime){
                       state.votes.delete(entry[0]);
                   }
                })
            }

            if(state.comments && state.comments.size){
                Array.from(state.comments).forEach((entry)=>{
                    if(entry[1].expiresAt < currentTime){
                        state.comments.delete(entry[0]);
                    }
                 })
            }

            if(state.drafts && state.drafts.size){
                Array.from(state.drafts).forEach((entry)=>{
                    if(entry[1].expiresAt < currentTime){
                        state.drafts.delete(entry[0]);
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

