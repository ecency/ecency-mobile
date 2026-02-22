import { useDispatch } from 'react-redux';
import { useFollowMutation, useUnfollowMutation } from '../providers/sdk/mutations';
import {
  FOLLOW_USER,
  FOLLOW_USER_SUCCESS,
  FOLLOW_USER_FAIL,
  UNFOLLOW_USER,
  UNFOLLOW_USER_SUCCESS,
  UNFOLLOW_USER_FAIL,
  TOAST_NOTIFICATION,
} from '../redux/constants/constants';

/**
 * Hook that replaces the Redux thunk followUser/unfollowUser actions.
 * Uses SDK mutations for broadcasting while keeping Redux state tracking for loading UI.
 */
export function useFollowUserAction() {
  const dispatch = useDispatch();
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();

  const handleFollowUser = async (
    data: { following: string; [key: string]: any },
    isFollowing: boolean,
    successToastText: string,
    failToastText: string,
  ) => {
    const actionType = isFollowing ? UNFOLLOW_USER : FOLLOW_USER;
    const successType = isFollowing ? UNFOLLOW_USER_SUCCESS : FOLLOW_USER_SUCCESS;
    const failType = isFollowing ? UNFOLLOW_USER_FAIL : FOLLOW_USER_FAIL;

    dispatch({ type: actionType, payload: data });

    try {
      const mutation = isFollowing ? unfollowMutation : followMutation;
      await mutation.mutateAsync({ following: data.following });

      dispatch({ type: successType, payload: data });
      dispatch({ type: TOAST_NOTIFICATION, payload: successToastText });
    } catch {
      dispatch({ type: failType, payload: data });
      dispatch({ type: TOAST_NOTIFICATION, payload: failToastText });
    }
  };

  return handleFollowUser;
}
