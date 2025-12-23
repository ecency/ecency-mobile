import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { getPostTips } from '../../ecency/ecency';
import { PostTipsResponse } from '../../ecency/ecency.types';
import QUERIES from '../queryKeys';
import { useAppDispatch } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { sendTip, TipParams } from '../../../services/tippingService';

interface UsePostTipsQueryProps {
  author?: string;
  permlink?: string;
  enabled?: boolean;
}

/**
 * Fetches tips for a specific post
 * Caching: 5 minutes stale time (tips change infrequently during post viewing)
 * No persistence needed - tips are post-specific and frequently updated
 */
export const usePostTipsQuery = ({ author, permlink, enabled = true }: UsePostTipsQueryProps) => {
  return useQuery<PostTipsResponse | null>({
    queryKey: [QUERIES.POST.GET_TIPS, author, permlink],
    queryFn: async () => {
      if (!author || !permlink) {
        return null;
      }
      try {
        return await getPostTips(author, permlink);
      } catch (error) {
        console.log('Failed to fetch tips:', error);
        // Return empty tips data on error
        return { meta: { count: 0, totals: {} }, list: [] };
      }
    },
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

  return useMutation<any, Error, TipParams>({
    mutationFn: sendTip,
    onSuccess: (data, variables) => {
      // Invalidate tips query to refetch updated tips
      queryClient.invalidateQueries({
        queryKey: [QUERIES.POST.GET_TIPS, variables.author, variables.permlink],
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
