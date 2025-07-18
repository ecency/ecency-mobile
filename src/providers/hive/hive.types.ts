export enum ContentType {
  POLL = 'poll',
}

export enum PollPreferredInterpretation {
  NUMBER_OF_VOTES = 'number_of_votes',
  TOKENS = 'tokens',
}

export interface PollMetadata {
  // POLL
  content_type: ContentType;
  version: number;
  question: string;
  preferred_interpretation: PollPreferredInterpretation;
  max_choices_voted: number;
  choices: string[];
  filters: {
    account_age: number;
  };
  end_time: number;
  ui_hide_res_until_voted: boolean;
  token?: string;
  community_membership?: string[];
  allow_vote_changes?: boolean;
  // ECENCY BASED PROPS
  hide_votes?: boolean; // prop used to allow/disallwo viewing voters data
}

export interface PostMetadata extends Partial<PollMetadata> {
  // GENERAL
  tags: string[];
  token: string;
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

export interface RecurrentTransfer {
  amount: string;
  consecutive_failures: number;
  from: string;
  id: number;
  memo: string;
  pair_id: number;
  recurrence: number;
  remaining_executions: number;
  to: string;
  trigger_date: string;
}

export enum CommunityTypeId {
  TOPIC = 1, // any one can post or comment
  JOURNEL = 2, // only members can post or guests (both sub and unsub) can comment
  COUNCIL = 3, // only subscribed members can post or comment
}

export enum CommunityRole {
  MEMBER = 'member',
  MODERATOR = 'mod',
  ADMIN = 'admin',
  OWNER = 'owner',
  GUEST = 'guest',
}
