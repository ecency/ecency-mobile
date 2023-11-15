
import React from 'react';
import { proxifyImageSrc } from '@ecency/render-helper';
import {
    Platform,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from 'react-native-fast-image';
import {
    default as AnimatedView,
    ZoomIn
} from 'react-native-reanimated';
import { Icon } from '../..';
import styles from './uploadsGalleryModalStyles';
import { MediaItem } from '../../../providers/ecency/ecency.types';
import { useIntl } from 'react-intl';

interface Props {
    item: MediaItem;
    insertedMediaUrls: string[],
    isDeleteMode: boolean;
    isDeleting: boolean;
    deleteIds: string[];
    isExpandedMode: boolean;
    onPress: () => void;
}

export const MediaPreviewItem = ({ item, insertedMediaUrls, isDeleteMode, isDeleting, deleteIds, isExpandedMode, onPress }: Props) => {

    const intl = useIntl();

    const thumbUrl =
        item.thumbUrl ||
        proxifyImageSrc(item.url, 600, 500, Platform.OS === 'ios' ? 'match' : 'webp');
    let isInsertedTimes = 0;
    insertedMediaUrls?.forEach((url) => (isInsertedTimes += url === item.url ? 1 : 0));
    const isToBeDeleted = deleteIds.indexOf(item._id) >= 0;
    const transformStyle = {
        transform: isToBeDeleted ? [{ scaleX: 0.7 }, { scaleY: 0.7 }] : [],
    };

    const _renderStatus = () => (item.speakData &&
        <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{intl.formatMessage({id:`uploads_modal.${item.speakData?.status}`})}</Text>
        </View>
    )

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
        <TouchableOpacity onPress={onPress} disabled={isDeleting}>
            <View style={transformStyle}>
                <FastImage
                    source={{ uri: thumbUrl }}
                    style={isExpandedMode ? styles.gridMediaItem : styles.mediaItem}
                />
                {_renderCounter()}
                {_renderMinus()}
                {_renderStatus()}
            </View>
        </TouchableOpacity>
    );
}