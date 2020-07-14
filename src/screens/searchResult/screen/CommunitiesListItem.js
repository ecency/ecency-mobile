import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './communitiesListItemStyles';

import { Tag } from '../../../components/basicUIElements';

const UserListItem = ({
  index,
  handleOnPress,
  handleOnLongPress,
  isClickable,
  title,
  about,
  admins,
  id,
  authors,
  posts,
  subscribers,
  isNsfw,
}) => (
  <TouchableOpacity
    onLongPress={() => handleOnLongPress && handleOnLongPress()}
    disabled={!isClickable}
    onPress={() => handleOnPress && handleOnPress()}
  >
    <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Tag
            style={styles.subscribeButton}
            textStyle={styles.subscribeButtonText}
            value="Subscribe"
            isFilter
            onPress={() => {}}
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

export default UserListItem;
