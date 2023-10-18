import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, View, FlatList, AppState } from 'react-native';
import { Comments, EmptyScreen, Header, PostOptionsModal } from '../../../components';
import styles from '../styles/wavesScreen.styles';
import { wavesQueries } from '../../../providers/queries';
import { useAppSelector } from '../../../hooks';
import WavesHeader from '../children/wavesHeader';
import { PostTypes } from '../../../constants/postTypes';
import ScrollTopPopup from '../../../components/tabbedPosts/view/scrollTopPopup';
import { debounce } from 'lodash';
import { useNavigationState } from '@react-navigation/native';


const SCROLL_POPUP_THRESHOLD = 5000;


const WavesScreen = ({ route }) => {
    //refs
    const postOptionsModalRef = useRef<any>(null);
    const postsListRef = useRef<FlatList>();
    const blockPopupRef = useRef(false);
    const scrollOffsetRef = useRef(0);
    const appState = useRef(AppState.currentState);
    const isFirstRender = useRef(true);

    const wavesQuery = wavesQueries.useWavesQuery('ecency.waves');

    const isDarkTheme = useAppSelector(state => state.application.isDarkTheme)

    const navState = useNavigationState(state => state);

    const [enableScrollTop, setEnableScrollTop] = useState(false);
    const [popupAvatars, setPopupAvatars] = useState<any[]>([])



    useEffect(() => {

        const _stateSub = AppState.addEventListener('change', _handleAppStateChange);
        return () => {
            _stateSub.remove();
        }
    }, [])


    useEffect(() => {
        if (navState.routeNames[navState.index] === route.name && !isFirstRender.current) {
            _latestWavesCheck();
        }
        isFirstRender.current = false;
    }, [navState.index])



    //actions
    const _handleAppStateChange = async (nextAppState) => {

        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            _latestWavesCheck()
        }

        appState.current = nextAppState;
    };


    const _latestWavesCheck = async () => {
        const latestWaves = await wavesQuery.latestWavesFetch()
        if (latestWaves.length > 0) {
            setPopupAvatars(latestWaves.map((item) => item.avatar))
            setEnableScrollTop(true)
        }
    }

    const _fetchData = (fetchProps: any) => {
        if (fetchProps?.refresh) {
            wavesQuery.refresh();
        } else {
            wavesQuery.fetchNextPage();
        }
    }

    //scrolls to top, blocks scroll popup for 2 seconds to reappear after scroll
    const _scrollTop = () => {
        if (postsListRef.current) {
            postsListRef.current.scrollToOffset({ offset: 0 });
            setEnableScrollTop(false);
            setPopupAvatars([])
            scrollPopupDebouce.cancel();
            blockPopupRef.current = true;
            setTimeout(() => {
                blockPopupRef.current = false;
            }, 2000);
        }
    }

    //makes sure pop do not reappear while scrolling up
    const scrollPopupDebouce = debounce(
        (value) => {
            setEnableScrollTop(value);
        },
        500,
        { leading: true },
    );

    //calback to calculate with to display scroll to popup
    const _onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        let currentOffset = event.nativeEvent.contentOffset.y;
        let scrollUp = currentOffset < scrollOffsetRef.current;
        scrollOffsetRef.current = currentOffset;

        if (scrollUp && !blockPopupRef.current && currentOffset > SCROLL_POPUP_THRESHOLD) {
            scrollPopupDebouce(true);
        }
    };



    const _handleOnOptionsPress = (content: any) => {
        if (postOptionsModalRef.current) {
            postOptionsModalRef.current.show(content);
        }
    }

    const _data = wavesQuery.data;

    const _renderListHeader = (
        <WavesHeader />
    )
    const _renderListFooter = () => wavesQuery.isLoading && !wavesQuery.isRefreshing
        ? <ActivityIndicator style={{ padding: 32 }} /> : <View style={{ padding: 32 }} />;
    const _renderListEmpty = () => wavesQuery.isRefreshing || wavesQuery.isLoading
        ? <View /> : <EmptyScreen />;

    return (
        <View style={styles.container}>
            <Header />

            <View style={{ flex: 1 }}>
                <Comments
                    postType={PostTypes.WAVE}
                    comments={_data}
                    handleOnOptionsPress={_handleOnOptionsPress}
                    flatListProps={{
                        ref: postsListRef,
                        onEndReached: _fetchData,
                        onScroll: _onScroll,
                        ListEmptyComponent: _renderListEmpty,
                        ListFooterComponent: _renderListFooter,
                        ListHeaderComponent: _renderListHeader,
                        refreshControl: (
                            <RefreshControl
                                refreshing={wavesQuery.isRefreshing}
                                onRefresh={() => _fetchData({ refresh: true })}
                                progressBackgroundColor="#357CE6"
                                tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                                titleColor="#fff"
                                colors={['#fff']}
                            />
                        ),
                    }}
                />
                <ScrollTopPopup
                    popupAvatars={popupAvatars}
                    enableScrollTop={enableScrollTop}
                    onPress={_scrollTop}
                    onClose={() => {
                        setEnableScrollTop(false);
                        setPopupAvatars([])
                    }}
                />
            </View>



            <PostOptionsModal ref={postOptionsModalRef} />

        </View>
    );
};


export default WavesScreen;