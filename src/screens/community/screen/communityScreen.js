import React from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import { Posts, CollapsibleCard, Header } from '../../../components';
import { Tag, ProfileSummaryPlaceHolder } from '../../../components/basicUIElements';

import CommunityContainer from '../container/communityContainer';

// Styles
import styles from './communityStyles';

import { GLOBAL_POST_FILTERS, GLOBAL_POST_FILTERS_VALUE } from '../../../constants/options/filters';

const TagResultScreen = ({ navigation }) => {
  const tag = navigation.getParam('tag', '');
  const filter = navigation.getParam('filter', '');

  const intl = useIntl();

  const _getSelectedIndex = () => {
    if (filter) {
      const selectedIndex = GLOBAL_POST_FILTERS_VALUE.indexOf(filter);
      if (selectedIndex > 0) {
        return selectedIndex;
      }
    }
    return 0;
  };

  return (
    <CommunityContainer>
      {({ data, handleSubscribeButtonPress, isSubscribed }) => (
        <View style={styles.container}>
          <Header isReverse hideUser />
          {data ? (
            <CollapsibleCard title={data.title} isTitleCenter defaultTitle="test">
              <View style={styles.collapsibleCard}>
                <Text style={styles.description}>{data.description}</Text>
                <View style={styles.separator} />
                <Text style={styles.stats}>
                  {`${data.subscribers} Subscribers • ${data.num_authors} Posters • ${data.num_pending} Posts`}
                </Text>
                <View style={styles.separator} />
                <View style={{ flexDirection: 'row' }}>
                  <Tag
                    style={styles.subscribeButton}
                    textStyle={!isSubscribed && styles.subscribeButtonText}
                    value={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    isPin={isSubscribed}
                    isFilter
                    onPress={handleSubscribeButtonPress}
                  />
                  <Tag
                    style={styles.subscribeButton}
                    value="New Post"
                    isFilter
                    isPin
                    onPress={handleSubscribeButtonPress}
                  />
                </View>
              </View>
            </CollapsibleCard>
          ) : (
            <ProfileSummaryPlaceHolder />
          )}
          <View tabLabel={intl.formatMessage({ id: 'search.posts' })} style={styles.tabbarItem}>
            <Posts
              key={tag}
              filterOptions={GLOBAL_POST_FILTERS}
              filterOptionsValue={GLOBAL_POST_FILTERS_VALUE}
              selectedOptionIndex={_getSelectedIndex()}
              tag={tag}
            />
          </View>
        </View>
      )}
    </CommunityContainer>
  );
};

export default TagResultScreen;
