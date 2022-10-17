import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import { useIntl } from 'react-intl';

import { MainButton, Tag, TextButton, UserAvatar } from '../../index';
import { ListPlaceHolder } from '../../basicUIElements';

import DEFAULT_IMAGE from '../../../assets/no_image.png';

import styles from './subscribedCommunitiesListStyles';
import globalStyles from '../../../globalStyles';

const SubscribedCommunitiesListView = ({
  data,
  isLoading,
  subscribingCommunities,
  handleOnPress,
  handleSubscribeButtonPress,
  handleGetSubscriptions,
  handleDiscoverPress,
}) => {
  const intl = useIntl();

  const _renderEmptyContent = () => {
    return (
      !isLoading && (
        <>
          <Text style={[globalStyles.subTitle, styles.noContentText]}>
            {intl.formatMessage({ id: 'communities.no_communities' })}
          </Text>
          <TextButton
            text={intl.formatMessage({ id: 'communities.discover_communities' })}
            textStyle={[globalStyles.subTitle, styles.discoverTextButton]}
            onPress={handleDiscoverPress}
          />
        </>
      )
    );
  };

  const _renderListItem = ({ item, index }) => (
    <View style={[styles.communityWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => handleOnPress(item[0])}>
          <UserAvatar username={item[0]} defaultSource={DEFAULT_IMAGE} noAction />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOnPress(item[0])}>
          <Text style={styles.community}>{item[1]}</Text>
        </TouchableOpacity>
      </View>
      <View>
        {subscribingCommunities.hasOwnProperty(item[0]) &&
        subscribingCommunities[item[0]].loading ? (
          <View style={{ width: 65, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <Tag
            style={styles.subscribeButton}
            textStyle={item[4] && styles.subscribeButtonText}
            value={
              !item[4]
                ? intl.formatMessage({
                    id: 'search_result.communities.subscribe',
                  })
                : intl.formatMessage({
                    id: 'search_result.communities.unsubscribe',
                  })
            }
            isPin={!item[4]}
            isFilter
            onPress={() =>
              handleSubscribeButtonPress(
                {
                  communityId: item[0],
                  communityTitle: item[1],
                  userRole: item[2],
                  userLabel: item[3],
                  isSubscribed: item[4],
                },
                'communitiesScreenJoinedTab',
              )
            }
          />
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => index.toString()}
      renderItem={_renderListItem}
      ListEmptyComponent={_renderEmptyContent}
      ListFooterComponent={isLoading && <ListPlaceHolder />}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleGetSubscriptions} />}
    />
  );
};

export default SubscribedCommunitiesListView;
