import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Icon } from '../icon';

// Constant
import { default as ROUTES } from '../../constants/routeNames';

// Styles
import styles from './postButtonStyles';

const PostButtonView = ({ navigation }) => (
  <View style={styles.postButtonWrapper}>
    <TouchableOpacity
      onPress={() =>
        navigation.navigate({
          routeName: ROUTES.SCREENS.EDITOR,
        })
      }
      activeOpacity={1}
    >
      <View style={styles.postButton}>
        <Icon name="pencil" size={24} iconType="MaterialCommunityIcons" color="#F8F8F8" />
      </View>
    </TouchableOpacity>
  </View>
);

export default withNavigation(PostButtonView);
