import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { showActionModal, toastNotification } from '../../../redux/actions/uiAction';
import { MediaItem } from '../../ecency/ecency.types';
import { getAllVideoStatuses, markAsPublished } from '../../speak/speak';
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


  const _setRefetchInterval = (data:MediaItem[]|undefined) => {
    if (data) {
      const hasPendingItem = data.find((item) =>
        item.speakData?.status === ThreeSpeakStatus.PREPARING ||
        item.speakData?.status === ThreeSpeakStatus.ENCODING);
      
      if(hasPendingItem){
        return 1000;
      }
    }

    return false;
  }


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

  const build = (body: string) => {
    let _newBody = body;
    videoPublishMetaRef.current = null;
    const _ids = extract3SpeakIds({ body });

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
      }
    });

    return _newBody;
  };

  return {
    build,
    videoPublishMetaRef,
  };
};

export const useSpeakMutations = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

  // id is options, if no id is provided program marks all notifications as read;
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

  const markAsPublishedMutation = useMutation(_mutationFn, _options);

  return {
    markAsPublishedMutation,
  };
};
