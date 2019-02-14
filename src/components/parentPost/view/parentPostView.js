import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import { default as ROUTES } from '../../../constants/routeNames';

import styles from './parentPostStyles';

const ParentPost = ({ post, navigation }) => (
  <View style={styles.container}>
    <TouchableOpacity
      onPress={() => (navigation && navigation.navigate
        ? navigation.navigate({
          routeName: ROUTES.SCREENS.POST,
          params: {
            content: post,
          },
          key: post.permlink,
        })
        : null)
      }
    >
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.description}>{post.summary}</Text>
    </TouchableOpacity>
  </View>
);

export default withNavigation(ParentPost);
