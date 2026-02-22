import { useDispatch } from 'react-redux';
import {
  useSubscribeCommunityMutation,
  useUnsubscribeCommunityMutation,
} from '../providers/sdk/mutations';
import {
  SUBSCRIBE_COMMUNITY,
  SUBSCRIBE_COMMUNITY_SUCCESS,
  SUBSCRIBE_COMMUNITY_FAIL,
  LEAVE_COMMUNITY,
  LEAVE_COMMUNITY_SUCCESS,
  LEAVE_COMMUNITY_FAIL,
  TOAST_NOTIFICATION,
} from '../redux/constants/constants';

/**
 * Hook that replaces the Redux thunk subscribeCommunity/leaveCommunity actions.
 * Uses SDK mutations for broadcasting while keeping Redux state tracking for per-screen loading.
 */
export function useCommunitySubscriptionAction() {
  const dispatch = useDispatch();
  const subscribeMutation = useSubscribeCommunityMutation();
  const unsubscribeMutation = useUnsubscribeCommunityMutation();

  const handleSubscription = async (
    data: { isSubscribed: boolean; communityId: string },
    successToastText: string,
    failToastText: string,
    screen: string,
  ) => {
    const isLeaving = data.isSubscribed;
    const actionType = isLeaving ? LEAVE_COMMUNITY : SUBSCRIBE_COMMUNITY;
    const successType = isLeaving ? LEAVE_COMMUNITY_SUCCESS : SUBSCRIBE_COMMUNITY_SUCCESS;
    const failType = isLeaving ? LEAVE_COMMUNITY_FAIL : SUBSCRIBE_COMMUNITY_FAIL;

    dispatch({ type: actionType, payload: { ...data, screen } });

    try {
      const mutation = isLeaving ? unsubscribeMutation : subscribeMutation;
      await mutation.mutateAsync({ community: data.communityId });

      dispatch({ type: successType, payload: { ...data, screen } });
      dispatch({ type: TOAST_NOTIFICATION, payload: successToastText });
    } catch {
      dispatch({ type: failType, payload: { ...data, screen } });
      dispatch({ type: TOAST_NOTIFICATION, payload: failToastText });
    }
  };

  return handleSubscription;
}
