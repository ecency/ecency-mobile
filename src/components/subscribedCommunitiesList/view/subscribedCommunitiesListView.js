import React from 'react';
import { View, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useIntl } from 'react-intl';

import { Tag, UserAvatar } from '../../index';
import { ListPlaceHolder } from '../../basicUIElements';

import DEFAULT_IMAGE from '../../../assets/no_image.png';

import styles from './subscribedCommunitiesListStyles';

const SubscribedCommunitiesListView = ({
  data,
  subscribingCommunities,
  handleOnPress,
  handleSubscribeButtonPress,
}) => {
  const intl = useIntl();

  const _renderEmptyContent = () => {
    return (
      <>
        <ListPlaceHolder />
      </>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item, ind) => ind}
      renderItem={({ item, index }) => (
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
                      isSubscribed: item[4],
                      communityId: item[0],
                    },
                    'communitiesScreenJoinedTab',
                  )
                }
              />
            )}
          </View>
        </View>
      )}
      ListEmptyComponent={_renderEmptyContent}
    />
  );
};

export default SubscribedCommunitiesListView;
