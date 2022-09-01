import { View, Text } from 'react-native'
import React, { forwardRef, useImperativeHandle, useRef } from 'react'
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

export const WriteCommentButton = forwardRef(({ onPress }, ref) => {
    const intl = useIntl();

    const animatedContainer = useRef<AnimatedView>();

    const isLoggedIn = useAppSelector(state => state.application.isLoggedIn);

    useImperativeHandle(ref, () => ({
        bounce: () => {
            console.log("bouncing")
            if (animatedContainer.current) {
                animatedContainer.current.swing(1000);
            }
        },
    }));

    const _onPress = () => {
        if (!isLoggedIn) {
            showLoginAlert({ intl })
            return;
        }
        if (onPress) {
            onPress();
        }
    }

    return (
        <AnimatedView ref={animatedContainer}>
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
        </AnimatedView>

    )
})
