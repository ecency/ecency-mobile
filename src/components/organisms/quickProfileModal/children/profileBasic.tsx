import React from 'react'
import { View, Text } from 'react-native'
import FastImage from 'react-native-fast-image';
import styles from './quickProfileStyles';
import * as Progress from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
    avatarUrl:string,
    username:string,
    about:string,
    created:string,
    resourceCredits:string,
    isLoading:boolean,
    onPress:()=>void
}

export const ProfileBasic = ({avatarUrl, username, about, resourceCredits, isLoading, created, onPress}: Props) => {
    
    const progress = parseInt(resourceCredits || '0')/100;
    
    return (
        <TouchableOpacity onPress={onPress} >
            <View style={styles.container}>
                <View>
                    <FastImage 
                        source={{uri:avatarUrl}}
                        resizeMode='cover'
                        style={styles.image}
                    />
                    <View style={styles.progressCircle}>
                        <Progress.Circle 
                            size={144}
                            indeterminate={isLoading}
                            progress={progress} 
                            borderColor='gray'
                            borderWidth={0}
                            thickness={8}
                            strokeCap='round'
                            color={EStyleSheet.value('$primaryBlue')}
                        />
                    </View>
                </View>
            
                <Text style={styles.title}>{`@${username} - ${created}`}</Text>
                <Text style={styles.bodyText} numberOfLines={2} >{about}</Text>
            </View>
        </TouchableOpacity>
    )
}
