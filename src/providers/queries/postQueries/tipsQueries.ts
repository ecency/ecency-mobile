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

  return useMutation<unknown, Error, TipParams>({
    mutationFn: async (params) => {
      const { currency, amount, recipient, author, permlink, precision } = params;
      const normalizedRecipient = recipient.trim();
      const normalizedAuthor = author.trim();
      const normalizedPermlink = permlink.trim();
      const normalizedCurrency = currency.trim().toUpperCase();
      if (!normalizedRecipient) {
        throw new Error('Tip recipient is required');
      }
      if (!normalizedAuthor) {
        throw new Error('Tip author is required');
      }
      if (!normalizedPermlink) {
        throw new Error('Tip permlink is required');
      }
      if (!normalizedCurrency) {
        throw new Error('Tip currency is required');
      }
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Tip amount must be a valid number greater than 0');
      }

      const isPoints = normalizedCurrency === 'POINTS';
      const isHive = normalizedCurrency === 'HIVE';
      const isHbd = normalizedCurrency === 'HBD';
      const isEngineToken = !isPoints && !isHive && !isHbd;

      if (isEngineToken && precision == null) {
        throw new Error(`Missing precision for engine token tip currency: ${normalizedCurrency}`);
      }

      const formattedAmount = formatTipAmount(amount, normalizedCurrency, precision);
      const formattedNumericAmount = Number(formattedAmount);
      if (!Number.isFinite(formattedNumericAmount) || formattedNumericAmount <= 0) {
        const precisionLabel = precision ?? 'default';
        throw new Error(
          `Tip amount rounds to zero with precision ${precisionLabel} for ${normalizedCurrency}`,
        );
      }
      const memo = `Tip for @${normalizedAuthor}/${normalizedPermlink}`;

      if (isPoints) {
        return transferPointMutation.mutateAsync({
          to: normalizedRecipient,
          amount: `${formattedAmount} POINT`,
          memo,
        });
      }

      if (isHive || isHbd) {
        return transferMutation.mutateAsync({
          to: normalizedRecipient,
          amount: `${formattedAmount} ${normalizedCurrency}`,
          memo,
        });
      }

      // Engine tokens
      return transferEngineMutation.mutateAsync({
        to: normalizedRecipient,
        symbol: normalizedCurrency,
        quantity: formattedAmount,
        memo,
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate tips query to refetch updated tips
      const tipsQueryKey = getPostTipsQueryOptions(variables.author, variables.permlink).queryKey;
      queryClient.invalidateQueries({
        queryKey: tipsQueryKey,
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
