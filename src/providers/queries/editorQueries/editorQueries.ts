import { useMemo } from 'react';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  getImagesInfiniteQueryOptions,
  getFragmentsInfiniteQueryOptions,
  useAddFragment,
  useEditFragment,
  useRemoveFragment,
  useAddImage,
  useDeleteImage,
} from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { Image } from 'react-native-image-crop-picker';
// import Upload, { UploadOptions } from 'react-native-background-upload';

// import Config from 'react-native-config';
// import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { uploadImage } from '../../ecency/ecency';
import { MediaItem, Snippet } from '../../ecency/ecency.types';
import { signImage, getDigitPinCode } from '../../hive/dhive';
import { selectCurrentAccount, selectPin } from '../../../redux/selectors';
import { decryptKey } from '../../../utils/crypto';

/**
 * EDITOR QUERIES - SDK MIGRATION STATUS
 *
 * QUERIES (using SDK):
 * ✅ useMediaQuery - Uses SDK getImagesInfiniteQueryOptions
 * ✅ useSnippetsQuery - Uses SDK getFragmentsInfiniteQueryOptions
 *
 * MUTATIONS (SDK migration status):
 * ✅ useSnippetsMutation - Migrated to SDK (useAddFragment, useEditFragment)
 * ✅ useSnippetDeleteMutation - Migrated to SDK (useRemoveFragment)
 * ✅ useAddToUploadsMutation - Migrated to SDK (useAddImage)
 * ✅ useMediaDeleteMutation - Migrated to SDK (useDeleteImage)
 * ❌ useMediaUploadMutation - React Native specific (uses signImage and RN Image API)
 */

interface SnippetMutationVars {
  id: string | null;
  title: string;
  body: string;
}

interface MediaUploadVars {
  media: Image;
  addToUploads: boolean;
}

/**
 * Get username and access token from Redux state
 * Used internally by mutation hooks to access auth credentials
 */
const useAuth = () => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);
  const digitPinCode = getDigitPinCode(pinHash);

  const username = currentAccount?.name;
  const accessToken = currentAccount?.local?.accessToken
    ? decryptKey(currentAccount.local.accessToken, digitPinCode)
    : undefined;

  return { username, code: accessToken };
};

/** GET QUERIES (using SDK) */

/**
 * Hook to return user images/gallery with infinite scroll pagination
 * Uses SDK's getImagesInfiniteQueryOptions for efficient data loading
 *
 * @param limit - Number of items to load per page (default: 20)
 * @returns Flattened images array with pagination controls
 */
export const useMediaQuery = (limit = 20) => {
  const { username, code } = useAuth();

  const infiniteQuery = useInfiniteQuery({
    ...getImagesInfiniteQueryOptions(username || '', code, limit),
    enabled: !!username && !!code, // Only fetch when username and code are available
  });

  // Flatten pages into single array
  const data = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.data);
  }, [infiniteQuery.data?.pages]);

  return {
    ...infiniteQuery,
    data,
  };
};

/**
 * Hook to return user snippets/fragments with infinite scroll pagination
 * Uses SDK's getFragmentsInfiniteQueryOptions for efficient data loading
 *
 * @param limit - Number of items to load per page (default: 20)
 * @returns Flattened snippets array with pagination controls
 */
export const useSnippetsQuery = (limit = 20) => {
  const { username, code } = useAuth();

  const infiniteQuery = useInfiniteQuery({
    ...getFragmentsInfiniteQueryOptions(username || '', code, limit),
    enabled: !!username && !!code, // Only fetch when username and code are available
  });

  // Flatten pages into single array
  const data = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.data);
  }, [infiniteQuery.data?.pages]);

  return {
    ...infiniteQuery,
    data,
  };
};

/** MUTATIONS (custom Ecency features, not in SDK) */

/**
 * Mutation hook for adding an image URL to the user's Ecency gallery
 * Uses SDK's useAddImage hook
 */
export const useAddToUploadsMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { username, code } = useAuth();

  const addImageMutation = useAddImage(username, code);
  const mediaQueryKeyPrefix = getImagesInfiniteQueryOptions(username || '', code).queryKey.slice(
    0,
    -1,
  );

  const normalizeMediaData = (data: any): MediaItem[] | null => {
    if (Array.isArray(data)) {
      return data as MediaItem[];
    }
    if (data && Array.isArray(data.data)) {
      return data.data as MediaItem[];
    }
    return null;
  };

  return useMutation<any[], Error, string>({
    mutationFn: async (url) => {
      return addImageMutation.mutateAsync({ url });
    },
    retry: 3,
    onSuccess: (data) => {
      // Update infinite query cache structure
      const normalizedData = normalizeMediaData(data);
      if (!normalizedData) {
        return;
      }
      queryClient.setQueriesData({ queryKey: mediaQueryKeyPrefix, exact: false }, (old: any) => {
        if (!old?.pages) {
          return old;
        }
        // Update first page with new data
        return {
          ...old,
          pages: old.pages.map((page: any, idx: number) =>
            idx === 0 ? { ...page, data: normalizedData } : page,
          ),
        };
      });
    },
    onError: (error) => {
      if (error.toString().includes('code 409')) {
        // means image was already present, refresh to get updated order
        queryClient.invalidateQueries({ queryKey: mediaQueryKeyPrefix, exact: false });
      } else {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      }
    },
  });
};

/**
 * Mutation hook for uploading images to Ecency image hosting
 *
 * SDK MIGRATION STATUS: React Native specific
 * This handles image uploads using React Native's Image API and signature-based authentication.
 * The SDK's useUploadImage hook uses browser File API which is not available in React Native.
 */
export const useMediaUploadMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const addToUploadsMutation = useAddToUploadsMutation();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinCode = useAppSelector(selectPin);

  // NOTE: temporary removal of background uplaod support uptill upload package is fixed
  // const _uploadMedia = async ({ media }: MediaUploadVars) => {
  //   return new Promise((resolve, reject) => {
  //     signImage(media, currentAccount, pinCode)
  //       .then((sign) => {
  //         const _options: UploadOptions = {
  //           url: `${Config.NEW_IMAGE_API}/hs/${sign}`,
  //           path: Platform.select({
  //             ios: `file://${media.path}`,
  //             android: media.path.replace('file://', ''),
  //           }),
  //           method: 'POST',
  //           type: 'multipart',
  //           maxRetries: 2, // set retry count (Android only). Default 2
  //           headers: {
  //             Authorization: Config.NEW_IMAGE_API, // Config.NEW_IMAGE_API
  //             'Content-Type': 'multipart/form-data',
  //           },
  //           field: 'uploaded_media',
  //           // Below are options only supported on Android
  //           notification: {
  //             enabled: true,
  //           },
  //           useUtf8Charset: true,
  //         };

  //         console.log('Upload starting');

  //         return Upload.startUpload(_options);
  //       })
  //       .then((uploadId) => {
  //         Upload.addListener('progress', uploadId, (data) => {
  //           console.log(`Progress: ${data.progress}%`, data);
  //         });
  //         Upload.addListener('error', uploadId, (data) => {
  //           console.log(`Error`, data);
  //           throw data.error;
  //         });
  //         Upload.addListener('cancelled', uploadId, (data) => {
  //           console.log(`Cancelled!`, data);
  //           throw new Error('Upload Cancelled');
  //         });
  //         Upload.addListener('completed', uploadId, (data) => {
  //           // data includes responseCode: number and responseBody: Object
  //           console.log('Completed!', data);
  //           const _respData = JSON.parse(data.responseBody);
  //           resolve(_respData);
  //         });
  //       })
  //       .catch((err) => {
  //         console.warn('Meida Upload Failed', err);
  //         Sentry.captureException(err, (scope) => {
  //           scope.setContext('info', { message: 'Media upload failed' });
  //         });
  //         reject(err);
  //       });
  //   });
  // };

  return useMutation<Image, undefined, MediaUploadVars>({
    mutationFn: async ({ media }) => {
      console.log('uploading media', media);
      const sign = await signImage(media, currentAccount, pinCode);
      return uploadImage(media, currentAccount.name, sign);
    },

    onSuccess: (response, { addToUploads }) => {
      if (addToUploads && response && response.url) {
        console.log('adding image to gallery', response.url);
        addToUploadsMutation.mutate(response.url);
      }
    },
    onError: (err) => {
      Sentry.captureException(err, (scope) => {
        scope.setContext('info', { message: 'Media upload failed' });
      });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

/**
 * Mutation hook for adding or updating snippets/fragments
 * Uses SDK's useAddFragment and useEditFragment hooks
 */
export const useSnippetsMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { username, code } = useAuth();

  const addFragmentMutation = useAddFragment(username, code);
  const editFragmentMutation = useEditFragment(username, code);
  const snippetsQueryKeyPrefix = getFragmentsInfiniteQueryOptions(
    username || '',
    code,
  ).queryKey.slice(0, -1);

  return useMutation<Snippet[], undefined, SnippetMutationVars>({
    mutationFn: async (vars) => {
      console.log('going to add/update snippet', vars);
      if (vars.id) {
        return editFragmentMutation.mutateAsync({
          fragmentId: vars.id,
          title: vars.title,
          body: vars.body,
        });
      } else {
        return addFragmentMutation.mutateAsync({
          title: vars.title,
          body: vars.body,
        });
      }
    },

    onMutate: (vars) => {
      console.log('mutate snippets for add/update', vars);

      const _newItem = {
        id: vars.id,
        title: vars.title,
        body: vars.body,
        created: new Date().toDateString(),
        modified: new Date().toDateString(),
      } as Snippet;

      // Update infinite query cache structure
      queryClient.setQueriesData({ queryKey: snippetsQueryKeyPrefix, exact: false }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, idx: number) => {
            if (idx !== 0) return page;
            const data = vars.id
              ? page.data.map((item: Snippet) => (item.id === vars.id ? _newItem : item))
              : [_newItem, ...page.data];
            return { ...page, data };
          }),
        };
      });
    },
    onSuccess: (data) => {
      console.log('added/updated snippet', data);
      queryClient.invalidateQueries({ queryKey: snippetsQueryKeyPrefix, exact: false });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'snippets.message_failed' })));
    },
  });
};

/** DELETE MUTATIONS */

/**
 * Mutation hook for batch deleting images from user's Ecency gallery
 * Uses SDK's useDeleteImage hook for each deletion
 */
export const useMediaDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { username, code } = useAuth();

  const deleteImageMutation = useDeleteImage(username, code);
  const mediaQueryKeyPrefix = getImagesInfiniteQueryOptions(username || '', code).queryKey.slice(
    0,
    -1,
  );

  return useMutation<string[], undefined, string[]>({
    mutationFn: async (deleteIds) => {
      // Batch delete images using SDK hook
      // eslint-disable-next-line no-restricted-syntax
      for (const imageId of deleteIds) {
        // eslint-disable-next-line no-await-in-loop
        await deleteImageMutation.mutateAsync({ imageId });
      }
      return deleteIds;
    },
    retry: 3,
    onSuccess: (deleteIds) => {
      console.log('Success media deletion delete', deleteIds);
      // Update infinite query cache structure
      queryClient.setQueriesData({ queryKey: mediaQueryKeyPrefix, exact: false }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((item: MediaItem) => !deleteIds.includes(item._id)),
          })),
        };
      });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'uploads_modal.delete_failed' })));
      queryClient.invalidateQueries({ queryKey: mediaQueryKeyPrefix, exact: false });
    },
  });
};

/**
 * Mutation hook for deleting snippets/fragments
 * Uses SDK's useRemoveFragment hook
 */
export const useSnippetDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { username, code } = useAuth();

  const removeFragmentMutation = useRemoveFragment(username, code);
  const snippetsQueryKeyPrefix = getFragmentsInfiniteQueryOptions(
    username || '',
    code,
  ).queryKey.slice(0, -1);

  return useMutation<Snippet[], undefined, string>({
    mutationFn: async (fragmentId) => {
      return removeFragmentMutation.mutateAsync({ fragmentId });
    },
    retry: 3,
    onSuccess: (_, fragmentId) => {
      console.log('Success snippet delete', fragmentId);
      queryClient.setQueriesData({ queryKey: snippetsQueryKeyPrefix, exact: false }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((item: Snippet) => item.id !== fragmentId),
          })),
        };
      });
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};
