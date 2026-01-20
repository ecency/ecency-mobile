import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDraft as sdkAddDraft,
  updateDraft as sdkUpdateDraft,
  deleteDraft as sdkDeleteDraft,
  addSchedule as sdkAddSchedule,
  deleteSchedule as sdkDeleteSchedule,
  moveSchedule as sdkMoveSchedule,
} from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { useAppDispatch } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import ecencyApi from '../../../config/ecencyApi';

/**
 * SDK DRAFT MUTATIONS
 * These are re-exported from @ecency/sdk with mobile-specific wrappers
 */

/**
 * Add a new draft to the Ecency server
 * @param code - Access token
 * @param title - Draft title
 * @param body - Draft body content
 * @param tags - Comma-separated tags
 * @param meta - Draft metadata
 */
export const useAddDraftMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      title,
      body,
      tags,
      meta,
    }: {
      code: string | undefined;
      title: string;
      body: string;
      tags: string;
      meta: any;
    }) => {
      return sdkAddDraft(code, title, body, tags, meta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

/**
 * Update an existing draft
 * @param code - Access token
 * @param draftId - Draft ID to update
 * @param title - Updated title
 * @param body - Updated body content
 * @param tags - Updated comma-separated tags
 * @param meta - Updated metadata
 */
export const useUpdateDraftMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      draftId,
      title,
      body,
      tags,
      meta,
    }: {
      code: string | undefined;
      draftId: string;
      title: string;
      body: string;
      tags: string;
      meta: any;
    }) => {
      return sdkUpdateDraft(code, draftId, title, body, tags, meta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

/**
 * Delete a draft from the Ecency server
 * @param code - Access token
 * @param draftId - Draft ID to delete
 */
export const useDeleteDraftMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, draftId }: { code: string | undefined; draftId: string }) => {
      return sdkDeleteDraft(code, draftId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

/**
 * SDK SCHEDULE MUTATIONS
 * These are re-exported from @ecency/sdk with mobile-specific wrappers
 */

/**
 * Add a new scheduled post to the Ecency server
 * @param code - Access token
 * @param permlink - Post permlink
 * @param title - Post title
 * @param body - Post body content
 * @param meta - Post metadata
 * @param options - Post options (beneficiaries, etc.)
 * @param schedule - ISO 8601 datetime string for scheduling
 * @param reblog - Whether to reblog after publishing
 */
export const useAddScheduleMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      permlink,
      title,
      body,
      meta,
      options,
      schedule,
      reblog,
    }: {
      code: string | undefined;
      permlink: string;
      title: string;
      body: string;
      meta: Record<string, unknown>;
      options: Record<string, unknown> | null;
      schedule: string;
      reblog: boolean;
    }) => {
      return sdkAddSchedule(code, permlink, title, body, meta, options, schedule, reblog);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success' })));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

/**
 * Delete a scheduled post from the Ecency server
 * @param code - Access token
 * @param id - Scheduled post ID to delete
 */
export const useDeleteScheduleMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, id }: { code: string | undefined; id: string }) => {
      return sdkDeleteSchedule(code, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

/**
 * Move a scheduled post to drafts
 * @param code - Access token
 * @param id - Scheduled post ID to move
 */
export const useMoveScheduleToDraftsMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, id }: { code: string | undefined; id: string }) => {
      return sdkMoveSchedule(code, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success_moved' })));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

/**
 * NOTIFICATION MUTATIONS
 * Custom wrappers for Ecency private API notification endpoints
 */

/**
 * Mark notifications as read
 * @param id - Optional notification ID. If not provided, marks all as read
 * @param all - If true, marks all notifications as read
 */
export const useMarkNotificationsReadMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, all }: { id?: string; all?: boolean }) => {
      const data: { id?: string; all?: boolean } = {};
      if (id) {
        data.id = id;
      }
      if (all) {
        data.all = all;
      }

      const response = await ecencyApi.post('/private-api/notifications/mark', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (data?.unread !== undefined) {
        // Unread count is typically handled by the caller
        // through Redux or other state management
      }
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};
