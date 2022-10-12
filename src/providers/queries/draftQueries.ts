import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isArray } from 'lodash';
import { useIntl } from 'react-intl';
import { useAppDispatch } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { Draft } from '../../redux/reducers/cacheReducer';
import {
  addDraft,
  deleteDraft,
  deleteScheduledPost,
  getDrafts,
  getSchedules,
  moveScheduledToDraft,
  updateDraft,
} from '../ecency/ecency';
import QUERIES from './queryKeys';

interface DraftMutationVars {
  id: string | null;
  title: string;
  body: string;
  tags: string;
  metaData: Object;
}

/** hook used to return user drafts */
export const useGetDraftsQuery = () => {
  return useQuery([QUERIES.DRAFTS.GET], _getDrafts);
};

/** used to return user schedules */
export const useGetSchedulesQuery = () => {
  return useQuery([QUERIES.SCHEDULES.GET], _getSchedules);
};

export const useDraftDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation(deleteDraft, {
    retry: 3,
    onSuccess: (data) => {
      console.log('Success draft delete', data);
      queryClient.setQueryData([QUERIES.DRAFTS.GET], _sortData(data));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};


export const useDraftMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Draft[] | Draft, Error, DraftMutationVars>(
    async ({ id, title, body, tags, metaData }) => {
      if (id) {
        return await updateDraft(id, title, body, tags, metaData);
      } else {
        return await addDraft(title, body, tags, metaData);
      }
    }, {
    onMutate: async ({ id, title, body, tags, metaData }) => {
      if(id){
        queryClient.setQueryData([QUERIES.DRAFTS.GET], (oldData:Draft[]|undefined)=>{
          if(oldData){
            const draftIndex = oldData.findIndex((draft)=>draft._id===id);
            if(draftIndex > -1){
              oldData[draftIndex] = {
                ...oldData[draftIndex],
                body,
                title,
                tags,
                meta:metaData
              }
            }
          }
          return oldData;
        })
      }
    },
    onSuccess: (data) => {
      console.log('Success draft update', data);

      queryClient.setQueryData([QUERIES.DRAFTS.GET], (oldData:Draft[]|undefined) => {
        if (isArray(data)) {
          return _sortData(data)
        } else if (oldData && isArray(oldData)) {
          return [data, ...oldData]
        } else {
          return [data];
        }
      })

    },
    onError: () => {
      // dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
}


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
