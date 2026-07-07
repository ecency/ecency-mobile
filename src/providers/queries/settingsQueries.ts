import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { getSupportSettingsQueryOptions, useUpdateSupportSettings } from '@ecency/sdk';
import QUERIES from './queryKeys';
import { getNodes } from '../ecency/ecency';
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
 * (post beneficiary percent and curation holdback percent).
 * Consumes the SDK query options so the cache entry is shared with every
 * other surface (settings screen, editor submit-time injection).
 */
export const useSupportSettingsQuery = () => {
  const { username, code } = useAuth();

  return useQuery(getSupportSettingsQueryOptions(username, code));
};

/**
 * Hook to update user's voluntary Support Ecency settings.
 * The SDK hook seeds and invalidates the shared settings cache on success;
 * this wrapper only adds the mobile failure toast.
 */
export const useSupportSettingsMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { username, code } = useAuth();

  const mutation = useUpdateSupportSettings(username, code);

  const mutate: typeof mutation.mutate = (variables, options) =>
    mutation.mutate(variables, {
      onError: () => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      },
      ...options,
    });

  return { ...mutation, mutate };
};
