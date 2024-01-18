import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import QUERIES from './queryKeys';
import { getNodes } from '../ecency/ecency';
import { SERVER_LIST } from '../../constants/options/api';
import { useAppDispatch } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';

/** GET QUERIES * */

export const useGetServersQuery = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  return useQuery<string[]>([QUERIES.SETTINGS.GET_SERVERS], getNodes, {
    initialData: SERVER_LIST,
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};
