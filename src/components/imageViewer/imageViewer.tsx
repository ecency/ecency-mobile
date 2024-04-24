import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, Platform, SafeAreaView, Alert, Share, ShareContent } from 'react-native';
import styles from './imageViewer.styles';
import EStyleSheet from 'react-native-extended-stylesheet';
import ImageViewing from 'react-native-image-viewing';
import { useIntl } from 'react-intl';
import IconButton from '../iconButton';
import { writeToClipboard } from '../../utils/clipboard';
import { useDispatch } from 'react-redux';
import { toastNotification } from '../../redux/actions/uiAction';


export const ImageViewer = forwardRef(({ }, ref) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    // intl.formatMessage({ id: 'post.copy_link' }),
    // intl.formatMessage({ id: 'post.gallery_mode' }),
    // intl.formatMessage({ id: 'post.save_to_local' }),

    const [visible, setVisible] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);


    useImperativeHandle(ref, () => ({
        show(selectedUrl: string, _imageUrls: string[]) {
            setImageUrls(_imageUrls)
            setSelectedIndex(_imageUrls.indexOf(selectedUrl))
            setVisible(true);
        },
    }));


    const _onCopyPress = (index: number) => {
        const url = imageUrls[index]
        Share.share(Platform.OS === 'ios' ?
            { url } : { message: url })
    }


    const _onSavePress = (index: number) => {

    }


    const _renderIconButton = (iconName: string, onPress: () => void) => (
        <IconButton
            name={iconName}
            iconType="MaterialCommunityIcons"
            color={EStyleSheet.value('$iconColor')}
            style={{ marginHorizontal: 4 }}
            size={24}
            onPress={onPress}
        />
    )


    const _renderImageViewerHeader = (imageIndex: number) => {
        return (
            <SafeAreaView
                style={{
                    marginTop: Platform.select({ ios: 0, android: 25 }),
                }}>
                <View style={styles.imageViewerHeaderContainer}>
                    <View style={styles.leftContainer}>
                        {_renderIconButton('close', _onCloseImageViewer)}
                        <Text style={styles.imageGalleryHeaderText}>{
                            `Preview (${imageIndex + 1}/${imageUrls.length})`}</Text>
                    </View>

                    <View style={styles.rightContainer}>
                        {_renderIconButton('content-copy', () => _onCopyPress(imageIndex))}
                        {_renderIconButton('download', () => _onSavePress(imageIndex))}
                    </View>

                </View>
            </SafeAreaView>
        );
    };


    const _onCloseImageViewer = () => {
        setVisible(false);
        setImageUrls([])
    }


    return (
        <ImageViewing
            images={imageUrls.map((url) => ({ uri: url }))}
            imageIndex={selectedIndex}
            visible={visible}
            animationType="slide"
            swipeToCloseEnabled
            onRequestClose={_onCloseImageViewer}
            HeaderComponent={(data) => _renderImageViewerHeader(data.imageIndex)}
        />
    );
});

// const _handleImageOptionPress = (ind) => {
//     if (ind === 1) {
//       // open gallery mode
//       // setIsImageModalOpen(true);
//       return;
//     }
//     if (ind === 0) {
//       // copy to clipboard
//       writeToClipboard(selectedImage).then(() => {
//         dispatch(
//           toastNotification(
//             intl.formatMessage({
//               id: 'alert.copied',
//             }),
//           ),
//         );
//       });
//     }
//     // if (ind === 2) {
//     //   // save to local
//     //   _saveImage(selectedImage);
//     // }

//     setSelectedImage(null);
//   };


// const _saveImage = async (uri) => {
//     try {
//       if (Platform.OS === 'android') {
//         await checkAndroidPermission();
//         uri = `file://${await _downloadImage(uri)}`;
//       }
//       // CameraRoll.saveToCameraRoll(uri)
//       //   .then(() => {
//       //     dispatch(
//       //       toastNotification(
//       //         intl.formatMessage({
//       //           id: 'post.image_saved',
//       //         }),
//       //       ),
//       //     );
//       //   })
//       //   .catch(() => {
//       //     dispatch(
//       //       toastNotification(
//       //         intl.formatMessage({
//       //           id: 'post.image_saved_error',
//       //         }),
//       //       ),
//       //     );
//       //   });
//     } catch (error) {
//       dispatch(
//         toastNotification(
//           intl.formatMessage({
//             id: 'post.image_saved_error',
//           }),
//         ),
//       );
//     }
//   };

// const _downloadImage = async (uri) => {
//     return RNFetchBlob.config({
//       fileCache: true,
//       appendExt: 'jpg',
//     })
//       .fetch('GET', uri)
//       .then((res) => {
//         const { status } = res.info();

//         if (status == 200) {
//           return res.path();
//         } else {
//           Promise.reject();
//         }
//       })
//       .catch((errorMessage) => {
//         Promise.reject(errorMessage);
//       });
//   };


// const checkAndroidPermission = async () => {
//     try {
//       const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
//       await PermissionsAndroid.request(permission);
//       Promise.resolve();
//     } catch (error) {
//       Promise.reject(error);
//     }
//   };