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