import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';

import styles from './communitiesListItemStyles';

import { Tag } from '../../../components/basicUIElements';

const UserListItem = ({
  index,
  handleOnPress,
  handleOnLongPress,
  title,
  about,
  admins,
  id,
  authors,
  posts,
  subscribers,
  isNsfw,
  name,
  handleSubscribeButtonPress,
  isSubscribed,
}) => {
  const [subscribed, setSubscribed] = useState(isSubscribed);
  const intl = useIntl();

  const _handleSubscribeButtonPress = () => {
    handleSubscribeButtonPress({ subscribed: !subscribed, communityId: name }).then(() => {
      setSubscribed(!subscribed);
    });
  };

  return (
    <TouchableOpacity
      onLongPress={() => handleOnLongPress && handleOnLongPress()}
      onPress={() => handleOnPress && handleOnPress(name)}
    >
      <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Tag
              style={styles.subscribeButton}
              textStyle={!subscribed && styles.subscribeButtonText}
              value={
                subscribed
                  ? intl.formatMessage({
                      id: 'search_result.communities.subscribe',
                    })
                  : intl.formatMessage({
                      id: 'search_result.communities.unsubscribe',
                    })
              }
              isPin={subscribed}
              isFilter
              onPress={_handleSubscribeButtonPress}
            />
          </View>
          {!!about && <Text style={styles.about}>{about}</Text>}
          <View style={styles.separator} />
          <Text style={styles.stats}>
            {`${subscribers.toString()} ${intl.formatMessage({
              id: 'search_result.communities.subscribers',
            })} • ${authors.toString()} ${intl.formatMessage({
              id: 'search_result.communities.posters',
            })} • ${posts} ${intl.formatMessage({
              id: 'search_result.communities.posts',
            })}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserListItem;
