import { useQuery } from '@tanstack/react-query';
import { getBadActorsQueryOptions } from '@ecency/sdk';

export function useBadActors() {
  return useQuery(getBadActorsQueryOptions());
}
