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