import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useAppDispatch } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import {
  addDraft,
  deleteDraft,
  deleteScheduledPost,
  getDrafts,
  getSchedules,
  moveScheduledToDraft,
} from '../ecency/ecency';
import QUERIES from './queryKeys';

/** hook used to return user drafts */
export const useGetDraftsQuery = () => {
  return useQuery([QUERIES.DRAFTS.GET], _getDrafts);
};

/** used to return user schedules */
export const useGetSchedulesQuery = () => {
  return useQuery([QUERIES.SCHEDULES.GET], _getSchedules);
};

export const useAddDraftMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation(addDraft, {
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
  return useMutation(deleteDraft, {
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
  return useMutation<any, any, any>(
    async (deleteIds) => {
      console.log('deleteIds : ', JSON.stringify(deleteIds, null, 2));
      // eslint-disable-next-line
      for (const i in deleteIds) {
        // eslint-disable-next-line
        await deleteDraft(deleteIds[i]);
      }
      return deleteIds;
    },
    {
      retry: 3,
      onSuccess: (deleteIds) => {
        console.log('Success draft delete', deleteIds);
        queryClient.invalidateQueries([QUERIES.DRAFTS.GET]);
      },
      onError: () => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      },
    },
  );
};

export const useScheduleDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation(deleteScheduledPost, {
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
  return useMutation<any, any, any>(
    async (deleteIds) => {
      console.log('deleteIds : ', JSON.stringify(deleteIds, null, 2));

      // eslint-disable-next-line
      for (const i in deleteIds) {
        // eslint-disable-next-line
        await deleteScheduledPost(deleteIds[i]);
      }
      return deleteIds;
    },
    {
      retry: 3,
      onSuccess: (deleteIds) => {
        console.log('Success schedules delete', deleteIds);
        queryClient.invalidateQueries([QUERIES.SCHEDULES.GET]);
      },
      onError: () => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      },
    },
  );
};

export const useMoveScheduleToDraftsMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation(moveScheduledToDraft, {
    retry: 3,
    onSuccess: (data) => {
      console.log('Moved to drafts data', data);
      queryClient.setQueryData([QUERIES.SCHEDULES.GET], _sortData(data));
      queryClient.invalidateQueries([QUERIES.DRAFTS.GET]);
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.success_moved' })));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

const _getDrafts = async () => {
  try {
    const data = await getDrafts();
    return _sortData(data || []);
  } catch (err) {
    throw new Error('draft.load_error');
  }
};

const _getSchedules = async () => {
  try {
    const data = await getSchedules();
    return _sortDataS(data);
  } catch (err) {
    throw new Error('drafts.load_error');
  }
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
