import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import get from 'lodash/get';
import { useNavigation } from '@react-navigation/native';
import { default as ROUTES } from '../../../constants/routeNames';

import styles from './parentPostStyles';

const ParentPost = ({ post }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() =>
          get(navigation, 'navigate')
            ? navigation.navigate({
                name: ROUTES.SCREENS.POST,
                params: {
                  content: post,
                },
                key: post.permlink,
              })
            : null
        }
      >
        <Text style={styles.title}>{get(post, 'title')}</Text>
        <Text style={styles.description}>{get(post, 'summary')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ParentPost;
