import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteDraft, getDrafts, getSchedules } from '../ecency/ecency';
import QUERIES from './queryKeys';

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
    return useMutation(deleteDraft, {
        retry:3, 
        onSuccess:(data)=>{
            console.log("Success draft delete", data);
            queryClient.setQueryData([QUERIES.DRAFTS.GET], _sortData(data));
        }
    })
}

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
