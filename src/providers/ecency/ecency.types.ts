export interface ReceivedVestingShare {
    delegator:string;
    delegatee:string;
    vesting_shares:string;
    timestamp:string;
}
export interface Referral {
    id:number;
    referral:string;
    rewarded:boolean;
    username:string;
    created:string
}
