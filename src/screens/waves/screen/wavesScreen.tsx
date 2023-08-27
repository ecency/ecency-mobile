import React, { useRef } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { Comments, EmptyScreen, Header, PostOptionsModal } from '../../../components';
import styles from '../styles/wavesScreen.styles';
import { wavesQueries } from '../../../providers/queries';


const WavesScreen = () => {

    const postOptionsModalRef = useRef<any>(null);

    const wavesQuery = wavesQueries.useWavesQuery('ecency.waves');

    const _fetchData = ({refresh}:{refresh?:boolean}) => {
        if(refresh){
            wavesQuery.refresh();
        } else {
            wavesQuery.fetchNextPage();
        }
    }


    const _handleOnOptionsPress = (content:any) => {
        if(postOptionsModalRef.current){
            postOptionsModalRef.current.show(content);
        }
    }


    // const _data = useInjectVotesCache(wavesQuery.data.slice());
    const _data = wavesQuery.data;

    const _renderListFooter = () => wavesQuery.isLoading && !wavesQuery.isRefreshing 
        ? <ActivityIndicator style={{padding:32}} /> : <View style={{padding:32}}/>;
    const _renderListEmpty = () => wavesQuery.isRefreshing || wavesQuery.isLoading 
        ? <View/> : <EmptyScreen />;

    return (
        <View style={styles.container}>
            <Header />

            <View style={{ flex: 1 }}>
                <Comments
                    comments={_data}
                    handleOnOptionsPress={_handleOnOptionsPress}
                    flatListProps={{
                        onEndReached: _fetchData,
                        onScroll: () => {},
                        ListEmptyComponent: _renderListEmpty,
                        ListFooterComponent: _renderListFooter,
                        onEndReachedThreshold: 1,
                        refreshControl: (
                          <RefreshControl
                            refreshing={wavesQuery.isRefreshing}
                            onRefresh={() => _fetchData({ refresh: true })}
                          />
                        ),
                    }}  
                />
            </View>

            <PostOptionsModal ref={postOptionsModalRef} />

        </View>
    );
};


export default WavesScreen;