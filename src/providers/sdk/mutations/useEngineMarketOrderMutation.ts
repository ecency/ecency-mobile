import { useEngineMarketOrder } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useEngineMarketOrderMutation() {
  const { username, authContext } = useMutationAuth();
  return useEngineMarketOrder(username, authContext);
}
