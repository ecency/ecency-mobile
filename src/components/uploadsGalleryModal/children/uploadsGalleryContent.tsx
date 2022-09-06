import { proxifyImageSrc } from '@ecency/render-helper';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Alert, FlatList, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from 'react-native-fast-image';
import { CheckBox, Icon, IconButton, MainButton, TextButton } from '../..';
import { UploadedMedia } from '../../../models';
import styles from '../children/uploadsGalleryModalStyles';

type Props = {
    mediaUploads: any[],
    indices: Map<number, boolean>
    isLoading: boolean,
    getMediaUploads: () => void,
    deleteMedia: (indices) => Promise<boolean>,
    insertMedia: (map: Map<number, boolean>) => void
    handleOpenGallery: (addToUploads?: boolean) => void,
    handleOpenCamera: () => void,
    handleOpenForUpload: () => void,
}

const UploadsGalleryContent = ({
    mediaUploads,
    isLoading,
    deleteMedia,
    insertMedia,
    getMediaUploads,
    handleOpenGallery,
    handleOpenCamera,

}: Props) => {

    const intl = useIntl()

    const [indices, setIndices] = useState<Map<number, boolean>>(new Map());

    const _deleteMedia = async () => {
        const status = await deleteMedia(indices)
        if (status) {
            setIndices(new Map())
        }
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
                    onPress={() => insertMedia(indices)}
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
                insertMedia(new Map([[index, true]]))
            }
        }

        const thumbUrl = proxifyImageSrc(item.url, 600, 500, Platform.OS === 'ios' ? 'match' : 'webp');

        return (
            <TouchableOpacity onPress={_onPress} onLongPress={_onCheckPress}>
                <FastImage
                    source={{ uri: thumbUrl }}
                    style={styles.mediaItem}
                />
                {/* <View style={styles.checkContainer}>
                    <CheckBox
                        isChecked={indices.has(index)}
                        clicked={_onCheckPress}
                        style={styles.checkStyle}
                    />
                </View> */}

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
            <IconButton
                style={styles.addButton}
                color={EStyleSheet.value('$primaryBlack')}
                iconType="MaterialCommunityIcons"
                name={'plus'}
                size={28}
                onPress={()=>{handleOpenGallery(true)}}
            />
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
                style={{flex:1}}
                contentContainerStyle={{alignItems:'center' }}
                ListHeaderComponent={_renderHeaderContent}
                ListEmptyComponent={_renderEmptyContent}
                ListFooterComponent={<View style={styles.listEmptyFooter} />}
                extraData={indices}
                horizontal={true}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={getMediaUploads}
                    />
                }
            />

            {_renderFloatingPanel()}
        </View>
    )
}

export default UploadsGalleryContent