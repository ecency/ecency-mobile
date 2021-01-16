import React from 'react';
import { useIntl } from 'react-intl';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import get from 'lodash/get';
import { SafeAreaView } from 'react-navigation';
import ScrollableTabView from 'react-native-scrollable-tab-view';

// Components
import { FilterBar, UserAvatar, TabBar, BasicHeader } from '../../../components';
import CommunitiesList from '../../../components/communitiesList';
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
      {({ subscriptions, discovers, handleOnPress, handleSubscribeButtonPress }) => {
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
                  <FlatList
                    data={subscriptions}
                    //keyExtractor={(item, ind) => `${item}-${ind}`}
                    renderItem={({ item, index }) => (
                      <View
                        style={[styles.communityWrapper, index % 2 !== 0 && styles.itemWrapperGray]}
                      >
                        <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity onPress={() => handleOnPress(item[0])}>
                            <UserAvatar username={item[0]} defaultSource={DEFAULT_IMAGE} noAction />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleOnPress(item[0])}>
                            <Text style={styles.community}>{item[1]}</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Tag
                            style={styles.subscribeButton}
                            textStyle={styles.subscribeButtonText}
                            value={intl.formatMessage({
                              id: 'search_result.communities.unsubscribe',
                            })}
                            isPin={false}
                            isFilter
                            onPress={() =>
                              handleSubscribeButtonPress({
                                isSubscribed: true,
                                communityId: item[0],
                              })
                            }
                          />
                        </View>
                      </View>
                    )}
                    ListEmptyComponent={_renderEmptyContent}
                  />
                </View>
                <View
                  tabLabel={intl.formatMessage({ id: 'communities.discover' })}
                  style={styles.tabbarItem}
                >
                  <CommunitiesList
                    data={discovers}
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
