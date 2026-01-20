import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDraftsQueryOptions, getSchedulesQueryOptions } from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { useAppDispatch } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { addDraft, deleteDraft, deleteScheduledPost, moveScheduledToDraft } from '../ecency/ecency';
import QUERIES from './queryKeys';

/** hook used to return user drafts using SDK */
export const useGetDraftsQuery = () => {
  return useQuery({
    ...getDraftsQueryOptions(),
    select: (data) => _sortData(data || []),
  });
};

/** used to return user schedules using SDK */
export const useGetSchedulesQuery = () => {
  return useQuery({
    ...getSchedulesQueryOptions(),
    select: (data) => _sortDataS(data || []),
  });
};

export const useAddDraftMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation({
    mutationFn: addDraft,
    retry: 3,
    onSuccess: (data) => {
      queryClient.setQueryData([QUERIES.DRAFTS.GET], _sortData(data));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

export const useDraftDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation({
    mutationFn: deleteDraft,
    retry: 3,
    onSuccess: (data) => {
      console.log('Success draft delete', JSON.stringify(data, null, 2));
      queryClient.setQueryData([QUERIES.DRAFTS.GET], _sortData(data));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

export const useDraftsBatchDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation<any, any, any>({
    mutationFn: async (deleteIds) => {
      console.log('deleteIds : ', JSON.stringify(deleteIds, null, 2));
      // eslint-disable-next-line
      for (const i in deleteIds) {
        // eslint-disable-next-line
        await deleteDraft(deleteIds[i]);
      }
      return deleteIds;
    },

    retry: 3,
    onSuccess: (deleteIds) => {
      console.log('Success draft delete', deleteIds);
      queryClient.invalidateQueries({ queryKey: [QUERIES.DRAFTS.GET] });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

export const useScheduleDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation({
    mutationFn: deleteScheduledPost,
    retry: 3,
    onSuccess: (data) => {
      console.log('Success scheduled post delete', data);
      queryClient.setQueryData([QUERIES.SCHEDULES.GET], _sortData(data));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

export const useSchedulesBatchDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation<any, any, any>({
    mutationFn: async (deleteIds) => {
      console.log('deleteIds : ', JSON.stringify(deleteIds, null, 2));

      // eslint-disable-next-line
      for (const i in deleteIds) {
        // eslint-disable-next-line
        await deleteScheduledPost(deleteIds[i]);
      }
      return deleteIds;
    },

    retry: 3,
    onSuccess: (deleteIds) => {
      console.log('Success schedules delete', deleteIds);
      queryClient.invalidateQueries({ queryKey: [QUERIES.SCHEDULES.GET] });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

export const useMoveScheduleToDraftsMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation({
    mutationFn: moveScheduledToDraft,
    retry: 3,
    onSuccess: (data) => {
      console.log('Moved to drafts data', data);
      queryClient.setQueryData([QUERIES.SCHEDULES.GET], _sortData(data));
      queryClient.invalidateQueries({ queryKey: [QUERIES.DRAFTS.GET] });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success_moved' })));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

const _sortDataS = (data) =>
  data.sort((a, b) => {
    const dateA = new Date(a.schedule).getTime();
    const dateB = new Date(b.schedule).getTime();

    return dateB > dateA ? 1 : -1;
  });

const _sortData = (data) =>
  data.sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();

    return dateB > dateA ? 1 : -1;
  });
