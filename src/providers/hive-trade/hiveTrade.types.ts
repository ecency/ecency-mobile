export enum TransactionType {
    None = 0,
    Sell = 2,
    Buy = 1,
    Cancel = 3
}

export enum OrderIdPrefix {
    EMPTY = "",
    SWAP = "9"
}

export enum MarketAsset {
    HIVE = "HIVE",
    HBD = "HBD"
}


export interface SwapOptions {
    fromAsset: MarketAsset;
    fromAmount: number;
    toAmount: number;
}

export interface MarketStatistics {
    hbd_volume: string;
    highest_bid: string;
    hive_volume: string;
    latest: string;
    lowest_ask: string;
    percent_change: string;
}
