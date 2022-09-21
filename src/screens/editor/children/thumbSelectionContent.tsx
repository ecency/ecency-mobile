import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { FlatList } from 'react-native-gesture-handler';
import { extractImageUrls } from '../../../utils/editor';
import styles from './styles';
import ESStyleSheet from 'react-native-extended-stylesheet';

interface ThumbSelectionContentProps {
    body: string;
    thumbUrl: string;
    isUploading: boolean;
    onThumbSelection: (url: string) => void;
}

const ThumbSelectionContent = ({ body, thumbUrl, onThumbSelection, isUploading }: ThumbSelectionContentProps) => {
    const intl = useIntl();

    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [needMore, setNeedMore] = useState(true);
    const [thumbIndex, setThumbIndex] = useState(0);


    useEffect(() => {
        const urls = extractImageUrls({ body });

        if (urls.length < 2) {
            setNeedMore(true);
            onThumbSelection(urls[0] || '');
            setThumbIndex(0);
            setImageUrls([])
        } else {
            setNeedMore(false);
            setImageUrls(urls)
        }

        const _urlIndex = urls.indexOf(thumbUrl)
        if(_urlIndex < 0){
            onThumbSelection(urls[0] || '');
            setThumbIndex(0);
        } else{
            setThumbIndex(_urlIndex)
        }

    }, [body])


    //VIEW_RENDERERS
    const _renderImageItem = ({ item, index }: { item: string, index: number }) => {
        const _onPress = () => {
            onThumbSelection(item);
            setThumbIndex(index);
        }

        const selectedStyle = item === thumbUrl && index === thumbIndex ? styles.selectedStyle : null

        return (
            <TouchableOpacity onPress={() => _onPress()} >
                <FastImage
                    source={{ uri: item }}
                    style={{ ...styles.thumbStyle, ...selectedStyle }}
                    resizeMode='cover'
                />
            </TouchableOpacity>
        )
    }

    const _renderHeader = () => (
        isUploading && 
        <View style={{flex:1, justifyContent:'center', marginRight: 16}}>
            <ActivityIndicator color={ESStyleSheet.value('$primaryBlack')} />
        </View>

    )


    return (
        <View style={styles.thumbSelectContainer}>
            <Text style={styles.settingLabel}>{intl.formatMessage({ id: 'editor.select_thumb' })}</Text>
            {
                needMore ? (
                    <Text style={styles.contentLabel}>{intl.formatMessage({ id: 'editor.add_more_imgs' })}</Text>
                ) : (
                    <FlatList
                        data={imageUrls}
                        renderItem={_renderImageItem}
                        ListHeaderComponent={_renderHeader}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        horizontal={true}
                        contentContainerStyle={styles.listContainer}
                        showsHorizontalScrollIndicator={false} />
                )
            }

        </View>
    );
};

export default ThumbSelectionContent;
