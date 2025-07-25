import { useQuery } from '@tanstack/react-query';
import QUERIES from './queryKeys';
import { getNodes } from '../ecency/ecency';
import { SERVER_LIST } from '../../constants/options/api';

/** GET QUERIES * */

export const useGetServersQuery = () => {
  return useQuery<string[]>({
    queryKey: [QUERIES.SETTINGS.GET_SERVERS],
    queryFn: getNodes,
    initialData: SERVER_LIST,
  });
};
