import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
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
  const tabViewRef = useRef(null);

  const _handleDiscoverPress = () => {
    if (tabViewRef.current) {
      tabViewRef.current.goToPage(1);
    }
  };

  const _renderTabbar = () => (
    <TabBar
      style={styles.tabbar}
      tabUnderlineDefaultWidth={80}
      tabUnderlineScaleX={2}
      tabBarPosition="overlayTop"
      textStyle={styles.tabBarText}
    />
  );

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
          <View style={styles.container}>
            <BasicHeader
              title={intl.formatMessage({
                id: 'side_menu.communities',
              })}
            />
            <ScrollableTabView
              ref={tabViewRef}
              style={globalStyles.tabView}
              renderTabBar={_renderTabbar}
              prerenderingSiblingsNumber={Infinity}
            >
              <View
                tabLabel={intl.formatMessage({ id: 'communities.joined' })}
                style={styles.tabbarItem}
              >
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
              <View
                tabLabel={intl.formatMessage({ id: 'communities.discover' })}
                style={styles.tabbarItem}
              >
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
            </ScrollableTabView>
          </View>
        );
      }}
    </CommunitiesContainer>
  );
};

export default gestureHandlerRootHOC(CommunitiesScreen);
