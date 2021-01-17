import React from 'react';
import { useIntl } from 'react-intl';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import get from 'lodash/get';
import { SafeAreaView } from 'react-navigation';
import ScrollableTabView from 'react-native-scrollable-tab-view';

// Components
import {
  FilterBar,
  UserAvatar,
  TabBar,
  BasicHeader,
  CommunitiesList,
  SubscribedCommunitiesList,
} from '../../../components';
import { CommunitiesPlaceHolder } from '../../../components/basicUIElements';

import CommunitiesContainer from '../container/communitiesContainer';
import DEFAULT_IMAGE from '../../../assets/no_image.png';
import Tag from '../../../components/basicUIElements/view/tag/tagView';

import styles from './communitiesScreenStyles';
import globalStyles from '../../../globalStyles';

const CommunitiesScreen = ({ navigation, searchValue }) => {
  const intl = useIntl();

  const _renderEmptyContent = () => {
    return (
      <>
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
      </>
    );
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
      }) => {
        console.log(subscriptions, discovers);
        return (
          <View style={styles.container}>
            <SafeAreaView forceInset={{ bottom: 'never' }} style={{ flex: 1 }}>
              <BasicHeader
                title={intl.formatMessage({
                  id: 'side_menu.communities',
                })}
              />
              <ScrollableTabView
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
                  />
                </View>
              </ScrollableTabView>
            </SafeAreaView>
          </View>
        );
      }}
    </CommunitiesContainer>
  );
};

export default CommunitiesScreen;
