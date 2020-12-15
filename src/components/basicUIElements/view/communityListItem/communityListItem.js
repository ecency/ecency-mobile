import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';

import { UserAvatar } from '../../../userAvatar';
import { Tag } from '../../index';

import DEFAULT_IMAGE from '../../../../assets/no_image.png';

import styles from './communityListItemStyles';

const CommunityListItem = ({ item, index, handleOnPress, handleSubscribeButtonPress }) => {
  const intl = useIntl();
  return (
    <View style={[styles.communityWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
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
          onPress={() => handleSubscribeButtonPress({ isSubscribed: true, communityId: item[0] })}
        />
      </View>
    </View>
  );
};

export default CommunityListItem;
