import * as React from 'react';
import { useIntl } from 'react-intl';
import { Text, View, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { IconButton } from '../..';
import styles from './tabbedPostsStyles';

interface NewPostsPopupProps {
    onPress:()=>void;
    onClose:()=>void;
    popupAvatars:string[];
}

const NewPostsPopup = ({
    onPress,
    onClose,
    popupAvatars,
}: NewPostsPopupProps) => {
    const intl = useIntl();

    if(popupAvatars.length == 0){
        return null;
    }

    return (
        <View style={styles.popupContainer}>
            <View style={styles.popupContentContainer}>
                <TouchableOpacity
                onPress={onPress}
                >
                <View style={styles.popupContentContainer}>
                    <IconButton
                        iconStyle={styles.arrowUpIcon}
                        iconType="MaterialCommunityIcons"
                        name="arrow-up"
                        onPress={onPress}
                        size={12}
                    />

                    {popupAvatars.map((url, index) => (
                    <FastImage
                        key={`image_bubble_${url}`}
                        source={{ uri: url }}
                        style={[styles.popupImage, { zIndex: 10 - index }]}
                    />
                    ))}

                    <Text style={styles.popupText}>
                    {intl.formatMessage({ id: 'home.popup_postfix' })}
                    </Text>
                </View>
                </TouchableOpacity>

                <IconButton
                iconStyle={styles.closeIcon}
                iconType="MaterialCommunityIcons"
                name="close"
                onPress={onClose}
                size={12}
                />
            </View>
            </View>
    );
};

export default NewPostsPopup;
