import { QuoteItem } from "../../redux/reducers/walletReducer";

export interface ReceivedVestingShare {
    delegator:string;
    delegatee:string;
    vesting_shares:string;
    timestamp:string;
}

export interface EcencyUser {
    username:string;
    points:string;
    unclaimed_points:string;
    points_by_type:{[key:string]:string};
    unclaimed_points_by_type:{[key:string]:string};
}

export interface Referral {
    id:number;
    referral:string;
    rewarded:boolean;
    username:string;
    created:string
}

export interface ReferralStat {
    total: number;
    rewarded: number;
}

export interface UserPoint {
    id: number;
    type: number;
    amount: string;
    created:string;
    memo?: string;
    receiver?: string;
    sender?: string;

}

export interface LatestQuotes {
   [key:string]:QuoteItem
}

export interface CommentHistoryItem {
    body: string;
    tags: [string];
    title: string;
    timestamp:string;
    v: number;
}