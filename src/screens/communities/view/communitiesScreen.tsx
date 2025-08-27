import React from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { TabView } from 'react-native-tab-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TabBar,
  BasicHeader,
  CommunitiesList,
  SubscribedCommunitiesList,
} from '../../../components';

import CommunitiesContainer from '../container/communitiesContainer';

import styles from './communitiesScreenStyles';
import globalStyles from '../../../globalStyles';

const CommunitiesScreen = () => {
  const intl = useIntl();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'joined',
      title: intl.formatMessage({
        id: 'communities.joined',
      }),
    },
    {
      key: 'discover',
      title: intl.formatMessage({
        id: 'communities.discover',
      }),
    },
  ]);

  const _handleDiscoverPress = () => {
    setIndex(1);
  };

  return (
    <CommunitiesContainer>
      {({
        subscriptions,
        discovers,
        handleOnPress,
        handleSubscribeButtonPress,
        subscribingCommunitiesInDiscoverTab,
        subscribingCommunitiesInJoinedTab,
        handleGetSubscriptions,
        isSubscriptionsLoading,
        isDiscoversLoading,
      }) => {
        return (
          <SafeAreaView style={styles.container}>
            <BasicHeader
              title={intl.formatMessage({
                id: 'side_menu.communities',
              })}
            />
            <TabView
              navigationState={{ index, routes }}
              style={[globalStyles.tabView]}
              onIndexChange={setIndex}
              renderTabBar={TabBar}
              renderScene={({ route }) => {
                switch (route.key) {
                  case 'joined':
                    return (
                      <View style={styles.tabbarItem}>
                        <SubscribedCommunitiesList
                          data={subscriptions}
                          subscribingCommunities={subscribingCommunitiesInJoinedTab}
                          handleSubscribeButtonPress={handleSubscribeButtonPress}
                          handleOnPress={handleOnPress}
                          handleGetSubscriptions={handleGetSubscriptions}
                          handleDiscoverPress={_handleDiscoverPress}
                          isLoading={isSubscriptionsLoading}
                        />
                      </View>
                    );
                  case 'discover':
                    return (
                      <View style={styles.tabbarItem}>
                        <CommunitiesList
                          data={discovers}
                          subscribingCommunities={subscribingCommunitiesInDiscoverTab}
                          handleOnPress={handleOnPress}
                          handleSubscribeButtonPress={handleSubscribeButtonPress}
                          isLoggedIn={true}
                          noResult={discovers.length === 0}
                          screen="communitiesScreenDiscoverTab"
                          isDiscoversLoading={isDiscoversLoading}
                        />
                      </View>
                    );
                }
              }}
            />
          </SafeAreaView>
        );
      }}
    </CommunitiesContainer>
  );
};

export default gestureHandlerRootHOC(CommunitiesScreen);
