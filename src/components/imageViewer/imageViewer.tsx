import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, Platform, SafeAreaView } from 'react-native';
import styles from './imageViewer.styles';
import EStyleSheet from 'react-native-extended-stylesheet';
import ImageViewing from 'react-native-image-viewing';
import { IconButton } from '../buttons';


export const ImageViewer = forwardRef(({ }, ref) => {

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


    const _renderImageViewerHeader = (imageIndex: number) => {
        return (
            <SafeAreaView
                style={{
                    marginTop: Platform.select({ ios: 0, android: 25 }),
                }}>
                <View style={styles.imageViewerHeaderContainer}>
                    <Text style={styles.imageGalleryHeaderText}>{`${imageIndex + 1}/${imageUrls.length
                        }`}</Text>
                    <IconButton
                        name="close"
                        color={EStyleSheet.value('$primaryDarkText')}
                        buttonStyle={styles.closeIconButton}
                        size={20}
                        handleOnPress={_onCloseImageViewer}
                    />
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
