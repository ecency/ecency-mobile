import { useQuery } from '@tanstack/react-query';
import {
  getDraftsQueryOptions,
  getSchedulesQueryOptions,
  useAddDraft,
  useUpdateDraft,
  useDeleteDraft,
  useAddSchedule,
  useDeleteSchedule,
  useMoveSchedule,
} from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { decryptKey } from '../../utils/crypto';
import { getDigitPinCode } from '../hive/dhive';

/**
 * Get username and access token from Redux state
 * Used internally by mutation hooks to access auth credentials
 */
const useAuth = () => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);
  const digitPinCode = getDigitPinCode(pinHash);

  const username = currentAccount?.username;
  const accessToken = currentAccount?.local?.accessToken
    ? decryptKey(currentAccount.local.accessToken, digitPinCode)
    : undefined;

  return { username, code: accessToken };
};

/** Hook used to return user drafts using SDK */
export const useGetDraftsQuery = () => {
  return useQuery({
    ...getDraftsQueryOptions(),
    select: (data) => _sortData(data || []),
  });
};

/** Hook used to return user schedules using SDK */
export const useGetSchedulesQuery = () => {
  return useQuery({
    ...getSchedulesQueryOptions(),
    select: (data) => _sortDataS(data || []),
  });
};

/**
 * Hook to add a new draft
 * Uses SDK's useAddDraft hook with mobile-specific error handling
 */
export const useAddDraftMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { username, code } = useAuth();

  return useAddDraft(
    username,
    code,
    undefined, // onSuccess - handled by SDK query invalidation
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  );
};

/**
 * Hook to update an existing draft
 * Uses SDK's useUpdateDraft hook with mobile-specific error handling
 */
export const useUpdateDraftMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { username, code } = useAuth();

  return useUpdateDraft(username, code, undefined, () => {
    dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
  });
};

/**
 * Hook to delete a single draft
 * Uses SDK's useDeleteDraft hook with mobile-specific error handling
 */
export const useDraftDeleteMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { username, code } = useAuth();

  return useDeleteDraft(username, code, undefined, () => {
    dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
  });
};

/**
 * Hook to batch delete multiple drafts
 * Calls SDK's deleteDraft hook multiple times sequentially
 */
export const useDraftsBatchDeleteMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const deleteDraftMutation = useDraftDeleteMutation();

  return {
    mutate: async (deleteIds: string[], options?: { onSettled?: () => void }) => {
      try {
        // Delete drafts in parallel
        await Promise.all(deleteIds.map((id) => deleteDraftMutation.mutateAsync({ draftId: id })));
        options?.onSettled?.();
      } catch (error) {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
        options?.onSettled?.();
      }
    },
    isLoading: deleteDraftMutation.isLoading,
    isPending: deleteDraftMutation.isPending,
  };
};

/**
 * Hook to add a scheduled post
 * Uses SDK's useAddSchedule hook with mobile-specific success/error handling
 */
export const useAddScheduleMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { username, code } = useAuth();

  return useAddSchedule(
    username,
    code,
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
    },
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  );
};

/**
 * Hook to delete a single scheduled post
 * Uses SDK's useDeleteSchedule hook with mobile-specific error handling
 */
export const useScheduleDeleteMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { username, code } = useAuth();

  return useDeleteSchedule(username, code, undefined, () => {
    dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
  });
};

/**
 * Hook to batch delete multiple schedules
 * Calls SDK's deleteSchedule hook multiple times sequentially
 */
export const useSchedulesBatchDeleteMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const deleteScheduleMutation = useScheduleDeleteMutation();

  return {
    mutate: async (deleteIds: string[], options?: { onSettled?: () => void }) => {
      try {
        // Delete schedules in parallel
        await Promise.all(deleteIds.map((id) => deleteScheduleMutation.mutateAsync({ id })));
        options?.onSettled?.();
      } catch (error) {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
        options?.onSettled?.();
      }
    },
    isLoading: deleteScheduleMutation.isLoading,
    isPending: deleteScheduleMutation.isPending,
  };
};

/**
 * Hook to move a scheduled post to drafts
 * Uses SDK's useMoveSchedule hook with mobile-specific success/error handling
 */
export const useMoveScheduleToDraftsMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { username, code } = useAuth();

  return useMoveSchedule(
    username,
    code,
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success_moved' })));
    },
    () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  );
};

// Sort helpers
const _sortDataS = (data: any[]) =>
  data.sort((a, b) => {
    const dateA = new Date(a.schedule).getTime();
    const dateB = new Date(b.schedule).getTime();
    return dateB > dateA ? 1 : -1;
  });

const _sortData = (data: any[]) =>
  data.sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();
    return dateB > dateA ? 1 : -1;
  });
