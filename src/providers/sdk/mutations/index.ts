/**
 * SDK mutation wrappers for mobile.
 *
 * Each wrapper injects the mobile auth context (platform adapter + current user)
 * into the corresponding SDK mutation hook.  This mirrors the pattern used in
 * vision-next/apps/web/src/api/sdk-mutations/.
 */

// Social
export { useFollowMutation } from './useFollowMutation';
export { useUnfollowMutation } from './useUnfollowMutation';
export { useReblogMutation } from './useReblogMutation';

// Content
export { useCommentMutation } from './useCommentMutation';
export { useUpdateReplyMutation } from './useUpdateReplyMutation';
export { useDeleteCommentMutation } from './useDeleteCommentMutation';
export { useCrossPostMutation } from './useCrossPostMutation';
export { usePinPostMutation } from './usePinPostMutation';
export { useMutePostMutation } from './useMutePostMutation';
export { usePromoteMutation } from './usePromoteMutation';
export { useBoostPlusMutation } from './useBoostPlusMutation';

// Wallet — transfers
export { useTransferMutation } from './useTransferMutation';
export { useTransferPointMutation } from './useTransferPointMutation';
export { useTransferToSavingsMutation } from './useTransferToSavingsMutation';
export { useTransferFromSavingsMutation } from './useTransferFromSavingsMutation';
export { useTransferToVestingMutation } from './useTransferToVestingMutation';
export { useWithdrawVestingMutation } from './useWithdrawVestingMutation';
export { useConvertMutation } from './useConvertMutation';
export { useClaimInterestMutation } from './useClaimInterestMutation';
export { useClaimRewardsMutation as useSdkClaimRewardsMutation } from './useClaimRewardsMutation';

// Wallet — delegation
export { useDelegateVestingSharesMutation } from './useDelegateVestingSharesMutation';
export { useDelegateRcMutation } from './useDelegateRcMutation';
export { useSetWithdrawVestingRouteMutation } from './useSetWithdrawVestingRouteMutation';

// Hive Engine
export { useTransferEngineTokenMutation } from './useTransferEngineTokenMutation';
export { useDelegateEngineTokenMutation } from './useDelegateEngineTokenMutation';
export { useUndelegateEngineTokenMutation } from './useUndelegateEngineTokenMutation';
export { useStakeEngineTokenMutation } from './useStakeEngineTokenMutation';
export { useUnstakeEngineTokenMutation } from './useUnstakeEngineTokenMutation';
export { useClaimEngineRewardsMutation } from './useClaimEngineRewardsMutation';
export { useEngineMarketOrderMutation } from './useEngineMarketOrderMutation';

// SPK / Larynx
export { useTransferSpkMutation } from './useTransferSpkMutation';
export { useTransferLarynxMutation } from './useTransferLarynxMutation';
export { useLockLarynxMutation } from './useLockLarynxMutation';
export { usePowerLarynxMutation } from './usePowerLarynxMutation';

// Community
export { useSubscribeCommunityMutation } from './useSubscribeCommunityMutation';
export { useUnsubscribeCommunityMutation } from './useUnsubscribeCommunityMutation';
export { useSetCommunityRoleMutation } from './useSetCommunityRoleMutation';
export { useUpdateCommunityMutation } from './useUpdateCommunityMutation';

// Account / Profile
export { useAccountUpdateMutation } from './useAccountUpdateMutation';
export { useGrantPostingPermissionMutation } from './useGrantPostingPermissionMutation';

// Governance
export { useWitnessVoteMutation } from './useWitnessVoteMutation';
export { useProposalVoteMutation } from './useProposalVoteMutation';
export { useWitnessProxyMutation } from './useWitnessProxyMutation';

// Market
export { useLimitOrderCreateMutation } from './useLimitOrderCreateMutation';
export { useLimitOrderCancelMutation } from './useLimitOrderCancelMutation';
