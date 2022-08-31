import { View, Text } from 'react-native'
import React, { useRef } from 'react'
import UserAvatar from '../../userAvatar';
import EStyleSheet from 'react-native-extended-stylesheet';
import { View as AnimatedView } from 'react-native-animatable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import styles from './WriteCommentButtonStyles';

interface WriteCommentButton {
    onPress: () => void;
}

export const WriteCommentButton = ({ onPress }) => {

    return (
        <TouchableOpacity onPress={onPress}>
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
