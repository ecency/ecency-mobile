import React from 'react'
import { View, Text } from 'react-native'
import FastImage from 'react-native-fast-image';
import styles from './quickProfileStyles';
import * as Progress from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';

interface Props {
    avatarUrl:string,
    username:string,
    about:string,
    resourceCredits:string,
    isLoading:boolean
}

export const ProfileBasic = ({avatarUrl, username, about, resourceCredits, isLoading}: Props) => {
    
    const progress = parseInt(resourceCredits || '0')/100;
    
    return (
        <View style={styles.container}>
            <View>
                <FastImage 
                    source={{uri:avatarUrl}}
                    resizeMode='cover'
                    style={styles.image}
                />
                <View style={{position:'absolute', top:0, bottom:0, left:0, right:0, alignItems:'center', justifyContent:'center'}}>
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
        
            <Text style={styles.title}>{`@${username}`}</Text>
            <Text style={styles.bodyText}>{about}</Text>
        </View>
    )
}
