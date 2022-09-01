import { View, Text } from 'react-native'
import React, { useRef } from 'react'
import UserAvatar from '../../userAvatar';
import { View as AnimatedView } from 'react-native-animatable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import styles from './WriteCommentButtonStyles';
import { useAppSelector } from '../../../hooks';
import showLoginAlert from '../../../utils/showLoginAlert';
import { useIntl } from 'react-intl';

interface WriteCommentButton {
    onPress: () => void;
}

export const WriteCommentButton = ({ onPress }) => {
    const intl = useIntl();
    const isLoggedIn = useAppSelector(state => state.application.isLoggedIn);

    const _onPress = () => {
        if(!isLoggedIn){
            showLoginAlert({intl})
            return;
        }
        if(onPress){
            onPress();
        }
    }

    return (
        <TouchableOpacity onPress={_onPress}>
            <View style={styles.container}>
                <UserAvatar username="demo.com" />
                <View style={styles.inputContainer}>
                    <Text style={styles.inputPlaceholder}>
                        {'Write a comment...'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}
