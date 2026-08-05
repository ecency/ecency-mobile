import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { TabItem } from 'components/tabbedPosts/types/tabbedPosts.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetManager } from 'react-native-actions-sheet';
import { useNavigation } from '@react-navigation/native';
import { CollapsibleCard, BasicHeader, TabbedPosts } from '../../../components';
import { Tag, ProfileSummaryPlaceHolder } from '../../../components/basicUIElements';

import CommunityContainer from '../container/communityContainer';

// Styles
import styles from './communityStyles';

import { COMMUNITY_SCREEN_FILTER_MAP, getDefaultFilters } from '../../../constants/options/filters';
import ROUTES from '../../../constants/routeNames';
import { SheetNames } from '../../../navigation/sheets';
import { useAppSelector } from '../../../hooks';

const CommunityScreen = ({ route }: any) => {
  const tag = route.params?.tag ?? '';
  const filter = route.params?.filter ?? '';
  const intl = useIntl();
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(true);

  const communityTabs = useAppSelector(
    (state) => state.customTabs.communityTabs || getDefaultFilters('community'),
  );

  const tabFilters = useMemo(
    () =>
      communityTabs.map(
        (key: string) =>
          ({
            filterKey: key,
            label: COMMUNITY_SCREEN_FILTER_MAP[key],
          } as TabItem),
      ),
    [communityTabs],
  );

  const _getSelectedIndex = () => {
    if (filter) {
      const selectedIndex = communityTabs.indexOf(filter);
      if (selectedIndex > 0) {
        return selectedIndex;
      }
    }
    return 0;
  };

  const _handleOnScrollBeginDrag = () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const _handleOnExpanded = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const _handleManagePress = useCallback(
    async (data: any) => {
      const result = await SheetManager.show(SheetNames.COMMUNITY_MANAGE);

      // Only a selection carries a known action. Backdrop, swipe and back
      // dismissals resolve the sheet's payload object instead, so match on the
      // action rather than on truthiness.
      const params = {
        communityId: data?.name || tag,
        communityTitle: data?.title || '',
      };

      switch (result?.action) {
        case 'members':
          navigation.navigate({
            name: ROUTES.SCREENS.COMMUNITY_MEMBERS,
            key: `community_members_${tag}`,
            params,
          });
          break;
        case 'settings':
          navigation.navigate({
            name: ROUTES.SCREENS.COMMUNITY_SETTINGS,
            key: `community_settings_${tag}`,
            params,
          });
          break;
        case 'activities':
          navigation.navigate({
            name: ROUTES.SCREENS.COMMUNITY_ACTIVITIES,
            key: `community_activities_${tag}`,
            params,
          });
          break;
        default:
          break;
      }
    },
    [navigation, tag],
  );

  return (
    <CommunityContainer tag={tag}>
      {({
        data,
        handleSubscribeButtonPress,
        handleNewPostButtonPress,
        isSubscribed,
        isLoggedIn,
        isModerator,
      }: any) => (
        <SafeAreaView style={styles.container}>
          <BasicHeader
            title={`${data && data.title ? data.title : ''} ${intl.formatMessage({
              id: 'community.community',
            })}`}
            enableViewModeToggle={true}
            rightIconName={isModerator ? 'shield-account-outline' : undefined}
            iconType="MaterialCommunityIcons"
            handleRightIconPress={() => _handleManagePress(data)}
          />
          {data ? (
            <CollapsibleCard
              title={`${intl.formatMessage({
                id: 'community.details',
              })}`}
              isTitleCenter
              defaultTitle=""
              isExpanded={isExpanded}
              handleOnExpanded={_handleOnExpanded}
            >
              <View style={styles.collapsibleCard}>
                <ScrollView style={styles.descriptionContainer}>
                  <Text style={styles.description}>{data.description}</Text>
                </ScrollView>
                <View style={styles.separator} />
                <Text style={styles.stats}>
                  {`${data.subscribers} ${intl.formatMessage({
                    id: 'search_result.communities.subscribers',
                  })} • ${data.num_authors} ${intl.formatMessage({
                    id: 'search_result.communities.posters',
                  })} • ${data.num_pending} ${intl.formatMessage({
                    id: 'search_result.communities.posts',
                  })}`}
                </Text>
                <View style={styles.separator} />
                <View style={{ flexDirection: 'row' }}>
                  {isLoggedIn && (
                    <Tag
                      style={styles.subscribeButton}
                      textStyle={isSubscribed && styles.subscribeButtonText}
                      value={
                        !isSubscribed
                          ? intl.formatMessage({
                              id: 'search_result.communities.subscribe',
                            })
                          : intl.formatMessage({
                              id: 'search_result.communities.unsubscribe',
                            })
                      }
                      isPin={!isSubscribed}
                      isFilter
                      onPress={handleSubscribeButtonPress}
                    />
                  )}
                  <Tag
                    style={styles.subscribeButton}
                    value={intl.formatMessage({
                      id: 'community.new_post',
                    })}
                    isFilter
                    isPin
                    onPress={handleNewPostButtonPress}
                  />
                </View>
              </View>
            </CollapsibleCard>
          ) : (
            <ProfileSummaryPlaceHolder />
          )}
          <View
            {...({ tabLabel: intl.formatMessage({ id: 'search.posts' }) } as any)}
            style={styles.tabbarItem}
          >
            <TabbedPosts
              key={tag + JSON.stringify(communityTabs)}
              tabFilters={tabFilters}
              selectedOptionIndex={_getSelectedIndex()}
              tag={tag}
              pageType="community"
              handleOnScrollBeginDrag={(isExpanded ? _handleOnScrollBeginDrag : null) as any}
            />
          </View>
        </SafeAreaView>
      )}
    </CommunityContainer>
  );
};

export default gestureHandlerRootHOC(CommunityScreen);
