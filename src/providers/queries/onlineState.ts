import type { NetInfoState } from '@react-native-community/netinfo';

/**
 * Whether NetInfo's view of the network should be reported to React Query as
 * online.
 *
 * Both fields are three-valued, and both are read the same way: only an explicit
 * `false` means offline. `isConnected` is null while the platform has not
 * determined a state yet, which happens on the very first event after launch, and
 * `isInternetReachable` is null while its probe is still running and can stay
 * wrong for a long time on a network that answers the probe but little else.
 *
 * Coercing either unknown to offline is the more damaging mistake. React Query
 * holds a mutation while the manager says offline and releases it on the next
 * connectivity event, so an unknown state read as offline can park a broadcast or
 * a claim until something else happens to change the network. Attempting the
 * request and letting it fail visibly is recoverable; sitting paused with nothing
 * on screen is not.
 */
export const isOnlineState = (state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>) =>
  state.isConnected !== false && state.isInternetReachable !== false;
