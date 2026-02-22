import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getPostTipsQueryOptions } from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { PostTipsResponse } from '../../ecency/ecency.types';
import QUERIES from '../queryKeys';
import { useAppDispatch } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { formatTipAmount } from '../../../services/tippingService';
import {
  useTransferMutation,
  useTransferPointMutation,
  useTransferEngineTokenMutation,
} from '../../sdk/mutations';

interface UsePostTipsQueryProps {
  author?: string;
  permlink?: string;
  enabled?: boolean;
}

export interface TipParams {
  currency: string;
  amount: string;
  recipient: string;
  author: string;
  permlink: string;
  precision?: number;
}

/**
 * Fetches tips for a specific post using SDK
 * Caching: 5 minutes stale time (tips change infrequently during post viewing)
 * No persistence needed - tips are post-specific and frequently updated
 */
export const usePostTipsQuery = ({ author, permlink, enabled = true }: UsePostTipsQueryProps) => {
  return useQuery<PostTipsResponse | null>({
    ...getPostTipsQueryOptions(author || '', permlink || ''),
    enabled: enabled && !!author && !!permlink,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // Don't retry on failure
    placeholderData: { meta: { count: 0, totals: {} }, list: [] }, // Safe default
  });
};

/**
 * Mutation hook for sending tips
 * Invalidates tips query on success and shows toast notifications
 */
export const useSendTipMutation = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const intl = useIntl();

  const transferMutation = useTransferMutation();
  const transferPointMutation = useTransferPointMutation();
  const transferEngineMutation = useTransferEngineTokenMutation();

  return useMutation<any, Error, TipParams>({
    mutationFn: async (params) => {
      const { currency, amount, recipient, author, permlink, precision } = params;
      const formattedAmount = formatTipAmount(amount, currency, precision);
      const memo = `Tip for @${author}/${permlink}`;

      if (currency === 'POINTS') {
        return transferPointMutation.mutateAsync({
          to: recipient,
          amount: `${formattedAmount} POINT`,
          memo,
        });
      }

      if (currency === 'HIVE' || currency === 'HBD') {
        return transferMutation.mutateAsync({
          to: recipient,
          amount: `${formattedAmount} ${currency}`,
          memo,
        });
      }

      // Engine tokens
      return transferEngineMutation.mutateAsync({
        to: recipient,
        symbol: currency,
        quantity: formattedAmount,
        memo,
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate tips query to refetch updated tips
      queryClient.invalidateQueries({
        queryKey: [QUERIES.POST.GET_TIPS, variables.author, variables.permlink],
      });

      // Invalidate wallet/portfolio query so balances refresh after tip
      queryClient.invalidateQueries({
        queryKey: [QUERIES.WALLET.GET],
      });

      // Show success toast
      dispatch(toastNotification(intl.formatMessage({ id: 'tipping.success' })));
    },
    onError: (error) => {
      // Show error toast
      dispatch(toastNotification(intl.formatMessage({ id: 'tipping.error' })));
      console.error('Tip sending failed:', error);
    },
  });
};
