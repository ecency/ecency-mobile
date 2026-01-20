/**
 * SDK-Based Query Wrappers for dhive.ts
 *
 * This module provides SDK-based implementations of dhive.ts query functions
 * while maintaining the same API for backward compatibility.
 *
 * Migration Path:
 * 1. Import from this file instead of dhive.ts for query functions
 * 2. Eventually migrate to using SDK query hooks directly in components
 * 3. Remove this compatibility layer when all code uses SDK hooks
 *
 * @deprecated Use SDK query hooks directly in new code
 */

import {
  // Account queries
  getAccountsQueryOptions,
  getAccountFullQueryOptions,
  lookupAccountsQueryOptions,
  getAccountReputationsQueryOptions,
  getFollowCountQueryOptions,
  getFollowingQueryOptions,
  getMutedUsersQueryOptions,
  getRelationshipBetweenAccountsQueryOptions,
  getAccountSubscriptionsQueryOptions,
  getTransactionsInfiniteQueryOptions,

  // Community queries
  getCommunityQueryOptions,
  getCommunitiesQueryOptions,

  // Post queries
  getPostQueryOptions,
  getPostsRankedQueryOptions,
  getAccountPostsQueryOptions,
  getDiscussionsQueryOptions,
  getContentRepliesQueryOptions,
  getEntryActiveVotesQueryOptions,
  getTrendingTagsQueryOptions,

  // Market queries
  getDynamicPropsQueryOptions,
  getMarketStatisticsQueryOptions,
  getOrderBookQueryOptions,

  // Wallet queries
  getVestingDelegationsQueryOptions,
  getWithdrawRoutesQueryOptions,
  getOpenOrdersQueryOptions,
  getRecurrentTransfersQueryOptions,
  getConversionRequestsQueryOptions,
  getSavingsWithdrawFromQueryOptions,

  // Proposal queries
  getUserProposalVotesQueryOptions,
} from '@ecency/sdk';

import { getQueryClient } from '../queries';

/**
 * Get a single account's basic data
 * @deprecated Use getAccountsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getAccount = async (username: string) => {
  const queryClient = getQueryClient();
  const accounts = await queryClient.fetchQuery(getAccountsQueryOptions([username]));

  if (accounts && accounts.length > 0) {
    return accounts[0];
  }

  throw new Error(`Account not found: ${username}`);
};

/**
 * Get multiple accounts' basic data
 * @deprecated Use getAccountsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getAccounts = async (usernames: string[]) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getAccountsQueryOptions(usernames));
};

/**
 * Get full user data with extended information (RC, VP, reputation, etc.)
 * @deprecated Use getAccountFullQueryOptions from @ecency/sdk with useQuery hook
 */
export const getUser = async (username: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getAccountFullQueryOptions(username));
};

/**
 * Lookup accounts by username prefix
 * @deprecated Use lookupAccountsQueryOptions from @ecency/sdk with useQuery hook
 */
export const lookupAccounts = async (username: string, limit: number = 20) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(lookupAccountsQueryOptions(username, limit));
};

/**
 * Get account reputation
 * @deprecated Use getAccountReputationsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getUserReputation = async (author: string) => {
  const queryClient = getQueryClient();
  const result = await queryClient.fetchQuery(getAccountReputationsQueryOptions(author, 1));

  if (result && result.length > 0) {
    return result[0].reputation;
  }

  return 0;
};

/**
 * Get follow count for an account
 * @deprecated Use getFollowCountQueryOptions from @ecency/sdk with useQuery hook
 */
export const getFollows = async (username: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getFollowCountQueryOptions(username));
};

/**
 * Get list of accounts that a user is following
 * @deprecated Use getFollowingQueryOptions from @ecency/sdk with useQuery hook
 */
export const getFollowing = async (
  follower: string,
  startFollowing: string = '',
  followType: string = 'blog',
  limit: number = 100,
) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(
    getFollowingQueryOptions(follower, startFollowing, followType, limit),
  );
};

/**
 * Get list of accounts following a user
 * ⚠️ WARNING: This function is NOT YET AVAILABLE in SDK
 * Using direct Hive API call as fallback
 *
 * TODO: Add getFollowersQueryOptions to SDK
 * @deprecated Use getFollowersQueryOptions from @ecency/sdk when available
 */
export const getFollowers = async (
  follower: string,
  startFollowing: string = '',
  followType: string = 'blog',
  limit: number = 100,
) => {
  // Fallback to direct API call until SDK provides this
  const { client } = await import('./dhive');
  return client.database.call('get_followers', [follower, startFollowing, followType, limit]);
};

/**
 * Get list of muted users
 * @deprecated Use getMutedUsersQueryOptions from @ecency/sdk with useQuery hook
 */
export const getMutes = async (username: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getMutedUsersQueryOptions(username));
};

/**
 * Get relationship between two accounts
 * @deprecated Use getRelationshipBetweenAccountsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getRelationship = async (follower: string, following: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getRelationshipBetweenAccountsQueryOptions(follower, following));
};

/**
 * Get account subscriptions
 * @deprecated Use getAccountSubscriptionsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getSubscriptions = async (account: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getAccountSubscriptionsQueryOptions(account));
};

/**
 * Get account history/transactions
 * Note: SDK uses infinite query pattern for this
 * @deprecated Use getTransactionsInfiniteQueryOptions from @ecency/sdk with useInfiniteQuery hook
 */
export const getAccountHistory = async (
  user: string,
  operations: string[],
  _startIndex: number = -1, // unused - kept for API compatibility
  limit: number = 1000,
) => {
  const queryClient = getQueryClient();

  // Note: SDK's infinite query pattern is different
  // This is a simplified compatibility wrapper
  // For full functionality, use the infinite query hook directly
  const result = await queryClient.fetchQuery(
    getTransactionsInfiniteQueryOptions(user, operations, limit),
  );

  return result.pages?.[0] || [];
};

// ============================================================================
// COMMUNITY FUNCTIONS
// ============================================================================

/**
 * Get single community data
 * @deprecated Use getCommunityQueryOptions from @ecency/sdk with useQuery hook
 */
export const getCommunity = async (tag: string, observer: string = '') => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getCommunityQueryOptions(tag, observer));
};

/**
 * Get community title (with caching)
 * @deprecated Use getCommunityQueryOptions from @ecency/sdk and extract title
 */
export const getCommunityTitle = async (tag: string) => {
  const queryClient = getQueryClient();
  const community = await queryClient.fetchQuery(getCommunityQueryOptions(tag, ''));
  return community?.title || tag;
};

/**
 * Get list of communities
 * @deprecated Use getCommunitiesQueryOptions from @ecency/sdk with useQuery hook
 */
export const getCommunities = async (
  last: string = '',
  limit: number = 100,
  query: string | null = null,
  sort: string = 'rank',
  observer: string = '',
) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getCommunitiesQueryOptions({ last, limit, query, sort, observer }));
};

// ============================================================================
// POST FUNCTIONS
// ============================================================================

/**
 * Get single post data
 * @deprecated Use getPostQueryOptions from @ecency/sdk with useQuery hook
 */
export const getPost = async (
  author: string,
  permlink: string,
  currentUserName: string | null = null,
  _isPromoted: boolean = false, // unused - kept for API compatibility
) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getPostQueryOptions(author, permlink, currentUserName || ''));
};

/**
 * Check if post is available
 * ⚠️ WARNING: This is a utility function not directly in SDK
 *
 * TODO: Add checkPostExistsQueryOptions to SDK
 * @deprecated Use getPostQueryOptions from @ecency/sdk and check result
 */
export const isPostAvailable = async (author: string, permlink: string) => {
  try {
    const queryClient = getQueryClient();
    const post = await queryClient.fetchQuery(getPostQueryOptions(author, permlink, ''));
    return post && post.post_id !== 0;
  } catch {
    return false;
  }
};

/**
 * Get pure post data without processing
 * ⚠️ WARNING: This is essentially same as getPost in SDK
 *
 * @deprecated Use getPostQueryOptions from @ecency/sdk with useQuery hook
 */
export const getPurePost = async (author: string, permlink: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getPostQueryOptions(author, permlink, ''));
};

/**
 * Get ranked posts (trending, hot, new, etc.)
 * @deprecated Use getPostsRankedQueryOptions from @ecency/sdk with useQuery hook
 */
export const getRankedPosts = async (
  query: any,
  _currentUserName: string = '', // unused - kept for API compatibility
  _filterNsfw: string = '0', // unused - SDK handles NSFW filtering
) => {
  const queryClient = getQueryClient();
  const posts = await queryClient.fetchQuery(getPostsRankedQueryOptions(query));

  // Note: NSFW filtering is handled by SDK
  // This wrapper maintains API compatibility
  return posts;
};

/**
 * Get account posts
 * @deprecated Use getAccountPostsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getAccountPosts = async (
  query: any,
  _currentUserName: string = '', // unused - kept for API compatibility
  _filterNsfw: string = '0', // unused - SDK handles NSFW filtering
) => {
  const queryClient = getQueryClient();
  const posts = await queryClient.fetchQuery(getAccountPostsQueryOptions(query));

  // Note: NSFW filtering is handled by SDK
  return posts;
};

/**
 * Get discussion/comments
 * @deprecated Use getDiscussionsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getDiscussionCollection = async (
  author: string,
  permlink: string,
  _currentUsername: string = '', // unused - kept for API compatibility
) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getDiscussionsQueryOptions(author, permlink));
};

/**
 * Get comments for a post
 * @deprecated Use getDiscussionsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getComments = async (
  author: string,
  permlink: string,
  _currentUsername: string = '', // unused - kept for API compatibility
) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getDiscussionsQueryOptions(author, permlink));
};

/**
 * Get replies by last update
 * @deprecated Use getContentRepliesQueryOptions from @ecency/sdk with useQuery hook
 */
export const getRepliesByLastUpdate = async (query: any, _currentUsername: string = '') => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(
    getContentRepliesQueryOptions(query.start_author, query.start_permlink, query.limit),
  );
};

/**
 * Get active votes for a post
 * @deprecated Use getEntryActiveVotesQueryOptions from @ecency/sdk with useQuery hook
 */
export const getActiveVotes = async (author: string, permlink: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getEntryActiveVotesQueryOptions(author, permlink));
};

/**
 * Get specific user's vote on a post (useful when total votes > 1000)
 * ⚠️ WARNING: This function is NOT YET AVAILABLE in SDK
 * Using direct Hive API call as fallback
 *
 * TODO: Add getUserPostVoteQueryOptions to SDK
 * @deprecated Use getUserPostVoteQueryOptions from @ecency/sdk when available
 */
export const getUserPostVote = async (author: string, permlink: string, username: string) => {
  // Fallback to direct API call until SDK provides this
  try {
    const { client } = await import('./dhive');
    const result = await client.call('database_api', 'list_votes', [
      [username, author, permlink],
      1,
      'by_voter_comment',
    ]);

    if (result?.votes && result.votes.length > 0) {
      return result.votes[0];
    }
    return null;
  } catch (error) {
    console.warn('Failed to get user post vote', error);
    return null;
  }
};

/**
 * Get trending tags
 * @deprecated Use getTrendingTagsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getTrendingTags = async (tag: string = '', number: number = 20) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getTrendingTagsQueryOptions(tag, number));
};

// ============================================================================
// MARKET/PRICE FUNCTIONS
// ============================================================================

/**
 * Get dynamic global properties
 * Note: SDK combines this with reward fund and feed history
 * @deprecated Use getDynamicPropsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getDynamicGlobalProperties = async () => {
  const queryClient = getQueryClient();
  const props = await queryClient.fetchQuery(getDynamicPropsQueryOptions());

  // SDK returns combined data, extract just the dynamic props
  return props.dynamicProps;
};

/**
 * Get reward fund
 * Note: SDK includes this in getDynamicPropsQueryOptions
 * @deprecated Use getDynamicPropsQueryOptions from @ecency/sdk and extract rewardFund
 */
export const getRewardFund = async () => {
  const queryClient = getQueryClient();
  const props = await queryClient.fetchQuery(getDynamicPropsQueryOptions());

  return props.rewardFund;
};

/**
 * Get feed history
 * Note: SDK includes this in getDynamicPropsQueryOptions
 * @deprecated Use getDynamicPropsQueryOptions from @ecency/sdk and extract feedHistory
 */
export const getFeedHistory = async () => {
  const queryClient = getQueryClient();
  const props = await queryClient.fetchQuery(getDynamicPropsQueryOptions());

  return props.feedHistory;
};

/**
 * Get current median history price
 * Note: SDK includes this in getDynamicPropsQueryOptions
 * @deprecated Use getDynamicPropsQueryOptions from @ecency/sdk and extract current_median_history
 */
export const getCurrentMedianHistoryPrice = async () => {
  const queryClient = getQueryClient();
  const props = await queryClient.fetchQuery(getDynamicPropsQueryOptions());

  return props.feedHistory?.current_median_history;
};

/**
 * Get market statistics
 * @deprecated Use getMarketStatisticsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getMarketStatistics = async () => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getMarketStatisticsQueryOptions());
};

/**
 * Get order book
 * @deprecated Use getOrderBookQueryOptions from @ecency/sdk with useQuery hook
 */
export const getOrderBook = async (limit: number = 500) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getOrderBookQueryOptions(limit));
};

// ============================================================================
// WALLET FUNCTIONS
// ============================================================================

/**
 * Get vesting delegations
 * @deprecated Use getVestingDelegationsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getVestingDelegations = async (
  username: string,
  fromDelegatee: string = '',
  limit: number = 1000,
) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getVestingDelegationsQueryOptions(username, fromDelegatee, limit));
};

/**
 * Get withdraw routes
 * @deprecated Use getWithdrawRoutesQueryOptions from @ecency/sdk with useQuery hook
 */
export const getWithdrawRoutes = async (account: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getWithdrawRoutesQueryOptions(account));
};

/**
 * Get open orders
 * @deprecated Use getOpenOrdersQueryOptions from @ecency/sdk with useQuery hook
 */
export const getOpenOrders = async (username: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getOpenOrdersQueryOptions(username));
};

/**
 * Get recurrent transfers
 * @deprecated Use getRecurrentTransfersQueryOptions from @ecency/sdk with useQuery hook
 */
export const getRecurrentTransfers = async (username: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getRecurrentTransfersQueryOptions(username));
};

/**
 * Get conversion requests
 * @deprecated Use getConversionRequestsQueryOptions from @ecency/sdk with useQuery hook
 */
export const getConversionRequests = async (username: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getConversionRequestsQueryOptions(username));
};

/**
 * Get savings withdraw from
 * @deprecated Use getSavingsWithdrawFromQueryOptions from @ecency/sdk with useQuery hook
 */
export const getSavingsWithdrawFrom = async (username: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getSavingsWithdrawFromQueryOptions(username));
};

// ============================================================================
// PROPOSAL FUNCTIONS
// ============================================================================

/**
 * Get proposals voted by user
 * @deprecated Use getUserProposalVotesQueryOptions from @ecency/sdk with useQuery hook
 */
export const getProposalsVoted = async (username: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getUserProposalVotesQueryOptions(username));
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch global properties (combines multiple calls)
 * This is a convenience function that fetches and processes global data
 * @deprecated Use getDynamicPropsQueryOptions from @ecency/sdk with custom processing
 */
export const fetchGlobalProps = async () => {
  const queryClient = getQueryClient();
  const props = await queryClient.fetchQuery(getDynamicPropsQueryOptions());

  // Process and return in the format expected by legacy code
  const { dynamicProps, rewardFund, feedHistory } = props;

  const hivePerMVests =
    (parseFloat(dynamicProps.total_vesting_fund_hive) /
      parseFloat(dynamicProps.total_vesting_shares)) *
    1e6;

  const base = parseFloat(feedHistory.current_median_history.base.split(' ')[0]);
  const quote = parseFloat(feedHistory.current_median_history.quote.split(' ')[0]);

  return {
    hivePerMVests,
    base,
    quote,
    fundRecentClaims: rewardFund.recent_claims,
    fundRewardBalance: parseFloat(rewardFund.reward_balance.split(' ')[0]),
    hbdPrintRate: dynamicProps.hbd_print_rate,
  };
};

/**
 * Get post with comments (convenience function)
 * @deprecated Use getPostQueryOptions and getDiscussionsQueryOptions separately
 */
export const getPostWithComments = async (author: string, permlink: string) => {
  const post = await getPost(author, permlink);
  const comments = await getComments(author, permlink);

  return [post, comments];
};

/**
 * Get state (complex function that combines multiple queries)
 * Note: This may need custom implementation based on usage
 * @deprecated Use combination of SDK query options based on specific needs
 */
export const getState = async (path: string) => {
  // This is a complex function that returns different data based on path
  // May need custom implementation or gradual migration
  // For now, fallback to direct API call
  const { client } = await import('./dhive');
  return client.database.getState(path);
};

// ============================================================================
// RE-EXPORT OPERATION/MUTATION FUNCTIONS FROM dhive.ts
// Import and re-export all operation functions to maintain single import point
// ============================================================================

export {
  // Core operations
  sendHiveOperations,
  broadcastPostingJSON,
  buildActiveCustomJsonOpArr,
  generateTrxId,

  // Voting
  vote,
  voteProposal,

  // Posting
  postContent,
  postComment,
  deleteComment,
  reblog,

  // Transfers
  transferToken,
  recurrentTransferToken,
  convert,
  transferToSavings,
  transferFromSavings,
  transferToVesting,
  withdrawVesting,
  delegateVestingShares,
  setWithdrawVestingRoute,

  // Points
  transferPoint,
  promote,
  boost,
  boostPlus,

  // Social
  followUser,
  unfollowUser,
  ignoreUser,
  markHiveNotifications,

  // Account
  profileUpdate,
  grantPostingPermission,

  // Community
  subscribeCommunity,
  pinCommunityPost,

  // Rewards
  claimRewardBalance,

  // Helpers
  getDigitPinCode,
  getPostingKey,
  getActiveKey,
  getAnyPrivateKey,
  votingPower,
  upvoteAmount,
  signImage,
  vestToSteem,

  // URI handling
  resolveTransaction,
  handleHiveUriOperation,

  // Client
  checkClient,
} from './dhive';
