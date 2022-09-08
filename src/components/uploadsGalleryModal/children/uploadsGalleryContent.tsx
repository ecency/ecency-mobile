import { proxifyImageSrc } from '@ecency/render-helper';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import { View as AnimatedView } from 'react-native-animatable';
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from 'react-native-fast-image';
import { Icon, IconButton } from '../..';
import { UploadedMedia } from '../../../models';
import styles from '../children/uploadsGalleryModalStyles';

type Props = {
    mediaUploads: any[],
    indices: Map<number, boolean>
    isLoading: boolean,
    isAddingToUploads: boolean,
    getMediaUploads: () => void,
    deleteMedia: (id:string) => Promise<boolean>,
    insertMedia: (map: Map<number, boolean>) => void
    handleOpenGallery: (addToUploads?: boolean) => void,
    handleOpenCamera: () => void,
    handleOpenForUpload: () => void,
}

const UploadsGalleryContent = ({
    mediaUploads,
    isAddingToUploads,
    deleteMedia,
    insertMedia,
    handleOpenGallery,
    handleOpenCamera,

}: Props) => {

    const intl = useIntl()

    const [deleteIds, setDeleteIds] = useState<Map<string, boolean>>(new Map());
    const [isDeleteMode, setIsDeleteMode] = useState(false);


    const _deleteMedia = async (id:string) => {
        await deleteMedia(id)
        if(deleteIds.has(id)) {
            deleteIds.delete(id);
            setDeleteIds(new Map([...deleteIds]))
        }
    }


    //render list item for snippet and handle actions;
    const _renderItem = ({ item, index }: { item: UploadedMedia, index: number }) => {

        const _onPress = () => {

            if (isDeleteMode) {
                deleteIds.set(item._id, true);
                setDeleteIds(new Map([...deleteIds]));
                _deleteMedia(item._id);

            } else {
                insertMedia(new Map([[index, true]]))
            }
        }

        const thumbUrl = proxifyImageSrc(item.url, 600, 500, Platform.OS === 'ios' ? 'match' : 'webp');

        return (
            <TouchableOpacity onPress={_onPress} disabled={deleteIds.has(item._id)}>
                <FastImage
                    source={{ uri: thumbUrl }}
                    style={styles.mediaItem}
                />
                {
                    isDeleteMode && (
                        <AnimatedView animation='zoomIn' duration={300} style={styles.minusContainer}>
                            {
                                deleteIds.has(item._id) ? (
                                    <ActivityIndicator color={EStyleSheet.value('$pureWhite')} />
                                ) : (
                                    <Icon
                                        color={EStyleSheet.value('$pureWhite')}
                                        iconType="MaterialCommunityIcons"
                                        name={'minus'}
                                        size={24}
                                    />
                                )
                            }
                        </AnimatedView>
                    )
                }
            </TouchableOpacity>
        )
    };


    const _renderSelectButton = (iconName, text, onPress) => {
        return (
            <TouchableOpacity onPress={() => { onPress && onPress() }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon
                        style={{ width: 32, height: 32 }}
                        color={EStyleSheet.value('$primaryBlack')}
                        iconType="MaterialCommunityIcons"
                        name={iconName}
                        size={24}
                    />
                    <Text style={styles.selectButtonLabel}>{text}</Text>
                </View>
            </TouchableOpacity>
        )
    }


    const _renderHeaderContent = () => (
        <View style={styles.buttonsContainer}>
            <View style={styles.selectButtonsContainer} >
                {_renderSelectButton('image-plus', 'Gallery', handleOpenGallery)}
                {_renderSelectButton('camera-plus', 'Camera', handleOpenCamera)}
            </View>
            <View style={styles.uploadsBtnContainer}>
                <IconButton
                    style={styles.uploadsActionBtn}
                    color={EStyleSheet.value('$primaryBlack')}
                    iconType="MaterialCommunityIcons"
                    name={'plus'}
                    size={28}
                    onPress={() => { handleOpenGallery(true) }}
                />
                <IconButton
                    style={{ ...styles.uploadsActionBtn, backgroundColor: isDeleteMode ? EStyleSheet.value('$iconColor') : 'transparent' }}
                    color={EStyleSheet.value('$primaryBlack')}
                    iconType="MaterialCommunityIcons"
                    name={'minus'}
                    size={28}
                    onPress={() => { setIsDeleteMode(!isDeleteMode) }}
                />
            </View>

            {isAddingToUploads && (
                <AnimatedView animation='zoomIn' duration={500} style={styles.thumbPlaceholder}>
                    <ActivityIndicator />
                </AnimatedView>
            )}
        </View>

    )

    //render empty list placeholder
    const _renderEmptyContent = () => {
        return (
            <>
                <Text style={styles.emptyText}>{intl.formatMessage({ id: 'uploads_modal.label_no_images' })}</Text>
            </>
        );
    };



    return (
        <View style={styles.container}>
            <FlatList
                data={mediaUploads}
                keyExtractor={(item) => `item_${item.url}`}
                renderItem={_renderItem}
                style={{ flex: 1 }}
                contentContainerStyle={{ alignItems: 'center' }}
                ListHeaderComponent={_renderHeaderContent}
                ListEmptyComponent={_renderEmptyContent}
                ListFooterComponent={<View style={styles.listEmptyFooter} />}
                extraData={deleteIds}
                horizontal={true}
                keyboardShouldPersistTaps='always'
            // refreshControl={
            //     <RefreshControl
            //         refreshing={isLoading}
            //         onRefresh={getMediaUploads}
            //     />
            // }
            />
        </View>
    )
}

export default UploadsGalleryContent