import { useGenerateImage } from '@ecency/sdk';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount, selectPin } from '../../../redux/selectors';
import { getDigitPinCode } from '../../hive/dhive';
import { decryptKey } from '../../../utils/crypto';

export function useGenerateImageMutation() {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pin = useAppSelector(selectPin);

  const username = currentAccount?.name;
  const digitPin = pin ? getDigitPinCode(pin) : undefined;
  const accessToken =
    currentAccount?.local?.accessToken && digitPin
      ? decryptKey(currentAccount.local.accessToken, digitPin) || undefined
      : undefined;

  return useGenerateImage(username, accessToken);
}
