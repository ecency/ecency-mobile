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
}
