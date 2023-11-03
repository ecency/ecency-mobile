import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { Image } from 'react-native-image-crop-picker';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import {
  addFragment,
  addImage,
  deleteFragment,
  deleteImage,
  getFragments,
  getImages,
  updateFragment,
  uploadImage,
} from '../ecency/ecency';
import { MediaItem, Snippet } from '../ecency/ecency.types';
import { signImage } from '../hive/dhive';
import QUERIES from './queryKeys';
import Upload, { UploadOptions } from 'react-native-background-upload'
import Config from 'react-native-config';
import { Platform } from 'react-native';
import { getAllVideoStatuses } from '../speak/speak';
import { ThreeSpeakVideo } from '../speak/speak.types';

interface SnippetMutationVars {
  id: string | null;
  title: string;
  body: string;
}

interface MediaUploadVars {
  media: Image;
  addToUploads: boolean;
}

/** GET QUERIES * */

export const useMediaQuery = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  return useQuery<MediaItem[]>([QUERIES.MEDIA.GET], getImages, {
    initialData: [],
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

export const useSnippetsQuery = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  return useQuery<Snippet[]>([QUERIES.SNIPPETS.GET], getFragments, {
    initialData: [],
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

/** ADD UPDATE MUTATIONS * */

export const useAddToUploadsMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<any[], Error, string>(addImage, {
    retry: 3,
    onSuccess: (data) => {
      queryClient.setQueryData([QUERIES.MEDIA.GET], data);
    },
    onError: (error) => {
      if (error.toString().includes('code 409')) {
        // means image ware already preset, refresh to get updated order
        queryClient.invalidateQueries([QUERIES.MEDIA.GET]);
      } else {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      }
    },
  });
};


export const useVideoUploadsQuery = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const currentAccount = useAppSelector(state => state.account.currentAccount);
  const pinHash = useAppSelector(state => state.application.pin);

  const _fetchVideoUploads = async () => await getAllVideoStatuses(currentAccount, pinHash);

  return useQuery<ThreeSpeakVideo[]>([QUERIES.MEDIA.GET_VIDEOS], _fetchVideoUploads, {
    initialData: [],
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
}

export const useMediaUploadMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const addToUploadsMutation = useAddToUploadsMutation();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

  const _uploadMedia = ({ media }: MediaUploadVars) => {

    return new Promise(async (resolve, reject) => {

      try {
        let sign = await signImage(media, currentAccount, pinCode);

        const _options: UploadOptions = {
          url: `${Config.NEW_IMAGE_API}/hs/${sign}`,
          path: Platform.select({
            ios: 'file://' + media.path,
            android: media.path.replace('file://', '')
          }),
          method: 'POST',
          type: 'multipart',
          maxRetries: 2, // set retry count (Android only). Default 2
          headers: {
            'Authorization': Config.NEW_IMAGE_API, // Config.NEW_IMAGE_API
            'Content-Type': 'multipart/form-data',
          },
          field: 'uploaded_media',
          // Below are options only supported on Android
          notification: {
            enabled: true
          },
          useUtf8Charset: true
        }

        const uploadId = await Upload.startUpload(_options)

        console.log('Upload started', uploadId)

        Upload.addListener('progress', uploadId, (data) => {
          console.log(`Progress: ${data.progress}%`, data)
        })
        Upload.addListener('error', uploadId, (data) => {
          console.log(`Error`, data)
          throw data.error;
        })
        Upload.addListener('cancelled', uploadId, (data) => {
          console.log(`Cancelled!`, data)
          throw new Error("Upload Cancelled")
        })
        Upload.addListener('completed', uploadId, (data) => {
          // data includes responseCode: number and responseBody: Object
          console.log('Completed!', data)
          const _respData = JSON.parse(data.responseBody);
          resolve(_respData)
        })
      } catch (err) {
        console.warn("Meida Upload Failed", err);
        reject(err)
      }
    })
  }


  return useMutation<Image, undefined, MediaUploadVars>(
    (vars) => {

      return _uploadMedia(vars);
    },
    {
      onSuccess: (response, { addToUploads }) => {
        if (addToUploads && response && response.url) {
          console.log('adding image to gallery', response.url);
          addToUploadsMutation.mutate(response.url);
        }
      },
      onError: () => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      },
    },
  );
};

export const useSnippetsMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<Snippet[], undefined, SnippetMutationVars>(
    async (vars) => {
      console.log('going to add/update snippet', vars);
      if (vars.id) {
        const response = await updateFragment(vars.id, vars.title, vars.body);
        return response;
      } else {
        const response = await addFragment(vars.title, vars.body);
        return response;
      }
    },
    {
      onMutate: (vars) => {
        console.log('mutate snippets for add/update', vars);

        const _newItem = {
          id: vars.id,
          title: vars.title,
          body: vars.body,
          created: new Date().toDateString(),
          modified: new Date().toDateString(),
        } as Snippet;

        const data = queryClient.getQueryData<Snippet[]>([QUERIES.SNIPPETS.GET]);

        let _newData: Snippet[] = data ? [...data] : [];
        if (vars.id) {
          const snipIndex = _newData.findIndex((item) => vars.id === item.id);
          _newData[snipIndex] = _newItem;
        } else {
          _newData = [_newItem, ..._newData];
        }

        queryClient.setQueryData([QUERIES.SNIPPETS.GET], _newData);
      },
      onSuccess: (data) => {
        console.log('added/updated snippet', data);
        queryClient.invalidateQueries([QUERIES.SNIPPETS.GET]);
      },
      onError: () => {
        dispatch(toastNotification(intl.formatMessage({ id: 'snippets.message_failed' })));
      },
    },
  );
};

/** DELETE MUTATIONS * */

export const useMediaDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation<string[], undefined, string[]>(
    async (deleteIds) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const i in deleteIds) {
        // eslint-disable-next-line no-await-in-loop
        await deleteImage(deleteIds[i]);
      }
      return deleteIds;
    },
    {
      retry: 3,
      onSuccess: (deleteIds) => {
        console.log('Success media deletion delete', deleteIds);
        const data: MediaItem[] | undefined = queryClient.getQueryData([QUERIES.MEDIA.GET]);
        if (data) {
          const _newData = data.filter((item) => !deleteIds.includes(item._id));
          queryClient.setQueryData([QUERIES.MEDIA.GET], _newData);
        }
      },
      onError: () => {
        dispatch(toastNotification(intl.formatMessage({ id: 'uploads_modal.delete_failed' })));
        queryClient.invalidateQueries([QUERIES.MEDIA.GET]);
      },
    },
  );
};

export const useSnippetDeleteMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  return useMutation<Snippet[], undefined, string>(deleteFragment, {
    retry: 3,
    onSuccess: (data) => {
      console.log('Success scheduled post delete', data);
      queryClient.setQueryData([QUERIES.SNIPPETS.GET], data);
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};
