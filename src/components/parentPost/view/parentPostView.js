import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';
import { default as ROUTES } from '../../../constants/routeNames';


import styles from './parentPostStyles';

const ParentPost = (props) => {
  const { navigation, post } = props;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => (get(navigation, 'navigate')
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
        <Text style={styles.title}>{get(post, 'title')}</Text>
        <Text style={styles.description}>{get(post, 'summary')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default withNavigation(ParentPost);
