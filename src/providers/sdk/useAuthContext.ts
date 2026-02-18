import { useMemo } from 'react';
import { getQueryClient } from '@ecency/sdk';
import type { AuthContextV2 } from '@ecency/sdk';

import { useAppSelector } from '../../hooks';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { useUserActivityMutation } from '../queries';
import { createMobilePlatformAdapter } from './mobilePlatformAdapter';

export function useAuthContext(): AuthContextV2 {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pin = useAppSelector(selectPin);
  const userActivityMutation = useUserActivityMutation();

  const queryClient = getQueryClient();

  const adapter = useMemo(
    () =>
      createMobilePlatformAdapter({
        queryClient,
        userActivityMutate: (params) => userActivityMutation.mutate(params),
      }),
    [currentAccount?.name, pin],
  );

  return useMemo(
    () => ({
      adapter,
      enableFallback: true,
    }),
    [adapter],
  );
}
