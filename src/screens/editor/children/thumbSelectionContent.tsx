import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { FlatList } from 'react-native-gesture-handler';
import { extractImageUrls } from '../../../utils/editor';
import styles from './styles';

interface ThumbSelectionContentProps {
    body:string;
    thumbIndex:number;
    onThumbSelection:(index:number)=>void;
}

const ThumbSelectionContent = ({body, thumbIndex, onThumbSelection}: ThumbSelectionContentProps) => {
    const intl = useIntl();

    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [needMore, setNeedMore] = useState(true);
    
    useEffect(() => {
        const urls = extractImageUrls({body});

        if(urls.length < 2){
            setNeedMore(true);
            onThumbSelection(0);
            setImageUrls([])
        }else{
            setNeedMore(false);
            setImageUrls(urls)
        }
    }, [body])


    //VIEW_RENDERERS
    const _renderImageItem = ({item, index}:{item:string, index:number}) => {
        const _onPress = () => {  
            onThumbSelection(index);
        }

        const selectedStyle = index === thumbIndex ? styles.selectedStyle : null

        return (
            <TouchableOpacity onPress={() => _onPress()} >
                <FastImage 
                    source={{uri:item}}
                    style={{...styles.thumbStyle, ...selectedStyle}}
                    resizeMode='cover'
                />
            </TouchableOpacity>
        )
    }


    return (
        <View style={styles.thumbSelectContainer}>
            <Text style={styles.settingLabel}>{intl.formatMessage({id:'editor.select_thumb'})}</Text>
            {
                needMore ? (
                    <Text style={styles.contentLabel}>{intl.formatMessage({id:'editor.add_more_imgs'})}</Text>
                ):(
                    <FlatList
                        data={imageUrls}
                        renderItem={_renderImageItem}
                        keyExtractor={(item, index)=>`${item}-${index}`}
                        horizontal={true}
                        contentContainerStyle={styles.listContainer}
                        showsHorizontalScrollIndicator={false}/>
                )
            }
           
        </View>
    );
};

export default ThumbSelectionContent;
