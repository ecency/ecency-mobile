export enum ContentType {
  POLL = 'poll',
}

/**
 * Why a post or comment is dimmed behind the moderation hint. Each reason gets its own
 * message so the UI never claims a guideline violation for content that was only
 * downvoted. Assigned by parsePost/parseComment from the SDK's shared rules, so the
 * website flags the same content for the same reason.
 *
 * Re-exported under the local name rather than imported from the SDK everywhere, so
 * components keep reading one mobile-side symbol.
 */
export { ContentModerationReason as MutedReason } from '@ecency/sdk';

/**
 * Values written by app versions that carried their own rules. Posts cached before the
 * update still hold these, so the card copy keeps mapping them until the cache turns
 * over. Nothing writes them any more.
 */
export enum LegacyMutedReason {
  MODERATED = 'moderated',
  LOW_REPUTATION = 'low_reputation',
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

// Optional AI-usage disclosure. Interoperable with the `ai_tools` json_metadata convention
// used by other Hive frontends so an AI-usage badge shows consistently across them.
export interface AiToolsMeta {
  media_generation?: boolean; // AI-generated image/media
  writing_edit?: boolean; // AI grammar/formatting/editing assistance
}

// All fields optional: extractMetadata builds this progressively and app/format
// etc. are merged in later by makeJsonMetadata.
export interface PostMetadata extends Partial<PollMetadata> {
  // GENERAL
  tags?: string[];
  token?: string;
  description?: string;
  format?: string;
  version?: number;
  app?: string;
  // separates waves/comments from top-level posts (PostTypes value)
  type?: string;

  // LINKS
  links?: string[];
  links_meta?: Record<string, { title?: string; summary?: string; image?: string | null } | null>;

  // IMAGE
  image?: string[];
  image_ratios?: number[];

  // AI-usage disclosure (interoperable across Hive frontends; omitted when nothing disclosed)
  ai_tools?: AiToolsMeta;
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
