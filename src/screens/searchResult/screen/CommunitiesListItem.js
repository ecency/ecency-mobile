import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
              value={subscribed ? 'Unsubscribe' : 'Subscribe'}
              isPin={subscribed}
              isFilter
              onPress={_handleSubscribeButtonPress}
            />
          </View>
          {!!about && <Text style={styles.about}>{about}</Text>}
          <View style={styles.separator} />
          <Text style={styles.stats}>
            {`${subscribers.toString()} Subscribers • ${authors.toString()} Posters • ${posts} Posts`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserListItem;
