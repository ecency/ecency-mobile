import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Video, Image } from 'react-native-image-crop-picker';
import * as Sentry from '@sentry/react-native';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { selectCurrentAccount, selectPin } from '../../../redux/selectors';
import { uploadVideoEmbed, setVideoThumbnail } from '../../speak/speak';
import { VideoUploadResult } from '../../speak/speak.types';
import { getDigitPinCode } from '../../hive/dhive';
import { decryptKey } from '../../../utils/crypto';

/**
 * Returns the decrypted HiveSigner access token for the current account.
 * Used to authenticate with the Ecency 3Speak proxy.
 */
function useAccessToken() {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  return (): string => {
    const digitPinCode = getDigitPinCode(pinHash);
    const token = currentAccount?.local?.accessToken;
    if (!token) {
      throw new Error('No access token stored for current account');
    }
    const decrypted = decryptKey(token, digitPinCode as string);
    if (!decrypted) {
      throw new Error('Failed to decrypt access token');
    }
    return decrypted;
  };
}

/**
 * Hook for uploading videos via the new 3Speak embed architecture.
 *
 * Returns a mutation that:
 * 1. Requests a short-lived upload token from the Ecency proxy
 * 2. Uploads the video via TUS resumable protocol
 * 3. Returns { embedUrl, permlink } on success
 *
 * Also exposes `completed` (0-100) for progress UI.
 */
export const useThreeSpeakEmbedUpload = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const getToken = useAccessToken();
  const [completed, setCompleted] = useState(0);

  const mutation = useMutation({
    mutationKey: ['threeSpeakEmbedUpload'],
    mutationFn: async ({
      media,
      isShort = false,
    }: {
      media: Video | Image;
      isShort?: boolean;
    }): Promise<VideoUploadResult> => {
      if (!currentAccount?.name) {
        throw new Error('No active account');
      }

      const accessToken = getToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      try {
        const result = await uploadVideoEmbed(
          media,
          currentAccount.name,
          accessToken,
          isShort,
          (percentage) => setCompleted(percentage),
        );
        return result;
      } catch (e: any) {
        Sentry.captureException(e);

        const status = e?.originalResponse?.getStatus?.() ?? e?.status;

        if (status === 413) {
          dispatch(toastNotification(intl.formatMessage({ id: 'video-upload.error-too-large' })));
        } else if (status === 429) {
          dispatch(toastNotification(intl.formatMessage({ id: 'video-upload.error-too-many' })));
        } else if (status === 503) {
          dispatch(toastNotification(intl.formatMessage({ id: 'video-upload.error-unavailable' })));
        } else if (status === 401 || status === 403) {
          dispatch(toastNotification(intl.formatMessage({ id: 'video-upload.error-auth' })));
        } else {
          dispatch(toastNotification(intl.formatMessage({ id: 'video-upload.error-generic' })));
        }

        throw e;
      } finally {
        setCompleted(0);
      }
    },
  });

  return { ...mutation, completed, setCompleted };
};

/**
 * Hook for setting a custom thumbnail on an uploaded 3Speak video.
 */
export const useSetVideoThumbnail = () => {
  const getToken = useAccessToken();

  return useMutation({
    mutationKey: ['threeSpeakSetThumbnail'],
    mutationFn: async ({ permlink, thumbnailUrl }: { permlink: string; thumbnailUrl: string }) => {
      const accessToken = getToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }
      await setVideoThumbnail(permlink, thumbnailUrl, accessToken);
    },
  });
};
