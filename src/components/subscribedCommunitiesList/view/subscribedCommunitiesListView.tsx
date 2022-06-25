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
import { Community } from '../../../redux/reducers/cacheReducer';

const SubscribedCommunitiesListView = ({
  data,
  subscriptionsLoading,
  subscribingCommunities,
  handleOnPress,
  handleSubscribeButtonPress,
  handleGetSubscriptions,
  handleDiscoverPress,
  loading,
  subscribingItem
}: {
  data: Community[],
  loading: boolean,
  subscribingItem: Community | null,
}) => {
  const intl = useIntl();

  const _renderEmptyContent = () => {
    return (
      !subscriptionsLoading && (
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

  const _renderListItem = ({ item, index }: {item: Community, index: number}) => (
    <View style={[styles.communityWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => handleOnPress(item.communityId)}>
          <UserAvatar username={item.communityId} defaultSource={DEFAULT_IMAGE} noAction />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOnPress(item.communityId)}>
          <Text style={styles.community}>{item.title}</Text>
        </TouchableOpacity>
      </View>
      <View>
        {loading && subscribingItem && subscribingItem.communityId === item.communityId ? (
          <View style={{ width: 65, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <Tag
            style={styles.subscribeButton}
            textStyle={item.isSubscribed && styles.subscribeButtonText}
            value={
              !item.isSubscribed
                ? intl.formatMessage({
                    id: 'search_result.communities.subscribe',
                  })
                : intl.formatMessage({
                    id: 'search_result.communities.unsubscribe',
                  })
            }
            isPin={!item.isSubscribed}
            isFilter
            onPress={() => handleSubscribeButtonPress(item)
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
      ListFooterComponent={subscriptionsLoading && <ListPlaceHolder />}
      refreshControl={<RefreshControl refreshing={subscriptionsLoading} onRefresh={handleGetSubscriptions} />}
    />
  );
};

export default SubscribedCommunitiesListView;
