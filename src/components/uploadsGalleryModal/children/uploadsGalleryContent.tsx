import { proxifyImageSrc } from '@ecency/render-helper';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  default as AnimatedView,
  SlideInRight,
  SlideOutRight,
  ZoomIn,
  EasingNode,
} from 'react-native-reanimated';
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from 'react-native-fast-image';
import { FlatList } from 'react-native-gesture-handler';
import { Icon, IconButton } from '../..';
import { UploadedMedia } from '../../../models';
import styles, {
  COMPACT_HEIGHT,
  EXPANDED_HEIGHT,
  MAX_HORIZONTAL_THUMBS,
} from './uploadsGalleryModalStyles';
import { useMediaDeleteMutation } from '../../../providers/queries';

type Props = {
  insertedMediaUrls: string[];
  mediaUploads: any[];
  isAddingToUploads: boolean;
  insertMedia: (map: Map<number, boolean>) => void;
  handleOpenGallery: (addToUploads?: boolean) => void;
  handleOpenCamera: () => void;
};

const UploadsGalleryContent = ({
  insertedMediaUrls,
  mediaUploads,
  isAddingToUploads,
  insertMedia,
  handleOpenGallery,
  handleOpenCamera,
}: Props) => {
  const intl = useIntl();

  const deleteMediaMutation = useMediaDeleteMutation();

  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isExpandedMode, setIsExpandedMode] = useState(false);

  const animatedHeightRef = useRef(new Animated.Value(COMPACT_HEIGHT));

  const isDeleting = deleteMediaMutation.isLoading;

  useEffect(() => {
    if (isExpandedMode) {
      Keyboard.dismiss();
    }
  }, [isExpandedMode]);

  const _deleteMedia = async () => {
    deleteMediaMutation.mutate(deleteIds, {
      onSettled: () => {
        setIsDeleteMode(false);
        setDeleteIds([]);
      },
    });
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
  const _renderItem = ({ item, index }: { item: UploadedMedia; index: number }) => {
    const _onPress = () => {
      if (isDeleteMode) {
        const idIndex = deleteIds.indexOf(item._id);
        if (idIndex >= 0) {
          deleteIds.splice(idIndex, 1);
        } else {
          deleteIds.push(item._id);
        }
        setDeleteIds([...deleteIds]);
      } else {
        insertMedia(new Map([[index, true]]));
      }
    };

    const thumbUrl = proxifyImageSrc(item.url, 600, 500, Platform.OS === 'ios' ? 'match' : 'webp');
    let isInsertedTimes = 0;
    insertedMediaUrls.forEach((url) => (isInsertedTimes += url === item.url ? 1 : 0));
    const isToBeDeleted = deleteIds.indexOf(item._id) >= 0;
    const transformStyle = {
      transform: isToBeDeleted ? [{ scaleX: 0.7 }, { scaleY: 0.7 }] : [],
    };

    const _renderMinus = () =>
      isDeleteMode && (
        <AnimatedView.View entering={ZoomIn} style={styles.minusContainer}>
          <Icon
            color={EStyleSheet.value('$pureWhite')}
            iconType="MaterialCommunityIcons"
            name="minus"
            size={20}
          />
        </AnimatedView.View>
      );

    const _renderCounter = () =>
      isInsertedTimes > 0 &&
      !isDeleteMode && (
        <AnimatedView.View entering={ZoomIn} style={styles.counterContainer}>
          <Text style={styles.counterText}>{isInsertedTimes}</Text>
        </AnimatedView.View>
      );

    return (
      <TouchableOpacity onPress={_onPress} disabled={isDeleting}>
        <View style={transformStyle}>
          <FastImage
            source={{ uri: thumbUrl }}
            style={isExpandedMode ? styles.gridMediaItem : styles.mediaItem}
          />
          {_renderCounter()}
          {_renderMinus()}
        </View>
      </TouchableOpacity>
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

  const _renderHeaderContent = () => (
    <View style={{ ...styles.buttonsContainer, paddingVertical: isExpandedMode ? 8 : 0 }}>
      <View style={styles.selectButtonsContainer}>
        {_renderSelectButton('image', 'Gallery', handleOpenGallery)}
        {_renderSelectButton('camera', 'Camera', handleOpenCamera)}
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
        Animated.timing(animatedHeightRef.current, {
          toValue: isExpandedMode ? COMPACT_HEIGHT : EXPANDED_HEIGHT,
          duration: 300,
          easing: EasingNode.inOut(EasingNode.cubic),
        }).start(() => {
          setIsExpandedMode(!isExpandedMode);
        });
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
    <Animated.View style={{ ...styles.container, height: animatedHeightRef.current }}>
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
