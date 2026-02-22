import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';
import { useAuthContext } from '../useAuthContext';

/** Shared auth plumbing consumed by every mutation wrapper. */
export function useMutationAuth() {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const authContext = useAuthContext();
  const username: string | undefined = currentAccount?.name;
  return { username, authContext };
}
