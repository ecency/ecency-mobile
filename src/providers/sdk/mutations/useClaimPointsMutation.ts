import { useClaimPoints } from '@ecency/sdk';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount, selectPin } from '../../../redux/selectors';
import { getDigitPinCode } from '../../hive/hive';
import { decryptKey } from '../../../utils/crypto';

export function useClaimPointsMutation() {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pin = useAppSelector(selectPin);

  const username = currentAccount?.name;
  const digitPin = pin ? getDigitPinCode(pin) : undefined;
  const accessToken =
    currentAccount?.local?.accessToken && digitPin
      ? decryptKey(currentAccount.local.accessToken, digitPin) || undefined
      : undefined;

  return useClaimPoints(username, accessToken);
}
