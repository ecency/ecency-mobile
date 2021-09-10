import React, { useEffect, useRef, useState } from 'react';
import {Alert, AlertButton } from 'react-native';
import { Source } from 'react-native-fast-image';
import ActionSheet from 'react-native-actions-sheet';
import { QuickProfileContent } from '../children/quickProfileContent';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../children/quickProfileStyles';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { hideProfileModal } from '../../../../redux/actions/uiAction';
import { getFollows, getRelationship, getUser } from '../../../../providers/hive/dhive';
import { checkFavorite } from '../../../../providers/ecency/ecency';
import { useIntl } from 'react-intl';



export interface ActionModalData {
  title:string, 
  body:string, 
  buttons:AlertButton[], 
  headerImage?:Source,
  onClosed:()=>void,
}


export const QuickProfileModal = ({}) => {
    const intl = useIntl();
    const sheetModalRef = useRef<ActionSheet>();
    const dispatch = useAppDispatch();

    const profileModalUsername = useAppSelector((state)=>state.ui.profileModalUsername);
    const currentAccount = useAppSelector((state)=>state.account.currentAccount);

    const [follows, setFollows] = useState(null);
    const [user, setUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isOwnProfile = currentAccount.name === profileModalUsername;

    useEffect(() => {
        if(profileModalUsername){
            _fetchUser()
            _fetchProfile()
            sheetModalRef.current.show();
        }
    }, [profileModalUsername])


    const _fetchUser = async () => {
        setIsLoading(true);
        let user;
      
        try {
          user = await getUser(profileModalUsername, isOwnProfile);
          setUser(user)
        } catch (error) {
            setIsLoading(false);
        }
      };


    const _fetchProfile = async () => {
    const username = profileModalUsername;
    try {
        if (username) {
        
        let _isFollowing;
        let _isMuted;
        let _isFavourite;
        let follows;

        if (!isOwnProfile) {
            const res = await getRelationship(currentAccount.name, username);
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



    const _onClose = () => {
        dispatch(hideProfileModal());
    }
    

    return (
        <ActionSheet 
            ref={sheetModalRef}
            gestureEnabled={true}
            containerStyle={styles.sheetContent}
            onClose={_onClose}
            indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}> 
            
            <QuickProfileContent 
                isLoading={isLoading}
                username={profileModalUsername}
            />
        </ActionSheet> 
    );
};
