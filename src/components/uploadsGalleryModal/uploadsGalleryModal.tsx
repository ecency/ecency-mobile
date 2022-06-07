import { proxifyImageSrc } from '@ecency/render-helper';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { Alert, FlatList, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { CheckBox, MainButton, TextButton } from '..';
import { UploadedMedia } from '../../models';
import { addImage, deleteImage, getImages } from '../../providers/ecency/ecency';
import { ProgressBar } from '../atoms';
import Modal from '../modal';
import styles from './uploadsGalleryModalStyles';


export interface UploadsGalleryModalRef {
    showModal: () => void;
}

interface MediaInsertData {
    url: string,
    hash: string,
}

interface UploadsGalleryModalProps {
    username: string;
    handleOnSelect: (data: Array<MediaInsertData>) => void;
    uploadedImage: MediaInsertData;
    isUploading: boolean;
    uploadProgress: number
}

export const UploadsGalleryModal = forwardRef(({
    username,
    handleOnSelect,
    uploadedImage,
    isUploading,
    uploadProgress,

}: UploadsGalleryModalProps, ref) => {
    const intl = useIntl();

    const [mediaUploads, setMediaUploads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lastAddedImageUrl, setLastAddedImageUrl] = useState(null);
    const [indices, setIndices] = useState<Map<number, boolean>>(new Map());


    useImperativeHandle(ref, () => ({
        showModal: () => {
            setShowModal(true);
        },
    }));


    useEffect(() => {
        _getMediaUploads();
    }, []);

    useEffect(() => {
        if (!showModal) {
            setIndices(new Map());
        }
    }, [showModal])

    useEffect(() => {
        if (uploadedImage && uploadedImage.url !== lastAddedImageUrl) {
            _addUploadedImageToGallery();
        }
    }, [uploadedImage])


    
    //save image to user gallery
    const _addUploadedImageToGallery = async () => {
        try {
            console.log("adding image to gallery", username, uploadedImage)
            setIsLoading(true);
            await addImage(uploadedImage.url);
            await _getMediaUploads();
            setLastAddedImageUrl(uploadedImage.url);
            setIsLoading(false);
        } catch (err) {
            console.warn("Failed to add image to gallery, could possibly a duplicate image", err)
            setIsLoading(false);
        }
    }


    // remove image data from user's gallery
    const _deleteMedia = async () => {
        try {
            setIsLoading(true);
            for (const index of indices.keys()) {
                await deleteImage(mediaUploads[index]._id)
            }
            await _getMediaUploads();
            setIndices(new Map());
            setIsLoading(false);
        } catch (err) {
            console.warn("failed to remove image from gallery", err)
            setIsLoading(false);
        }
    }


    //fetch images from server
    const _getMediaUploads = async () => {
        try {
            if (username) {
                setIsLoading(true);
                console.log("getting images for: " + username)
                const images = await getImages()
                console.log("images received", images)
                setMediaUploads(images);
                setIsLoading(false);
            }
        } catch (err) {
            console.warn("Failed to get images")
            setIsLoading(false);
        }
    }

    //inserts media items in post body
    const _insertMedia = async (selectedIndex?: number) => {
        const map = selectedIndex > -1 ? new Map([[selectedIndex, true]]) : indices;

        const data = []
        for (const index of map.keys()) {
            console.log(index)
            const item = mediaUploads[index]
            const hhash = item.url.split('/').pop() 
            data.push({
                url: item.url,
                hash: hhash.replace(/\.[^/.]+$/, "")
            })

        }
        handleOnSelect(data)
        setShowModal(false);
    }



    //renders footer with add snipept button and shows new snippet modal
    const _renderFloatingPanel = () => {

        if (!indices.size) {
            return null
        }

        const _onRemovePress = async () => {
            const _onConfirm = () => {
                _deleteMedia()
            }
            Alert.alert(
                intl.formatMessage({ id: 'alert.delete' }),
                intl.formatMessage({ id: 'alert.remove_alert' }),
                [{
                    text: intl.formatMessage({ id: 'alert.cancel' }),
                    style: 'cancel'
                }, {
                    text: intl.formatMessage({ id: 'alert.confirm' }),
                    onPress: _onConfirm
                }]
            )

        }

        return (
            <View style={styles.floatingContainer}>
                <TextButton
                    style={styles.cancelButton}
                    onPress={_onRemovePress}
                    text={intl.formatMessage({
                        id: 'uploads_modal.btn_delete',
                    })}
                />
                <MainButton
                    style={{ width: 136, marginLeft: 12 }}
                    onPress={_insertMedia}
                    iconName="plus"
                    iconType="MaterialCommunityIcons"
                    iconColor="white"
                    text={intl.formatMessage({
                        id: 'uploads_modal.btn_insert',
                    })}
                />
            </View>
        );
    };



    //render list item for snippet and handle actions;
    const _renderItem = ({ item, index }: { item: UploadedMedia, index: number }) => {

        const _onCheckPress = () => {
            //update selection indices
            if (indices.has(index)) {
                indices.delete(index);
            } else {
                indices.set(index, true);
            }

            setIndices(new Map([...indices]));
        }

        const _onPress = () => {

            if (indices.size) {
                _onCheckPress()
            } else {
                _insertMedia(index)
            }
        }

        const thumbUrl = proxifyImageSrc(item.url, 600, 500, Platform.OS === 'ios' ? 'match' : 'webp');

        return (
            <TouchableOpacity onPress={_onPress} onLongPress={_onCheckPress}>
                <FastImage
                    source={{ uri: thumbUrl }}
                    style={styles.mediaItem}
                />
                <View style={styles.checkContainer}>
                    <CheckBox
                        isChecked={indices.has(index)}
                        clicked={_onCheckPress}
                        style={styles.checkStyle}
                    />
                </View>

            </TouchableOpacity>
        )
    };


    //render empty list placeholder
    const _renderEmptyContent = () => {
        return (
            <>
                <Text style={styles.title}>{intl.formatMessage({ id: 'uploads_modal.label_no_images' })}</Text>
            </>
        );
    };


    const _renderHeaderContent = () => (
        <>
            {isUploading && <ProgressBar progress={uploadProgress} />}
        </>

    )



    const _renderContent = () => {
        console.log("Rendering uploaded images")
        return (
            <View style={styles.container}>
                <View style={styles.bodyWrapper}>
    
                    {_renderHeaderContent()}
                    <FlatList
                        data={mediaUploads}
                        keyExtractor={(item) => `item_${item.url}`}
                        renderItem={_renderItem}
                        ListEmptyComponent={_renderEmptyContent}
                        ListFooterComponent={<View style={styles.listEmptyFooter} />}
                        extraData={indices}
                        numColumns={2}
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoading}
                                onRefresh={_getMediaUploads}
                            />
                        }
                    />
                </View>
                {_renderFloatingPanel()}
            </View>
        )
    } 




    return (
        <Modal
            isOpen={showModal}
            handleOnModalClose={() => setShowModal(false)}
            isFullScreen
            isCloseButton
            presentationStyle="formSheet"
            title={intl.formatMessage({
                id: 'uploads_modal.title'
            })}
            animationType="slide"
            style={styles.modalStyle}
        >
            {showModal && _renderContent()}
        </Modal>

    );
});


