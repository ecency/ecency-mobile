import React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { Comments, EmptyScreen, Header } from '../../../components';
import styles from '../styles/wavesScreen.styles';
import { useWavesQuery } from '../../../providers/queries/wavesQueries/wavesQueries';


const WavesScreen = () => {

    const wavesQuery = useWavesQuery('ecency.waves');

    const _fetchData = ({refresh}:{refresh?:boolean}) => {
        if(refresh){
            wavesQuery.refresh();
        } else {
            wavesQuery.fetchNextPage();
        }
    }


    const _data = wavesQuery.data.slice();

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

        </View>
    );
};


export default WavesScreen;