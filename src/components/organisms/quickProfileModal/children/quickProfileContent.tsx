import React, { useEffect, useState, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { View, Alert } from 'react-native'
import { ProfileStats, StatsData } from './profileStats'
import { MainButton } from '../../..'
import { addFavorite, checkFavorite, deleteFavorite } from '../../../../providers/ecency/ecency'
import { followUser, getFollows, getRelationship, getUser } from '../../../../providers/hive/dhive'
import { getRcPower, getVotingPower } from '../../../../utils/manaBar'
import styles from './quickProfileStyles'
import { ProfileBasic } from './profileBasic'
import { parseReputation } from '../../../../utils/user'
import { default as ROUTES } from '../../../../constants/routeNames';
import { ActionPanel } from './actionPanel'
import { getTimeFromNowNative } from '../../../../utils/time'
import { useAppDispatch, useAppSelector } from '../../../../hooks'
import { toastNotification } from '../../../../redux/actions/uiAction'
import bugsnapInstance from '../../../../config/bugsnag'
import RootNavigation from '../../../../navigation/rootNavigation'

interface QuickProfileContentProps {
    username: string,
    onClose: () => void;
}

export const QuickProfileContent = ({
    username,
    onClose
}: QuickProfileContentProps) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const currentAccount = useAppSelector((state) => state.account.currentAccount);
    const pinCode = useAppSelector((state) => state.application.pin);
    const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [follows, setFollows] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);

    const isOwnProfile = currentAccount && currentAccount.name === username;
    const currentAccountName = currentAccount ? currentAccount.name : null;
    const isProfileLoaded = (user && follows) ? true : false;

    useEffect(() => {
        if (username) {
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
            setIsLoading(false);
        }
    };


    const _onFollowPress = async () => {
        try {
            const follower = currentAccountName
            const following = username;

            setIsLoading(true);
            await followUser(currentAccount, pinCode, {
                follower,
                following,
            })

            setIsLoading(false);
            setIsFollowing(true)
            dispatch(
                toastNotification(
                    intl.formatMessage({
                        id: isFollowing ? 'alert.success_unfollow' : 'alert.success_follow',
                    }),
                ),
            );
        }
        catch (err) {
            setIsLoading(false);
            console.warn("Failed to follow user", err)
            bugsnapInstance.notify(err);
            Alert.alert(intl.formatMessage({ id: 'alert.fail' }), err.message)
        }
    }

    const _onFavouritePress = async () => {
        try {
            setIsLoading(true);
            let favoriteAction;

            if (isFavourite) {
                favoriteAction = deleteFavorite;
            } else {
                favoriteAction = addFavorite;
            }

            await favoriteAction(username)

            dispatch(
                toastNotification(
                    intl.formatMessage({
                        id: isFavourite ? 'alert.success_unfavorite' : 'alert.success_favorite',
                    }),
                ),
            );
            setIsFavourite(!isFavourite);
            setIsLoading(false);
        }

        catch (error) {
            console.warn('Failed to perform favorite action');
            setIsLoading(false);
            Alert.alert(
                intl.formatMessage({
                    id: 'alert.fail',
                }),
                error.message || error.toString(),
            );
        }
    }



    //UI CALLBACKS

    const _openFullProfile = () => {
        let params = {
            username,
            reputation: user ? user.reputation : null
        };


        RootNavigation.navigate({
            name: ROUTES.SCREENS.PROFILE,
            params,
            key: username,
        });

        if (onClose) {
            onClose();
        }
    }

    //extract prop values
    let _votingPower = '';
    let _resourceCredits = '';
    let _followerCount = 0;
    let _followingCount = 0;
    let _postCount = 0;
    let _about = '';
    let _reputation = 0;
    let _createdData = null;

    if (isProfileLoaded) {
        _votingPower = getVotingPower(user).toFixed(1);
        _resourceCredits = getRcPower(user).toFixed(0);
        _postCount = user.post_count || 0;
        _about = user.about?.profile?.about || '';
        _reputation = parseReputation(user.reputation);
        _createdData = getTimeFromNowNative(user.created)

        if (follows) {
            _followerCount = follows.follower_count || 0;
            _followingCount = follows.following_count || 0
        }
    }



    const statsData1 = [
        { label: intl.formatMessage({ id: 'profile.follower' }), value: _followerCount },
        { label: intl.formatMessage({ id: 'profile.following' }), value: _followingCount },
        { label: intl.formatMessage({ id: 'profile.post' }), value: _postCount },
    ] as StatsData[]

    const statsData2 = [
        { label: intl.formatMessage({ id: 'profile.resource_credits' }), value: _resourceCredits, suffix: '%' },
        { label: intl.formatMessage({ id: 'profile.reputation' }), value: _reputation },
    ] as StatsData[]

    return (
        <View style={styles.modalStyle}>
            <ProfileBasic
                username={username}
                about={_about}
                created={_createdData}
                votingPower={_votingPower}
                isLoading={isLoading}
                onPress={_openFullProfile}
            />
            <ProfileStats
                data={statsData1}
                intermediate={!isProfileLoaded}
            />
            <ProfileStats
                horizontalMargin={16}
                data={statsData2}
                intermediate={!isProfileLoaded}
            />
            <MainButton
                style={styles.button}
                text={intl.formatMessage({ id: 'profile.view_full' })}
                onPress={_openFullProfile}
            />
            {isLoggedIn && (
                <ActionPanel
                    isFollowing={isFollowing}
                    isFavourite={isFavourite}
                    isMuted={isMuted}
                    isLoading={isLoading}
                    onFavouritePress={_onFavouritePress}
                    onFollowPress={_onFollowPress}
                />
            )}

        </View>
    )
};
