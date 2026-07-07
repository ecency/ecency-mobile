import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import QUERIES from './queryKeys';
import { getNodes, getSupportSettings, setSupportSettings } from '../ecency/ecency';
import { SupportSettings } from '../ecency/ecency.types';
import { SERVER_LIST } from '../../constants/options/api';
import { useAppDispatch, useAuth } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';

/** GET QUERIES * */

export const useGetServersQuery = () => {
  return useQuery<string[]>({
    queryKey: [QUERIES.SETTINGS.GET_SERVERS],
    queryFn: getNodes,
    placeholderData: [...SERVER_LIST],
    staleTime: 0,
  });
};

/**
 * Hook to fetch user's voluntary Support Ecency settings
 * (post beneficiary percent and curation holdback percent)
 */
export const useSupportSettingsQuery = () => {
  const { username } = useAuth();

  return useQuery<SupportSettings>({
    queryKey: [QUERIES.SETTINGS.GET_SUPPORT_SETTINGS, username],
    queryFn: getSupportSettings,
    enabled: !!username,
  });
};

/**
 * Hook to update user's voluntary Support Ecency settings
 */
export const useSupportSettingsMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { username } = useAuth();

  return useMutation({
    mutationFn: (data: { beneficiary_percent: number; curation_percent: number }) =>
      setSupportSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERIES.SETTINGS.GET_SUPPORT_SETTINGS, username], data);
      queryClient.invalidateQueries({
        queryKey: [QUERIES.SETTINGS.GET_SUPPORT_SETTINGS, username],
      });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};
