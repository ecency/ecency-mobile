import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Alert, AlertButton } from 'react-native';
import ImagePicker, { Image, Options, Video } from 'react-native-image-crop-picker';
import RNHeicConverter from 'react-native-heic-converter';
import { openSettings } from 'react-native-permissions';
import bugsnapInstance from '../../../config/bugsnag';
import UploadsGalleryContent from '../children/uploadsGalleryContent';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  delay,
  extract3SpeakIds,
  extractFilenameFromPath,
  extractImageUrls,
} from '../../../utils/editor';
import showLoginAlert from '../../../utils/showLoginAlert';
import { editorQueries, speakQueries } from '../../../providers/queries';
import { showActionModal } from '../../../redux/actions/uiAction';
import { MediaItem } from '../../../providers/ecency/ecency.types';
import { SpeakUploaderModal } from '../children/speakUploaderModal';

export interface UploadsGalleryModalRef {
  showModal: () => void;
}

export enum Modes {
  MODE_IMAGE = 0,
  MODE_VIDEO = 1,
}

export enum MediaInsertStatus {
  UPLOADING = 'UPLOADING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export interface MediaInsertData {
  url: string;
  filename?: string;
  text: string;
  status: MediaInsertStatus;
  mode: Modes;
}

interface UploadsGalleryModalProps {
  draftId?: string;
  postBody: string;
  paramFiles: any[];
  isEditing: boolean;
  isPreviewActive: boolean;
  allowMultiple?: boolean;
  hideToolbarExtension: () => void;
  handleMediaInsert: (data: Array<MediaInsertData>) => void;
  setIsUploading: (status: boolean) => void;
}

export const UploadsGalleryModal = forwardRef(
  (
    {
      draftId,
      postBody,
      paramFiles,
      isEditing,
      isPreviewActive,
      allowMultiple,
      hideToolbarExtension,
      handleMediaInsert,
      setIsUploading,
    }: UploadsGalleryModalProps,
    ref,
  ) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const imageUploadsQuery = editorQueries.useMediaQuery();
    const videoUploadsQuery = speakQueries.useVideoUploadsQuery();

    const mediaUploadMutation = editorQueries.useMediaUploadMutation();

    const pendingInserts = useRef<MediaInsertData[]>([]);
    const speakUploaderRef = useRef<SpeakUploaderModal>();

    const [showModal, setShowModal] = useState(false);
    const [isAddingToUploads, setIsAddingToUploads] = useState(false);
    const [mode, setMode] = useState<Modes>(Modes.MODE_IMAGE);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [isScrolledTop, setIsScrolledTop] = useState(true);

    const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

    const mediaUploadsQuery = mode === Modes.MODE_VIDEO ? videoUploadsQuery : imageUploadsQuery;

    useImperativeHandle(ref, () => ({
      toggleModal: (value: boolean, _mode: Modes = mode) => {
        if (!isLoggedIn) {
          showLoginAlert({ intl });
          return;
        }

        if (value === showModal && _mode === mode) {
          return;
        }

        if (value) {
          _getMediaUploads(_mode);
        }

        setMode(_mode);
        setShowModal(value);
      },
      getMode: () => mode,
      isVisible: () => showModal,
      isScrolledTop: () => {
        return isScrolledTop;
      }
    }));

    useEffect(() => {
      if (paramFiles) {
        console.log('files : ', paramFiles);

        // delay is a workaround to let editor ready before initiating uploads on mount
        delay(500).then(() => {
          const _mediaItems = paramFiles.map((el) => {
            if (el.filePath && el.fileName) {
              const _media = {
                path: el.filePath,
                mime: el.mimeType,
                filename: el.fileName,
              };

              return _media;
            }
            return null;
          });

          _handleMediaOnSelected(_mediaItems, true);
        });
      }
    }, [paramFiles]);

    useEffect(() => {
      if (!isEditing && pendingInserts.current.length) {
        handleMediaInsert(pendingInserts.current);
        pendingInserts.current = [];
      }
    }, [isEditing]);

    useEffect(() => {
      _getMediaUploads(mode); // get media uploads when there is new update
    }, [mediaUploadsQuery.data, mode]);

    useEffect(() => {
      if (showModal) {
        let _urls: string[] = [];
        if (mode === Modes.MODE_VIDEO) {
          const _vidIds = extract3SpeakIds({ body: postBody });
          _urls = _vidIds.map((id) => {
            const mediaItem = mediaUploadsQuery.data.find((item) => item._id === id);
            return mediaItem?.url;
          });
        } else {
          _urls = extractImageUrls({ body: postBody });
        }
        setMediaUrls(_urls);
      }
    }, [postBody, showModal, mode]);

    const _handleOpenImagePicker = (addToUploads?: boolean) => {
      const _vidMode = mode === Modes.MODE_VIDEO;

      if (_vidMode && isAddingToUploads) {
        speakUploaderRef.current.showUploader();
        return;
      }

      const _options: Options = _vidMode
        ? {
            mediaType: 'video',
            smartAlbums: ['UserLibrary', 'Favorites', 'Videos'],
          }
        : {
            includeBase64: true,
            multiple: allowMultiple || true,
            mediaType: 'photo',
            smartAlbums: ['UserLibrary', 'Favorites', 'PhotoStream', 'Panoramas', 'Bursts'],
          };

      ImagePicker.openPicker(_options)
        .then((items) => {
          if (items && !Array.isArray(items)) {
            items = [items];
          }
          if (_vidMode) {
            _handleVideoSelection(items[0]);
          } else {
            _handleMediaOnSelected(items, !addToUploads);
          }
        })
        .catch((e) => {
          _handleMediaOnSelectFailure(e);
        });
    };

    const _handleOpenCamera = () => {
      const _vidMode = mode === Modes.MODE_VIDEO;

      if (_vidMode && isAddingToUploads) {
        speakUploaderRef.current.showUploader();
        return;
      }

      const _options: Options = _vidMode
        ? {
            mediaType: 'video',
          }
        : {
            includeBase64: true,
            mediaType: 'photo',
          };

      ImagePicker.openCamera(_options)
        .then((media) => {
          if (_vidMode) {
            _handleVideoSelection(media);
          } else {
            _handleMediaOnSelected([media], true);
          }
        })
        .catch((e) => {
          _handleMediaOnSelectFailure(e);
        });
    };

    const _handleMediaOnSelected = async (media: Image[], shouldInsert: boolean) => {
      try {
        if (!media || media.length == 0) {
          throw new Error('New media items returned');
        }

        // post process heic to jpg media items
        for (let i = 0; i < media.length; i++) {
          const element = media[i];
          if (element.mime === 'image/heic') {
            // eslint-disable-next-line no-await-in-loop
            const res = await RNHeicConverter.convert({ path: element.sourceURL }); // default with quality = 1 & jpg extension
            if (res && res.path) {
              element.mime = 'image/jpeg';
              element.path = res.path;
              element.filename = element.filename ? element.filename.replace('.HEIC', '.JPG') : '';
              media[i] = element;
            }
          }
        }

        if (shouldInsert) {
          setShowModal(false);
          hideToolbarExtension();
          media.forEach((element, index) => {
            if (element) {
              media[index].filename =
                element.filename ||
                extractFilenameFromPath({ path: element.path, mimeType: element.mime });
              handleMediaInsert([
                {
                  filename: element.filename,
                  url: '',
                  text: '',
                  status: MediaInsertStatus.UPLOADING,
                },
              ]);
            }
          });
        }

        for (let index = 0; index < media.length; index++) {
          const element = media[index];
          if (element) {
            // eslint-disable-next-line no-await-in-loop
            await _uploadImage(element, { shouldInsert });
          }
        }
      } catch (error) {
        console.log('Failed to upload image', error);

        bugsnapInstance.notify(error);
      }
    };

    const _uploadImage = async (media, { shouldInsert } = { shouldInsert: false }) => {
      if (!isLoggedIn) return;
      try {
        if (setIsUploading) {
          setIsUploading(true);
        }
        if (!shouldInsert) {
          setIsAddingToUploads(true);
        }

        await mediaUploadMutation.mutateAsync(
          {
            media,
            addToUploads: !shouldInsert,
          },
          {
            onSuccess: (data) => {
              console.log('upload successfully', data, media, shouldInsert);
              if (data && data.url && shouldInsert) {
                _handleMediaInsertion({
                  filename: media.filename,
                  url: data.url,
                  text: '',
                  status: MediaInsertStatus.READY,
                });
              }
            },
            onSettled: () => {
              if (setIsUploading) {
                setIsUploading(false);
              }
              setIsAddingToUploads(false);
            },
            onError: (err) => {
              throw err;
            },
          },
        );
      } catch (error) {
        console.log('error while uploading image : ', error);

        if (error.toString().includes('code 413')) {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            intl.formatMessage({
              id: 'alert.payloadTooLarge',
            }),
          );
        } else if (error.toString().includes('code 429')) {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            intl.formatMessage({
              id: 'alert.quotaExceeded',
            }),
          );
        } else if (error.toString().includes('code 400')) {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            intl.formatMessage({
              id: 'alert.invalidImage',
            }),
          );
        } else {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            error.message || error.toString(),
          );
        }

        if (shouldInsert) {
          _handleMediaInsertion({
            filename: media.filename,
            url: '',
            text: '',
            status: MediaInsertStatus.FAILED,
          });
        }
      }
    };

    const _handleVideoSelection = (video: Video) => {
      // show video upload modal,
      // allow thumbnail selection and uplaods
      speakUploaderRef.current.showUploader(video);
    };

    const _handleMediaOnSelectFailure = (error) => {
      let title = intl.formatMessage({ id: 'alert.something_wrong' });
      let body = error.message || JSON.stringify(error);
      let action: AlertButton = {
        text: intl.formatMessage({ id: 'alert.okay' }),
        onPress: () => {
          console.log('cancel pressed');
        },
      };

      switch (error.code) {
        case 'E_PERMISSION_MISSING':
        case 'E_NO_LIBRARY_PERMISSION':
          title = intl.formatMessage({
            id: 'alert.permission_denied',
          });
          body = intl.formatMessage({
            id: 'alert.permission_text',
          });
          action = {
            text: intl.formatMessage({ id: 'alert.open_settings' }),
            onPress: () => {
              openSettings();
            },
          };
          break;
      }

      dispatch(
        showActionModal({
          title,
          body,
          buttons: [action],
        }),
      );
    };

    const _handleOpenSpeakUploader = () => {
      speakUploaderRef.current.showUploader();
    };

    const _setIsSpeakUploading = (flag: boolean) => {
      setIsUploading(flag);
      setIsAddingToUploads(flag);
    };

    const _handleMediaInsertion = (data: MediaInsertData) => {
      if (isEditing) {
        pendingInserts.current.push(data);
      } else if (handleMediaInsert) {
        handleMediaInsert([data]);
      }
    };

    // fetch images from server
    const _getMediaUploads = async (_mode: Modes = mode) => {
      try {
        mediaUploadsQuery.refetch();
      } catch (err) {
        console.warn('Failed to get images');
      }
      setIsAddingToUploads(false);
    };

    // inserts media items in post body
    const _insertMedia = async (map: Map<number, boolean>) => {
      const data: MediaInsertData[] = [];

      map.forEach((value, index) => {
        console.log(index);
        const item: MediaItem = mediaUploadsQuery.data[index];
        data.push({
          url: mode === Modes.MODE_VIDEO ? item.speakData?._id || '' : item.url,
          text: mode === Modes.MODE_VIDEO ? `3speak` : '',
          status: MediaInsertStatus.READY,
          mode,
        });
      });

      handleMediaInsert(data);
    };

    const data = mediaUploadsQuery.data.slice();

    if (isPreviewActive) {
      return null;
    }

    return (
      <>
        {showModal && (
          <UploadsGalleryContent
            mode={mode}
            draftId={draftId}
            insertedMediaUrls={mediaUrls}
            mediaUploads={data}
            isAddingToUploads={isAddingToUploads}
            getMediaUploads={_getMediaUploads}
            insertMedia={_insertMedia}
            handleOpenCamera={_handleOpenCamera}
            handleOpenGallery={_handleOpenImagePicker}
            handleOpenSpeakUploader={_handleOpenSpeakUploader}
            handleIsScrolledTop={setIsScrolledTop}
          />
        )}
        <SpeakUploaderModal
          ref={speakUploaderRef}
          isUploading={isAddingToUploads}
          setIsUploading={_setIsSpeakUploading}
        />
      </>
    );
  },
);
