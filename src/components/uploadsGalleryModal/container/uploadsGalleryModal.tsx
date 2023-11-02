import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Alert, AlertButton } from 'react-native';
import ImagePicker, { Image } from 'react-native-image-crop-picker';
import RNHeicConverter from 'react-native-heic-converter';
import { openSettings } from 'react-native-permissions';
import bugsnapInstance from '../../../config/bugsnag';
import { getImages } from '../../../providers/ecency/ecency';
import UploadsGalleryContent from '../children/uploadsGalleryContent';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { delay, extractFilenameFromPath } from '../../../utils/editor';
import showLoginAlert from '../../../utils/showLoginAlert';
import { useMediaQuery, useMediaUploadMutation } from '../../../providers/queries';
import { showActionModal } from '../../../redux/actions/uiAction';

export interface UploadsGalleryModalRef {
  showModal: () => void;
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
}

interface UploadsGalleryModalProps {
  insertedMediaUrls: string[];
  paramFiles: any[];
  username: string;
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
      insertedMediaUrls,
      paramFiles,
      username,
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

    const mediaQuery = useMediaQuery();
    const mediaUploadMutation = useMediaUploadMutation();

    const pendingInserts = useRef<MediaInsertData[]>([]);

    const [mediaUploads, setMediaUploads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isAddingToUploads, setIsAddingToUploads] = useState(false);

    const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
    const pinCode = useAppSelector((state) => state.application.pin);
    const currentAccount = useAppSelector((state) => state.account.currentAccount);

    useImperativeHandle(ref, () => ({
      toggleModal: (value: boolean) => {
        if (!isLoggedIn) {
          showLoginAlert({ intl });
          return;
        }

        if (value === showModal) {
          return;
        }

        if (value) {
          _getMediaUploads();
        }
        setShowModal(value);
      },
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
      _getMediaUploads(); // get media uploads when there is new update
    }, [mediaQuery.data]);

    const _handleOpenImagePicker = (addToUploads?: boolean) => {
      ImagePicker.openPicker({
        includeBase64: true,
        multiple: allowMultiple || true,
        mediaType: 'photo',
        smartAlbums: ['UserLibrary', 'Favorites', 'PhotoStream', 'Panoramas', 'Bursts'],
      })
        .then((images) => {
          if (images && !Array.isArray(images)) {
            images = [images];
          }
          _handleMediaOnSelected(images, !addToUploads);
        })
        .catch((e) => {
          _handleMediaOnSelectFailure(e);
        });
    };

    const _handleOpenCamera = () => {
      ImagePicker.openCamera({
        includeBase64: true,
        mediaType: 'photo',
      })
        .then((image) => {
          _handleMediaOnSelected([image], true);
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

    const _handleMediaOnSelectFailure = (error) => {
      let title = intl.formatMessage({ id: 'alert.something_wrong' });
      let body = error.message || JSON.stringify(error);
      let action: AlertButton = {
        text: intl.formatMessage({ id: 'alert.okay' }),
        onPress: () => {console.log("cancel pressed")},
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

    const _handleMediaInsertion = (data: MediaInsertData) => {
      if (isEditing) {
        pendingInserts.current.push(data);
      } else if (handleMediaInsert) {
        handleMediaInsert([data]);
      }
    };

    // fetch images from server
    const _getMediaUploads = async () => {
      try {
        if (username) {
          console.log(`getting images for: ${username}`);
          const images = await getImages();
          console.log('images received', images);
          setMediaUploads(images || []);
        }
      } catch (err) {
        console.warn('Failed to get images');
      }
      setIsAddingToUploads(false);
    };

    // inserts media items in post body
    const _insertMedia = async (map: Map<number, boolean>) => {
      const data: MediaInsertData[] = [];
      for (const index of map.keys()) {
        console.log(index);
        const item = mediaUploads[index];
        data.push({
          url: item.url,
          text: '',
          status: MediaInsertStatus.READY,
        });
      }
      handleMediaInsert(data);
    };

    return (
      !isPreviewActive &&
      showModal && (
        <UploadsGalleryContent
          insertedMediaUrls={insertedMediaUrls}
          mediaUploads={mediaQuery.data.slice()}
          isAddingToUploads={isAddingToUploads}
          getMediaUploads={_getMediaUploads}
          insertMedia={_insertMedia}
          handleOpenCamera={_handleOpenCamera}
          handleOpenGallery={_handleOpenImagePicker}
        />
      )
    );
  },
);
