import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, Alert, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { FlatList } from 'react-native-gesture-handler';
import Animated, {
  default as AnimatedView,
  Easing,
  SlideInRight,
  SlideOutRight,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { Icon, IconButton } from '../..';
import { MediaItem } from '../../../providers/ecency/ecency.types';
import { editorQueries, speakQueries } from '../../../providers/queries';
import { MediaPreviewItem } from './mediaPreviewItem';
import styles, {
  COMPACT_HEIGHT,
  EXPANDED_HEIGHT,
  MAX_HORIZONTAL_THUMBS,
} from './uploadsGalleryModalStyles';
import { ThreeSpeakStatus } from '../../../providers/speak/speak.types';
import { toastNotification } from '../../../redux/actions/uiAction';
import { useAppSelector } from '../../../hooks';
import { Modes } from '../container/uploadsGalleryModal';

type Props = {
  mode: Modes;
  insertedMediaUrls: string[];
  mediaUploads: MediaItem[];
  isAddingToUploads: boolean;
  insertMedia: (map: Map<number, boolean>) => void;
  handleOpenGallery: (addToUploads?: boolean) => void;
  handleOpenSpeakUploader: () => void;
  handleOpenCamera: () => void;
};

const UploadsGalleryContent = ({
  mode,
  insertedMediaUrls,
  mediaUploads,
  isAddingToUploads,
  insertMedia,
  handleOpenGallery,
  handleOpenCamera,
  handleOpenSpeakUploader,
}: Props) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const deleteMediaMutation = editorQueries.useMediaDeleteMutation();
  const speakMutations = speakQueries.useSpeakMutations();

  const allowSpkPublishing = useAppSelector((state) => state.editor.allowSpkPublishing);

  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isExpandedMode, setIsExpandedMode] = useState(false);

  const animatedHeight = useSharedValue(COMPACT_HEIGHT);

  const isDeleting =
    mode === Modes.MODE_IMAGE
      ? deleteMediaMutation.isLoading
      : speakMutations.deleteVideoMutation.isLoading;

  useEffect(() => {
    if (isExpandedMode) {
      Keyboard.dismiss();
    }
  }, [isExpandedMode]);

  const _deleteMedia = async () => {
    const _options = {
      onSettled: () => {
        setIsDeleteMode(false);
        setDeleteIds([]);
      },
    };

    switch (mode) {
      case Modes.MODE_VIDEO:
        const _permlinks: string[] = [];
        deleteIds.forEach((_id) => {
          const mediaItem = mediaUploads.find((item) => item._id === _id);
          if (mediaItem?.speakData) {
            _permlinks.push(mediaItem.speakData.permlink);
          }
        });
        speakMutations.deleteVideoMutation.mutate(_permlinks, _options);
        break;
      default:
        deleteMediaMutation.mutate(deleteIds, _options);
        break;
    }
  };

  const _onDeletePress = async () => {
    if (isDeleteMode && deleteIds.length > 0) {
      const _onCancelPress = () => {
        setIsDeleteMode(false);
        setDeleteIds([]);
      };

      Alert.alert(
        intl.formatMessage({ id: 'alert.delete' }),
        intl.formatMessage({ id: 'uploads_modal.confirm_delete' }),
        [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            style: 'cancel',
            onPress: _onCancelPress,
          },
          {
            text: intl.formatMessage({ id: 'alert.confirm' }),
            onPress: () => _deleteMedia(),
          },
        ],
      );
    } else {
      setIsDeleteMode(!isDeleteMode);
    }
  };

  // render list item for snippet and handle actions;
  const _renderItem = ({ item, index }: { item: MediaItem; index: number }) => {
    // avoid rendering unpublihsed videos in allow publishing state is false
    if (
      !allowSpkPublishing &&
      item.speakData &&
      item.speakData.status !== ThreeSpeakStatus.PUBLISHED
    ) {
      return null;
    }

    const _onPress = () => {
      if (isDeleteMode) {
        const deleteId = item._id;

        const idIndex = deleteIds.indexOf(deleteId);
        if (idIndex >= 0) {
          deleteIds.splice(idIndex, 1);
        } else {
          deleteIds.push(deleteId);
        }
        setDeleteIds([...deleteIds]);
      } else {
        let insertError: Error | null = null;
        if (item.speakData) {
          switch (item.speakData.status) {
            case ThreeSpeakStatus.READY:
              // check if a ready video is already inserted
              insertedMediaUrls.forEach((url) => {
                const _mediaItem = mediaUploads.find(
                  (item) => item.url === url && item.speakData?.status === ThreeSpeakStatus.READY,
                );
                if (_mediaItem) {
                  insertError = new Error('Can only have on unpublised speak speak per post');
                }
              });
              break;
            case ThreeSpeakStatus.PREPARING:
            case ThreeSpeakStatus.ENCODING:
              // interupt video insertion is it's still under processing
              insertError = new Error('Please wait while video is being processed');
              break;

            default:
              console.log('Skipping corner check for published video');
              break;
          }
        }

        if (!insertError) {
          insertMedia(new Map([[index, true]]));
        } else {
          dispatch(toastNotification(insertError.message));
        }
      }
    };

    return (
      <MediaPreviewItem
        item={item}
        insertedMediaUrls={insertedMediaUrls}
        deleteIds={deleteIds}
        isDeleteMode={isDeleteMode}
        isDeleting={isDeleting}
        isExpandedMode={isExpandedMode}
        onPress={_onPress}
      />
    );
  };

  const _renderSelectButton = (iconName: string, text: string, onPress: () => void) => {
    return (
      <TouchableOpacity
        onPress={() => {
          onPress && onPress();
        }}
      >
        <View style={styles.selectButton}>
          <View style={styles.selectBtnPlus}>
            <Icon
              color={EStyleSheet.value('$primaryBackgroundColor')}
              iconType="FontAwesome5"
              name="plus-circle"
              size={12}
            />
          </View>

          <Icon
            color={EStyleSheet.value('$primaryBlack')}
            iconType="MaterialCommunityIcons"
            name={iconName}
            size={24}
          />

          <Text style={styles.selectButtonLabel}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const _renderSelectButtons = (
    <>
      {_renderSelectButton(
        mode === Modes.MODE_VIDEO ? 'video-box' : 'image',
        'Gallery',
        handleOpenGallery,
      )}
      {_renderSelectButton('camera', 'Camera', handleOpenCamera)}
    </>
  );

  const _renderHeaderContent = () => (
    <View style={{ ...styles.buttonsContainer, paddingVertical: isExpandedMode ? 8 : 0 }}>
      <View style={styles.selectButtonsContainer}>
        {mode === Modes.MODE_IMAGE
          ? _renderSelectButtons
          : isAddingToUploads
          ? _renderSelectButton('progress-upload', 'Uploading', handleOpenSpeakUploader)
          : _renderSelectButtons}
      </View>
      <View style={styles.pillBtnContainer}>
        <IconButton
          style={styles.uploadsActionBtn}
          color={EStyleSheet.value('$primaryBlack')}
          iconType="MaterialCommunityIcons"
          name="plus"
          size={28}
          onPress={() => {
            handleOpenGallery(true);
          }}
        />

        <IconButton
          style={{
            ...styles.uploadsActionBtn,
            backgroundColor: isDeleteMode ? EStyleSheet.value('$iconColor') : 'transparent',
          }}
          color={EStyleSheet.value('$primaryBlack')}
          iconType="MaterialCommunityIcons"
          name="minus"
          size={28}
          onPress={() => {
            setIsDeleteMode(!isDeleteMode);
            setDeleteIds([]);
          }}
        />
      </View>

      {isAddingToUploads && (
        <View style={styles.pillBtnContainer}>
          <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} />
        </View>
      )}

      {isExpandedMode && _renderExpansionButton()}
      {isExpandedMode && _renderDeleteButton()}
    </View>
  );

  // render empty list placeholder
  const _renderEmptyContent = () => {
    return (
      <>
        <Text style={styles.emptyText}>
          {intl.formatMessage({ id: 'uploads_modal.label_no_images' })}
        </Text>
      </>
    );
  };

  const _renderExpansionButton = () => (
    <IconButton
      style={styles.pillBtnContainer}
      iconType="MaterialCommunityIcons"
      name={isExpandedMode ? 'arrow-collapse-vertical' : 'arrow-expand-vertical'}
      color={EStyleSheet.value('$primaryBlack')}
      size={32}
      onPress={() => {
        const _toValue = isExpandedMode ? COMPACT_HEIGHT : EXPANDED_HEIGHT;
        animatedHeight.value = withTiming(_toValue, {
          easing: Easing.inOut(Easing.cubic),
        });

        setIsExpandedMode(!isExpandedMode);
      }}
    />
  );

  const _renderDeleteButton = () => {
    if (deleteIds.length > 0) {
      return isExpandedMode ? (
        <AnimatedView.View entering={SlideInRight} exiting={SlideOutRight}>
          <IconButton
            style={{
              ...styles.pillBtnContainer,
              backgroundColor: EStyleSheet.value('$primaryRed'),
            }}
            iconType="MaterialCommunityIcons"
            name="delete-outline"
            color={EStyleSheet.value(deleteIds.length > 0 ? '$pureWhite' : '$pureWhite')}
            size={32}
            onPress={_onDeletePress}
            isLoading={isDeleting}
          />
        </AnimatedView.View>
      ) : (
        <AnimatedView.View
          entering={SlideInRight}
          exiting={SlideOutRight}
          style={styles.deleteButtonContainer}
        >
          <IconButton
            style={styles.deleteButton}
            color={EStyleSheet.value('$pureWhite')}
            iconType="MaterialCommunityIcons"
            name="delete-outline"
            disabled={isDeleting}
            size={28}
            onPress={_onDeletePress}
            isLoading={isDeleting}
          />
        </AnimatedView.View>
      );
    }
    return null;
  };

  return (
    <Animated.View style={{ ...styles.container, height: animatedHeight }}>
      <FlatList
        key={isExpandedMode ? 'vertical_grid' : 'horizontal_list'}
        data={mediaUploads.slice(0, !isExpandedMode ? MAX_HORIZONTAL_THUMBS : undefined)}
        keyExtractor={(item) => `item_${item.url}`}
        renderItem={_renderItem}
        style={{ flex: 1 }}
        contentContainerStyle={
          isExpandedMode ? styles.gridContentContainer : styles.listContentContainer
        }
        ListHeaderComponent={_renderHeaderContent}
        ListEmptyComponent={_renderEmptyContent}
        ListFooterComponent={!isExpandedMode && mediaUploads.length > 0 && _renderExpansionButton}
        extraData={deleteIds}
        horizontal={!isExpandedMode}
        numColumns={isExpandedMode ? 2 : 1}
        keyboardShouldPersistTaps="always"
      />

      {!isExpandedMode && _renderDeleteButton()}
    </Animated.View>
  );
};

export default UploadsGalleryContent;
