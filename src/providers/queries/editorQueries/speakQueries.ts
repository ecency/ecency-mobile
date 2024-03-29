import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { showActionModal, toastNotification } from '../../../redux/actions/uiAction';
import { MediaItem } from '../../ecency/ecency.types';
import {
  deleteVideo,
  getAllVideoStatuses,
  markAsPublished,
  updateSpeakVideoInfo,
} from '../../speak/speak';
import QUERIES from '../queryKeys';
import { extract3SpeakIds } from '../../../utils/editor';
import { ThreeSpeakStatus, ThreeSpeakVideo } from '../../speak/speak.types';
import bugsnapInstance from '../../../config/bugsnag';

/**
 * fetches and caches speak video uploads
 * @returns query instance with data as array of videos as MediaItem[]
 */
export const useVideoUploadsQuery = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  const _fetchVideoUploads = async () => getAllVideoStatuses(currentAccount, pinHash);

  const _setRefetchInterval = (data: MediaItem[] | undefined) => {
    if (data) {
      const hasPendingItem = data.find(
        (item) =>
          item.speakData?.status === ThreeSpeakStatus.PREPARING ||
          item.speakData?.status === ThreeSpeakStatus.ENCODING,
      );

      if (hasPendingItem) {
        return 1000;
      }
    }

    return false;
  };

  return useQuery<MediaItem[]>([QUERIES.MEDIA.GET_VIDEOS], _fetchVideoUploads, {
    initialData: [],
    refetchInterval: _setRefetchInterval,
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};

export const useSpeakContentBuilder = () => {
  const dispatch = useDispatch();
  const videoUploads = useVideoUploadsQuery();
  const videoPublishMetaRef = useRef<ThreeSpeakVideo | null>(null);
  const thumbUrlsRef = useRef<string[]>([]);

  const build = (body: string) => {
    let _newBody = body;
    videoPublishMetaRef.current = null;
    thumbUrlsRef.current = [];
    const _ids = extract3SpeakIds({ body });
    const thumbUrls: string[] = [];

    _ids.forEach((id) => {
      const mediaItem: MediaItem | undefined = videoUploads.data.find((item) => item._id === id);
      if (mediaItem) {
        // check if video is unpublished, set unpublish video meta
        if (mediaItem.speakData?.status !== ThreeSpeakStatus.PUBLISHED) {
          if (!videoPublishMetaRef.current) {
            videoPublishMetaRef.current = mediaItem.speakData;
          } else {
            dispatch(
              showActionModal({
                title: 'Fail',
                body: 'Can have only one unpublished video per post',
              }),
            );
            throw new Error('Fail');
          }
        }

        // replace 3speak with actual data
        const _toReplaceStr = `[3speak](${id})`;
        const _replacement = `<center>[![](${mediaItem.thumbUrl})](${mediaItem.url})</center>`;
        _newBody = _newBody.replace(_toReplaceStr, _replacement);

        thumbUrls.push(mediaItem.thumbUrl);
      }
    });

    thumbUrlsRef.current = thumbUrls;

    return _newBody;
  };

  return {
    build,
    videoPublishMetaRef,
    thumbUrlsRef,
  };
};

export const useSpeakMutations = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

  // mark as published mutations id is options, if no id is provided program marks all notifications as read;
  const _mutationFn = async (id: string) => {
    try {
      const response = await markAsPublished(currentAccount, pinCode, id);
      console.log('Speak video marked as published', response);

      return true;
    } catch (err) {
      bugsnapInstance.notify(err);
    }
  };

  const _options: UseMutationOptions<number, unknown, string | undefined, void> = {
    retry: 3,
    delay: 5000,
    onMutate: async (videoId) => {
      // TODO: find a way to optimise mutations by avoiding too many loops
      console.log('on mutate data', videoId);

      // update query data
      const videosCache: MediaItem[] | undefined = queryClient.getQueryData([
        QUERIES.MEDIA.GET_VIDEOS,
      ]);
      console.log('query data', videosCache);

      if (!videosCache) {
        return;
      }

      const _vidIndex = videosCache.findIndex((item) => item._id === videoId);

      if (_vidIndex) {
        const spkData = videosCache[_vidIndex].speakData;
        if (spkData) {
          spkData.status = ThreeSpeakStatus.PUBLISHED;
        }
      }

      queryClient.setQueryData([QUERIES.MEDIA.GET_VIDEOS], videosCache);
    },

    onSuccess: async (status, _id) => {
      console.log('on success data', status);
      queryClient.invalidateQueries([QUERIES.MEDIA.GET_VIDEOS]);
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  };

  // update info mutation
  const _updateInfoMutationFn = async ({ id, title, body, tags }) => {
    try {
      // TODO: update information
      const response = await updateSpeakVideoInfo(currentAccount, pinCode, body, id, title, tags);
      console.log('Speak video marked as published', response);

      return true;
    } catch (err) {
      bugsnapInstance.notify(err);
    }
  };

  const _updateInfoOptions = {
    retry: 3,
    onSuccess: async (status, _data) => {
      console.log('on success data', status);
      queryClient.invalidateQueries([QUERIES.MEDIA.GET_VIDEOS]);
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  };

  // delete mutation
  const _deleteMutationFn = async (permlinks: string[]) => {
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const i in permlinks) {
        // eslint-disable-next-line no-await-in-loop
        await deleteVideo(currentAccount, pinCode, permlinks[i]);
      }
      console.log('deleted speak videos', permlinks);
      return true;
    } catch (err) {
      bugsnapInstance.notify(err);
    }
  };

  const _deleteVideoOptions = {
    retry: 3,
    onSuccess: async (status, permlinks) => {
      console.log('Success media deletion', status, permlinks);
      const data: MediaItem[] | undefined = queryClient.getQueryData([QUERIES.MEDIA.GET_VIDEOS]);
      if (data) {
        const _newData = data.filter((item) => !permlinks.includes(item.speakData?.permlink));
        queryClient.setQueryData([QUERIES.MEDIA.GET_VIDEOS], _newData);
      }

      queryClient.invalidateQueries([QUERIES.MEDIA.GET_VIDEOS]);
    },
    onError: (err) => {
      console.warn('delete failing', err);
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  };

  // init mutations
  const markAsPublishedMutation = useMutation(_mutationFn, _options);
  const updateInfoMutation = useMutation(_updateInfoMutationFn, _updateInfoOptions);
  const deleteVideoMutation = useMutation(_deleteMutationFn, _deleteVideoOptions);

  return {
    markAsPublishedMutation,
    updateInfoMutation,
    deleteVideoMutation,
  };
};
