import { proxifyImageSrc } from '@ecency/render-helper';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, Alert, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import { View as AnimatedView } from 'react-native-animatable';
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from 'react-native-fast-image';
import { Icon, IconButton } from '../..';
import { UploadedMedia } from '../../../models';
import styles from '../children/uploadsGalleryModalStyles';

type Props = {
    insertedMediaUrls: string[],
    mediaUploads: any[],
    indices: Map<number, boolean>
    isLoading: boolean,
    isAddingToUploads: boolean,
    getMediaUploads: () => void,
    deleteMedia: (ids: string) => Promise<boolean>,
    insertMedia: (map: Map<number, boolean>) => void
    handleOpenGallery: (addToUploads?: boolean) => void,
    handleOpenCamera: () => void,
    handleOpenForUpload: () => void,
}

const UploadsGalleryContent = ({
    insertedMediaUrls,
    mediaUploads,
    isAddingToUploads,
    getMediaUploads,
    deleteMedia,
    insertMedia,
    handleOpenGallery,
    handleOpenCamera,
}: Props) => {

    const intl = useIntl()

    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);


    const _deleteMedia = async () => {

        setIsDeleting(true)
        try {
            for (const i in deleteIds) {
                await deleteMedia(deleteIds[i])
            }
        } catch (err) {
            console.warn("Failed to delete media items")
        }
        getMediaUploads();
        setIsDeleting(false);
        setIsDeleteMode(false);
        setDeleteIds([]);

    }


    const _onDeletePress = async () => {
        if (isDeleteMode && deleteIds.length > 0) {

            const _onCancelPress = () => {
                setIsDeleteMode(false);
                setDeleteIds([])
            }

            Alert.alert(
                intl.formatMessage({ id: 'alert.delete' }),
                intl.formatMessage({ id: 'alert.remove_alert' }),
                [{
                    text: intl.formatMessage({ id: 'alert.cancel' }),
                    style: 'cancel',
                    onPress: _onCancelPress
                }, {
                    text: intl.formatMessage({ id: 'alert.confirm' }),
                    onPress: () => _deleteMedia()
                }]
            )
        } else {
            setIsDeleteMode(!isDeleteMode);
        }

    }


    //render list item for snippet and handle actions;
    const _renderItem = ({ item, index }: { item: UploadedMedia, index: number }) => {

        const _onPress = () => {
            if (isDeleteMode) {
                const idIndex = deleteIds.indexOf(item._id)
                if (idIndex >= 0) {
                    deleteIds.splice(idIndex, 1);
                } else {
                    deleteIds.push(item._id);
                }
                setDeleteIds([...deleteIds]);
            } else {
                insertMedia(new Map([[index, true]]))
            }
        }

        const thumbUrl = proxifyImageSrc(item.url, 600, 500, Platform.OS === 'ios' ? 'match' : 'webp');
        let isInsertedTimes = 0;
        insertedMediaUrls.forEach(url => isInsertedTimes += url === item.url ? 1 : 0);
        const isToBeDeleted = deleteIds.indexOf(item._id) >= 0;
        const transformStyle = {
            transform: isToBeDeleted ?
                [{ scaleX: 0.7 }, { scaleY: 0.7 }] : []
        }

        const _renderMinus = () => (
            isDeleteMode && (
                <AnimatedView
                    animation='zoomIn'
                    duration={300}
                    style={styles.minusContainer}>
                    <Icon
                        color={EStyleSheet.value('$pureWhite')}
                        iconType="MaterialCommunityIcons"
                        name={'minus'}
                        size={20}
                    />
                </AnimatedView>
            )
        )


        const _renderCounter = () => (
            isInsertedTimes > 0 && !isDeleteMode && (
                <AnimatedView
                    animation='zoomIn'
                    duration={300}
                    style={styles.counterContainer}>
                    <Text style={styles.counterText}>{isInsertedTimes}</Text>
                </AnimatedView>
            )
        )

        return (
            <TouchableOpacity onPress={_onPress} disabled={isDeleting}>
                <View style={transformStyle}>
                    <FastImage
                        source={{ uri: thumbUrl }}
                        style={styles.mediaItem}
                    />
                    {_renderCounter()}
                    {_renderMinus()}
                </View>
            </TouchableOpacity>
        )
    };


    const _renderSelectButton = (iconName: string, text: string, onPress: () => void) => {
        return (
            <TouchableOpacity onPress={() => { onPress && onPress() }}>
                <View style={styles.selectButton}>

                    <View style={styles.selectBtnPlus}>
                        <Icon
                            color={EStyleSheet.value('$primaryBackgroundColor')}
                            iconType="FontAwesome5"
                            name={'plus-circle'}
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
        )
    }


    const _renderHeaderContent = () => (
        <View style={styles.buttonsContainer}>
            <View style={styles.selectButtonsContainer} >
                {_renderSelectButton('image', 'Gallery', handleOpenGallery)}
                {_renderSelectButton('camera', 'Camera', handleOpenCamera)}
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
                    style={{
                        ...styles.uploadsActionBtn,
                        backgroundColor: isDeleteMode ?
                            deleteIds.length ? EStyleSheet.value('$primaryRed')
                                : EStyleSheet.value('$iconColor')
                            : 'transparent'
                    }}
                    color={EStyleSheet.value('$primaryBlack')}
                    iconType="MaterialCommunityIcons"
                    name={isDeleteMode && deleteIds.length ? 'delete-outline' : 'minus'}
                    disabled={isDeleting}
                    size={28}
                    onPress={_onDeletePress}
                    isLoading={isDeleting}
                />
            </View>

            {isAddingToUploads && (
                <View style={styles.thumbPlaceholder}>
                    <ActivityIndicator color={EStyleSheet.value('$primaryBlack')} />
                </View>
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