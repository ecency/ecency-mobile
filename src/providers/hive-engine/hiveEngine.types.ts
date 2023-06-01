export enum Methods {
  FIND = 'find',
  FIND_ONE = 'findOne',
}

export enum JSON_RPC {
  RPC_2 = '2.0',
}

export enum EngineContracts {
  TOKENS = 'tokens',
  MARKET = 'market'
}

export enum EngineActions {
  TRANSFER = 'transfer',
  DELEGATE = 'delegate',
  UNDELEGATE = 'undelegate',
  UNSTAKE = 'unstake',
  STAKE = 'stake'
}


export enum EngineTables {
  BALANCES = 'balances',
  DELEGATIONS = 'delegations',
  TOKENS = 'tokens',
  METRICS = 'metrics',
}

export enum EngineIds {
  ONE = '1',
}


export interface TokenBalance {
  symbol: string;
  balance: string;
  stake: string;
  pendingUnstake: string;
  delegationsIn: string;
  delegationsOut: string;
  pendingUndelegations: string;
}

export interface Token {
  issuer: string;
  symbol: string;
  name: string;
  metadata: string;
  precision: number;
  maxSupply: string;
  supply: string;
  circulatingSupply: string;
  stakingEnabled: boolean;
  unstakingCooldown: number;
  delegationEnabled: boolean;
  undelegationCooldown: number;
  numberTransactions: number;
  totalStaked: string;
}

export interface HiveEngineToken {
  symbol: string;
  name?: string;
  icon?: string;
  precision?: number;
  stakingEnabled?: boolean;
  delegationEnabled?: boolean;
  balance: number;
  stake: number;
  stakedBalance: number;
  delegationsIn: number;
  delegationsOut: number;
  hasDelegations: boolean;
  delegations: string;
  stakedBalanceStr: string;
  balanceStr: string;
  tokenPrice?: number;
  percentChange?: number;
  unclaimedBalance: string;
  volume24h?:number
}

export interface TokenMetadata {
  desc: string;
  url: string;
  icon: string;
}

export interface TokenStatus {
  symbol: string;
  pendingToken: number;
  precision: number;
  pendingRewards: number;
}



export interface EngineMetric {
  _id: number
  highestBid: string;
  lastDayPrice: string;
  lastDayPriceExpiration: number;
  lastPrice: string;
  lowestAsk: string;
  priceChangeHive:string;
  priceChangePercent:string;
  symbol: string;
  volume: string;
  volumeExpiration: number;

}

interface EngineQuery {
  symbol?: string | { $in: string[] };
  account?: string;
}

interface PayloadParams {
  contract: EngineContracts;
  table: EngineTables;
  query: EngineQuery;
}

export interface EngineRequestPayload {
  jsonrpc: JSON_RPC;
  method: Methods;
  params: PayloadParams;
  id: EngineIds;
}



export interface EngineActionPayload {
  to:string,
  symbol:string,
  quantity:string,
  memo?:string
}

export interface EngineActionJSON {
  contractName:EngineContracts;
  contractAction:EngineActions;
  contractPayload: EngineActionPayload;
}


export interface MarketData {
  quoteVolume:number;
  baseVolume:number;
  low:number;
  close:number;
  high:number;
  open:number;
  timestamp:number;
}

export interface HistoryItem {
_id:string; 
blockNumber:number; 
transactionId:string; 
timestamp:number;
operation:EngineOperations;
from:string;
to:string;
symbol:string;
quantity:number;
memo:string;
account:string;
authorperm?:string;
}

export enum EngineOperations {
  TOKENS_CREATE = "tokens_create",
  TOKENS_ISSUE = "tokens_issue",
  TOKENS_TRANSFER = "tokens_transfer",
  TOKENS_TRANSFER_TO_CONTRACT = "tokens_transferToContract",
  TOKENS_TRANSFER_FROM_CONTRACT = "tokens_transferFromContract",
  TOKENS_UPDATE_PRECISION = "tokens_updatePrecision",
  TOKENS_UPDATE_URL = "tokens_updateUrl",
  TOKENS_UPDATE_METADATA = "tokens_updateMetadata",
  TOKENS_TRANSFER_OWNERSHIP = "tokens_transferOwnership",
  TOKENS_ENABLE_STAKING = "tokens_enableStaking",
  TOKENS_ENABLE_DELEGATION = "tokens_enableDelegation",
  TOKENS_STAKE = "tokens_stake",
  TOKENS_UNSTAKE_START = "tokens_unstakeStart",
  TOKENS_UNSTAKE_DONE = "tokens_unstakeDone",
  TOKENS_CANCEL_UNSTAKE = "tokens_cancelUnstake",
  TOKENS_DELEGATE = "tokens_delegate",
  TOKENS_UNDELEGATE_START = "tokens_undelegateStart",
  TOKENS_UNDELEGATE_DONE = "tokens_undelegateDone",
  TOKENS_TRANSFER_FEE = "tokens_transferFee",
  MARKET_CANCEL = "market_cancel",
  MARKET_PLACE_ORDER = "market_placeOrder",
  MARKET_EXPIRE = "market_expire",
  MARKET_BUY = "market_buy",
  MARKET_BUY_REMAINING = "market_buyRemaining",
  MARKET_SELL = "market_sell",
  MARKET_SELL_REMAINING = "market_sellRemaining",
  MARKET_CLOSE = "market_close",
  MINING_LOTTERY = "mining_lottery",
  WITNESSES_PROPOSE_ROUND = "witnesses_proposeRound",
  HIVEPEGGED_BUY = "hivepegged_buy",
  HIVEPEGGED_WITHDRAW = "hivepegged_withdraw",
  INFLATION_ISSUE_NEW_TOKENS = "inflation_issueNewTokens",
  NFT_TRANSFER = "nft_transfer",
  NFT_ISSUE = "nft_issue",
  NFT_ISSUE_MULTIPLE = "nft_issueMultiple",
  NFT_BURN = "nft_burn",
  NFT_DELEGATE = "nft_delegate",
  NFT_UNDELEGATE = "nft_undelegate",
  NFT_UNDELEGATE_DONE = "nft_undelegateDone",
  NFT_ENABLE_DELEGATION = "nft_enableDelegation",
  NFT_CREATE = "nft_create",
  NFT_ADD_AUTHORIZED_ISSUING_ACCOUNTS = "nft_addAuthorizedIssuingAccounts",
  NFT_SET_GROUP_BY = "nft_setGroupBy",
  NFT_SET_PROPERTIES = "nft_setProperties",
  NFT_ADD_PROPERTY = "nft_addProperty",
  NFT_SET_PROPERTY_PERMISSIONS = "nft_setPropertyPermissions",
  NFT_UPDATE_PROPERTY_DEFINITION = "nft_updatePropertyDefinition",
  NFT_UPDATE_URL = "nft_updateUrl",
  NFT_UPDATE_METADATA = "nft_updateMetadata",
  NFT_UPDATE_NAME = "nft_updateName",
  NFT_UPDATE_ORG_NAME = "nft_updateOrgName",
  NFT_UPDATE_PRODUCT_NAME = "nft_updateProductName",
  NFT_TRANSFER_FEE = "nft_transferFee",
  NFTMARKET_BUY = "nftmarket_buy",
  NFTMARKET_TRANSFER_FEE = "nftmarket_transferFee",
  NFTMARKET_SELL = "nftmarket_sell",
  NFTMARKET_CANCEL = "nftmarket_cancel",
  NFTMARKET_CHANGE_PRICE = "nftmarket_changePrice",
  NFTMARKET_ENABLE_MARKET = "nftmarket_enableMarket"
}
