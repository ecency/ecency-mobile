import React from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { Posts, CollapsibleCard, Header, BasicHeader, TabbedPosts } from '../../../components';
import { Tag, ProfileSummaryPlaceHolder } from '../../../components/basicUIElements';

import CommunityContainer from '../container/communityContainer';

// Styles
import styles from './communityStyles';

import { COMMUNITY_SCREEN_FILTER_MAP } from '../../../constants/options/filters';
import { useAppSelector } from '../../../hooks';

const CommunityScreen = ({ navigation }) => {
  const tag = navigation.getParam('tag', '');
  const filter = navigation.getParam('filter', '');

  const intl = useIntl();

  const communityTabs = useAppSelector((state) => state.customTabs.communityTabs);
  const filterOptions = communityTabs.map((key) => COMMUNITY_SCREEN_FILTER_MAP[key]);

  const _getSelectedIndex = () => {
    if (filter) {
      const selectedIndex = communityTabs.indexOf(filter);
      if (selectedIndex > 0) {
        return selectedIndex;
      }
    }
    return 0;
  };

  return (
    <CommunityContainer>
      {({
        data,
        handleSubscribeButtonPress,
        handleNewPostButtonPress,
        isSubscribed,
        isLoggedIn,
      }) => (
        <View style={styles.container}>
          <BasicHeader
            title={`${data && data.title ? data.title : ''} ${intl.formatMessage({
              id: 'community.community',
            })}`}
            enableViewModeToggle={true}
          />
          {data ? (
            <CollapsibleCard
              title={`${intl.formatMessage({
                id: 'community.details',
              })}`}
              isTitleCenter
              defaultTitle=""
            >
              <View style={styles.collapsibleCard}>
                <Text style={styles.description}>{data.description}</Text>
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
          <View tabLabel={intl.formatMessage({ id: 'search.posts' })} style={styles.tabbarItem}>
            <TabbedPosts
              key={tag + JSON.stringify(filterOptions)}
              filterOptions={filterOptions}
              filterOptionsValue={communityTabs}
              selectedOptionIndex={_getSelectedIndex()}
              tag={tag}
              pageType="community"
            />
          </View>
        </View>
      )}
    </CommunityContainer>
  );
};

export default CommunityScreen;
