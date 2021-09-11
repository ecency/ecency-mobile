import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { View, Text, ActivityIndicator, Alert, Button } from 'react-native'
import FastImage from 'react-native-fast-image'
import { checkFavorite } from '../../../../providers/ecency/ecency'
import { getFollows, getRelationship, getUser } from '../../../../providers/hive/dhive'
import { getRcPower, getVotingPower } from '../../../../utils/manaBar'
import styles from './quickProfileStyles'

interface QuickProfileContentProps {
    username:string,
    currentAccountName:string;
}

export const QuickProfileContent = ({
    currentAccountName,
    username,

}:QuickProfileContentProps) => {
    const intl = useIntl();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [follows, setFollows] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);

    const isOwnProfile = currentAccountName === username;

    useEffect(() => {
        if(username) {
            _fetchUser();
            _fetchExtraUserData();
        } else {
            setUser(null);
        }
    }, [username])


    //NETWORK CALLS
    const _fetchUser = async () => {
        setIsLoading(true);
        try {
          const _user = await getUser(username, isOwnProfile);
          setUser(_user)
        } catch (error) {
            setIsLoading(false);
        }
    };


    const _fetchExtraUserData = async () => {
        try {
            if (username) {
                let _isFollowing;
                let _isMuted;
                let _isFavourite;
                let follows;
        
                if (!isOwnProfile) {
                    const res = await getRelationship(currentAccountName, username);
                    _isFollowing = res && res.follows;
                    _isMuted = res && res.ignores;
                    _isFavourite = await checkFavorite(username);
                }
        
                try {
                    follows = await getFollows(username);
                } catch (err) {
                    follows = null;
                }
        
            
                setFollows(follows);
                setIsFollowing(_isFollowing);
                setIsMuted(_isMuted)
                setIsFavourite(_isFavourite)
                setIsLoading(false);
            
            }
        } catch (error) {
            console.warn('Failed to fetch complete profile data', error);
            Alert.alert(
            intl.formatMessage({
                id: 'alert.fail',
            }),
            error.message || error.toString(),
            );
        }
    };


    //UI CALLBACKS


    //UI RENDERERS
    if(!user){
        return <ActivityIndicator />
    }

    //extract prop values
    let _votingPower = '';
    let _resourceCredits = '';
    let _followerCount = 0;
    let _followingCount = 0;
    let _postCount = 0;
    let _avatarUrl = '';
    let _about = '';

    if (user) {
      _votingPower = getVotingPower(user).toFixed(1);
      _resourceCredits = getRcPower(user).toFixed(1);
      _postCount = user.post_count || 0;
      _avatarUrl = user.avatar || '';
      _about = user.about?.profile?.about || '';
    }

    if(follows){
        _followerCount = follows.follower_count || 0;
        _followingCount = follows.following_count || 0
    }

    return (
        <View style={styles.modalStyle}>
            <FastImage 
                source={{uri:_avatarUrl}}
                resizeMode='cover'
                style={{width:56, height:56, borderRadius:22}}
            />
            <Text style={styles.bodyText}>{`@${username}`}</Text>
            <Text style={styles.bodyText}>{_about}</Text>
            <Text style={styles.bodyText}>{_votingPower}</Text>
            <Text style={styles.bodyText}>{_resourceCredits}</Text>
            <Text style={styles.bodyText}>{_followerCount}</Text>
            <Text style={styles.bodyText}>{_followingCount}</Text>
            <Text style={styles.bodyText}>{_postCount}</Text>
            <Text style={styles.bodyText}>{isFollowing?"following":"not following"}</Text>
            <Text style={styles.bodyText}>{isMuted?"muted":"not muted"}</Text>
            <Text style={styles.bodyText}>{isFavourite?"fav":"not fav"}</Text>
            <Button
                title='View Profile'
                onPress={()=>{}}
            />
            <Button
                title='Add To Favourites'
                onPress={()=>{}}
            />
            <Button
                title='Follow'
                onPress={()=>{}}
            />
            {isLoading && <ActivityIndicator/>}
        </View>
    )
}
