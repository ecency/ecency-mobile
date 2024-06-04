export enum ContentType {
  GENERAL = 'general',
  POLL = 'poll',
}

export enum PollPreferredInterpretation {
  NUMBER_OF_VOTES = 'number_of_votes',
  TOKENS = 'tokens',
}

export interface PollMetadata {
  // POLL
  question: string;
  preferred_interpretation: PollPreferredInterpretation;
  max_choices_voted: number;
  choices: string[];
  filters: {
    account_age: number;
  };
  end_time: number;
  // ECENCY SPECIFIC POLL OPTIONS
  vote_change: boolean;
  hide_votes: boolean;
}

export interface PostMetadata extends PollMetadata {
  // GENERAL
  tags: string[];
  token: string;
  content_type: ContentType;
  description: string;
  format: string;
  version: number;
  app: string;

  // IMAGE
  image: string[];
  image_ratios: number[];


}

export interface Vote {
  percent: number;
  reputation: number;
  rshares: string;
  time: string;
  timestamp?: number;
  voter: string;
  weight: number;
  reward?: number;
}

export interface DynamicGlobalProperties {
  hbd_print_rate: number;
  total_vesting_fund_hive: string;
  total_vesting_shares: string;
  hbd_interest_rate: number;
  head_block_number: number;
  vesting_reward_percent: number;
  virtual_supply: string;
}

export interface FeedHistory {
  current_median_history: {
    base: string;
    quote: string;
  };
}

export interface RewardFund {
  recent_claims: string;
  reward_balance: string;
}

export interface DelegatedVestingShare {
  id: number;
  delegatee: string;
  delegator: string;
  min_delegation_time: string;
  vesting_shares: string;
}

export interface Follow {
  follower: string;
  following: string;
  what: string[];
}

export interface MarketStatistics {
  hbd_volume: string;
  highest_bid: string;
  hive_volume: string;
  latest: string;
  lowest_ask: string;
  percent_change: string;
}

export interface OpenOrderItem {
  id: number;
  created: string;
  expiration: string;
  seller: string;
  orderid: number;
  for_sale: number;
  sell_price: {
    base: string;
    quote: string;
  };
  real_price: string;
  rewarded: boolean;
}

export interface OrdersDataItem {
  created: string;
  hbd: number;
  hive: number;
  order_price: {
    base: string;
    quote: string;
  };
  real_price: string;
}

export interface TradeDataItem {
  current_pays: string;
  date: number;
  open_pays: string;
}

export interface OrdersData {
  bids: OrdersDataItem[];
  asks: OrdersDataItem[];
  trading: OrdersDataItem[];
}

export interface ConversionRequest {
  amount: string;
  conversion_date: string;
  id: number;
  owner: string;
  requestid: number;
}

export interface SavingsWithdrawRequest {
  id: number;
  from: string;
  to: string;
  memo: string;
  request_id: number;
  amount: string;
  complete: string;
}

export interface TransferDataType {
  fundType: string;
  destination: string;
  amount: string;
  memo?: string;
}
